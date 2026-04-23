import { supabase } from '../lib/supabase'
import { ZELLE_RECIPIENT } from '../config/zelle'
import { toast } from 'sonner'
import { notificationService } from './notification.service'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const N8N_BOT_CHECKPROOF = import.meta.env.VITE_N8N_BOT_CHECKPROOF as string

const ZELLE_BUCKET = 'zelle_comprovantes'

export type StripePaymentMethod = 'card' | 'pix'

export interface StripeCheckoutParams {
  slug: string
  email: string
  fullName: string
  phone: string
  dependents?: number
  paymentMethod: StripePaymentMethod
  proc_id?: string
  order_id?: string
  userId?: string
  amount?: number
  coupon_code?: string
  action?: string
  serviceId?: string
}

export interface ParcelowCheckoutParams {
  slug: string
  email: string
  fullName: string
  phone: string
  cpf: string
  dependents?: number
  userId?: string
  amount?: number
  coupon_code?: string
  proc_id?: string
  order_id?: string
}

export interface StripeCheckoutResult {
  url: string
  orderId?: string
}

// Fee constants (mirrors edge function — for display only, final calc is server-side)
const CARD_FIXED_FEE = 0.3
const CARD_PERCENTAGE_FEE = 0.039
const PIX_PROCESSING_FEE = 0.018
const IOF_RATE = 0.035

export function estimateCardTotal(netUSD: number): number {
  return (netUSD + CARD_FIXED_FEE) / (1 - CARD_PERCENTAGE_FEE)
}

export function estimatePixTotal(netUSD: number, exchangeRate: number): number {
  const netBRL = netUSD * exchangeRate
  const withFees = netBRL / (1 - PIX_PROCESSING_FEE)
  return withFees * (1 + IOF_RATE)
}

/** Parse "US$ 200,00" → 200 */
export function parsePriceUSD(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9,]/g, '').replace(',', '.')) || 0
}

export const paymentService = {
  async _preRegisterOrder(params: {
    userId?: string
    fullName: string
    email: string
    amount: number
    slug: string
    paymentMethod: string
    dependents?: number
    procId?: string
    phone?: string
    coupon_code?: string
  }): Promise<string | undefined> {
    try {
      let parentServiceSlug: string | null = null

      if (params.procId) {
        const { data: parentProcess } = await supabase
          .from('user_services')
          .select('service_slug')
          .eq('id', params.procId)
          .maybeSingle()

        parentServiceSlug = parentProcess?.service_slug ?? null
      }

      const paymentMetadata = {
        dependents: params.dependents ?? 0,
        proc_id: params.procId,
        parent_process_id: params.procId,
        parent_service_slug: parentServiceSlug,
        phone: params.phone?.replace(/\D/g, ''),
      }

      // 1. Check if a pending order already exists for this user and slug
      // This prevents duplicates if the user clicks multiple times or refreshes
      if (params.userId) {
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id, payment_metadata')
          .eq('user_id', params.userId)
          .eq('product_slug', params.slug)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (existingOrder) {
          await supabase
            .from('orders')
            .update({
              client_name: params.fullName,
              client_email: params.email,
              total_price_usd: params.amount,
              payment_method: params.paymentMethod,
              coupon_code: params.coupon_code || null,
              payment_metadata: {
                ...(existingOrder.payment_metadata || {}),
                ...paymentMetadata,
              },
            })
            .eq('id', existingOrder.id)

          console.log(
            '[PaymentService] Reusing existing pending order:',
            existingOrder.id,
          )
          return existingOrder.id
        }
      }

      // 2. Insert new order if none exists
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .insert({
            user_id: params.userId || null,
            client_name: params.fullName,
            client_email: params.email,
            total_price_usd: params.amount,
            product_slug: params.slug,
            payment_method: params.paymentMethod,
            payment_status: 'pending',
            coupon_code: params.coupon_code || null,
            payment_metadata: paymentMetadata,
          })
          .select('id')
          .single()

        return orderData?.id
      } catch (e) {
        console.error('[PaymentService] Pre-registration error:', e)
        return undefined
      }
    } catch (outerError) {
      console.error(
        '[PaymentService] Critical pre-registration failure:',
        outerError,
      )
      return undefined
    }
  },

  async createStripeCheckout(
    params: StripeCheckoutParams,
  ): Promise<StripeCheckoutResult> {
    const orderId = await this._preRegisterOrder({
      userId: params.userId,
      fullName: params.fullName,
      email: params.email,
      amount: params.amount || 0,
      slug: params.slug,
      paymentMethod:
        params.paymentMethod === 'card' ? 'stripe_card' : 'stripe_pix',
      dependents: params.dependents,
      procId: params.proc_id,
      phone: params.phone,
      coupon_code: params.coupon_code,
    })

    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        order_id: orderId,
        slug: params.slug,
        email: params.email,
        fullName: params.fullName,
        amount: params.amount,
        dependents: params.dependents,
        paymentMethod: params.paymentMethod,
        coupon_code: params.coupon_code,
        origin_url: window.location.origin,
        action: params.action || '',
        serviceId: params.serviceId || '',
        proc_id: params.proc_id,
      },
    })

    if (error) {
      console.error('[PaymentService] Stripe error:', error)
      // Try to extract error message from error object if it's a FunctionsHttpError
      const errorDetail = (error as any).context?.message || error.message
      throw new Error(errorDetail || 'Erro ao processar Stripe Checkout')
    }

    if (!data?.url) throw new Error('URL de checkout não retornada.')

    return { url: data.url, orderId }
  },

  async createParcelowCheckout(
    params: ParcelowCheckoutParams,
  ): Promise<StripeCheckoutResult> {
    const orderId = await this._preRegisterOrder({
      userId: params.userId,
      fullName: params.fullName,
      email: params.email,
      amount: params.amount || 0,
      slug: params.slug,
      paymentMethod: 'parcelow',
      dependents: params.dependents,
      procId: params.proc_id,
      phone: params.phone,
      coupon_code: params.coupon_code,
    })

    const { data, error } = await supabase.functions.invoke(
      'create-parcelow-checkout',
      {
        body: {
          order_id: orderId,
          slug: params.slug,
          email: params.email,
          fullName: params.fullName,
          amount: params.amount,
          dependents: params.dependents,
          cpf: params.cpf,
          coupon_code: params.coupon_code,
          origin_url: window.location.origin,
          proc_id: params.proc_id,
        },
      },
    )

    if (error) {
      console.error('[PaymentService] Parcelow error:', error)
      throw new Error(error.message || 'Erro ao processar Parcelow Checkout')
    }

    if (!data?.checkoutUrl)
      throw new Error('URL de checkout Parcelow não retornada.')

    return { url: data.checkoutUrl, orderId }
  },

  /** Upload proof image to Supabase Storage, returns the storage path */
  async uploadZelleProof(file: File, slug: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${slug}/${Date.now()}_proof.${ext}`

    const { error } = await supabase.storage
      .from(ZELLE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })

    if (error) throw new Error(`Erro ao enviar comprovante: ${error.message}`)
    return path
  },

  async createZellePayment(params: {
    slug: string
    serviceName: string
    expectedAmount: number
    amount: number
    confirmationCode: string
    paymentDate: string
    proofPath: string
    guestEmail: string
    guestName: string
    userId?: string | null
    dependents?: number
    proc_id?: string
    coupon_code?: string
    phone?: string
  }): Promise<{ paymentId: string; autoApproved: boolean }> {
    const orderId = await this._preRegisterOrder({
      userId: params.userId || undefined,
      fullName: params.guestName,
      email: params.guestEmail,
      amount: params.expectedAmount,
      slug: params.slug,
      paymentMethod: 'zelle',
      dependents: params.dependents,
      procId: params.proc_id,
      phone: params.phone,
      coupon_code: params.coupon_code,
    })

    const { data, error } = await supabase.functions.invoke(
      'create-zelle-payment',
      {
        body: {
          amount: params.amount,
          payment_date: params.paymentDate,
          proof_path: params.proofPath,
          service_slug: params.slug,
          visa_order_id: orderId,
          guest_email: params.guestEmail,
          guest_name: params.guestName,
          user_id: params.userId ?? null,
          proc_id: params.proc_id,
          coupon_code: params.coupon_code || undefined,
          dependents: params.dependents,
          recipient_name: ZELLE_RECIPIENT.name,
          recipient_email: ZELLE_RECIPIENT.email,
          admin_notes: `Serviço: ${params.serviceName} | Valor esperado: $${params.expectedAmount.toFixed(2)} | Pago: $${params.amount.toFixed(2)}${params.dependents ? ` | Dependentes: ${params.dependents}` : ''}`,
        },
      },
    )

    if (error) {
      console.error('[PaymentService] Zelle error:', error)
      throw new Error(error.message || 'Erro ao processar pagamento Zelle')
    }

    const paymentId = data.payment_id

    // --- N8N BOT CHECKPROOF (Síncrono e com Tratamento de Respostas) ---
    let autoApproved = data.auto_approved === true
    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/zelle_comprovantes/${params.proofPath}`

    const botPayload = {
      event: 'zelle_payment_created',
      payment_id: paymentId,
      user_id: params.userId || null,
      email: params.guestEmail,
      full_name: params.guestName,
      amount: params.amount,
      proof_path: params.proofPath,
      image_url: imageUrl,
      service_slug: params.slug,
      timestamp: new Date().toISOString(),
    }

    try {
      console.log('[N8N Bot] Aguardando verificação prévia...')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s de limite para verificação síncrona

      const botResponse = await fetch(N8N_BOT_CHECKPROOF, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botPayload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const botData = await botResponse
        .json()
        .catch(() => ({ response: 'error' }))
      console.log('[N8N Bot] Resposta:', botData)

      if (botData.response === 'approved payment') {
        autoApproved = true
        console.log('[N8N Bot] Pagamento aprovado automaticamente pelo robô.')
      } else {
        autoApproved = false

        await notificationService.notifyAdmin({
          title: '🔍 Zelle: Verificação Automática Falhou',
          body: `O pagamento ${paymentId} ($${params.amount}) não passou na conferência automática do robô. Motivo: ${botData.response}. Uma análise manual é necessária.`,
          userId: params.userId || undefined,
          metadata: {
            payment_id: paymentId,
            bot_response: botData.response,
          },
        })

        toast.info(
          'O comprovante não passou na verificação automática inicial e precisará ser analisado manualmente.',
          {
            duration: 6000,
          },
        )
      }
    } catch (botErr: unknown) {
      autoApproved = false
      console.warn(
        '[N8N Bot] Falha ou timeout na verificação:',
        (botErr as Error).message,
      )

      await notificationService.notifyAdmin({
        title: '⚠️ Erro Técnico: Robô Zelle Offline',
        body: `Não foi possível contatar o robô de verificação para o pagamento ${paymentId}. O sistema seguirá para conferência manual.`,
        userId: params.userId || undefined,
      })

      toast.info(
        'Não foi possível verificar seu comprovante agora. Nossa equipe fará a conferência manual em instantes.',
      )
    }

    return {
      paymentId: paymentId,
      autoApproved: autoApproved,
    }
  },

  /**
   * Admin only — approve a pending Zelle payment.
   * Calls 'validate-zelle-payment' with the correct status and payment_id.
   */
  async approveZellePayment(paymentId: string): Promise<void> {
    const { error } = await supabase.functions.invoke(
      'validate-zelle-payment',
      {
        body: {
          payment_id: paymentId,
          status: 'approved',
          admin_notes: 'Aprovado manualmente via Painel Admin',
        },
      },
    )

    if (error) {
      console.error('[PaymentService] Manual Approval failed:', error)
      throw new Error(error.message || 'Erro ao aprovar pagamento Zelle')
    }
  },

  /** Admin only — reject a Zelle payment */
  async rejectZellePayment(paymentId: string, reason: string): Promise<void> {
    const { error } = await supabase.functions.invoke(
      'validate-zelle-payment',
      {
        body: {
          payment_id: paymentId,
          status: 'rejected',
          admin_notes: reason || 'Rejeitado manualmente via Painel Admin',
        },
      },
    )

    if (error) {
      console.error('[PaymentService] Manual Rejection failed:', error)
      throw new Error(error.message || 'Erro ao rejeitar pagamento Zelle')
    }
  },

  /** Check the payment status of an order via Polling (Used in Checkout Success Page) */
  async checkOrderPaymentStatus(
    slug: string,
    timeoutMs: number = 20000,
    orderId?: string | null,
  ): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userEmail = session?.user?.email
    if (!userEmail && !orderId) return false

    const startTime = Date.now()

    while (Date.now() - startTime < timeoutMs) {
      let query = supabase.from('orders').select('payment_status')

      if (orderId) {
        query = query.eq('id', orderId)
      } else {
        query = query.eq('client_email', userEmail!).eq('product_slug', slug)
      }

      const { data } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (
        data &&
        (data.payment_status === 'paid' || data.payment_status === 'complete')
      ) {
        return true
      }

      // Wait 3 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    return false // Timeout
  },

  async verifyStripeSession(sessionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke(
        'verify-stripe-session',
        {
          body: { session_id: sessionId },
        },
      )

      if (error) return false
      return data.success === true
    } catch (err) {
      console.error('[PaymentService] Verify session failed:', err)
      return false
    }
  },

  /**
   * Immediate check for order activation.
   */
  async verifyOrderActivation(params: {
    slug: string
    orderId?: string | null
    onSuccess: () => void
    onError: (msg: string) => void
  }): Promise<void> {
    const { slug, orderId, onSuccess, onError } = params

    // Direct check of orders
    const isPaid = await this.checkOrderPaymentStatus(slug, 1000, orderId)

    if (isPaid) {
      onSuccess()
    } else {
      onError(
        'Seu pagamento foi recebido, mas a ativação automática está sendo processada. Por favor, aguarde cerca de 3 minutos e verifique seu e-mail ou o dashboard. Se o serviço não aparecer, entre em contato com nosso suporte.',
      )
    }
  },
}
