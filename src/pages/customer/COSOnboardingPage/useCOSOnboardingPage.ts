/**
 * useCOSOnboardingPage — integração real com Supabase
 *
 * Substitui o mock (processService / localStorage) pelo sistema de workflow:
 *  - user_product_instances  → instância do processo do usuário
 *  - user_steps              → cada etapa com status e dados
 *  - step_reviews            → feedback do admin
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../hooks/useAuth'
import { useT } from '../../../i18n'
import { getSupabaseClient } from '../../../lib/supabase'
import { ensureWorkflowBackend, workflowService, getProductIdBySlug } from '../../../services/workflow.service'
import type { UserProductInstance, UserStep, StepReview } from '../../../services/workflow.service'
import type { UserService, USCISOutcome, MotionOutcome, RFEOutcome } from '../../../models/process.model'
import { processService } from '../../../services/process.service'
import { cosNotificationService } from '../../../services/cos-notification.service'
import type { DocFile } from '../../../components/DocUploadCard'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Dependent {
  id:           string
  name:         string
  relation:     'spouse' | 'child' | 'other' | ''
  birthDate:    string
  marriageDate: string
  i94Date:      string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveCurrentStepIdx(steps: UserStep[]): number {
  const idx = steps.findIndex(
    (s) => !['approved', 'skipped', 'completed', 'in_review'].includes(s.status),
  )
  return idx === -1 ? Math.max(0, steps.length - 1) : idx
}

function shouldFallbackStorageUpload(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  const normalized = message.toLowerCase()

  return [
    'bucket not found',
    'storage',
    'object not found',
    'permission denied',
    'row-level security',
  ].some((token) => normalized.includes(token))
}

function buildMockFileRef(instanceId: string, slotKey: string, file: File) {
  return {
    name: slotKey,
    path: `mock://${instanceId}/${slotKey}/${file.name}`,
    url: URL.createObjectURL(file),
  }
}

function buildProcShim(
  instance: UserProductInstance,
  steps: UserStep[],
  slug: string,
  stepIdx: number,
  reviews: StepReview[],
): UserService {
  const merged: Record<string, unknown> = {}
  for (const s of steps) {
    if (s.data) Object.assign(merged, s.data)
  }
  merged.paid_dependents =
    (instance.metadata as Record<string, unknown>)?.paid_dependents ?? 0

  const currentStepReviews = reviews.filter(
    (r) => r.user_step_id === steps[stepIdx]?.id,
  )
  const lastRevision = currentStepReviews
    .filter((r) => r.action === 'revision_requested')
    .at(-1)

  if (lastRevision) {
    merged.admin_feedback = lastRevision.comment ?? true
    const match = String(lastRevision.comment ?? '').match(/campos:\s*(.+)/i)
    if (match) {
      merged.rejected_items = match[1].split(',').map((s) => s.trim())
    }
  }

  return {
    id:           instance.id,
    user_id:      instance.user_id,
    service_slug: slug,
    status:       instance.status === 'approved' ? 'completed' : 'active',
    current_step: stepIdx,
    step_data:    merged,
    created_at:   instance.created_at,
    updated_at:   instance.updated_at,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCOSOnboardingPage() {
  const t        = useT('onboarding')
  const navigate = useNavigate()
  const location = useLocation()
  const { slug: urlSlug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const slug = urlSlug
    || (location.pathname.includes('extensao-status') ? 'extensao-status' : 'troca-status')

  const { user } = useAuth()
  const urlStepIdx = Number(searchParams.get('step') ?? '-1')

  // ── DB state ───────────────────────────────────────────────────────────────
  const [instance,  setInstance]  = useState<UserProductInstance | null>(null)
  const [steps,     setSteps]     = useState<UserStep[]>([])
  const [reviews,   setReviews]   = useState<StepReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ── Form: step 0 ──────────────────────────────────────────────────────────
  const [currentVisa, setCurrentVisa] = useState<string | null>(null)
  const [targetVisa,  setTargetVisa]  = useState<string | null>(null)
  const [i94Date,     setI94Date]     = useState('')
  const [dependents,  setDependents]  = useState<Dependent[]>([])

  // ── Form: step 1 (docs) ───────────────────────────────────────────────────
  const [docs, setDocs] = useState<Record<string, DocFile>>({
    i94:           { file: null, label: 'COS I94' },
    passportVisa:  { file: null, label: 'COS PASSPORT VISA PRINCIPAL' },
    proofBrazil:   { file: null, label: 'COS PROOF OF RESIDENCE' },
    bankStatement: { file: null, label: 'COS BANK STATEMENT' },
  })

  const [isSubmitting,         setIsSubmitting]         = useState(false)
  const [isSavingMotionResult, setIsSavingMotionResult] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadWorkflow = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      await ensureWorkflowBackend(user.id)

      const productId = await getProductIdBySlug(slug)
      if (!productId) { toast.error('Produto não encontrado: ' + slug); return }

      const inst = await workflowService.getOrCreateInstance(user.id, productId)
      setInstance(inst)

      const userSteps = await workflowService.getSteps(inst.id)
      setSteps(userSteps)

      const allReviews = (await Promise.all(userSteps.map((s) => workflowService.getReviews(s.id)))).flat()
      setReviews(allReviews)

      // Hidrata form step 0
      const d0 = userSteps[0]?.data as Record<string, unknown> | undefined
      if (d0 && Object.keys(d0).length > 0) {
        if (d0.currentVisa) setCurrentVisa(d0.currentVisa as string)
        if (d0.targetVisa)  setTargetVisa(d0.targetVisa   as string)
        if (d0.i94Date)     setI94Date(d0.i94Date          as string)
        if (d0.dependents)  setDependents(d0.dependents    as Dependent[])
      }

      // Hidrata docs step 1
      const files1 = userSteps[1]?.files as Array<{ name: string; path: string; url: string }> | undefined
      if (files1?.length) {
        setDocs((prev) => {
          const next = { ...prev }
          for (const f of files1) next[f.name] = { file: null, label: f.name, path: f.path }
          return next
        })
      }

      // Posiciona na URL se não há ?step
      if (urlStepIdx < 0) {
        const first = deriveCurrentStepIdx(userSteps)
        const params = new URLSearchParams(searchParams)
        params.set('id', inst.id)
        params.set('step', String(Math.min(first, Math.max(0, userSteps.length - 1))))
        setSearchParams(params, { replace: true })
      }
    } catch (err) {
      console.error('[useCOSOnboardingPage]', err)
      toast.error('Erro ao carregar o processo.')
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, slug])

  useEffect(() => { void loadWorkflow() }, [loadWorkflow])

  // ── Derived ───────────────────────────────────────────────────────────────
  const dbCurrentStepIdx = useMemo(() => deriveCurrentStepIdx(steps), [steps])
  const stepIdx = urlStepIdx >= 0 ? urlStepIdx : dbCurrentStepIdx

  const proc = useMemo(
    () => instance ? buildProcShim(instance, steps, slug, stepIdx, reviews) : null,
    [instance, steps, slug, stepIdx, reviews],
  )

  const hasFeedback     = !!proc?.step_data?.admin_feedback
  const rejectedItems   = useMemo(() => (proc?.step_data?.rejected_items as string[]) ?? [], [proc])
  const isFieldRejected = useCallback((k: string) => hasFeedback && rejectedItems.includes(k), [hasFeedback, rejectedItems])
  const isReadOnly      = stepIdx < dbCurrentStepIdx && !hasFeedback
  const canSubmit       = stepIdx === 0 ? (!!currentVisa && !!targetVisa && !!i94Date) : stepIdx === 1 ? Object.values(docs).every((d) => d.file || d.path) : true

  const uscisResult          = String(proc?.step_data?.uscis_official_result ?? '').toLowerCase()
  const rfeResult            = String(proc?.step_data?.uscis_rfe_result      ?? '').toLowerCase()
  const motionReportedResult = String(proc?.step_data?.motion_final_result   ?? '').toLowerCase()
  const isMotionContext    = uscisResult === 'denied' || uscisResult === 'rejected' || rfeResult === 'denied' || stepIdx >= 19
  const isRFEContext       = !isMotionContext && (uscisResult === 'rfe' || rfeResult === 'rfe' || (stepIdx >= 13 && stepIdx <= 18))
  const isMotionResultStep = stepIdx === 23 || stepIdx === 24

  // ── Dependents ────────────────────────────────────────────────────────────
  const addDependent    = useCallback(() => setDependents((p) => [...p, { id: crypto.randomUUID(), name: '', relation: '', birthDate: '', marriageDate: '', i94Date: '' }]), [])
  const updateDependent = useCallback((id: string, field: keyof Dependent, value: string) => setDependents((p) => p.map((d) => d.id === id ? { ...d, [field]: value } : d)), [])
  const removeDependent = useCallback((id: string) => setDependents((p) => p.filter((d) => d.id !== id)), [])
  const handleDocChange = useCallback((key: string, file: File) => setDocs((p) => ({ ...p, [key]: { ...p[key], file } })), [])

  const getDocSlots = useCallback(() => {
    const ext = slug === 'extensao-status'
    const bankSub = ext ? 'Extensão 1.000U$/mes = U$ 6.000' : `COS U$ 22,000 + U$ 5.000 por dependente = U$ ${(22000 + dependents.length * 5000).toLocaleString('en-US')}`
    const slots = [
      { key: 'i94',          title: 'Form I-94 (Principal)',        subtitle: 'U.S. Entry Record',     category: 'Personal Documents' },
      { key: 'passportVisa', title: 'Passport and Visa (Principal)', subtitle: 'Bio page + Visa stamp', category: 'Personal Documents' },
      { key: 'proofBrazil',  title: 'Proof of Residence',           subtitle: 'Utility bill or bank doc', category: 'Personal Documents' },
      { key: 'bankStatement',title: 'Bank Statement',                subtitle: bankSub,                 category: 'Financial Documents' },
    ]
    for (const dep of dependents) {
      slots.push({ key: `i94_dep_${dep.id}`,          title: `I-94 (${dep.name || 'Dependent'})`,           subtitle: 'U.S. Entry Record',    category: `Docs: ${dep.name || 'Dependent'}` })
      slots.push({ key: `passportVisa_dep_${dep.id}`, title: `Passport/Visa (${dep.name || 'Dependent'})`,  subtitle: 'Bio page + Visa stamp', category: `Docs: ${dep.name || 'Dependent'}` })
      if (dep.relation === 'child')  slots.push({ key: `birthCertificate_dep_${dep.id}`, title: `Birth Certificate (${dep.name || 'Dependent'})`, subtitle: 'Birth proof',    category: `Docs: ${dep.name || 'Dependent'}` })
      if (dep.relation === 'spouse') slots.push({ key: 'marriageCertificate',              title: 'Marriage Certificate',                            subtitle: 'Marriage proof', category: `Docs: ${dep.name || 'Dependent'}` })
    }
    return slots
  }, [slug, dependents])

  // ── handleConcluir ────────────────────────────────────────────────────────
  const handleConcluir = useCallback(async () => {
    if (!user || !instance || steps.length === 0) return
    setIsSubmitting(true)
    try {
      const backend = await ensureWorkflowBackend(user.id)
      const currentUserStep = steps[stepIdx]
      if (!currentUserStep) throw new Error('Step não encontrado')

      if (stepIdx === 0) {
        await workflowService.submitStep(currentUserStep.id, {
          currentVisa, targetVisa, i94Date, dependents,
        })
      } else if (stepIdx === 1) {
        const slots = getDocSlots()
        const refs: Array<{ name: string; path: string; url: string }> = []
        const storage = backend === 'supabase'
          ? getSupabaseClient()?.storage.from('aplikei-profiles') ?? null
          : null

        for (const slot of slots) {
          const doc = docs[slot.key]
          if (doc?.file) {
            const ext  = doc.file.name.split('.').pop()
            const path = `${user!.id}/cos/${instance.id}/${slot.key}.${ext}`

            if (storage) {
              try {
                const { error } = await storage.upload(path, doc.file, { upsert: true })
                if (error) throw new Error(`Upload ${slot.key}: ${error.message}`)
                refs.push({ name: slot.key, path, url: storage.getPublicUrl(path).data.publicUrl })
                continue
              } catch (error) {
                if (!shouldFallbackStorageUpload(error)) {
                  throw error
                }
                console.warn('[useCOSOnboardingPage] Falling back to local upload storage:', error)
              }
            }

            refs.push(buildMockFileRef(instance.id, slot.key, doc.file))
          } else if (doc?.path) {
            refs.push({
              name: slot.key,
              path: doc.path,
              url: storage && !doc.path.startsWith('mock://')
                ? storage.getPublicUrl(doc.path).data.publicUrl
                : doc.path,
            })
          }
        }

        setDocs((prev) => {
          const next = { ...prev }
          refs.forEach((ref) => {
            next[ref.name] = {
              ...(next[ref.name] ?? { file: null, label: ref.name }),
              file: null,
              path: ref.path,
            }
          })
          return next
        })

        await workflowService.submitStepFiles(currentUserStep.id, refs)
      } else {
        await workflowService.completeStep(currentUserStep.id)
      }

      // Se não é F1, pula I-20 / SEVIS (índices 7, 8, 9)
      let nextSteps = await workflowService.getSteps(instance.id)
      if (targetVisa !== 'F1') {
        const toSkip = nextSteps.filter((_, i) => [7, 8, 9].includes(i) && _.status === 'pending')
        if (toSkip.length > 0) {
          await Promise.all(toSkip.map((s) => workflowService.completeStep(s.id)))
          nextSteps = await workflowService.getSteps(instance.id)
        }
      }

      setSteps(nextSteps)

      toast.success(t.cos?.toasts?.stepSent ?? 'Etapa enviada!')
      const derivedNextIdx = deriveCurrentStepIdx(nextSteps)
      const currentStatus = nextSteps[stepIdx]?.status
      const shouldAdvanceSequentially =
        derivedNextIdx <= stepIdx &&
        currentStatus &&
        !['pending', 'in_progress', 'revision_requested'].includes(currentStatus)

      const nextIdx = shouldAdvanceSequentially ? stepIdx + 1 : derivedNextIdx

      if (nextIdx >= nextSteps.length) {
        navigate(`/dashboard/processes/${slug}?id=${instance.id}`)
      } else {
        const nextStep = nextSteps[nextIdx]
        if (nextStep?.product_step?.type === 'admin_action') {
          navigate(`/dashboard/processes/${slug}?id=${instance.id}`)
          return
        }

        const params = new URLSearchParams(searchParams)
        params.set('id', instance.id)
        params.set('step', String(nextIdx))
        setSearchParams(params)
      }
    } catch (err) {
      toast.error(`${t.cos?.toasts?.errorSaving ?? 'Erro'}: ${err instanceof Error ? err.message : 'desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [instance, steps, stepIdx, currentVisa, targetVisa, i94Date, dependents, docs, getDocSlots, user, t, navigate, slug, searchParams])

  const handleMotionResultReport = useCallback(async (result: 'approved' | 'rejected') => {
    if (!steps.length) return
    setIsSavingMotionResult(true)
    try {
      const last = steps.at(-1)!
      await workflowService.saveDraft(last.id, { motion_final_result: result, motion_result_reported_at: new Date().toISOString() })
      toast.success(result === 'approved' ? 'Resultado informado como aprovado.' : 'Resultado informado como reprovado.')
    } catch { toast.error('Não foi possível salvar o resultado.') }
    finally { setIsSavingMotionResult(false) }
  }, [steps])

  const goToProcess        = useCallback(() => {
    if (instance) {
      navigate(`/dashboard/processes/${slug}?id=${instance.id}`)
      return
    }
    navigate(`/dashboard/processes/${slug}`)
  }, [instance, navigate, slug])
  const jumpToOnboardingStep = useCallback((target: number) => {
    const params = new URLSearchParams(searchParams)
    if (instance) {
      params.set('id', instance.id)
    }
    params.set('step', String(target))
    setSearchParams(params)
  }, [instance, searchParams, setSearchParams])

  const handleUSCISResult = useCallback(async (
    result: USCISOutcome,
    opts: { jumpToStep: (n: number) => void }
  ) => {
    if (!proc) return
    const now = new Date().toISOString()

    await processService.updateStepData(proc.id, {
      uscis_official_result: result,
      uscis_reported_at: now,
    })

    await cosNotificationService.notifyAdmin({
      event: 'uscis_result_reported',
      processId: proc.id,
      userId: proc.user_id,
      metadata: { result },
    })

    if (result === 'approved') {
      await workflowService.updateInstanceOutcome(proc.id, { type: 'uscis', result: 'approved' })
      return
    }

    if (result === 'denied') {
      await processService.startAdditionalWorkflow(proc.id, 'motion')
      await cosNotificationService.notifyAdmin({
        event: 'motion_started',
        processId: proc.id,
        userId: proc.user_id,
      })
      opts.jumpToStep(19)
      return
    }

    if (result === 'rfe') {
      await processService.startAdditionalWorkflow(proc.id, 'rfe')
      await cosNotificationService.notifyAdmin({
        event: 'rfe_started',
        processId: proc.id,
        userId: proc.user_id,
      })
      opts.jumpToStep(13)
    }
  }, [proc])

  const handleMotionResult = useCallback(async (result: MotionOutcome) => {
    if (!proc) return
    await processService.updateStepData(proc.id, {
      motion_final_result: result,
      workflow_status: result,
      motion_result_reported_at: new Date().toISOString(),
      motion_result_reported_by: 'customer',
    })
    await processService.updateProcessStatus(proc.id, 'completed')
    await workflowService.updateInstanceOutcome(proc.id, { type: 'motion', result })
    await cosNotificationService.notifyAdmin({
      event: 'motion_result_reported',
      processId: proc.id,
      userId: proc.user_id,
      metadata: { result },
    })
    await loadWorkflow()
  }, [proc, loadWorkflow])

  const handleRFEResult = useCallback(async (
    result: RFEOutcome,
    opts: { jumpToStep: (n: number) => void }
  ) => {
    if (!proc) return
    const data = (proc.step_data || {}) as Record<string, unknown>
    const history = (data.rfe_history as object[]) || []

    // 1. Salvar histórico do ciclo atual
    const currentDocs = (data.docs as Record<string, string>) || {}
    const newHistoryItem = {
      proposal_text: data.rfe_proposal_text,
      proposal_amount: Number(data.rfe_proposal_amount) || 0,
      result,
      rfe_letter: currentDocs.rfe_letter,
      rfe_final_package: currentDocs.rfe_final_package,
      sent_at: (data.rfe_proposal_sent_at as string) || new Date().toISOString(),
    }

    // 2. Resetar campos do ciclo
    const { rfe_letter: _l, rfe_final_package: _p, ...remainingDocs } = currentDocs
    const resetData: Record<string, unknown> = {
      rfe_history: [...history, newHistoryItem],
      rfe_proposal_text: null,
      rfe_proposal_amount: null,
      rfe_proposal_sent_at: null,
      rfe_description: null,
      uscis_rfe_result: result,
    }

    await cosNotificationService.notifyAdmin({
      event: 'rfe_result_reported',
      processId: proc.id,
      userId: proc.user_id,
      metadata: { result },
    })

    if (result === 'approved') {
      await processService.updateStepData(proc.id, resetData)
      await processService.updateProcessStatus(proc.id, 'completed')
      await workflowService.updateInstanceOutcome(proc.id, { type: 'rfe', result: 'approved' })
      return
    }

    if (result === 'rfe') {
      await processService.updateStepData(proc.id, {
        ...resetData,
        docs: remainingDocs,
        uscis_official_result: 'rfe',
      })
      opts.jumpToStep(13)
      return
    }

    if (result === 'denied') {
      await processService.updateStepData(proc.id, {
        ...resetData,
        uscis_official_result: 'denied',
      })
      await processService.startAdditionalWorkflow(proc.id, 'motion')
      await cosNotificationService.notifyAdmin({
        event: 'motion_started',
        processId: proc.id,
        userId: proc.user_id,
      })
      opts.jumpToStep(19)
    }
  }, [proc])

  return {
    t, user, slug, stepIdx,
    service: null,
    proc, isLoading, isSubmitting, isSavingMotionResult,
    currentVisa, setCurrentVisa,
    targetVisa,  setTargetVisa,
    i94Date,     setI94Date,
    dependents, docs,
    hasFeedback, isFieldRejected, isReadOnly, canSubmit,
    isMotionContext, isRFEContext, isMotionResultStep, motionReportedResult,
    addDependent, updateDependent, removeDependent,
    handleDocChange, handleConcluir, handleMotionResultReport,
    handleUSCISResult, handleMotionResult, handleRFEResult,
    getDocSlots, goToProcess, jumpToOnboardingStep,
    // extras para componentes conectados
    instance, steps, refreshWorkflow: loadWorkflow,
  }
}
