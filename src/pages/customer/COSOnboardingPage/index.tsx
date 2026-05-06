import { motion } from 'framer-motion'
import {
  RiArrowLeftSLine,
  RiCheckDoubleLine,
  RiLoader4Line,
} from 'react-icons/ri'
import { MdPerson, MdAccountBalance } from 'react-icons/md'
import { useAuth } from '../../../hooks/useAuth'
import * as processService from '../../../features/process/lib/processOps'
import type { UserService } from '../../../features/process/types'
import { getServiceBySlug } from '../../../data/services'
import { toast } from 'sonner'
import { supabase } from '../../../shared/lib/supabase'
import { getSessionSafe } from '../../../shared/lib/supabase'
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
import { DocUploadCard, type DocFile } from '../../../components/molecules/DocUploadCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/atoms/dialog'

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
        const { data: row } = await supabase
          .from('user_services')
          .select('*')
          .eq('id', parentProcessId)
          .single()
        data = row && row.user_id === user.id ? row : null
      } else {
        const { data: row } = await supabase
          .from('user_services')
          .select('*')
          .eq('user_id', user.id)
          .eq('service_slug', slug)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        data = row ?? null
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
    currentProcessStep,
    isMotionContext,
    isRFEContext,
    stepIdx,
    navigate,
    searchParams,
    slug,
    proc,
  ])

  if (isLoading || !t || !t.cos) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='flex flex-col items-center gap-4 text-center p-12 bg-white rounded-[40px] shadow-sm border border-slate-100 animate-in fade-in zoom-in-95'>
          <div className='w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shadow-inner'>
            <RiLoader4Line className='text-3xl animate-spin' />
          </div>
          <div>
            <p className='text-xs font-black text-slate-800 uppercase tracking-widest'>
              Sincronizando Traduções
            </p>
            <p className='text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter'>
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
      const { data: freshProc } = await supabase
        .from('user_services')
        .select('*')
        .eq('id', proc.id)
        .single()
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
    <div className='min-h-screen bg-[#f8fafc] flex flex-col'>
      {isSubmitting && (
        <div className='fixed inset-0 z-[120] bg-white/70 backdrop-blur-sm flex items-center justify-center'>
          <div className='bg-white border border-slate-200 shadow-xl rounded-2xl px-6 py-5 flex items-center gap-3'>
            <RiLoader4Line className='text-2xl text-primary animate-spin' />
            <p className='text-sm font-black text-slate-700 uppercase tracking-wider'>
              Enviando etapa...
            </p>
          </div>
        </div>
      )}

      <div className='bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-black text-slate-900 tracking-tight'>
            {t.cos.title}
          </h1>
          <p className='text-xs text-slate-400 font-medium mt-0.5'>
            {t.cos.subtitle}{' '}
            <span className='text-primary font-black uppercase tracking-widest ml-1'>
              {t.cos.badge}
            </span>
          </p>
        </div>
      </div>

      <div className='flex-1 px-4 sm:px-8 py-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <RiCheckDoubleLine className='text-xl' />
              </div>
              <div>
                <p className='text-xs font-black text-primary uppercase tracking-widest'>
                  {t.cos.btns.completeStep}
                </p>
                <h2 className='text-lg font-black text-slate-900 tracking-tight'>
                  {currentStepTitle}
                </h2>
              </div>
            </div>

            <div className='hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500'>
              <span className='w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
              Step {stepIdx + 1} / {totalSteps}
            </div>
          </div>

          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className='bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden'
          >
            <COSStepContent
              t={t}
              stepIdx={stepIdx}
              proc={proc}
              user={user}
              serviceTitle={currentStepTitle}
              serviceDescription={currentStepDescription}
              isReadOnly={isReadOnly}
              isMotionContext={isMotionContext}
              isRFEContext={isRFEContext}
              currentVisa={currentVisa}
              targetVisa={targetVisa}
              i94Date={i94Date}
              dependents={dependents}
              docs={docs}
              isFieldRejected={isFieldRejected}
              setCurrentVisa={setCurrentVisa}
              setTargetVisa={setTargetVisa}
              setI94Date={setI94Date}
              addDependent={addDependent}
              updateDependent={updateDependent}
              removeDependent={removeDependent}
              getDocSlots={getDocSlots}
              onDocChange={handleDocChange}
              onComplete={handleConcluir}
              onBuyDependentSlot={() =>
                window.location.assign(
                  `/checkout/slot-dependente-cos?id=${proc?.id}&upgrade=true`,
                )
              }
              onRefreshSlots={() => window.location.reload()}
              onJumpToStep={jumpToOnboardingStep}
              onUSCISResult={handleUSCISResult}
              onMotionResult={handleMotionResult}
              onRFEResult={handleRFEResult}
            />
          </motion.div>

          {!isMotionResultStep && (
            <div className='flex items-center justify-between mt-6'>
              <button
                onClick={goToProcess}
                className='flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-500 hover:bg-slate-50 hover:border-slate-200 transition-all'
              >
                <RiArrowLeftSLine className='text-lg' />
                {t.cos.btns.back || 'Back'}
              </button>

              {!isReadOnly &&
                ![3, 5, 7, 8, 10, 12, 13, 14, 16, 17, 18, 19, 20, 22, 23, 24].includes(
                  stepIdx,
                ) && (
                  <button
                    onClick={() => void handleConcluir()}
                    disabled={!canSubmit || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${
                      !canSubmit || isSubmitting
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
