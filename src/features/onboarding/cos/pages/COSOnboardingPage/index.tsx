import { motion } from 'framer-motion'
import {
  RiArrowLeftSLine,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiArrowUpSLine,
  RiArrowDownSLine,
} from 'react-icons/ri'
import { MdPerson, MdAccountBalance } from 'react-icons/md'
import { useAuth } from "@shared/hooks/useAuth";
import * as processService from "@features/process/services/processOps";
import type { UserService } from "@features/process/types";
import { getServiceBySlug } from "@shared/data/services";
import { toast } from 'sonner'
import { supabase, getSessionSafe } from "@shared/lib/supabase";
import { compressImageForUpload } from "@shared/utils/uploadCompression";
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import I539FormStep from './I539FormStep'
import CoverLetterStep from './CoverLetterStep'
import FinalFormsStep from './FinalFormsStep'
import FinalPackageStep from './FinalPackageStep'
import I20UploadStep from './I20UploadStep'
import SevisFeeStep from './SevisFeeStep'
import COSStepContent from './components/COSStepContent'

import { cn } from "@shared/utils/cn"
import { OnboardingStepper } from "@shared/components/molecules/OnboardingStepper"

import { useT } from "@app/app/i18n";
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
import { MOTION_STEPS_TEMPLATE, RFE_STEPS_TEMPLATE } from "@shared/data/workflowTemplates";
import { COS_MOTION_END_STEP } from '@shared/data/cosWorkflow'
import { DocUploadCard, type DocFile } from '@shared/components/molecules/DocUploadCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/components/atoms/dialog'

// Assets
import imgTutor1 from '@assets/tutorial/arrastar_ate_o_final_para_aceitar.png'
import imgTutor2 from '@assets/tutorial/fazerupload_ou_usar_a_camera_do_documento.png'
import imgTutor3 from '@assets/tutorial/preencher_campos.png'

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
  const tVisas = useT('visas')
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
    searchParams.get('slug') ||
    searchParams.get('id') ||
    searchParams.get('parentId') ||
    searchParams.get('processId')
  const childProcessId = searchParams.get('childId')
  const childWorkflowType = searchParams.get('workflowType')
  const hasChildRecoveryContext = Boolean(childProcessId && childWorkflowType)
  const service = getServiceBySlug(slug)
  const dependentUpsellSlug = slug === 'extensao-status' ? 'dependent-eos' : 'dependent-cos'

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
  const [isLoading, setIsLoading] = useState(true)

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

  const hasFeedback = !!(proc?.step_data as any)?.admin_feedback
  const rejectedItems = ((proc?.step_data as any)?.rejected_items as string[]) || []
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

  let currentStepId = service?.steps[stepIdx]?.id
  if (stepIdx >= 13 && stepIdx <= 18) {
    currentStepId = RFE_STEPS_TEMPLATE[stepIdx - 13]?.id
  } else if (stepIdx >= 19 && stepIdx <= COS_MOTION_END_STEP) {
    currentStepId = MOTION_STEPS_TEMPLATE[stepIdx - 19]?.id || (stepIdx === COS_MOTION_END_STEP ? 'cos_motion_end' : undefined)
  }

  const isMotionResultStep =
    currentStepId === 'cos_motion_end' || stepIdx === COS_MOTION_END_STEP
  const motionReportedResult = String(
    (proc?.step_data as any)?.motion_final_result || '',
  ).toLowerCase()
  const uscisResult = String(
    (proc?.step_data as any)?.uscis_official_result || '',
  ).toLowerCase()
  const rfeResult = String(
    (proc?.step_data as any)?.uscis_rfe_result || '',
  ).toLowerCase()
  const currentProcessStep = proc?.current_step ?? 0
  const isRecoveryRangeStep = stepIdx >= 13 && stepIdx <= COS_MOTION_END_STEP
  const isMotionContext =
    stepIdx >= 19
      ? true
      : stepIdx >= 13 && stepIdx <= 18
      ? false
      : hasChildRecoveryContext
      ? childWorkflowType === 'motion'
      : false

  const isRFEContext =
    stepIdx >= 13 && stepIdx <= 18
      ? true
      : stepIdx >= 19
      ? false
      : hasChildRecoveryContext
      ? childWorkflowType === 'rfe'
      : false

  useEffect(() => {
    const requestedStep = service?.steps?.[stepIdx];
    if (!requestedStep) return;
    if (requestedStep.type === 'admin_action') {
      navigate(`/dashboard/processes/${slug}`, { replace: true });
    }
  }, [service, stepIdx, navigate, slug]);

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
          ? (t?.cos?.toasts?.approvedResultSaved ?? 'Resultado informado como aprovado.')
          : (t?.cos?.toasts?.rejectedResultSaved ?? 'Resultado informado como reprovado.'),
      )
    } catch (error) {
      console.error('[COSOnboardingPage] failed to save motion result:', error)
      toast.error(t?.cos?.toasts?.motionResultSaveError ?? 'Não foi possível salvar o resultado da Motion.')
    } finally {
      setIsSavingMotionResult(false)
    }
  }

  useEffect(() => {
    async function load() {
      if (!user || !slug) return
      try {

        let data = null
        let parentData = null

        if (parentProcessId) {
          const { data: row } = await supabase
            .from('user_services')
            .select('*')
            .eq('id', parentProcessId)
            .single()
          parentData = row && row.user_id === user.id ? row : null
          data = parentData
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

        // In child recovery context, operate on child process as source-of-truth
        if (childProcessId && childWorkflowType) {
          const { data: childRow } = await supabase
            .from('user_services')
            .select('*')
            .eq('id', childProcessId)
            .single()

          const isValidChild =
            childRow &&
            childRow.user_id === user.id &&
            String((childRow.step_data as any)?.parent_process_id || '') === String(parentProcessId || parentData?.id || '')

          if (isValidChild) {
            data = childRow
          }
        }

        if (!data) return

        setProc(data)

      // --- AUTO-REPAIR: Sincronizar slots pagos com o histórico de compras (purchases) ---
        try {
        if ((data.step_data as any)?.purchases) {
          const purchases = (data.step_data as any).purchases as Array<{
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
            String((data.step_data as any)?.paid_dependents ?? 0),
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

        if (data.step_data) {
          const stepData = data.step_data as any
          if (stepData.targetVisa)
            setTargetVisa(stepData.targetVisa as VisaType)
          if (stepData.currentVisa)
            setCurrentVisa(stepData.currentVisa as VisaType)
          if (stepData.i94Date) setI94Date(stepData.i94Date as string)
          if (stepData.dependents)
            setDependents(stepData.dependents as Dependent[])

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
      } catch (err) {
        console.error('[COSOnboardingPage] load error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user, slug, parentProcessId, childProcessId, childWorkflowType, stepIdx])

  useEffect(() => {
    if (!proc) return

    if (!searchParams.has('step')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('step', String(proc.current_step ?? 0))
      navigate(`/dashboard/processes/${slug}/onboarding?${nextParams.toString()}`, { replace: true })
      return
    }

    if (stepIdx < currentProcessStep) {
      return
    }

    const isInRFERange = stepIdx >= 13 && stepIdx <= 18
    const isInMotionRange = stepIdx >= 19 && stepIdx <= COS_MOTION_END_STEP

    if (isMotionContext && !isInMotionRange) {
      const nextParams = new URLSearchParams(searchParams)
      const motionStep =
        currentProcessStep >= 19 && currentProcessStep <= COS_MOTION_END_STEP
          ? currentProcessStep
          : 19
      nextParams.set('step', String(motionStep))
      navigate(
        `/dashboard/processes/${slug}/onboarding?${nextParams.toString()}`,
        {
          replace: true,
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
    currentStepId,
    navigate,
    searchParams,
    slug,
    proc,
  ],
  )

  let totalSteps = service?.steps?.length || 0
  let currentStepTitle = service?.steps?.[stepIdx]?.title || ''
  let currentStepDescription = service?.steps?.[stepIdx]?.description || ''

  if (stepIdx >= 13 && stepIdx <= 18) {
    totalSteps = 18
    const tpl = RFE_STEPS_TEMPLATE[stepIdx - 13]
    if (tpl) {
      currentStepTitle = tpl.title
      currentStepDescription = tpl.description
    }
  } else if (stepIdx >= 19) {
    totalSteps = COS_MOTION_END_STEP
    const tpl = MOTION_STEPS_TEMPLATE[stepIdx - 19]
    if (tpl) {
      currentStepTitle = tpl.title
      currentStepDescription = tpl.description
    } else if (stepIdx === COS_MOTION_END_STEP) {
      currentStepTitle = 'Resultado'
      currentStepDescription = 'Acompanhe o resultado final do seu Motion.'
    }
  }

  if (currentStepId && tVisas.processSteps?.[currentStepId]) {
    currentStepTitle = tVisas.processSteps[currentStepId].title || currentStepTitle
    currentStepDescription = tVisas.processSteps[currentStepId].description || currentStepDescription
  }

  const goToProcess = () => {
    if (hasChildRecoveryContext) {
      const nextParams = new URLSearchParams()
      if (parentProcessId) nextParams.set('slug', parentProcessId)
      nextParams.set('childId', childProcessId || proc?.id || '')
      if (childWorkflowType) nextParams.set('workflowType', childWorkflowType)
      navigate(`/dashboard/processes/${slug}?${nextParams.toString()}`)
      return
    }

    if (proc?.id) {
      navigate(`/dashboard/processes/${slug}?slug=${proc.id}`)
      return
    }
    navigate(`/dashboard/processes/${slug}`)
  }

  const jumpToOnboardingStep = (targetStep: number) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('step', String(targetStep))
    navigate(
      `/dashboard/processes/${slug}/onboarding?${nextParams.toString()}`,
    )
  }

  const handleUSCISResult = async (
    result: string,
    opts?: { jumpToStep?: (step: number) => void },
  ) => {
    if (!proc) return
    try {
      await processService.updateStepData(proc.id, {
        uscis_official_result: result,
      })

      if (result === 'denied') {
        const { childProcessId } = await processService.startAdditionalWorkflow(proc.id, 'motion')
        toast.success(t?.cos?.toasts?.deniedMotion ?? 'Visto negado. Iniciando fluxo de Motion.')
        const nextParams = new URLSearchParams()
        nextParams.set('slug', proc.id)
        if (childProcessId) nextParams.set('childId', childProcessId)
        nextParams.set('workflowType', 'motion')
        navigate(`/dashboard/processes/${slug}?${nextParams.toString()}`)
        return
      }

      if (result === 'rfe') {
        const { childProcessId } = await processService.startAdditionalWorkflow(proc.id, 'rfe')
        toast.success(t?.cos?.toasts?.resultReported ?? 'Resultado informado.')
        const nextParams = new URLSearchParams()
        nextParams.set('slug', proc.id)
        if (childProcessId) nextParams.set('childId', childProcessId)
        nextParams.set('workflowType', 'rfe')
        navigate(`/dashboard/processes/${slug}?${nextParams.toString()}`)
        return
      }

      toast.success(t?.cos?.toasts?.resultReported ?? 'Resultado informado.')
    } catch (err) {
      toast.error(t?.cos?.toasts?.resultReportError ?? 'Erro ao salvar resultado.')
    }
  }

  const handleMotionResult = async (result: string) => {
    await handleMotionResultReport(result as 'approved' | 'rejected')
  }

  const handleRFEResult = async (result: string) => {
    if (!proc) return
    try {
      const reportedAt = new Date().toISOString()
      const parentId = String(
        parentProcessId || ((proc.step_data as any)?.parent_process_id as string) || '',
      ).trim()
      const normalizedResult =
        result === 'approved' ? 'approved' : result === 'rfe' ? 'rfe' : 'denied'

      await processService.updateStepData(proc.id, {
        uscis_rfe_result: normalizedResult,
        workflow_status: normalizedResult === 'approved' ? 'approved' : normalizedResult === 'rfe' ? 'in_progress' : 'rejected',
        rfe_result_reported_at: reportedAt,
        rfe_result_reported_by: 'customer',
      })

      setProc((prev) => {
        if (!prev) return prev
        const currentStepData = (prev.step_data || {}) as Record<string, unknown>
        return {
          ...prev,
          step_data: {
            ...currentStepData,
            uscis_rfe_result: normalizedResult,
            workflow_status: normalizedResult === 'approved' ? 'approved' : normalizedResult === 'rfe' ? 'in_progress' : 'rejected',
            rfe_result_reported_at: reportedAt,
            rfe_result_reported_by: 'customer',
          },
        }
      })

      if (normalizedResult === 'denied') {
        if (parentId) {
          await processService.updateStepData(parentId, {
            uscis_official_result: 'denied',
          })
          const { childProcessId } = await processService.startAdditionalWorkflow(parentId, 'motion')
          const nextParams = new URLSearchParams()
          nextParams.set('slug', parentId)
          if (childProcessId) nextParams.set('childId', childProcessId)
          nextParams.set('workflowType', 'motion')
          navigate(`/dashboard/processes/${slug}?${nextParams.toString()}`)
          return
        }
      }

      if (normalizedResult === 'rfe') {
        // Fecha a RFE atual antes de iniciar um novo ciclo.
        await processService.updateProcessStatus(proc.id, 'completed')

        const cycleBaseId = parentId || proc.id
        const { childProcessId } = await processService.startAdditionalWorkflow(cycleBaseId, 'rfe')
        if (!childProcessId) {
          throw new Error('Falha ao iniciar novo ciclo de RFE.')
        }
        const targetChildId = childProcessId
        await processService.updateCurrentStep(targetChildId, 0, 'active')
        await processService.updateStepData(targetChildId, {
          workflow_status: 'in_progress',
          uscis_rfe_result: null,
          rfe_final_result: null,
          rfe_proposal_paid: null,
          rfe_payment_completed_at: null,
        })
        const nextParams = new URLSearchParams()
        nextParams.set('slug', parentId || proc.id)
        nextParams.set('childId', targetChildId)
        nextParams.set('workflowType', 'rfe')
        nextParams.set('step', '13')
        navigate(`/dashboard/processes/${slug}/onboarding?${nextParams.toString()}`)
        return
      }

      toast.success(
        normalizedResult === 'approved'
          ? (t?.cos?.toasts?.approvedResultSaved ?? 'Resultado informado como aprovado.')
          : (normalizedResult as string) === 'rfe'
          ? (t?.cos?.toasts?.resultReported ?? 'Novo ciclo de RFE iniciado.')
          : (t?.cos?.toasts?.rejectedResultSaved ?? 'Resultado informado como reprovado.'),
      )
    } catch (err) {
      toast.error(t?.cos?.toasts?.resultReportError ?? 'Erro ao salvar resultado.')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })
  }

  if (isLoading || !t || !t.cos) {
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
    const slotsT = t?.cos?.docs?.slots || {}

    const bankSubtitle = isExtension
      ? (slotsT.bankSubtitleExtension || 'Extensão 1.000U$/mes = U$ 6.000')
      : (slotsT.bankSubtitleCOS || 'COS U$ 22,000 + U$ 5.000 por dependente = U$ {total}').replace('{total}', cosTotal.toLocaleString('en-US'))

    const personalDocsCategory = slotsT.personalDocs || 'Personal Documents'
    const financialDocsCategory = slotsT.financialDocs || 'Financial Documents'

    const slots = [
      {
        key: 'i94',
        title: slotsT.i94Title || 'Form I-94 (Principal)',
        subtitle: slotsT.i94Subtitle || 'U.S. Entry Record',
        category: personalDocsCategory,
      },
      {
        key: 'passportVisa',
        title: slotsT.passportVisaTitle || 'Passport and Visa (Principal)',
        subtitle: slotsT.passportVisaSubtitle || 'Bio page + Visa stamp',
        category: personalDocsCategory,
      },
      {
        key: 'proofBrazil',
        title: slotsT.residenceTitle || 'Proof of Residence',
        subtitle: slotsT.residenceSubtitle || 'Utility bill or bank doc',
        category: personalDocsCategory,
      },
      {
        key: 'bankStatement',
        title: slotsT.bankTitle || 'Bank Statement',
        subtitle: bankSubtitle,
        category: financialDocsCategory,
      },
    ]

    dependents.forEach((dep) => {
      const depName = dep.name || 'Dependent'
      const depCategory = (slotsT.depDocs || 'Docs: {name}').replace('{name}', depName)

      slots.push({
        key: `i94_dep_${dep.id}`,
        title: (slotsT.i94DepTitle || 'I-94 ({name})').replace('{name}', depName),
        subtitle: slotsT.i94DepSubtitle || 'U.S. Entry Record',
        category: depCategory,
      })
      slots.push({
        key: `passportVisa_dep_${dep.id}`,
        title: (slotsT.passportVisaDepTitle || 'Passport/Visa ({name})').replace('{name}', depName),
        subtitle: slotsT.passportVisaDepSubtitle || 'Bio page + Visa stamp',
        category: depCategory,
      })
      if (dep.relation === 'child') {
        slots.push({
          key: `birthCertificate_dep_${dep.id}`,
          title: (slotsT.birthCertTitle || 'Birth Certificate ({name})').replace('{name}', depName),
          subtitle: slotsT.birthCertSubtitle || 'Birth proof',
          category: depCategory,
        })
      }
      if (dep.relation === 'spouse') {
        slots.push({
          key: `marriageCertificate`,
          title: slotsT.marriageCertTitle || 'Marriage Certificate',
          subtitle: slotsT.marriageCertSubtitle || 'Marriage proof',
          category: depCategory,
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

        const currentStepData = (proc.step_data as Record<string, unknown> | null) ?? {}
        const currentDocs =
          (currentStepData.docs as Record<string, string>) || {}
        const updatedDocs: Record<string, string> = { ...currentDocs }
        const slots = getDocSlots()

        for (const slot of slots) {
          const doc = docs[slot.key]
          if (doc?.file) {
            const fileToUpload = await compressImageForUpload(doc.file)
            const fileExt = fileToUpload.name.split('.').pop()
            const filePath = `${session.user.id}/cos/${slot.key}.${fileExt}`
            let uploadError = null

            const result = await supabase.storage
              .from('aplikei-profiles')
              .upload(filePath, fileToUpload, {
                upsert: true,
                contentType: fileToUpload.type,
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
        const isChildRecoveryFlow =
          hasChildRecoveryContext &&
          (childWorkflowType === 'motion' || childWorkflowType === 'rfe')

        if (isChildRecoveryFlow) {
          const currentDBStep = freshProc.current_step ?? 0
          const recoveryTemplate =
            childWorkflowType === 'motion'
              ? MOTION_STEPS_TEMPLATE
              : RFE_STEPS_TEMPLATE
          const nextStepIdx = currentDBStep + 1
          const isFinal = nextStepIdx >= recoveryTemplate.length
          const nextStep = recoveryTemplate[nextStepIdx]
          const isCorrection = !!(freshProc.step_data as any)?.admin_feedback
          const shouldRequestReview =
            isCorrection || nextStep?.type === 'admin_action' || isFinal

          if (nextStepIdx > currentDBStep) {
            await processService.approveStep(proc.id, nextStepIdx, isFinal, undefined, undefined, {
              notifyClient: !shouldRequestReview,
            })
          }

          if (shouldRequestReview) {
            await processService.requestStepReview(proc.id)
          }

          toast.success(t.cos?.toasts?.stepSent)

          const parentId =
            String(parentProcessId || (freshProc.step_data as any)?.parent_process_id || '').trim() || proc.id
          const flow = childWorkflowType === 'motion' ? 'motion' : 'rfe'
          const baseStep = flow === 'motion' ? 19 : 13

          if (isFinal || nextStep?.type === 'admin_action') {
            navigate(`/dashboard/processes/${slug}?slug=${parentId}&childId=${proc.id}&workflowType=${flow}`)
          } else {
            const params = new URLSearchParams()
            params.set('slug', parentId)
            params.set('childId', proc.id)
            params.set('workflowType', flow)
            params.set('step', String(baseStep + nextStepIdx))
            navigate(`/dashboard/processes/${slug}/onboarding?${params.toString()}`)
          }
          return
        }

        const freshStepData = (freshProc.step_data || {}) as any
        const clientTargetVisa = String(freshStepData.targetVisa || "");
        const clientCurrentVisa = String(freshStepData.currentVisa || "");
        const isF1 = clientTargetVisa.includes("F1") || clientTargetVisa.includes("F-1") || clientCurrentVisa.includes("F1") || clientCurrentVisa.includes("F-1");

        let nextStepIdx = stepIdx + 1;
        if (!isF1) {
          const stepsToSkipIds = ["cos_i20_upload", "cos_sevis_fee", "eos_i20_upload", "eos_sevis_fee"];
          while (nextStepIdx < service.steps.length && stepsToSkipIds.includes(service.steps[nextStepIdx].id)) {
            nextStepIdx++;
          }
        }

        const targetVisa = freshStepData.targetVisa as string
        const uscisResult = freshStepData.uscis_official_result as string
        const rfeResult = freshStepData.uscis_rfe_result as string

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

        const isFinal = nextStepIdx >= totalSteps
        let nextStep: any = service.steps[nextStepIdx]
        if (!nextStep) {
          if (nextStepIdx >= 13 && nextStepIdx <= 18) {
            nextStep = RFE_STEPS_TEMPLATE[nextStepIdx - 13]
          } else if (nextStepIdx >= 19 && nextStepIdx <= COS_MOTION_END_STEP) {
            nextStep = MOTION_STEPS_TEMPLATE[nextStepIdx - 19]
          }
        }

        const currentDBStep = freshProc.current_step ?? 0
        const isCorrection = !!(freshProc.step_data as any)?.admin_feedback
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
        const isAdminStep = nextStep?.type === 'admin_action'
        if (isAdminStep || isFinal) {
          navigate(`/dashboard/processes/${slug}`)
        } else {
          const params = new URLSearchParams(searchParams)
          params.set('step', String(nextStepIdx))
          if (proc?.id) params.set('id', proc.id)
          navigate(`/dashboard/processes/${slug}/onboarding?${params.toString()}`)
        }
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
        <div className='fixed inset-0 z-[120] bg-bg/70 backdrop-blur-sm flex items-center justify-center'>
          <div className='bg-card border border-border shadow-xl rounded-2xl px-6 py-5 flex items-center gap-3'>
            <RiLoader4Line className='text-2xl text-primary animate-spin' />
            <p className='text-sm font-black text-text uppercase tracking-wider'>
              Enviando etapa...
            </p>
          </div>
        </div>
      )}

      <div className='bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm backdrop-blur-md bg-card/85'>
        <div>
          <h1 className='text-xl font-black text-text tracking-tight'>
            {t.cos.title}
          </h1>
          <p className='text-xs text-text-muted font-medium mt-0.5'>
            {t.cos.subtitle}{' '}
            <span className='text-primary font-black uppercase tracking-widest ml-1'>
              {t.cos.badge}
            </span>
          </p>
        </div>
        <div className='md:hidden w-36'>
          <OnboardingStepper slug={slug} stepIdx={stepIdx} totalSteps={totalSteps} />
        </div>
      </div>

      <div className="hidden md:block bg-card border-b border-border py-6 mb-8">
        <div className="max-w-6xl mx-auto px-8">
          <OnboardingStepper slug={slug} stepIdx={stepIdx} totalSteps={totalSteps} />
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
                <h2 className='text-lg font-black text-text tracking-tight'>
                  {currentStepTitle}
                </h2>
              </div>
            </div>
          </div>

          {childProcessId && (
            <div className={cn(
              "mb-6 rounded-2xl p-5 border shadow-sm flex items-start gap-4 transition-all",
              childWorkflowType === 'motion' 
                ? "bg-amber-500/5 border-amber-500/20 text-amber-900" 
                : "bg-primary/5 border-primary/20 text-primary-dark"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner",
                childWorkflowType === 'motion'
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
                  : "bg-primary/10 border-primary/20 text-primary"
              )}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse inline-block" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted leading-none">
                  {childWorkflowType === 'motion' ? 'Fluxo de Motion Ativo' : 'Fluxo de RFE Ativo'}
                </p>
                <h3 className="text-sm font-black text-text mt-1">
                  Este caso é complementar ao seu processo principal.
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Identificador do Subprocesso: <span className="font-mono font-semibold">{childProcessId}</span>
                </p>
              </div>
            </div>
          )}

          <div className='bg-card rounded-[32px] border border-border shadow-xl overflow-hidden'>
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <COSStepContent
                t={t}
                currentStepId={currentStepId}
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
                    `/checkout/${dependentUpsellSlug}?proc_id=${proc?.id}&upgrade=true`,
                  )
                }
                onRefreshSlots={() => window.location.reload()}
                onJumpToStep={jumpToOnboardingStep}
                onUSCISResult={handleUSCISResult}
                onMotionResult={handleMotionResult}
                onRFEResult={handleRFEResult}
              />
            </motion.div>
          </div>

          {!isMotionResultStep && (
            <div className='flex items-center justify-between mt-6'>
              <button
                onClick={goToProcess}
                className='flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-sm font-black text-text-muted hover:bg-bg-subtle transition-all'
              >
                <RiArrowLeftSLine className='text-lg' />
                {t.cos.btns.back || 'Back'}
              </button>

              {!isReadOnly &&
                ![
                  'cos_analysis_form_docs',
                  'cos_i20_upload',
                  'cos_sevis_fee',
                  'cos_presentation_letter',
                  'cos_analysis_presentation_letter',
                  'cos_official_forms',
                  'cos_analysis_official_forms',
                  'cos_final_forms',
                  'cos_analysis_final_forms',
                  'cos_final_package',
                  'cos_rfe_explanation',
                  'cos_rfe_instruction',
                  'cos_rfe_accept_proposal',
                  'cos_rfe_proposal',
                  'cos_rfe_final_ship',
                  'cos_rfe_end',
                  'cos_motion_acquisition',
                  'cos_motion_instruction',
                  'cos_motion_accept_proposal',
                  'cos_motion_proposal',
                  'cos_motion_end',
                  'eos_admin_analysis',
                  'eos_i20_upload',
                  'eos_sevis_fee',
                  'eos_uscis_fee',
                  'eos_cover_letter',
                  'eos_admin_cover_analysis',
                  'eos_official_forms',
                  'eos_admin_final_review',
                  'eos_final_review',
                  'eos_final_package',
                ].includes(currentStepId || '') && (
                  <button
                    onClick={() => void handleConcluir()}
                    disabled={!canSubmit || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${!canSubmit || isSubmitting
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
