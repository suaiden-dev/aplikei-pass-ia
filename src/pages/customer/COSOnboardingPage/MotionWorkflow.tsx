import { useState, useRef, useCallback, useEffect } from 'react'
import {
  RiMoneyDollarCircleLine,
  RiArrowRightLine,
  RiInformationLine,
  RiCheckDoubleLine,
  RiShieldCheckLine,
  RiDownload2Line,
  RiBankCardLine,
  RiQrCodeLine,
  RiCloseLine,
  RiLockLine,
  RiTimeLine,
  RiUploadCloud2Line,
  RiImageLine,
  RiCheckLine,
  RiErrorWarningLine,
} from 'react-icons/ri'
import { MdPix } from 'react-icons/md'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import {
  processService,
  type UserService,
} from '../../../services/process.service'
import { cosNotificationService } from '../../../services/cos-notification.service'
import {
  paymentService,
  type StripePaymentMethod,
} from '../../../services/payment.service'
import { useAuth } from '../../../hooks/useAuth'
import { DocUploadCard } from '../../../components/DocUploadCard'
import { ZELLE_RECIPIENT } from '../../../config/zelle'
import { Input } from '../../../components/Input'
import { Label } from '../../../components/Label'
import { maskCPF, validateCPF } from '../../../utils/cpf'
import { estimateCardTotal } from '../../../services/payment.service'
import { cn } from '../../../utils/cn'
import { useT } from '../../../i18n'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepProps {
  proc: UserService
  user?: {
    id: string
    email?: string
    fullName?: string
    full_name?: string
    phone?: string
    phoneNumber?: string
  } | null
  onComplete?: () => void
}

type PaymentTab = 'card' | 'pix' | 'zelle' | 'parcelow'

interface MotionCheckoutOverlayProps {
  amount: number
  slug: string
  proc: UserService
  user?: StepProps['user']
  onClose: () => void
}

// ─── Payment method config ────────────────────────────────────────────────────

/**
 * Payment method config is now dynamic based on translations in the component body
 * to avoid issues with translation hook usage.
 */

const ZELLE_EMAIL = ZELLE_RECIPIENT.email
const ZELLE_PHONE = ZELLE_RECIPIENT.phone
const ZELLE_NAME = ZELLE_RECIPIENT.name

// ─── Checkout Overlay ─────────────────────────────────────────────────────────

function MotionCheckoutOverlay({
  amount,
  slug,
  proc,
  user: propUser,
  onClose,
}: MotionCheckoutOverlayProps) {
  const t = useT('checkout').product
  const t_onboarding = useT('onboarding')
  const { user: authUser } = useAuth()
  const user = propUser ?? authUser ?? null
  const [activeMethod, setActiveMethod] = useState<PaymentTab>('card')
  const [loading, setLoading] = useState(false)
  const [parcelowCpf, setParcelowCpf] = useState('')

  // Zelle state
  const [zelleAmount, setZelleAmount] = useState('')
  const [zelleCode, setZelleCode] = useState('')
  const [zelleDate, setZelleDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [zelleProof, setZelleProof] = useState<File | null>(null)
  const [zelleProofPreview, setZelleProofPreview] = useState<string | null>(
    null,
  )
  const [zelleDone, setZelleDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProofSelect = useCallback(
    (file: File) => {
      if (file.size > 8 * 1024 * 1024) {
        toast.error(t?.paymentMethods?.zelle?.uploadDesc || 'File too large')
        return
      }
      setZelleProof(file)
      setZelleProofPreview(URL.createObjectURL(file))
    },
    [t],
  )

  const savePaymentIntent = () => {
    localStorage.setItem(
      'pending_payment_advance',
      JSON.stringify({
        procId: proc.id,
        fromStep: proc.current_step,
      }),
    )
    localStorage.setItem('checkout_slug', slug)
  }

  const resolveCheckoutContact = async () => {
    const stepData = (proc.step_data || {}) as Record<string, unknown>
    const directEmail = String(user?.email || stepData.primaryEmail || '').trim()
    const directFullName = String(user?.fullName || stepData.fullName || '').trim()
    const directPhone = String(user?.phoneNumber || stepData.primaryPhone || '').trim()

    if (directEmail) {
      return {
        email: directEmail,
        fullName: directFullName || 'Cliente',
        phone: directPhone || '0000000000',
      }
    }

    const [{ data: account }, { data: profile }] = await Promise.all([
      supabase
        .from('user_accounts')
        .select('email, full_name, phone_number')
        .eq('id', proc.user_id)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('email, full_name, phone')
        .eq('id', proc.user_id)
        .maybeSingle(),
    ])

    const email = String(
      directEmail
        || account?.email
        || profile?.email
        || '',
    ).trim()

    return {
      email,
      fullName: String(
        directFullName
          || account?.full_name
          || profile?.full_name
          || 'Cliente',
      ).trim(),
      phone: String(
        directPhone
          || account?.phone_number
          || profile?.phone
          || '0000000000',
      ).trim(),
    }
  }

  const handlePay = async () => {
    setLoading(true)
    try {
      const { email, fullName, phone } = await resolveCheckoutContact()
      const userId = user?.id || proc.user_id

      if (!email) {
        toast.error(t_onboarding?.toasts?.emailNotFound || 'Email not found')
        return
      }

      const motionAction = 'motion_proposal_payment'

      if (activeMethod === 'card' || activeMethod === 'pix') {
        const { url } = await paymentService.createStripeCheckout({
          slug,
          email,
          fullName,
          phone,
          paymentMethod: activeMethod as StripePaymentMethod,
          amount,
          userId,

          proc_id: proc.id,
          action: motionAction,
        })

        savePaymentIntent()
        window.location.href = url
      } else if (activeMethod === 'parcelow') {
        if (!parcelowCpf || !validateCPF(parcelowCpf)) {
          throw new Error(
            t?.paymentMethods?.parcelow?.cpfRequired || 'CPF required',
          )
        }

        const { url } = await paymentService.createParcelowCheckout({
          slug,
          email,
          fullName,
          phone,
          cpf: parcelowCpf,
          amount,
          userId,
          proc_id: proc.id,
        })

        savePaymentIntent()
        window.location.href = url
      } else if (activeMethod === 'zelle') {
        toast.success(
          t?.paymentMethods?.zelle?.pendingReview || 'Pending review',
        )
        setZelleDone(true)
      }
    } catch (e: unknown) {
      const err = e as Error
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className='absolute inset-0 bg-card/60 backdrop-blur-sm' />

      {/* Content */}
      <div
        className='relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='px-8 py-6 border-b border-border flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-black text-text uppercase tracking-tight'>
              {t?.title}
            </h3>
            <p className='text-xs text-text-muted font-bold mt-0.5'>
              {t?.success?.confirmed}
            </p>
          </div>
          <button
            onClick={onClose}
            className='w-10 h-10 rounded-xl bg-bg-subtle border border-border flex items-center justify-center text-text-muted hover:text-text-muted hover:bg-bg-subtle transition-all'
          >
            <RiCloseLine className='text-xl' />
          </button>
        </div>

        {/* Amount banner */}
        <div className='mx-8 mt-6 bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-center justify-between'>
          <div>
            <p className='text-[10px] font-black text-primary uppercase tracking-widest mb-1'>
              {t?.summary?.total}
            </p>
            <h4 className='text-2xl font-black text-text'>
              $ {amount.toFixed(2)}
            </h4>
          </div>
          <RiMoneyDollarCircleLine className='text-4xl text-primary opacity-20' />
        </div>

        {/* Payment methods */}
        <div className='px-8 pt-6 pb-2'>
          <div className='grid grid-cols-4 gap-2'>
            {[
              {
                id: 'card',
                label: t?.paymentMethods?.card?.label,
                sub: t?.paymentMethods?.card?.sublabel,
                icon: <RiBankCardLine className='text-xl' />,
              },
              {
                id: 'pix',
                label: t?.paymentMethods?.pix?.label,
                sub: t?.paymentMethods?.pix?.sublabel,
                icon: <MdPix className='text-xl' />,
              },
              {
                id: 'zelle',
                label: t?.paymentMethods?.zelle?.label,
                sub: t?.paymentMethods?.zelle?.sublabel,
                icon: (
                  <span className='text-xs font-black tracking-tight leading-none'>
                    Z$
                  </span>
                ),
              },
              {
                id: 'parcelow',
                label: t?.paymentMethods?.parcelow?.label,
                sub: t?.paymentMethods?.parcelow?.sublabel,
                icon: (
                  <span className='text-[10px] font-black tracking-tighter leading-none'>
                    PRC
                  </span>
                ),
              },
            ].map((m) => (
              <button
                key={m.id}
                type='button'
                onClick={() => setActiveMethod(m.id as PaymentTab)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition-all duration-150 ${
                  activeMethod === m.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-text-muted hover:border-slate-300 hover:bg-bg-subtle'
                }`}
              >
                {m.icon}
                <span className='text-[11px] font-bold leading-none'>
                  {m.label}
                </span>
                <span className='text-[9px] font-medium leading-none opacity-70'>
                  {m.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific info */}
        <div className='px-8 pt-3 pb-6 space-y-4'>
          {activeMethod === 'card' && (
            <div className='flex items-start gap-2.5 rounded-xl bg-info/10 border border-info/20 p-3'>
              <RiBankCardLine className='text-info mt-0.5 shrink-0' />
              <p
                className='text-xs text-info leading-relaxed'
                dangerouslySetInnerHTML={{
                  __html: t?.paymentMethods?.card?.notice || '',
                }}
              />
            </div>
          )}

          {activeMethod === 'pix' && (
            <div className='flex items-start gap-2.5 rounded-xl bg-success/10 border border-success/20 p-3'>
              <RiQrCodeLine className='text-success mt-0.5 shrink-0' />
              <p
                className='text-xs text-success leading-relaxed'
                dangerouslySetInnerHTML={{
                  __html: t?.paymentMethods?.pix?.notice || '',
                }}
              />
            </div>
          )}

          {activeMethod === 'parcelow' && (
            <div className='space-y-4'>
              <div className='flex items-start gap-2.5 rounded-xl bg-warning/10 border border-warning/20 p-3'>
                <RiTimeLine className='text-warning mt-0.5 shrink-0' />
                <p
                  className='text-xs text-warning leading-relaxed'
                  dangerouslySetInnerHTML={{
                    __html: t?.paymentMethods?.parcelow?.notice || '',
                  }}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='motionParcelowCpf'>
                  {t?.paymentMethods?.parcelow?.cpfLabel}
                </Label>
                <Input
                  id='motionParcelowCpf'
                  placeholder='000.000.000-00'
                  maxLength={14}
                  value={parcelowCpf}
                  onChange={(e) => setParcelowCpf(maskCPF(e.target.value))}
                />
                <div className='flex items-center gap-1 text-[10px] text-text-muted'>
                  <RiInformationLine className='text-warning' />
                  <span>{t?.paymentMethods?.parcelow?.cpfNotice}</span>
                </div>
              </div>
            </div>
          )}

          {activeMethod === 'zelle' && !zelleDone && (
            <div className='space-y-4'>
              {/* Recipient info */}
              <div className='rounded-xl bg-primary/10 border border-primary/20 p-4'>
                <p className='text-[11px] font-bold text-primary uppercase tracking-widest mb-2'>
                  {t?.paymentMethods?.zelle?.notice}
                </p>
                <div className='space-y-1'>
                  <p className='text-sm font-bold text-text'>
                    {t?.paymentMethods?.zelle?.name} {ZELLE_NAME}
                  </p>
                  <p className='text-sm text-text-muted font-mono'>
                    {t?.paymentMethods?.zelle?.email} {ZELLE_EMAIL}
                  </p>
                  <p className='text-sm text-text-muted font-mono'>
                    {t?.paymentMethods?.zelle?.phone} {ZELLE_PHONE}
                  </p>
                </div>
                <p className='text-[11px] text-primary mt-2 leading-snug'>
                  {t?.paymentMethods?.zelle?.confirmTitle}
                </p>
              </div>

              {/* Zelle fields */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <Label htmlFor='motionZelleAmount'>
                    {t?.paymentMethods?.zelle?.amountSent}
                  </Label>
                  <Input
                    id='motionZelleAmount'
                    type='number'
                    step='0.01'
                    min='1'
                    placeholder={t?.paymentMethods?.zelle?.amountPlaceholder}
                    className='mt-1.5'
                    value={zelleAmount}
                    onChange={(e) => setZelleAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor='motionZelleDate'>
                    {t?.paymentMethods?.zelle?.paymentDate}
                  </Label>
                  <Input
                    id='motionZelleDate'
                    type='date'
                    className='mt-1.5'
                    value={zelleDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setZelleDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='motionZelleCode'>
                  {t?.paymentMethods?.zelle?.confirmationCode}{' '}
                  <span className='text-text-muted font-normal'>
                    {t?.paymentMethods?.zelle?.confirmationCode?.includes('(')
                      ? ''
                      : '(opcional)'}
                  </span>
                </Label>
                <Input
                  id='motionZelleCode'
                  placeholder={
                    t?.paymentMethods?.zelle?.confirmationPlaceholder
                  }
                  className='mt-1.5'
                  value={zelleCode}
                  onChange={(e) => setZelleCode(e.target.value)}
                />
              </div>

              {/* Proof upload */}
              <div>
                <Label>{t?.paymentMethods?.zelle?.uploadProof}</Label>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleProofSelect(f)
                  }}
                />
                {zelleProofPreview ? (
                  <div className='mt-1.5 relative rounded-xl overflow-hidden border border-border'>
                    <img
                      src={zelleProofPreview}
                      alt={t?.paymentMethods?.zelle?.uploadProof}
                      className='w-full max-h-40 object-cover'
                    />
                    <button
                      type='button'
                      onClick={() => {
                        setZelleProof(null)
                        setZelleProofPreview(null)
                      }}
                      className='absolute top-2 right-2 w-6 h-6 bg-slate-800/70 rounded-full flex items-center justify-center text-white hover:bg-slate-800 transition-colors'
                    >
                      <RiCloseLine className='text-sm' />
                    </button>
                    <div className='absolute bottom-0 left-0 right-0 bg-slate-800/60 px-3 py-1.5 flex items-center gap-2'>
                      <RiImageLine className='text-white text-xs' />
                      <span className='text-white text-[11px] truncate'>
                        {zelleProof?.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const f = e.dataTransfer.files[0]
                      if (f) handleProofSelect(f)
                    }}
                    className='mt-1.5 w-full border-2 border-dashed border-border rounded-xl py-6 flex flex-col items-center gap-2 text-text-muted hover:border-primary/40 hover:bg-primary/3 transition-colors'
                  >
                    <RiUploadCloud2Line className='text-2xl' />
                    <span className='text-xs font-medium'>
                      {t?.paymentMethods?.zelle?.uploadProof}
                    </span>
                    <span className='text-[10px]'>
                      {t?.paymentMethods?.zelle?.uploadDesc}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeMethod === 'zelle' && zelleDone && (
            <div className='rounded-xl bg-success/10 border border-success/20 p-5 text-center'>
              <RiCheckLine className='text-success text-3xl mx-auto mb-2' />
              <p className='font-bold text-text text-sm'>
                {t?.paymentMethods?.zelle?.pendingReview?.split('!')[0]}!
              </p>
              <p
                className='text-xs text-text-muted mt-1 leading-relaxed'
                dangerouslySetInnerHTML={{
                  __html:
                    t?.paymentMethods?.zelle?.pendingReview?.split('!')[1] ||
                    t?.paymentMethods?.zelle?.pendingReview,
                }}
              />
              <button
                type='button'
                onClick={onClose}
                className='flex items-center justify-center gap-2 mx-auto mt-4 px-4 py-2 bg-success text-white rounded-xl font-bold text-xs'
              >
                {t?.paymentMethods?.zelle?.goDashboard}
              </button>
            </div>
          )}

          {/* Submit button */}
          {!zelleDone && (
            <button
              onClick={handlePay}
              disabled={loading}
              className='flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-primary text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-[#1649c0] hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  {t?.redirecting || 'Redirecting...'}
                </>
              ) : (
                <>
                  <RiLockLine className='text-base' />
                  {activeMethod === 'card' && t?.paymentMethods?.card?.label}
                  {activeMethod === 'pix' && t?.paymentMethods?.pix?.label}
                  {activeMethod === 'zelle' && t?.paymentMethods?.zelle?.submit}
                  {activeMethod === 'parcelow' &&
                    t?.paymentMethods?.parcelow?.label}
                  <RiArrowRightLine className='text-base' />
                </>
              )}
            </button>
          )}

          <p className='text-center text-[11px] text-text-muted flex items-center justify-center gap-1'>
            <RiShieldCheckLine />
            {t?.paymentMethods?.card?.notice?.includes('SSL')
              ? t?.paymentMethods?.card?.notice
              : 'Protected by 256-bit SSL encryption.'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── MotionAcquisitionStep ────────────────────────────────────────────────────

/**
 * First Motion step - acquisition/payment entrypoint
 */
export function MotionExplanationStep({
  proc,
  user,
}: StepProps) {
  const t = useT('onboarding')
  const [showCheckout, setShowCheckout] = useState(false)
  const copy = t?.workflows?.motion?.acquisition
  const legacyCopy = t?.workflows?.motion?.explanation
  const textOr = (value: unknown, fallback: string) =>
    typeof value === 'string' && value.trim().length > 0 ? value : fallback
  const textOrChain = (...values: Array<unknown>) => {
    const firstFilled = values.find(
      (value) => typeof value === 'string' && value.trim().length > 0,
    )

    return typeof firstFilled === 'string' ? firstFilled : ''
  }
  const translatedFeatures = Array.isArray(copy?.features)
    ? copy.features.filter(
        (feature: unknown): feature is string =>
          typeof feature === 'string' && feature.trim().length > 0,
      )
    : []
  const features =
    translatedFeatures.length > 0
      ? translatedFeatures
      : [
          'Revisao completa da negativa recebida.',
          'Acesso ao fluxo guiado com suporte da equipe.',
        ]
  const [baseAmount, setBaseAmount] = useState(50)
  const analysisFeeTemplate = t?.workflows?.shared?.analysisFee
  const analysisFeeText =
    typeof analysisFeeTemplate === 'string' &&
    analysisFeeTemplate.includes('{amount}')
      ? analysisFeeTemplate.replace('{amount}', baseAmount.toFixed(2))
      : `Taxa de analise: $${baseAmount.toFixed(2)}`

  useEffect(() => {
    supabase
      .from('services_prices')
      .select('price')
      .eq('service_id', 'apoio-rfe-motion-inicio')
      .eq('is_active', true)
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.warn(
            '[MotionExplanationStep] Failed to load base price:',
            error.message,
          )
          setBaseAmount(50)
          return
        }
        const firstPrice = data?.[0]?.price
        const parsedPrice = Number(firstPrice)
        setBaseAmount(Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : 50)
      })
  }, [])

  return (
    <>
      <div className='max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <div className='bg-card rounded-[40px] border border-border p-12 shadow-sm text-center'>
          <div className='w-20 h-20 rounded-3xl bg-danger/10 text-danger flex items-center justify-center mx-auto mb-8 shadow-inner'>
            <RiErrorWarningLine className='text-4xl' />
          </div>
          <h2 className='text-3xl font-black text-text mb-4 uppercase tracking-tight'>
            {textOr(copy?.title, 'Motion - Adquirir')}
          </h2>
          <p className='text-text-muted leading-relaxed max-w-md mx-auto mb-10 overflow-hidden text-ellipsis line-clamp-3'>
            {textOrChain(
              copy?.desc,
              legacyCopy?.desc,
              'Contrate o servico de Motion para reverter a negativa.',
            )}
          </p>

          <div className='bg-bg-subtle rounded-3xl p-8 mb-10 text-left border border-border'>
            <h4 className='text-xs font-black text-text-muted uppercase tracking-widest mb-4'>
              {textOrChain(copy?.howItWorks, legacyCopy?.howItWorks, 'Como funciona')}
            </h4>
            <div className='space-y-4'>
              {features.map((feature: string, i: number) => (
                <div key={i} className='flex gap-3'>
                  <RiCheckDoubleLine className='text-primary text-lg shrink-0 mt-1' />
                  <p className='text-sm text-text-muted'>{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className='w-full bg-primary hover:bg-primary-hover text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3'
          >
            {textOrChain(copy?.btn, legacyCopy?.btn, 'Contratar Motion')}
            <RiMoneyDollarCircleLine className='text-xl' />
          </button>
          <div className='mt-4 flex flex-col items-center gap-1'>
            <p className='text-[10px] text-text-muted font-bold uppercase tracking-widest italic'>
              {analysisFeeText}
            </p>
            <p className='text-[9px] text-primary/50 font-black uppercase tracking-tighter'>
              {textOr(
                t?.workflows?.shared?.processingFees,
                'Taxas de processamento podem variar',
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Overlay */}
      {showCheckout && (
        <MotionCheckoutOverlay
          amount={baseAmount}
          slug='apoio-rfe-motion-inicio'
          proc={proc}
          user={user}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  )
}

// ─── MotionInstructionStep ────────────────────────────────────────────────────

/**
 * COSInstruction - Form for client (reason + upload)
 */
export function MotionInstructionStep({ proc, onComplete }: StepProps) {
  const t = useT('onboarding')
  const data = (proc.step_data || {}) as Record<string, unknown>
  const [reason, setReason] = useState(String(data.motion_reason || ''))
  const [docs, setDocs] = useState<Record<string, string>>((data.docs as Record<string, string>) || {})
  const [loading, setLoading] = useState(false)
  const instructionCopy = t?.workflows?.motion?.instruction
  const instructionTitle =
    instructionCopy?.title || 'Motion - Suas Informacoes'
  const instructionDescription =
    instructionCopy?.desc ||
    'Envie a carta de negativa e descreva o que o USCIS alegou para que nossa equipe analise o caso.'
  const reasonLabel =
    instructionCopy?.reasonLabel || 'Motivo da Negativa'
  const reasonPlaceholder =
    instructionCopy?.reasonPlaceholder ||
    'Descreva aqui o que voce recebeu na carta de negativa...'
  const uploadLabel =
    instructionCopy?.uploadLabel || 'Carta de Negativa'
  const uploadTitle =
    instructionCopy?.uploadTitle || 'Carta de Negativa (USCIS)'
  const uploadSubtitle =
    instructionCopy?.uploadSubtitle || 'Documento recebido pelo correio ou online'
  const uploadStatus = instructionCopy?.uploadStatus || 'Negativa'
  const supportingUploadLabel =
    instructionCopy?.supportingUploadLabel || 'Documentos de apoio (opcional)'
  const supportingUploadTitle =
    instructionCopy?.supportingUploadTitle || 'Documentos de apoio'
  const supportingUploadSubtitle =
    instructionCopy?.supportingUploadSubtitle ||
    'Evidencias extras que reforcem seu caso'
  const supportingUploadStatus =
    instructionCopy?.supportingUploadStatus || 'Opcional'
  const submitLabel = instructionCopy?.btn || 'Enviar para Analise'

  useEffect(() => {
    setReason(String(data.motion_reason || ''))
    setDocs((data.docs as Record<string, string>) || {})
  }, [data.motion_reason, data.docs])

  const handleFileUpload = async (docKey: string, file: File) => {
    try {
      setLoading(true)
      toast.loading(t?.workflows?.shared?.sendingFile || 'Sending...', {
        id: 'upload',
      })
      const fileExt = file.name.split('.').pop()
      const filePath = `${proc.user_id}/motion/${docKey}_${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const currentDocs = { ...docs }
      const newDocs = { ...currentDocs, [docKey]: filePath }
      
      await processService.updateStepData(proc.id, {
        docs: newDocs,
      })

      setDocs(newDocs)

      if (docKey === 'motion_denial_letter') {
        await cosNotificationService.notifyAdmin({
          event: 'motion_denial_letter_uploaded',
          processId: proc.id,
          userId: proc.user_id,
        })
      } else if (docKey === 'motion_supporting_docs') {
        await cosNotificationService.notifyAdmin({
          event: 'motion_supporting_docs_uploaded',
          processId: proc.id,
          userId: proc.user_id,
        })
      }

      toast.success(t?.workflows?.shared?.fileSent || 'File sent!', {
        id: 'upload',
      })
    } catch (e: unknown) {
      const err = e as Error
      toast.error('Erro no upload: ' + err.message, { id: 'upload' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!reason.trim()) {
        toast.error(
        reasonLabel || 'Description required',
      )
      return
    }
    try {
      setLoading(true)
      await processService.updateStepData(proc.id, {
        motion_reason: reason,
        motion_submitted_at: new Date().toISOString(),
        workflow_status: 'awaiting_proposal',
      })

      await cosNotificationService.notifyAdmin({
        event: 'motion_reason_submitted',
        processId: proc.id,
        userId: proc.user_id,
      })

      onComplete?.()
    } catch (e: unknown) {
      const err = e as Error
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-2xl mx-auto space-y-8'>
      <div className='bg-card rounded-[40px] border border-border p-12 shadow-sm'>
        <h3 className='text-2xl font-black text-text mb-6 uppercase tracking-tight'>
          {instructionTitle}
        </h3>
        <p className='text-sm text-text-muted font-medium leading-relaxed mb-8'>
          {instructionDescription}
        </p>

        <div className='space-y-6'>
          <div>
            <label className='text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block'>
              {reasonLabel}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full bg-bg-subtle border border-border rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[150px]'
              placeholder={reasonPlaceholder}
            />
          </div>

          <div>
            <label className='text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block'>
              {uploadLabel}
            </label>
            <DocUploadCard
              docKey='motion_denial_letter'
              title={uploadTitle}
              subtitle={uploadSubtitle}
              doc={{
                file: null,
                label: uploadStatus,
                path: docs?.motion_denial_letter,
              }}
              onChange={(key: string, file: File) =>
                handleFileUpload(key, file)
              }
            />
          </div>

          <div>
            <label className='text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block'>
              {supportingUploadLabel}
            </label>
            <DocUploadCard
              docKey='motion_supporting_docs'
              title={supportingUploadTitle}
              subtitle={supportingUploadSubtitle}
              doc={{
                file: null,
                label: supportingUploadStatus,
                path: docs?.motion_supporting_docs,
              }}
              onChange={(key: string, file: File) =>
                handleFileUpload(key, file)
              }
            />
          </div>

          <button
            disabled={loading}
            onClick={handleSave}
            className={cn(
              'w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3',
              loading && 'opacity-50 cursor-not-allowed',
            )}
          >
            {loading ? t?.workflows?.shared?.saving || 'Salvando...' : submitLabel}
            {!loading && <RiArrowRightLine className='text-xl' />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MotionAcceptProposalStep ─────────────────────────────────────────────────

/**
 * COSAceptProposal - Receive proposal & pay custom amount
 */
export function MotionAcceptProposalStep({
  proc,
  user,
}: StepProps) {
  const t = useT('onboarding')
  const [showCheckout, setShowCheckout] = useState(false)
  const data = (proc.step_data || {}) as Record<string, unknown>
  const purchases = Array.isArray(data.purchases)
    ? (data.purchases as Array<{ slug?: string }>)
    : []
  const proposalText =
    (data.motion_proposal_text as string) ||
    t?.workflows?.motion?.proposal?.defaultStrategy
  const proposalAmount =
    Number(data.motion_amount ?? data.motion_proposal_amount) || 0
  const alreadyPaid =
    Boolean(data.motion_payment_completed_at) ||
    Boolean(data.motion_proposal_paid) ||
    purchases.some((p) => p?.slug === 'proposta-rfe-motion')

  return (
    <>
      <div className='max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <div className='bg-card rounded-[40px] border border-border p-12 shadow-sm text-center'>
          <div className='w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-8 shadow-inner'>
            <RiShieldCheckLine className='text-4xl' />
          </div>
          <h2 className='text-3xl font-black text-text mb-4 uppercase tracking-tight'>
            {t?.workflows?.motion?.proposal?.title}
          </h2>

          <div className='flex items-center justify-center gap-3 mb-10'>
            <div className='h-px w-8 bg-bg-subtle' />
            <p className='text-xs text-text-muted font-bold uppercase tracking-widest'>
              {t?.workflows?.motion?.proposal?.strategyLabel}
            </p>
            <div className='h-px w-8 bg-bg-subtle' />
          </div>

          <div className='bg-bg-subtle rounded-3xl p-8 mb-10 border border-border italic text-text-muted text-sm leading-relaxed font-serif text-center'>
            "{proposalText}"
          </div>

          <div className='bg-primary/5 border border-primary/10 rounded-3xl p-8 mb-4 flex items-center justify-between'>
            <div>
              <p className='text-[10px] font-black text-primary uppercase tracking-widest mb-1'>
                {t?.workflows?.shared?.serviceCost}
              </p>
              <h4 className='text-3xl font-black text-text'>
                $ {proposalAmount.toFixed(2)}
              </h4>
            </div>
            <RiMoneyDollarCircleLine className='text-5xl text-primary opacity-20' />
          </div>

          {alreadyPaid ? (
            <div className='mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm font-semibold text-emerald-700'>
              {t?.workflows?.motion?.proposal?.alreadyPaid ||
                'Pagamento já confirmado.'}
            </div>
          ) : proposalAmount <= 0 ? (
            <div className='mb-6 rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm font-semibold text-amber-700'>
              {t?.workflows?.motion?.proposal?.waitingProposal ||
                'Aguardando proposta do time.'}
            </div>
          ) : null}

          <div className='flex items-center justify-center gap-4 mb-10 px-4'>
            <div className='flex items-center gap-1.5 px-2 py-1 bg-bg-subtle rounded-lg border border-border'>
              <span className='text-[9px] font-bold text-text-muted uppercase tracking-tight'>
                {t?.workflows?.shared?.ref}
              </span>
              <span className='text-[10px] font-mono text-text-muted'>
                {proc.service_slug}
              </span>
            </div>
            <div className='flex items-center gap-1.5 px-2 py-1 bg-bg-subtle rounded-lg border border-border'>
              <span className='text-[9px] font-bold text-text-muted uppercase tracking-tight'>
                {t?.workflows?.shared?.id}
              </span>
              <span className='text-[10px] font-mono text-text-muted'>
                {proc.id.slice(0, 8)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            disabled={proposalAmount <= 0 || alreadyPaid}
            className='w-full bg-primary hover:bg-primary-hover text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50'
          >
            {t?.workflows?.motion?.proposal?.btn}
            <RiArrowRightLine className='text-xl' />
          </button>

          {proposalAmount > 0 && (
            <p className='mt-4 text-[9px] text-text-muted font-bold uppercase tracking-widest text-center italic'>
              {t?.workflows?.checkout?.totalWithTax?.replace(
                '{amount}',
                estimateCardTotal(proposalAmount).toFixed(2),
              ) || `Total: $${estimateCardTotal(proposalAmount).toFixed(2)}`}
            </p>
          )}
        </div>
      </div>

      {/* Checkout Overlay */}
      {showCheckout && (
        <MotionCheckoutOverlay
          amount={proposalAmount}
          slug='proposta-rfe-motion'
          proc={proc}
          user={user}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  )
}

// ─── MotionEndStep ────────────────────────────────────────────────────────────

/**
 * COSEnd - Final Result reporting
 */
export function MotionEndStep({ proc }: StepProps) {
  const t = useT('onboarding')
  const navigate = useNavigate()
  const { user } = useAuth()
  const data = (proc.step_data || {}) as Record<string, unknown>
  const [savingResult, setSavingResult] = useState(false)
  const [chatSeeded, setChatSeeded] = useState(
    Boolean(data.motion_chat_started_at),
  )
  const [localResult, setLocalResult] = useState<string>(() =>
    String(data.motion_final_result || '').toLowerCase(),
  )
  const chatSeededRef = useRef(Boolean(data.motion_chat_started_at))
  const motionLetterPath = (data.docs as Record<string, string>)
    ?.motion_final_package
  const motionLetterUrl = motionLetterPath
    ? supabase.storage.from('profiles').getPublicUrl(motionLetterPath).data
        .publicUrl
    : null
  const workflowStatus = String(data.workflow_status || '').toLowerCase()
  const motionResult =
    localResult || String(data.motion_final_result || '').toLowerCase()
  const normalizedStatus =
    workflowStatus === 'approved' || workflowStatus === 'rejected'
      ? workflowStatus
      : motionResult === 'approved' || motionResult === 'rejected'
        ? motionResult
        : 'in_progress'
  const specialistMessage = chatSeeded || data.motion_chat_started_at
    ? 'O acesso ao especialista ja foi liberado e um chat foi aberto para conduzir sua Motion.'
    : 'Seu acesso ao especialista foi liberado. Entre no chat para conduzir sua Motion com nossa equipe.'

  useEffect(() => {
    if (chatSeededRef.current || chatSeeded) return
    if (!user?.id) return

    chatSeededRef.current = true

    void (async () => {
      try {
        const created = await processService.ensureChatThread(
          proc.id,
          user.id,
          'Olá! Quero falar com o especialista sobre o resultado da minha Motion.',
        )

        if (created) {
          await processService.updateStepData(proc.id, {
            motion_chat_started_at: new Date().toISOString(),
          })
          setChatSeeded(true)
        }
      } catch (error) {
        console.error('[MotionEndStep] failed to seed chat:', error)
      }
    })()
  }, [chatSeeded, proc.id, user?.id])

  return (
    <div className='max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700'>
      {motionLetterUrl && (
        <div className='bg-emerald-50 border border-emerald-100 rounded-[40px] p-8 flex flex-col items-center text-center shadow-sm'>
          <div className='w-16 h-16 rounded-2xl bg-card text-emerald-500 flex items-center justify-center mb-4 shadow-sm'>
            <RiDownload2Line className='text-3xl' />
          </div>
          <h3 className='text-lg font-black text-text uppercase tracking-tight'>
            {t?.workflows?.motion?.end?.packageTitle}
          </h3>
          <p className='text-xs text-text-muted font-medium mt-1 mb-6'>
            {t?.workflows?.motion?.end?.packageDesc}
          </p>
          <a
            href={motionLetterUrl}
            target='_blank'
            rel='noreferrer'
            className='px-12 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2'
          >
            <RiDownload2Line className='text-lg' /> Baixar Pacote de Motion
          </a>
        </div>
      )}

      <div className='bg-card rounded-[40px] border border-border p-12 shadow-sm text-center'>
        <div className='w-20 h-20 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-8'>
          <RiInformationLine className='text-4xl' />
        </div>
        <h2 className='text-2xl font-black text-text mb-3 uppercase tracking-tight'>
          Fale com o especialista pelo chat
        </h2>
        <p className='text-sm text-text-muted font-medium max-w-sm mx-auto leading-relaxed mb-10'>
          {specialistMessage}
        </p>
        <button
          type='button'
          onClick={() => navigate('/dashboard/support')}
          className='h-12 px-8 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all'
        >
          Ir para o Specialist
          <RiArrowRightLine className='inline ml-2 text-base' />
        </button>
      </div>

      <div className='bg-card rounded-[40px] border border-border p-12 shadow-sm text-center'>
        <div className='w-20 h-20 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-8'>
          <RiCheckDoubleLine className='text-4xl' />
        </div>
        <h2 className='text-2xl font-black text-text mb-3 uppercase tracking-tight'>
          Como foi o resultado da Motion?
        </h2>
        <p className='text-sm text-text-muted font-medium max-w-sm mx-auto leading-relaxed mb-10'>
          Nos informe selecionando o botao abaixo.
        </p>
        <div
          className={`rounded-3xl border p-6 ${normalizedStatus === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : normalizedStatus === 'rejected' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}
        >
          <p className='text-xs font-black uppercase tracking-widest mb-1'>
            {normalizedStatus === 'approved'
              ? 'Aprovado'
              : normalizedStatus === 'rejected'
                ? 'Rejeitado'
                : 'Informe o resultado'}
          </p>
          <p className='text-sm font-medium leading-relaxed'>
            {normalizedStatus === 'approved'
              ? t?.workflows?.motion?.end?.approvedDesc ||
                'Seu Motion foi aprovado.'
              : normalizedStatus === 'rejected'
                ? t?.workflows?.motion?.end?.deniedDesc ||
                  'Seu Motion foi rejeitado.'
                : 'Selecione uma opcao abaixo para nos informar como foi a Motion.'}
          </p>
        </div>

        <div className='mt-6 space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <button
              type='button'
              disabled={
                savingResult ||
                normalizedStatus === 'approved' ||
                normalizedStatus === 'rejected'
              }
              onClick={async () => {
                try {
                  setSavingResult(true)
                  await processService.updateStepData(proc.id, {
                    motion_final_result: 'approved',
                    workflow_status: 'approved',
                    motion_result_reported_at: new Date().toISOString(),
                    motion_result_reported_by: 'customer',
                  })
                  setLocalResult('approved')
                  toast.success('Resultado informado como aprovado.')
                } catch (error) {
                  console.error(
                    '[MotionEndStep] failed to save approved result:',
                    error,
                  )
                  toast.error('Nao foi possivel salvar o resultado.')
                } finally {
                  setSavingResult(false)
                }
              }}
              className='h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60'
            >
              <RiCheckLine className='inline mr-2 text-base' />
              Aprovado
            </button>
            <button
              type='button'
              disabled={
                savingResult ||
                normalizedStatus === 'approved' ||
                normalizedStatus === 'rejected'
              }
              onClick={async () => {
                try {
                  setSavingResult(true)
                  await processService.updateStepData(proc.id, {
                    motion_final_result: 'rejected',
                    workflow_status: 'rejected',
                    motion_result_reported_at: new Date().toISOString(),
                    motion_result_reported_by: 'customer',
                  })
                  setLocalResult('rejected')
                  toast.success('Resultado informado como reprovado.')
                } catch (error) {
                  console.error(
                    '[MotionEndStep] failed to save rejected result:',
                    error,
                  )
                  toast.error('Nao foi possivel salvar o resultado.')
                } finally {
                  setSavingResult(false)
                }
              }}
              className='h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all disabled:opacity-60'
            >
              <RiCloseLine className='inline mr-2 text-base' />
              Reprovado
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
