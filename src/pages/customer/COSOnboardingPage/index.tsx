import { useState, useEffect } from 'react'
import {
  useNavigate,
  useSearchParams,
  useParams,
  useLocation,
} from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiArrowLeftSLine,
  RiAddLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiErrorWarningLine,
} from 'react-icons/ri'
import { MdPerson, MdAccountBalance } from 'react-icons/md'
import { useAuth } from '../../../hooks/useAuth'
import {
  processService,
  type UserService,
} from '../../../services/process.service'
import { getServiceBySlug } from '../../../data/services'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { getSessionSafe } from '../../../lib/supabase'
import I539FormStep from './I539FormStep'
import CoverLetterStep from './CoverLetterStep'
import FinalFormsStep from './FinalFormsStep'
import FinalPackageStep from './FinalPackageStep'
import I20UploadStep from './I20UploadStep'
import SevisFeeStep from './SevisFeeStep'

import { useT } from '../../../i18n'
import {
  MotionExplanationStep,
  MotionInstructionStep,
  MotionAcceptProposalStep,
  MotionEndStep,
} from './MotionWorkflow'
import {
  RFEExplanationStep,
  RFEInstructionStep,
  RFEAcceptProposalStep,
  RFEEndStep,
} from './RFEWorkflow'
import { DocUploadCard, type DocFile } from '../../../components/DocUploadCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'

// Assets
import imgTutor1 from '../../../assets/tutor_i94/arrastar_ate_o_final_para_aceitar.png'
import imgTutor2 from '../../../assets/tutor_i94/fazerupload_ou_usar_a_camera_do_documento.png'
import imgTutor3 from '../../../assets/tutor_i94/preencher_campos.png'

// ─── Types ────────────────────────────────────────────────────────────────────

type VisaType = string

interface Dependent {
  id: string
  name: string
  relation: 'spouse' | 'child' | 'other' | ''
  birthDate: string
  marriageDate: string
  i94Date: string
}

const CURRENT_VISA_OPTIONS: { label: string; icon: string; color: string }[] = [
  { label: 'B1/B2', icon: '🌐', color: 'text-sky-500' },
  { label: 'F1/F2', icon: '🎓', color: 'text-green-500' },
  { label: 'J1/J2', icon: '🔄', color: 'text-violet-500' },
  { label: 'L1/L2', icon: '📋', color: 'text-orange-500' },
  { label: 'R1/R2', icon: '🏛️', color: 'text-red-500' },
  { label: 'Other', icon: '···', color: 'text-text-muted' },
]

const TARGET_VISA_OPTIONS: { label: string; icon: string; color: string }[] = [
  { label: 'B1/B2', icon: '🌐', color: 'text-sky-500' },
  { label: 'F1', icon: '🎓', color: 'text-green-500' },
  { label: 'J1', icon: '🔄', color: 'text-violet-500' },
]

// ─── Main Component ──────────────────────────────────────────────────────────

export default function COSOnboardingPage() {
  const t = useT('onboarding')
  const navigate = useNavigate()
  const { slug: urlSlug } = useParams<{ slug: string }>()
  const location = useLocation()
  const slug =
    urlSlug ||
    (location.pathname.includes('extensao-status')
      ? 'extensao-status'
      : 'troca-status')
  const [searchParams] = useSearchParams()
  const stepIdx = Number(searchParams.get('step') ?? '0')
  const parentProcessId =
    searchParams.get('id') ||
    searchParams.get('parentId') ||
    searchParams.get('processId')
  const service = getServiceBySlug(slug)

  // Safety guard: this component is only for COS products.
  // If somehow the generic :slug route catches a B1/B2 request, redirect immediately.
  useEffect(() => {
    if (slug === 'visto-b1-b2') {
      navigate(
        `/dashboard/processes/visto-b1-b2/onboarding${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        { replace: true },
      )
    }
  }, [slug, navigate, searchParams])

  const { user } = useAuth()
  const [proc, setProc] = useState<UserService | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingMotionResult, setIsSavingMotionResult] = useState(false)

  // ── Step 0 — COS Application Form ──
  const [currentVisa, setCurrentVisa] = useState<VisaType | null>(null)
  const [targetVisa, setTargetVisa] = useState<VisaType | null>(null)
  const [i94Date, setI94Date] = useState('')
  const [dependents, setDependents] = useState<Dependent[]>([])

  // ── Step 1 — Documents ──
  const [docs, setDocs] = useState<Record<string, DocFile>>({
    i94: { file: null, label: 'COS I94' },
    passportVisa: { file: null, label: 'COS PASSPORT VISA PRINCIPAL' },
    proofBrazil: { file: null, label: 'COS PROOF OF RESIDENCE' },
    bankStatement: { file: null, label: 'COS BANK STATEMENT' },
  })

  const hasFeedback = !!proc?.step_data?.admin_feedback
  const rejectedItems = (proc?.step_data?.rejected_items as string[]) || []
  const isFieldRejected = (key: string) =>
    hasFeedback && rejectedItems.includes(key)

  const isReadOnly = proc
    ? stepIdx < (proc.current_step ?? 0) && !hasFeedback
    : false

  const canSubmitStep0 = !!currentVisa && !!targetVisa && !!i94Date
  const canSubmitStep1 = Object.values(docs).every(
    (d) => d.file !== null || d.path,
  )
  const canSubmit =
    stepIdx === 0 ? canSubmitStep0 : stepIdx === 1 ? canSubmitStep1 : true
  const currentStepId = service?.steps[stepIdx]?.id
  const isMotionResultStep =
    currentStepId === 'cos_motion_end' || stepIdx === 23 || stepIdx === 24
  const motionReportedResult = String(
    proc?.step_data?.motion_final_result || '',
  ).toLowerCase()
  const uscisResult = String(
    proc?.step_data?.uscis_official_result || '',
  ).toLowerCase()
  const rfeResult = String(
    proc?.step_data?.uscis_rfe_result || '',
  ).toLowerCase()
  const currentProcessStep = proc?.current_step ?? 0
  const isRecoveryRangeStep = stepIdx >= 13 && stepIdx <= 24
  const isMotionContext =
    uscisResult === 'denied' ||
    uscisResult === 'rejected' ||
    rfeResult === 'denied' ||
    rfeResult === 'rejected' ||
    currentProcessStep >= 19
  const isRFEContext =
    !isMotionContext &&
    (uscisResult === 'rfe' ||
      rfeResult === 'rfe' ||
      (currentProcessStep >= 13 && currentProcessStep <= 18))

  const handleMotionResultReport = async (result: 'approved' | 'rejected') => {
    if (!proc) return

    const reportedAt = new Date().toISOString()
    setIsSavingMotionResult(true)
    try {
      await processService.updateStepData(proc.id, {
        motion_final_result: result,
        workflow_status: result,
        motion_result_reported_at: reportedAt,
        motion_result_reported_by: 'customer',
      })

      setProc((prev) => {
        if (!prev) return prev
        const currentStepData = (prev.step_data || {}) as Record<
          string,
          unknown
        >
        return {
          ...prev,
          step_data: {
            ...currentStepData,
            motion_final_result: result,
            workflow_status: result,
            motion_result_reported_at: reportedAt,
            motion_result_reported_by: 'customer',
          },
        }
      })

      toast.success(
        result === 'approved'
          ? 'Resultado informado como aprovado.'
          : 'Resultado informado como reprovado.',
      )
    } catch (error) {
      console.error('[COSOnboardingPage] failed to save motion result:', error)
      toast.error('Nao foi possivel salvar o resultado da Motion.')
    } finally {
      setIsSavingMotionResult(false)
    }
  }

  useEffect(() => {
    async function load() {
      if (!user || !slug) return

      let data = null

      if (parentProcessId) {
        data = await processService.getServiceById(parentProcessId)
        // Safety: verify user owns this process
        if (data && data.user_id !== user.id) {
          data = null
        }
      } else {
        data = await processService.getUserServiceBySlug(user.id, slug)
      }

      if (!data) return

      setProc(data)

      // --- AUTO-REPAIR: Sincronizar slots pagos com o histórico de compras (purchases) ---
      try {
        if (data.step_data?.purchases) {
          const purchases = data.step_data.purchases as Array<{
            dependents?: number | string
            slug?: string
          }>
          let totalPaidViaPurchases = 0

          purchases.forEach((p) => {
            const count = parseInt(String(p.dependents ?? 0), 10)
            const isAdditional =
              p.slug?.includes('dependente-adicional') ||
              p.slug?.includes('slot-dependente') ||
              p.slug === 'dependente-estudante' ||
              p.slug === 'dependente-b1-b2'

            if (isAdditional) {
              // Slots adicionais são somados (pelo menos 1 por compra)
              totalPaidViaPurchases += Math.max(1, count)
            } else {
              // No pedido principal, meta.dependents é o total de dependentes incluídos
              totalPaidViaPurchases = Math.max(totalPaidViaPurchases, count)
            }
          })

          const currentInDB = parseInt(
            String(data.step_data?.paid_dependents ?? 0),
            10,
          )
          if (totalPaidViaPurchases > currentInDB) {
            console.log(
              `[AutoRepair] Sincronizando slots via JSONB: ${currentInDB} -> ${totalPaidViaPurchases}`,
            )
            const patchedStepData = {
              ...((data.step_data || {}) as Record<string, unknown>),
              paid_dependents: totalPaidViaPurchases,
            }
            const patchedData: UserService = {
              ...data,
              step_data: patchedStepData,
            }
            setProc(patchedData)
            void processService
              .updateStepData(data.id, {
                paid_dependents: totalPaidViaPurchases,
              })
              .catch((persistError) => {
                console.warn(
                  '[AutoRepair] Falha ao persistir paid_dependents:',
                  persistError,
                )
              })
            data = patchedData
          }
        }
      } catch (err) {
        console.warn('[AutoRepair] Erro ao sincronizar slots:', err)
      }
      // --------------------------------------------------------------------------

      if (data.step_data) {
        if (data.step_data.targetVisa)
          setTargetVisa(data.step_data.targetVisa as VisaType)
        if (data.step_data.currentVisa)
          setCurrentVisa(data.step_data.currentVisa as VisaType)
        if (data.step_data.i94Date) setI94Date(data.step_data.i94Date as string)
        if (data.step_data.dependents)
          setDependents(data.step_data.dependents as Dependent[])

        // Hydrate docs
        if (data.step_data.docs) {
          const savedDocs = data.step_data.docs as Record<string, string>
          setDocs((prev) => {
            const next = { ...prev }
            Object.keys(savedDocs).forEach((key) => {
              next[key] = {
                file: null,
                label: key.toUpperCase().replace(/_/g, ' '),
                path: savedDocs[key],
              }
            })
            return next
          })
        }
      }
    }
    load()
  }, [user, slug, parentProcessId, stepIdx])

  useEffect(() => {
    if (!proc) return
    const isInRFERange = stepIdx >= 13 && stepIdx <= 18
    const isInMotionRange = stepIdx >= 19 && stepIdx <= 24

    if (isMotionContext && !isInMotionRange) {
      const nextParams = new URLSearchParams(searchParams)
      const motionStep =
        currentProcessStep >= 19 && currentProcessStep <= 24
          ? currentProcessStep
          : 19
      nextParams.set('step', String(motionStep))
      navigate(
        `/dashboard/processes/${slug}/onboarding?${nextParams.toString()}`,
        {
          replace: false,
        },
      )
      return
    }

    if (isRFEContext && !isInRFERange) {
      const nextParams = new URLSearchParams(searchParams)
      const rfeStep =
        currentProcessStep >= 13 && currentProcessStep <= 18
          ? currentProcessStep
          : 13
      nextParams.set('step', String(rfeStep))
      navigate(
        `/dashboard/processes/${slug}/onboarding?${nextParams.toString()}`,
        {
          replace: true,
        },
      )
    }
  }, [
    isMotionContext,
    isRFEContext,
    navigate,
    proc,
    searchParams,
    slug,
    stepIdx,
  ])

  // Translation safety guard: if locale is loading, return a refined loading state
  if (!t || !t.cos) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-bg-subtle'>
        <div className='flex flex-col items-center gap-4 text-center p-12 bg-card rounded-[40px] shadow-sm border border-border animate-in fade-in zoom-in-95'>
          <div className='w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shadow-inner'>
            <RiLoader4Line className='text-3xl animate-spin' />
          </div>
          <div>
            <p className='text-xs font-black text-text uppercase tracking-widest'>
              Sincronizando Traduções
            </p>
            <p className='text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tighter'>
              Preparando interface personalizada...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle doc slot generation
  const getDocSlots = () => {
    const isExtension = slug === 'extensao-status'
    const cosTotal = 22000 + dependents.length * 5000
    const bankSubtitle = isExtension
      ? 'Extensão 1.000U$/mes = U$ 6.000'
      : `COS U$ 22,000 + U$ 5.000 por dependente = U$ ${cosTotal.toLocaleString('en-US')}`

    const slots = [
      {
        key: 'i94',
        title: 'Form I-94 (Principal)',
        subtitle: 'U.S. Entry Record',
        category: 'Personal Documents',
      },
      {
        key: 'passportVisa',
        title: 'Passport and Visa (Principal)',
        subtitle: 'Bio page + Visa stamp',
        category: 'Personal Documents',
      },
      {
        key: 'proofBrazil',
        title: 'Proof of Residence',
        subtitle: 'Utility bill or bank doc',
        category: 'Personal Documents',
      },
      {
        key: 'bankStatement',
        title: 'Bank Statement',
        subtitle: bankSubtitle,
        category: 'Financial Documents',
      },
    ]

    dependents.forEach((dep) => {
      slots.push({
        key: `i94_dep_${dep.id}`,
        title: `I-94 (${dep.name || 'Dependent'})`,
        subtitle: 'U.S. Entry Record',
        category: `Docs: ${dep.name || 'Dependent'}`,
      })
      slots.push({
        key: `passportVisa_dep_${dep.id}`,
        title: `Passport/Visa (${dep.name || 'Dependent'})`,
        subtitle: 'Bio page + Visa stamp',
        category: `Docs: ${dep.name || 'Dependent'}`,
      })
      if (dep.relation === 'child') {
        slots.push({
          key: `birthCertificate_dep_${dep.id}`,
          title: `Birth Certificate (${dep.name || 'Dependent'})`,
          subtitle: 'Birth proof',
          category: `Docs: ${dep.name || 'Dependent'}`,
        })
      }
      if (dep.relation === 'spouse') {
        slots.push({
          key: `marriageCertificate`,
          title: `Marriage Certificate`,
          subtitle: 'Marriage proof',
          category: `Docs: ${dep.name || 'Dependent'}`,
        })
      }
    })

    return slots
  }

  const addDependent = () =>
    setDependents((d) => [
      ...d,
      {
        id: crypto.randomUUID(),
        name: '',
        relation: '',
        birthDate: '',
        marriageDate: '',
        i94Date: '',
      },
    ])
  const updateDependent = (id: string, field: keyof Dependent, value: string) =>
    setDependents((d) =>
      d.map((dep) => (dep.id === id ? { ...dep, [field]: value } : dep)),
    )
  const removeDependent = (id: string) =>
    setDependents((d) => d.filter((dep) => dep.id !== id))

  // ── Rule Helpers ──
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const getMarriageAge = (birthDate: string, marriageDate: string) => {
    if (!birthDate || !marriageDate) return 0
    const birth = new Date(birthDate)
    const marriage = new Date(marriageDate)
    let age = marriage.getFullYear() - birth.getFullYear()
    const m = marriage.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && marriage.getDate() < birth.getDate())) age--
    return age
  }

  const handleDocChange = (key: string, file: File) =>
    setDocs((prev) => ({ ...prev, [key]: { ...prev[key], file } }))

  const handleConcluir = async () => {
    if (!proc) return
    setIsSubmitting(true)
    try {
      const stepData: Record<string, unknown> = {}
      if (stepIdx === 0) {
        stepData.targetVisa = targetVisa
        stepData.currentVisa = currentVisa
        stepData.i94Date = i94Date
        stepData.dependents = dependents
      }

      if (stepIdx === 1) {
        if (!user?.id) {
          throw new Error(
            'Sessão expirada. Por favor, recarregue a página e tente novamente.',
          )
        }

        const session = await getSessionSafe()
        if (!session?.user?.id) {
          throw new Error(
            'Sessão expirada. Faça login novamente antes de enviar os documentos.',
          )
        }

        const currentDocs =
          (proc.step_data?.docs as Record<string, string>) || {}
        const updatedDocs: Record<string, string> = { ...currentDocs }
        const slots = getDocSlots()

        for (const slot of slots) {
          const doc = docs[slot.key]
          if (doc?.file) {
            const fileExt = doc.file.name.split('.').pop()
            const filePath = `${session.user.id}/cos/${slot.key}.${fileExt}`
            let uploadError = null

            const result = await supabase.storage
              .from('profiles')
              .upload(filePath, doc.file, {
                upsert: true,
                contentType: doc.file.type,
              })
            uploadError = result.error

            if (uploadError)
              throw new Error(
                `Erro ao enviar ${slot.key}: ${uploadError.message}`,
              )
            updatedDocs[slot.key] = filePath
          } else if (doc?.path) {
            updatedDocs[slot.key] = doc.path
          }
        }

        stepData.docs = updatedDocs
      }

      await processService.updateStepData(proc.id, stepData)

      // FRESH FETCH: Get latest data after potential update
      const freshProc = await processService.getServiceById(proc.id)
      if (!freshProc) return

      const service = getServiceBySlug(slug!)
      if (service) {
        let nextStepIdx = stepIdx + 1

        const targetVisa = freshProc.step_data?.targetVisa as string
        const uscisResult = freshProc.step_data?.uscis_official_result as string
        const rfeResult = freshProc.step_data?.uscis_rfe_result as string

        const showF1Steps = targetVisa === 'F1'
        if (!showF1Steps) {
          const stepsToSkipIds = [
            'cos_i20_upload',
            'cos_sevis_fee',
            'cos_analysis_i20_sevis',
          ]
          while (
            nextStepIdx < service.steps.length &&
            stepsToSkipIds.includes(service.steps[nextStepIdx].id)
          ) {
            nextStepIdx++
          }
        }

        // Jump logic for RFE/Motion
        const finalPackageIdx = service.steps.findIndex(
          (s) => s.id === 'cos_final_package',
        )
        const rfeEndIdx = service.steps.findIndex((s) => s.id === 'cos_rfe_end')
        let forceJump = false

        if (stepIdx === finalPackageIdx) {
          if (uscisResult === 'denied') {
            const motionStart = service.steps.findIndex(
              (s) => s.id === 'cos_motion_acquisition',
            )
            nextStepIdx = motionStart !== -1 ? motionStart : 19
            forceJump = true
          } else if (uscisResult === 'rfe') {
            const rfeStart = service.steps.findIndex(
              (s) => s.id === 'cos_rfe_explanation',
            )
            nextStepIdx = rfeStart !== -1 ? rfeStart : 13
            forceJump = true
          }
        } else if (stepIdx === rfeEndIdx) {
          if (rfeResult === 'denied') {
            const motionStart = service.steps.findIndex(
              (s) => s.id === 'cos_motion_acquisition',
            )
            nextStepIdx = motionStart !== -1 ? motionStart : 19
            forceJump = true
          } else if (rfeResult === 'rfe') {
            const rfeStart = service.steps.findIndex(
              (s) => s.id === 'cos_rfe_explanation',
            )
            nextStepIdx = rfeStart !== -1 ? rfeStart : 13
            forceJump = true
          }
        }

        const isFinal = nextStepIdx >= service.steps.length
        const nextStep = service.steps[nextStepIdx]

        const currentDBStep = freshProc.current_step ?? 0
        const isCorrection = !!freshProc.step_data?.admin_feedback
        const isMotionEnd = nextStep?.id === 'cos_motion_end'
        const shouldRequestReview =
          !isMotionEnd &&
          (isCorrection || nextStep?.type === 'admin_action' || isFinal)

        // Allow update if advancing OR if it's an explicit jump (even backward)
        if (nextStepIdx > currentDBStep || forceJump) {
          await processService.approveStep(proc.id, nextStepIdx, isFinal, undefined, undefined, {
            notifyClient: !shouldRequestReview,
          })
        }

        if (shouldRequestReview) {
          await processService.requestStepReview(proc.id)
        }
        toast.success(t.cos?.toasts?.stepSent)
        navigate(`/dashboard/processes/${slug}`)
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(t.cos?.toasts?.errorSaving + ': ' + message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-bg flex flex-col'>
      {isSubmitting && (
        <div className='fixed inset-0 z-[120] bg-card/70 backdrop-blur-sm flex items-center justify-center'>
          <div className='bg-card border border-border shadow-xl rounded-2xl px-6 py-5 flex items-center gap-3'>
            <RiLoader4Line className='text-2xl text-primary animate-spin' />
            <p className='text-sm font-black text-text uppercase tracking-wider'>
              Enviando etapa...
            </p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className='bg-card border-b border-border px-8 py-4 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-black text-text tracking-tight'>
            {t.cos?.title}
          </h1>
          <p className='text-xs text-text-muted font-medium mt-0.5'>
            {t.cos?.subtitle}{' '}
            <span className='text-primary font-black uppercase tracking-widest ml-1'>
              {t.cos?.badge}
            </span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className='p-8 max-w-[860px] mx-auto w-full'>
        <div>
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            className='bg-card rounded-2xl border border-border shadow-sm overflow-hidden'
          >
            {/* ── Step 0: COS Application Form ── */}
            {stepIdx === 0 && (
              <>
                <div className='px-8 py-6 border-b border-border'>
                  <h2 className='text-xl font-black text-text tracking-tight'>
                    {t.cos.form.title}
                  </h2>
                  <p className='text-sm text-text-muted font-medium mt-1'>
                    {t.cos.form.desc}
                  </p>
                </div>

                <div className='px-8 py-6 space-y-8'>
                  {/* Current visa */}
                  <div>
                    <label className='text-sm font-bold text-text mb-3 flex items-center gap-1'>
                      {t.cos.form.currentVisaLabel}{' '}
                      <span className='text-red-500'>*</span>
                    </label>
                    <div className='grid grid-cols-3 gap-3'>
                      {CURRENT_VISA_OPTIONS.map((v) => {
                        const isRejected = isFieldRejected('currentVisa')
                        return (
                          <button
                            key={v.label}
                            disabled={isReadOnly}
                            onClick={() =>
                              !isReadOnly && setCurrentVisa(v.label)
                            }
                            className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 px-1 sm:px-4 py-3 sm:py-4 rounded-xl border-2 font-bold text-[12px] sm:text-sm transition-all ${
                              currentVisa === v.label
                                ? isRejected
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-primary bg-primary/5 text-primary'
                                : isRejected
                                  ? 'border-red-100 bg-red-50/30 text-text-muted'
                                  : 'border-border text-text-muted hover:border-border hover:bg-bg-subtle'
                            } ${isReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`hidden sm:inline-block text-xl ${v.color}`}
                            >
                              {v.icon}
                            </span>
                            {v.label}
                            {isRejected && (
                              <RiErrorWarningLine className='ml-auto text-red-500 animate-pulse' />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Target visa */}
                  <div>
                    <label className='text-sm font-bold text-text mb-3 flex items-center gap-1'>
                      {t.cos.form.targetVisaLabel}{' '}
                      <span className='text-red-500'>*</span>
                    </label>
                    <div className='grid grid-cols-3 gap-3'>
                      {TARGET_VISA_OPTIONS.map((v) => {
                        const isRejected = isFieldRejected('targetVisa')
                        return (
                          <button
                            key={v.label}
                            disabled={isReadOnly}
                            onClick={() =>
                              !isReadOnly && setTargetVisa(v.label)
                            }
                            className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 px-1 sm:px-4 py-3 sm:py-4 rounded-xl border-2 font-bold text-[12px] sm:text-sm transition-all ${
                              targetVisa === v.label
                                ? isRejected
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-primary bg-primary/5 text-primary'
                                : isRejected
                                  ? 'border-red-100 bg-red-50/30 text-text-muted'
                                  : 'border-border text-text-muted hover:border-border hover:bg-bg-subtle'
                            } ${isReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`hidden sm:inline-block text-xl ${v.color}`}
                            >
                              {v.icon}
                            </span>
                            {v.label}
                            {isRejected && (
                              <RiErrorWarningLine className='ml-auto text-red-500 animate-pulse' />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* I-94 Date */}
                  <div>
                    <label className='text-sm font-bold text-text mb-2 flex items-center gap-1'>
                      {t.cos.form.i94DateLabel}{' '}
                      <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='date'
                      value={i94Date}
                      onChange={(e) => setI94Date(e.target.value)}
                      disabled={isReadOnly}
                      className={`border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64 disabled:text-text-muted ${
                        isFieldRejected('i94Date')
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-border bg-card text-text disabled:bg-bg-subtle'
                      }`}
                    />
                    <div className='mt-4 text-primary font-bold text-xs uppercase tracking-widest pl-1'>
                      {t.cos.form.mainApplicantI94}
                    </div>
                    <div className='mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-3'>
                      <a
                        href='https://i94.cbp.dhs.gov/home'
                        target='_blank'
                        rel='noreferrer'
                        className='text-xs text-primary font-semibold flex items-center gap-1 hover:underline underline-offset-4 decoration-primary/30'
                      >
                        {t.cos.form.i94Website} ↗
                      </a>

                      <Dialog>
                        <DialogTrigger asChild>
                          <button className='text-xs text-text-muted font-bold hover:text-primary transition-colors flex items-center gap-1'>
                            <RiInformationLine className='text-sm' />{' '}
                            {t.cos.form.i94TutorialLink}
                          </button>
                        </DialogTrigger>
                        <DialogContent className='max-w-2xl bg-card p-0 overflow-hidden border-none rounded-3xl shadow-2xl'>
                          <DialogHeader className='p-8 bg-card border-b border-border'>
                            <DialogTitle className='text-xl font-black text-white tracking-tight flex items-center gap-3'>
                              <div className='w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white'>
                                <RiInformationLine className='text-2xl' />
                              </div>
                              {t.cos.form.i94Tutorial.title}
                            </DialogTitle>
                          </DialogHeader>

                          <div className='p-8 space-y-12 max-h-[70vh] overflow-y-auto custom-scrollbar'>
                            {/* Step 1 */}
                            <div className='flex gap-6'>
                              <div className='flex-shrink-0 w-10 h-10 rounded-full bg-bg-subtle border-2 border-border flex items-center justify-center font-black text-text'>
                                1
                              </div>
                              <div className='flex-1 space-y-4'>
                                <p className='text-base font-black text-text tracking-tight leading-relaxed'>
                                  {t.cos.form.i94Tutorial.step1}
                                  <span className='block text-xs font-bold text-text-muted mt-1 uppercase tracking-widest'>
                                    {t.cos.form.i94Tutorial.step1Sub}
                                  </span>
                                </p>
                                <div className='rounded-2xl overflow-hidden border border-border shadow-sm'>
                                  <img
                                    src={imgTutor1}
                                    alt='Accept Terms'
                                    className='w-full h-auto'
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div className='flex gap-6'>
                              <div className='flex-shrink-0 w-10 h-10 rounded-full bg-bg-subtle border-2 border-border flex items-center justify-center font-black text-text'>
                                2
                              </div>
                              <div className='flex-1 space-y-4'>
                                <p className='text-base font-black text-text tracking-tight leading-relaxed'>
                                  {t.cos.form.i94Tutorial.step2}
                                  <span className='block text-xs font-bold text-text-muted mt-1 uppercase tracking-widest'>
                                    {t.cos.form.i94Tutorial.step2Sub}
                                  </span>
                                </p>
                                <div className='rounded-2xl overflow-hidden border border-border shadow-sm'>
                                  <img
                                    src={imgTutor2}
                                    alt='Upload/Camera Document'
                                    className='w-full h-auto'
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Step 3 */}
                            <div className='flex gap-6'>
                              <div className='flex-shrink-0 w-10 h-10 rounded-full bg-bg-subtle border-2 border-border flex items-center justify-center font-black text-text'>
                                3
                              </div>
                              <div className='flex-1 space-y-4'>
                                <p className='text-base font-black text-text tracking-tight leading-relaxed'>
                                  {t.cos.form.i94Tutorial.step3}
                                  <span className='block text-xs font-bold text-text-muted mt-1 uppercase tracking-widest'>
                                    {t.cos.form.i94Tutorial.step3Sub}
                                  </span>
                                </p>
                                <div className='rounded-2xl overflow-hidden border border-border shadow-sm'>
                                  <img
                                    src={imgTutor3}
                                    alt='Fill in fields'
                                    className='w-full h-auto'
                                  />
                                </div>
                              </div>
                            </div>

                            <div className='p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center'>
                              <p className='text-sm font-black text-emerald-800 uppercase tracking-tight'>
                                {t.cos.form.i94Tutorial.success} 🎉
                              </p>
                              <p className='text-xs text-emerald-600 font-bold mt-1 leading-snug'>
                                {t.cos.form.i94Tutorial.successDesc}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Dependents */}
                  <div className='pt-4'>
                    {(() => {
                      const rawPaidValue = proc?.step_data?.paid_dependents
                      const paidDependents = parseInt(
                        String(rawPaidValue ?? 0),
                        10,
                      )
                      const hasPaidSlots = paidDependents > 0
                      const reachedLimit = dependents.length >= paidDependents

                      return (
                        <div className='space-y-6'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <h3 className='text-base font-black text-text flex items-center gap-2'>
                                {t.cos.form.dependents.title}
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    hasPaidSlots
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                      : 'bg-bg-subtle text-text-muted border border-border'
                                  }`}
                                >
                                  {dependents.length} / {paidDependents}{' '}
                                  {t.cos.form.dependents.slots}
                                </span>
                              </h3>
                              <p className='text-[11px] text-text-muted font-bold uppercase tracking-wider mt-0.5'>
                                {hasPaidSlots
                                  ? t.cos.form.dependents.paidFor.replace(
                                      '{count}',
                                      String(paidDependents),
                                    )
                                  : t.cos.form.dependents.noPurchased}
                              </p>
                            </div>
                            {!isReadOnly && (
                              <button
                                onClick={addDependent}
                                disabled={reachedLimit}
                                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md ${
                                  reachedLimit
                                    ? 'bg-bg-subtle text-text-muted cursor-not-allowed shadow-none border border-border'
                                    : 'bg-card text-white hover:bg-slate-800 shadow-none'
                                }`}
                              >
                                <RiAddLine className='text-base' />{' '}
                                {reachedLimit
                                  ? t.cos.form.dependents.limitReached
                                  : t.cos.form.dependents.addBtn}
                              </button>
                            )}
                          </div>

                          {reachedLimit && !isReadOnly && proc && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className='p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left'
                            >
                              <div className='flex flex-col sm:flex-row items-center gap-3'>
                                <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                                  <RiAddLine className='text-xl' />
                                </div>
                                <div>
                                  <p className='text-xs font-black text-text uppercase tracking-tight'>
                                    {t.cos.form.dependents.needMoreSlots}
                                  </p>
                                  <p className='text-[11px] text-text-muted font-medium leading-tight'>
                                    {t.cos.form.dependents.addFamilyPrompt}
                                  </p>
                                </div>
                              </div>
                              <div className='flex flex-col sm:flex-row items-center gap-2'>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/checkout/slot-dependente-cos?id=${proc?.id}&upgrade=true`,
                                    )
                                  }
                                  className='w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1649c0] transition-all shadow-lg shadow-primary/20'
                                >
                                  {t.cos.form.dependents.buySlot}
                                </button>
                                <button
                                  onClick={() => window.location.reload()}
                                  className='w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border text-text-muted text-[10px] font-black uppercase tracking-widest hover:bg-bg-subtle transition-all'
                                >
                                  🔄 Atualizar Slots
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )
                    })()}

                    {dependents.length === 0 && (
                      <div className='text-center py-12 border-2 border-dashed border-border rounded-2xl'>
                        <p className='text-xs text-slate-300 font-bold uppercase tracking-widest leading-loose'>
                          {t.cos.form.dependents.noDependents}
                        </p>
                      </div>
                    )}

                    <div className='space-y-6'>
                      {dependents.map((dep) => {
                        const age = calculateAge(dep.birthDate)
                        const isNear21 = dep.relation === 'child' && age >= 20
                        const marriageAge = getMarriageAge(
                          dep.birthDate,
                          dep.marriageDate,
                        )
                        const marriageWarning =
                          dep.relation === 'spouse' && marriageAge >= 18

                        return (
                          <div
                            key={dep.id}
                            className='relative p-7 rounded-2xl border border-border bg-bg-subtle/50 shadow-sm'
                          >
                            {!isReadOnly && (
                              <button
                                onClick={() => removeDependent(dep.id)}
                                className='absolute top-4 right-4 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all'
                              >
                                <RiDeleteBinLine className='text-lg' />
                              </button>
                            )}

                            <div className='grid grid-cols-2 gap-x-6 gap-y-5'>
                              <div className='col-span-2 sm:col-span-1'>
                                <label className='block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2'>
                                  {t.cos.form.dependents.fullName}
                                </label>
                                <input
                                  value={dep.name}
                                  disabled={isReadOnly}
                                  onChange={(e) =>
                                    updateDependent(
                                      dep.id,
                                      'name',
                                      e.target.value,
                                    )
                                  }
                                  placeholder={
                                    t.cos.form.dependents.passportPlaceholder
                                  }
                                  className='w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-bg-subtle disabled:text-text-muted'
                                />
                              </div>

                              <div className='col-span-2 sm:col-span-1'>
                                <label className='block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2'>
                                  {t.cos.form.dependents.relationship}
                                </label>
                                <select
                                  value={dep.relation}
                                  disabled={isReadOnly}
                                  onChange={(e) =>
                                    updateDependent(
                                      dep.id,
                                      'relation',
                                      e.target.value as
                                        | 'spouse'
                                        | 'child'
                                        | 'other',
                                    )
                                  }
                                  className='w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer disabled:bg-bg-subtle disabled:text-text-muted disabled:cursor-default'
                                >
                                  <option value=''>
                                    {t.cos.form.dependents.select}
                                  </option>
                                  <option value='spouse'>
                                    {t.cos.form.dependents.spouse}
                                  </option>
                                  <option value='child'>
                                    {t.cos.form.dependents.child}
                                  </option>
                                  <option value='other'>
                                    {t.cos.form.dependents.other}
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className='block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2'>
                                  {t.cos.form.dependents.dob}
                                </label>
                                <input
                                  type='date'
                                  value={dep.birthDate}
                                  disabled={isReadOnly}
                                  onChange={(e) =>
                                    updateDependent(
                                      dep.id,
                                      'birthDate',
                                      e.target.value,
                                    )
                                  }
                                  className='w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-bg-subtle disabled:text-text-muted'
                                />
                              </div>

                              <div>
                                <label className='block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2'>
                                  {t.cos.form.dependents.i94Exp}
                                </label>
                                <input
                                  type='date'
                                  value={dep.i94Date}
                                  disabled={isReadOnly}
                                  onChange={(e) =>
                                    updateDependent(
                                      dep.id,
                                      'i94Date',
                                      e.target.value,
                                    )
                                  }
                                  className='w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-bg-subtle disabled:text-text-muted'
                                />
                              </div>

                              {dep.relation === 'spouse' && (
                                <div className='col-span-2'>
                                  <label className='block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 text-primary'>
                                    {t.cos.form.dependents.marriageDate}
                                  </label>
                                  <input
                                    type='date'
                                    value={dep.marriageDate}
                                    disabled={isReadOnly}
                                    onChange={(e) =>
                                      updateDependent(
                                        dep.id,
                                        'marriageDate',
                                        e.target.value,
                                      )
                                    }
                                    className='w-full bg-card border border-primary/20 rounded-xl px-4 py-2.5 text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-bg-subtle disabled:text-text-muted'
                                  />
                                </div>
                              )}
                            </div>

                            <div className='mt-5 space-y-3'>
                              {marriageWarning && (
                                <div className='flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-100'>
                                  <RiInformationLine className='text-orange-500 text-lg shrink-0 mt-0.5' />
                                  <p className='text-[11px] font-bold text-orange-800 leading-normal'>
                                    <span className='uppercase font-black block mb-0.5 tracking-wider'>
                                      {t.cos.form.dependents.eligibilityWarning}
                                    </span>
                                    {t.cos.form.dependents.marriageWarningText}
                                  </p>
                                </div>
                              )}

                              {isNear21 && (
                                <div className='flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100'>
                                  <RiInformationLine className='text-red-500 text-lg shrink-0 mt-0.5' />
                                  <p className='text-[11px] font-bold text-red-800 leading-normal'>
                                    <span className='uppercase font-black block mb-0.5 tracking-wider'>
                                      {t.cos.form.dependents.ineligibilityRisk}
                                    </span>
                                    {t.cos.form.dependents.childAgeWarning}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 1: Document Uploads ── */}
            {stepIdx === 1 && (
              <>
                <div className='px-8 py-6 border-b border-border flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500'>
                    <MdPerson className='text-xl' />
                  </div>
                  <div>
                    <h2 className='text-xl font-black text-text tracking-tight'>
                      {t.cos.docs.title}
                    </h2>
                    <p className='text-sm text-text-muted font-medium mt-0.5'>
                      {t.cos.docs.desc}
                    </p>
                  </div>
                </div>

                <div className='px-8 py-6 space-y-8'>
                  <div className='flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100'>
                    <RiInformationLine className='text-blue-500 text-xl shrink-0 mt-0.5' />
                    <div>
                      <p className='text-sm font-black text-text'>
                        {t.cos.docs.i94Instructions}
                      </p>
                      <p className='text-xs text-text-muted font-medium mt-0.5'>
                        {t.cos.docs.i94InstructionsDesc}
                      </p>
                      <a
                        href='https://i94.cbp.dhs.gov/I94'
                        target='_blank'
                        rel='noreferrer'
                        className='text-xs text-primary font-bold mt-1 inline-flex items-center gap-1 hover:underline'
                      >
                        {t.cos.docs.accessI94} ↗
                      </a>
                    </div>
                  </div>

                  {/* Map Categories */}
                  {Array.from(
                    new Set(getDocSlots().map((s) => s.category)),
                  ).map((cat) => (
                    <div key={cat}>
                      <div className='flex items-center gap-2 mb-4'>
                        {cat.includes('Financial') ? (
                          <MdAccountBalance className='text-text-muted text-base' />
                        ) : (
                          <MdPerson className='text-text-muted text-base' />
                        )}
                        <span className='text-[11px] font-black text-text-muted uppercase tracking-widest'>
                          {cat}
                        </span>
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {getDocSlots()
                          .filter((s) => s.category === cat)
                          .map((slot) => (
                            <DocUploadCard
                              key={slot.key}
                              docKey={slot.key}
                              title={slot.title}
                              subtitle={slot.subtitle}
                              doc={
                                docs[slot.key] || {
                                  file: null,
                                  label: slot.title,
                                }
                              }
                              onChange={handleDocChange}
                              isReadOnly={isReadOnly}
                              isRejected={isFieldRejected(`docs.${slot.key}`)}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Step 3: I-539 Official Form ── */}
            {stepIdx === 3 && proc && user && (
              <div className='px-8 py-6'>
                <div className='mb-6 border-b border-border pb-6'>
                  <h2 className='text-xl font-black text-text tracking-tight'>
                    {t.cos.i539.labels.header}
                  </h2>
                  <p className='text-sm text-text-muted font-medium mt-1'>
                    {t.cos.i539.labels.fillInstruction}
                  </p>
                </div>
                <I539FormStep
                  proc={proc}
                  user={user}
                  onComplete={handleConcluir}
                />
              </div>
            )}

            {/* ── Step 5: Cover Letter Questionnaire ── */}
            {stepIdx === 5 && proc && user && (
              <div className='px-8 py-6'>
                <div className='mb-6 border-b border-border pb-6'>
                  <h2 className='text-xl font-black text-text tracking-tight'>
                    Cover Letter Questionnaire
                  </h2>
                  <p className='text-sm text-text-muted font-medium mt-1'>
                    Please answer the questions below to help us generate your
                    presentation letter for USCIS.
                  </p>
                </div>
                <CoverLetterStep
                  proc={proc}
                  user={user}
                  onComplete={handleConcluir}
                />
              </div>
            )}

            {/* ── Step 7: I-20 Upload ── */}
            {stepIdx === 7 && proc && user && (
              <div className='px-8 py-6'>
                <div className='mb-6 border-b border-border pb-6'>
                  <h2 className='text-xl font-black text-text tracking-tight'>
                    {t.cos.i20Upload.title}
                  </h2>
                  <p className='text-sm text-text-muted font-medium mt-1'>
                    {t.cos.i20Upload.desc}
                  </p>
                </div>
                <I20UploadStep
                  proc={proc}
                  user={user}
                  onComplete={handleConcluir}
                />
              </div>
            )}

            {/* ── Step 8: SEVIS Fee ── */}
            {stepIdx === 8 && proc && user && (
              <div className='px-8 py-6 pb-24'>
                <div className='mb-6 border-b border-border pb-6'>
                  <h2 className='text-xl font-black text-text tracking-tight'>
                    {t.cos.sevisFee.title}
                  </h2>
                  <p className='text-sm text-text-muted font-medium mt-1'>
                    {t.cos.sevisFee.desc}
                  </p>
                </div>
                <SevisFeeStep
                  proc={proc}
                  user={user}
                  onComplete={handleConcluir}
                />
              </div>
            )}

            {/* ── Step 10: Final Forms ── */}
            {stepIdx === 10 && proc && user && (
              <FinalFormsStep
                proc={proc}
                user={user}
                onComplete={handleConcluir}
              />
            )}

            {/* ── Step 12: Final Package ── */}
            {stepIdx === 12 && proc && !isMotionContext && !isRFEContext && (
              <FinalPackageStep
                proc={proc}
                onComplete={handleConcluir}
                onJumpToStep={(targetStep) => {
                  const nextParams = new URLSearchParams(searchParams)
                  nextParams.set('step', String(targetStep))
                  navigate(
                    `/dashboard/processes/${slug}/onboarding?${nextParams.toString()}`,
                  )
                }}
              />
            )}

            {/* ── RFE Steps (Conditional on RFE) ── */}
            {(() => {
              const isInRFERange = stepIdx >= 13 && stepIdx <= 18
              if (!isInRFERange || !isRFEContext) return null

              return (
                <>
                  {stepIdx === 13 && proc && <RFEExplanationStep proc={proc} />}

                  {stepIdx === 14 && proc && (
                    <RFEInstructionStep
                      proc={proc}
                      onComplete={handleConcluir}
                    />
                  )}

                  {stepIdx === 16 && proc && (
                    <RFEAcceptProposalStep proc={proc} />
                  )}

                  {stepIdx === 18 && proc && (
                    <RFEEndStep
                      proc={proc}
                      onComplete={handleConcluir}
                      onJumpToMotion={() => handleConcluir()}
                      onJumpToNewRFE={() => handleConcluir()}
                    />
                  )}
                </>
              )
            })()}

            {/* ── Motion Steps (Conditional on Denied) ── */}
            {(() => {
              const isInMotionRange = stepIdx >= 19 && stepIdx <= 24
              if (!isInMotionRange || !isMotionContext) return null

              return (
                <>
                  {stepIdx === 19 && proc && (
                    <MotionExplanationStep
                      proc={proc}
                      user={user}
                      onComplete={handleConcluir}
                    />
                  )}

                  {stepIdx === 20 && proc && (
                    <MotionInstructionStep
                      proc={proc}
                      user={user}
                      onComplete={handleConcluir}
                    />
                  )}

                  {stepIdx === 22 && proc && (
                    <MotionAcceptProposalStep
                      proc={proc}
                      user={user}
                      onComplete={handleConcluir}
                    />
                  )}

                  {stepIdx === 24 && proc && (
                    <MotionEndStep proc={proc} user={user} onComplete={handleConcluir} />
                  )}
                </>
              )
            })()}

            {/* ── Fallback ── */}
            {(() => {
              if (!proc && isRecoveryRangeStep) {
                return (
                  <div className='p-16 text-center'>
                    <div className='w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mx-auto mb-4'>
                      <RiLoader4Line className='text-3xl animate-spin' />
                    </div>
                    <h2 className='text-xl font-black text-text mb-2'>
                      Carregando etapa
                    </h2>
                    <p className='text-sm text-text-muted font-medium'>
                      Estamos sincronizando o fluxo do seu processo.
                    </p>
                  </div>
                )
              }

              const isBaseStepRendered =
                [0, 1, 3, 5, 7, 8, 10].includes(stepIdx) ||
                (stepIdx === 12 && !isRFEContext && !isMotionContext)
              const isRFEStepRendered =
                isRFEContext && [13, 14, 16, 18].includes(stepIdx)
              const isMotionStepRendered =
                isMotionContext && [19, 20, 22, 24].includes(stepIdx)

              if (
                isBaseStepRendered ||
                isRFEStepRendered ||
                isMotionStepRendered
              ) {
                return null
              }

              return (
                <div className='p-16 text-center'>
                  <div className='w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mx-auto mb-4'>
                    <RiLoader4Line className='text-3xl animate-spin' />
                  </div>
                  <h2 className='text-xl font-black text-text mb-2'>
                    Qual foi o resultado?
                  </h2>
                  <p className='text-sm text-text-muted font-medium'>
                    Se você já recebeu o retorno oficial do USCIS, nos informe
                    abaixo para prosseguirmos com seu processo.
                  </p>
                  <div className='mt-8 p-4 bg-bg-subtle rounded-2xl border border-border max-w-sm mx-auto'>
                    <p className='text-[10px] font-black text-text-muted uppercase tracking-widest mb-1'>
                      Aguardando seu feedback
                    </p>
                    <p className='text-xs font-bold text-text-muted'>
                      {proc?.step_data?.motion_final_result 
                        ? `Status informado: ${String(proc.step_data.motion_final_result).toUpperCase()}`
                        : "Selecione uma das opções abaixo."}
                    </p>
                  </div>
                  <div className='mt-8 max-w-xl mx-auto rounded-3xl border border-primary/10 bg-primary/[0.03] p-6 sm:p-8 text-left'>
                    <div className='flex items-start gap-3 mb-5'>
                      <div className='w-10 h-10 rounded-xl bg-card border border-primary/10 text-primary flex items-center justify-center shrink-0'>
                        <RiInformationLine className='text-xl' />
                      </div>
                      <div>
                        <h3 className='text-base sm:text-lg font-black text-text tracking-tight'>
                          Voce ja recebeu o resultado da sua Motion?
                        </h3>
                        <p className='text-xs sm:text-sm text-text-muted font-medium mt-1 leading-relaxed'>
                          Assim que tiver retorno oficial do USCIS, selecione
                          abaixo para mantermos seu processo atualizado.
                        </p>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <button
                        type='button'
                        disabled={isSavingMotionResult || !!proc?.step_data?.motion_final_result}
                        onClick={() => handleMotionResultReport('approved')}
                        className='h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60'
                      >
                        Aprovado
                      </button>
                      <button
                        type='button'
                        disabled={isSavingMotionResult || !!proc?.step_data?.motion_final_result}
                        onClick={() => handleMotionResultReport('rejected')}
                        className='h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all disabled:opacity-60'
                      >
                        Reprovado
                      </button>
                    </div>

                    <p className='mt-4 text-[11px] font-bold text-text-muted uppercase tracking-wide'>
                      {motionReportedResult === 'approved'
                        ? 'Status informado: Aprovado.'
                        : motionReportedResult === 'rejected'
                          ? 'Status informado: Reprovado.'
                          : 'Nenhum resultado informado ate o momento.'}
                    </p>

                    {motionReportedResult === 'rejected' && (
                      <div className='mt-4 rounded-2xl border border-red-100 bg-red-50 p-4'>
                        <p className='text-xs font-bold text-red-700 leading-relaxed'>
                          Lamentamos que sua Motion tenha sido reprovada, mas
                          convidamos você a revisar nossos outros produtos e
                          oportunidades disponíveis.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </motion.div>

          {!isMotionResultStep && (
            <div className='flex items-center justify-between mt-6'>
              <button
                onClick={() => navigate(`/dashboard/processes/${slug}`)}
                className='flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-sm font-black text-text-muted hover:bg-bg-subtle hover:border-border transition-all'
              >
                <RiArrowLeftSLine className='text-lg' />{' '}
                {t.cos.btns.back || 'Back'}
              </button>

              {!isReadOnly &&
                stepIdx !== 3 &&
                stepIdx !== 5 &&
                stepIdx !== 7 &&
                stepIdx !== 8 &&
                stepIdx !== 10 &&
                stepIdx !== 12 &&
                stepIdx !== 13 &&
                stepIdx !== 14 &&
                stepIdx !== 16 &&
                stepIdx !== 17 &&
                stepIdx !== 18 &&
                stepIdx !== 19 &&
                stepIdx !== 20 &&
                stepIdx !== 22 &&
                stepIdx !== 23 &&
                stepIdx !== 24 && (
                  <button
                    onClick={handleConcluir}
                    disabled={!canSubmit || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${
                      !canSubmit || isSubmitting
                        ? 'bg-slate-200 text-text-muted cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <RiLoader4Line className='animate-spin text-lg' />
                    ) : (
                      <>
                        <RiCheckDoubleLine className='text-lg' />
                        {t.cos.btns.completeStep || 'Complete Step'}
                      </>
                    )}
                  </button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
