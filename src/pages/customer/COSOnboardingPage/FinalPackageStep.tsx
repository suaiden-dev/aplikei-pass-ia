import { useState, useEffect, useRef } from 'react'
import {
  RiDownload2Line,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiEditLine,
  RiFileTextLine,
  RiCheckboxCircleFill,
  RiArrowRightLine,
  RiMapPinLine,
  RiBarcodeLine,
  RiAlertFill,
  RiListOrdered2,
  RiTruckLine,
} from 'react-icons/ri'
import { toast } from 'sonner'
import {
  type UserService,
  processService,
} from '../../../services/process.service'
import { packageService } from '../../../services/package.service'
import {
  RiThumbUpLine,
  RiThumbDownLine,
  RiTimeLine,
  RiInformationFill,
} from 'react-icons/ri'
import { useT } from '../../../i18n'

interface Props {
  proc: UserService
  onComplete: () => Promise<void>
  onJumpToStep?: (step: number) => void
}

function getDeadline(i94Date: string | undefined): string | null {
  if (!i94Date) return null
  const d = new Date(i94Date)
  if (isNaN(d.getTime())) return null
  d.setDate(d.getDate() - 7)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function FinalPackageStep({
  proc,
  onComplete,
  onJumpToStep,
}: Props) {
  const t = useT('onboarding')
  const [isMerging, setIsMerging] = useState(false)
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const trackingSavedRef = useRef(false)

  const data = (proc.step_data || {}) as Record<string, unknown>
  const docs = (data.docs as Record<string, string>) || {}
  const i94Date = data.i94Date as string | undefined
  const deadline = getDeadline(i94Date)
  const hasDependents =
    !!(data.dependents as unknown[])?.length || !!data.paid_dependents

  useEffect(() => {
    if (data.uscis_official_result === 'approved') setShowCelebration(true)
  }, [data.uscis_official_result])

  useEffect(() => {
    if (data.finalPackagePdfUrl)
      setMergedPdfUrl(data.finalPackagePdfUrl as string)
  }, [data.finalPackagePdfUrl])

  useEffect(() => {
    if (data.tracking_code) setTrackingCode(data.tracking_code as string)
  }, [data.tracking_code])

  // Auto-generate on mount if not yet done
  useEffect(() => {
    if (!data.finalPackagePdfUrl) {
      setIsMerging(true)
      packageService
        .mergeAndUploadPackage(proc.id, proc.user_id!)
        .then((url) => setMergedPdfUrl(url))
        .catch((e: unknown) => toast.error((e as Error).message))
        .finally(() => setIsMerging(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTrackingBlur = async () => {
    const value = trackingCode.trim()
    if (!value || trackingSavedRef.current) return
    try {
      await processService.updateStepData(proc.id, { tracking_code: value })
      trackingSavedRef.current = true
      toast.success('Código de rastreamento salvo!')
    } catch {
      toast.error('Erro ao salvar código.')
    }
  }

  if (!t || !t.cos) return null

  const packageOrder: { name: string; ready: boolean; note?: string }[] = [
    { name: 'G-1145', ready: !!data.g1145PdfUrl },
    { name: 'G-1450', ready: !!data.g1450PdfUrl },
    {
      name: 'Formulário I-539 — Aplicante Principal',
      ready: !!data.i539PdfUrl,
    },
    { name: 'Formulário I-539A — Dependentes', ready: hasDependents },
    { name: 'I-94 — Aplicante Principal', ready: !!docs.i94 },
    { name: 'I-94 — Dependentes', ready: hasDependents },
    { name: 'I-20 F1', ready: !!docs.i20_document },
    {
      name: 'I-20 F2 (Dependentes)',
      ready: hasDependents && !!docs.i20_document,
    },
    { name: 'Taxa SEVIS I-901', ready: !!docs.sevis_receipt },
    { name: 'Bank Statement', ready: !!docs.bankStatement },
    { name: 'Cover Letter', ready: !!data.generatedCoverLetterHTML },
    {
      name: 'Passaporte e Visto — Aplicante Principal',
      ready: !!docs.passportVisa,
    },
    { name: 'Passaporte e Visto — Dependentes', ready: hasDependents },
    { name: 'Certidão de Casamento', ready: true },
    { name: 'Certidão de Nascimento', ready: true },
    { name: 'Comprovante de Residência do Brasil', ready: !!docs.proofBrazil },
  ]

  if (showCelebration) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-8 animate-in fade-in zoom-in-95 duration-1000'>
        <div className='w-24 h-24 rounded-[32px] bg-success/10 text-success flex items-center justify-center mb-8 shadow-inner rotate-3 hover:rotate-0 transition-transform'>
          <RiCheckDoubleLine className='text-5xl' />
        </div>
        <h2 className='text-4xl font-black text-text mb-4 uppercase tracking-tighter italic'>
          {t.cos.finalPackage.celebration.title}
        </h2>
        <p
          className='text-text-muted font-medium max-w-md mx-auto leading-relaxed mb-12'
          dangerouslySetInnerHTML={{
            __html: t.cos.finalPackage.celebration.desc,
          }}
        />
        <div className='bg-card rounded-[40px] border border-border p-12 shadow-xl shadow-none/50 mb-12 max-w-lg w-full relative overflow-hidden group'>
          <div className='absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity'>
            <RiCheckDoubleLine className='text-8xl' />
          </div>
          <div className='relative z-10'>
            <p className='text-[10px] font-black text-primary uppercase tracking-widest mb-4 italic'>
              {t.cos.finalPackage.celebration.nextStepTitle}
            </p>
            <h3 className='text-xl font-black text-text mb-6 uppercase tracking-tight'>
              {t.cos.finalPackage.celebration.nextStepDesc}
            </h3>
            <p className='text-sm text-text-muted font-medium leading-relaxed'>
              {t.cos.finalPackage.celebration.nextStepInfo}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            await processService.updateProcessStatus(proc.id, 'completed')
            window.location.href = '/dashboard'
          }}
          className='bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-none transition-all flex items-center gap-3'
        >
          {t.cos.finalPackage.celebration.btn}
          <RiArrowRightLine className='text-xl' />
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-8 pb-32'>
      {/* Header */}
      <div className='bg-card rounded-[32px] border border-border p-8 shadow-sm flex items-center gap-6'>
        <div className='w-16 h-16 rounded-2xl bg-success/10 text-success flex items-center justify-center flex-shrink-0'>
          <RiCheckDoubleLine className='text-4xl' />
        </div>
        <div>
          <h2 className='text-2xl font-black text-text tracking-tight uppercase'>
            {t.cos.finalPackage.header.title}
          </h2>
          <p className='text-sm font-medium text-text-muted'>
            {t.cos.finalPackage.header.desc}
          </p>
        </div>
      </div>

      {/* Deadline Alert */}
      {deadline && (
        <div className='bg-danger/10 border border-danger/20 rounded-[24px] p-6 flex items-start gap-4'>
          <RiAlertFill className='text-danger text-2xl shrink-0 mt-0.5' />
          <div>
            <p className='text-[11px] font-black text-danger uppercase tracking-widest mb-1'>
              Data Limite de Envio
            </p>
            <p className='text-xl font-black text-danger'>{deadline}</p>
            <p className='text-[11px] text-danger/80 font-bold mt-1 uppercase tracking-wide'>
              1 semana antes da data de permanência autorizada do I-94
            </p>
          </div>
        </div>
      )}

      {/* Download Area */}
      <div className='bg-card rounded-[40px] border border-border p-10 shadow-sm text-center'>
        <div className='w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-5'>
          <RiFileTextLine className='text-3xl' />
        </div>
        <h3 className='text-xl font-black text-text mb-2 uppercase tracking-tight'>
          {t.cos.finalPackage.download.title}
        </h3>
        <p className='text-sm text-text-muted font-medium max-w-sm mx-auto leading-relaxed mb-8'>
          Faça o download do seu pacote e realize as assinaturas conforme
          instruções abaixo.
        </p>
        {isMerging ? (
          <div className='flex items-center justify-center gap-3 py-5 text-text-muted'>
            <RiLoader4Line className='text-xl animate-spin text-primary' />
            <span className='text-sm font-black uppercase tracking-widest'>
              {t.cos.finalPackage.download.btnWaiting}
            </span>
          </div>
        ) : (
          <button
            onClick={() => window.open(mergedPdfUrl!, '_blank')}
            className='bg-primary hover:bg-primary-hover text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center gap-3 mx-auto'
          >
            <RiDownload2Line className='text-xl' />
            {t.cos.finalPackage.download.btnDownload}
          </button>
        )}
      </div>

      {/* Montar o Processo */}
      <div className='bg-card rounded-[32px] border border-border p-8 shadow-sm'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-9 h-9 rounded-xl bg-bg-subtle text-text-muted flex items-center justify-center'>
            <RiListOrdered2 className='text-lg' />
          </div>
          <div>
            <h3 className='text-[11px] font-black text-text uppercase tracking-widest'>
              Montar o Processo
            </h3>
            <p className='text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5'>
              Organize nesta ordem exata antes de enviar
            </p>
          </div>
        </div>
        <div className='space-y-2'>
          {packageOrder.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${item.ready ? 'bg-success/5 border-success/10' : 'bg-bg-subtle border-border'}`}
            >
              <span
                className={`text-[10px] font-black w-5 text-center shrink-0 ${item.ready ? 'text-success' : 'text-slate-300'}`}
              >
                {i + 1}
              </span>
              {item.ready ? (
                <RiCheckboxCircleFill className='text-success text-base shrink-0' />
              ) : (
                <div className='w-4 h-4 rounded-full border-2 border-border shrink-0' />
              )}
              <span
                className={`text-[11px] font-black uppercase tracking-widest ${item.ready ? 'text-text' : 'text-text-muted'}`}
              >
                {item.name}
              </span>
            </div>
          ))}
        </div>
        <p className='text-[10px] text-text-muted font-bold uppercase tracking-widest mt-5 text-center'>
          Gere o PDF único clicando em Download acima — todos os documentos já
          estarão nesta ordem.
        </p>
      </div>

      {/* Assinaturas */}
      <div className='bg-card rounded-[32px] border border-border p-8 shadow-sm'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-9 h-9 rounded-xl bg-info/10 text-info flex items-center justify-center'>
            <RiEditLine className='text-lg' />
          </div>
          <div>
            <h3 className='text-[11px] font-black text-text uppercase tracking-widest'>
              Assinaturas Necessárias
            </h3>
            <p className='text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5'>
              Use caneta preta — assinaturas à mão
            </p>
          </div>
        </div>

        <div className='space-y-3'>
          {/* G-1450 */}
          <div className='p-5 bg-bg-subtle rounded-2xl border border-border'>
            <p className='text-[11px] font-black text-text uppercase tracking-widest mb-1'>
              G-1450
            </p>
            <p className='text-[11px] text-text-muted font-medium'>
              Assine no campo destinado ao titular do cartão.
            </p>
          </div>

          {/* Cover Letter */}
          <div className='p-5 bg-bg-subtle rounded-2xl border border-border'>
            <p className='text-[11px] font-black text-text uppercase tracking-widest mb-1'>
              Cover Letter (Carta de Apresentação)
            </p>
            <p className='text-[11px] text-text-muted font-medium'>
              Assine no campo do aplicante principal ao final da carta.
            </p>
          </div>

          {/* I-539 */}
          <div className='p-5 bg-info/5 rounded-2xl border border-info/10'>
            <p className='text-[11px] font-black text-info uppercase tracking-widest mb-2'>
              Formulário I-539 — Aplicante Principal
            </p>
            <p className='text-[11px] text-text-muted font-medium'>
              📄 Pág 5, Parte 5, Item 4 — Assine com seu nome completo.
            </p>
          </div>

          {/* I-539A */}
          <div className='p-5 bg-info/5 rounded-2xl border border-info/10'>
            <p className='text-[11px] font-black text-info uppercase tracking-widest mb-2'>
              Formulário I-539A — Dependentes
            </p>
            <p className='text-[11px] text-text-muted font-medium mb-2'>
              📄 Pág 3, Parte 4, Item 4
            </p>
            <div className='space-y-1.5 pl-3 border-l-2 border-info/30'>
              <p className='text-[10px] text-text-muted font-bold uppercase tracking-wide'>
                ⬇ Menores de 14 anos → assinado pelo aplicante principal
              </p>
              <p className='text-[10px] text-text-muted font-bold uppercase tracking-wide'>
                ⬇ Maiores de 14 anos → o próprio dependente assina
              </p>
            </div>
          </div>
          <div className='p-5 bg-info/5 rounded-2xl border border-info/10'>
            <p className='text-[11px] font-black text-info uppercase tracking-widest mb-2'>
              Cartão de Crédito no G1450
            </p>
            <p className='text-[11px] text-text-muted font-medium mb-2'>
              📄 Preencher os dados do cartão de crédito no Formulário G1450
            </p>
            <div className='space-y-1.5 pl-3 border-l-2 border-info/30'>
              <p className='text-[10px] text-text-muted font-bold uppercase tracking-wide'>
                ➡️Preencher CCV, Data de Expiração e Número do Cartão.
              </p>
            </div>
          </div>

          {/* I-20 */}
          <div className='p-5 bg-bg-subtle rounded-2xl border border-border'>
            <p className='text-[11px] font-black text-text uppercase tracking-widest mb-1'>
              I-20 F1 e F2
            </p>
            <p className='text-[11px] text-text-muted font-medium'>
              📄 Pág 1 — Sempre assinado pelo aplicante principal.
            </p>
          </div>
        </div>
      </div>

      {/* Endereço de Envio */}
      <div className='bg-card rounded-[32px] border border-border p-8 shadow-sm'>
        <div className='flex items-center gap-3 mb-5'>
          <div className='w-9 h-9 rounded-xl bg-bg-subtle text-text-muted flex items-center justify-center'>
            <RiMapPinLine className='text-lg' />
          </div>
          <h3 className='text-[11px] font-black text-text uppercase tracking-widest'>
            Endereço de Envio (USCIS)
          </h3>
        </div>
        <div className='bg-bg-subtle rounded-2xl border border-border p-6 mb-4'>
          <p className='text-[11px] font-black text-text-muted uppercase tracking-widest mb-3'>
            Destinatário
          </p>
          <p className='font-mono text-sm text-text leading-relaxed'>
            U.S. Department of Homeland Security
          </p>
          <p className='font-mono text-sm text-text leading-relaxed'>
            2501 S. State Highway 121 Business
          </p>
          <p className='font-mono text-sm text-text leading-relaxed'>
            Suite 400
          </p>
          <p className='font-mono text-sm text-text leading-relaxed'>
            Lewisville, TX 75067
          </p>
        </div>
        <div className='flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-2xl p-4'>
          <RiTruckLine className='text-warning text-lg shrink-0 mt-0.5' />
          <p className='text-[11px] text-warning font-bold uppercase tracking-wide'>
            Sugestão: enviar via FedEx com entrega em 24h (express delivery) com
            número de rastreamento.
          </p>
        </div>
      </div>

      {/* Tracking Code */}
      <div className='bg-card rounded-[32px] border border-border p-8 shadow-sm'>
        <div className='flex items-center gap-3 mb-5'>
          <div className='w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center'>
            <RiBarcodeLine className='text-lg' />
          </div>
          <h3 className='text-[11px] font-black text-text uppercase tracking-widest'>
            Código de Rastreamento
          </h3>
        </div>
        <input
          type='text'
          value={trackingCode}
          onChange={(e) => {
            setTrackingCode(e.target.value)
            trackingSavedRef.current = false
          }}
          onBlur={handleTrackingBlur}
          placeholder='Cole aqui o código (ex: 1Z999AA10123456784)'
          className='w-full px-5 py-4 rounded-2xl border border-border bg-bg-subtle text-sm font-bold text-text placeholder:text-slate-300 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
        />
        <p className='text-[10px] text-text-muted font-bold uppercase tracking-widest mt-3'>
          Salvo automaticamente ao clicar fora do campo.
        </p>
      </div>

      {/* USCIS Result Feedback */}
      <div className='bg-bg-subtle border border-border rounded-[32px] p-8 shadow-sm relative overflow-hidden group/feedback'>
        <div className='absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover/feedback:opacity-10 transition-opacity'>
          <RiThumbUpLine className='text-8xl rotate-12' />
        </div>
        <div className='flex flex-col items-center text-center mb-8 relative z-10'>
          <div className='w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center mb-3 shadow-sm'>
            <RiInformationFill className='text-primary text-base' />
          </div>
          <h4 className='text-sm font-black text-text uppercase tracking-tight'>
            {t.cos.finalPackage.feedback.title}
          </h4>
          <p className='text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 italic'>
            {t.cos.finalPackage.feedback.subtitle}
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10'>
          <button
            onClick={async () => {
              toast.loading(t.cos.finalPackage.feedback.toasts.saving, {
                id: 'report',
              })
              await processService.updateStepData(proc.id, {
                uscis_official_result: 'approved',
                uscis_reported_at: new Date().toISOString(),
              })
              toast.success(t.cos.finalPackage.feedback.toasts.success, {
                id: 'report',
              })
              setShowCelebration(true)
            }}
            className='flex flex-col items-center justify-center p-8 bg-card border border-success/20 rounded-[24px] hover:bg-success/10 hover:border-success/30 transition-all group/btn shadow-sm hover:shadow-md'
          >
            <div className='w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all shadow-inner border border-success/10'>
              <RiThumbUpLine className='text-2xl' />
            </div>
            <span className='text-[10px] font-black text-text uppercase tracking-widest'>
              {t.cos.finalPackage.feedback.approved}
            </span>
          </button>
          <button
            onClick={async () => {
              toast.loading(t.cos.finalPackage.feedback.toasts.saving, {
                id: 'report',
              })
              try {
                await processService.updateStepData(proc.id, {
                  uscis_official_result: 'denied',
                  uscis_reported_at: new Date().toISOString(),
                })
                await processService.startAdditionalWorkflow(proc.id, 'motion')
                await processService.updateCurrentStep(proc.id, 19)
                toast.success(t.cos.finalPackage.feedback.toasts.success, {
                  id: 'report',
                })
                if (onJumpToStep) onJumpToStep(19)
                else await onComplete()
              } catch {
                toast.error('Erro ao iniciar fluxo de Motion')
              }
            }}
            className='flex flex-col items-center justify-center p-8 bg-card border border-danger/20 rounded-[24px] hover:bg-danger/10 hover:border-danger/30 transition-all group/btn shadow-sm hover:shadow-md'
          >
            <div className='w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-4 group-hover/btn:scale-110 group-hover/btn:-rotate-6 transition-all shadow-inner border border-danger/10'>
              <RiThumbDownLine className='text-2xl' />
            </div>
            <span className='text-[10px] font-black text-text uppercase tracking-widest'>
              {t.cos.finalPackage.feedback.denied}
            </span>
          </button>
          <button
            onClick={async () => {
              toast.loading(t.cos.finalPackage.feedback.toasts.saving, {
                id: 'report',
              })
              try {
                await processService.updateStepData(proc.id, {
                  uscis_official_result: 'rfe',
                  uscis_reported_at: new Date().toISOString(),
                })
                await processService.startAdditionalWorkflow(proc.id, 'rfe')
                await processService.updateCurrentStep(proc.id, 13)
                toast.success(t.cos.finalPackage.feedback.toasts.success, {
                  id: 'report',
                })
                if (onJumpToStep) onJumpToStep(13)
                else await onComplete()
              } catch {
                toast.error('Erro ao iniciar fluxo de RFE')
              }
            }}
            className='flex flex-col items-center justify-center p-8 bg-card border border-warning/20 rounded-[24px] hover:bg-warning/10 hover:border-warning/30 transition-all group/btn shadow-sm hover:shadow-md'
          >
            <div className='w-14 h-14 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mb-4 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all shadow-inner border border-warning/10'>
              <RiTimeLine className='text-2xl' />
            </div>
            <span className='text-[10px] font-black text-text uppercase tracking-widest text-center leading-tight'>
              {t.cos.finalPackage.feedback.rfe}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
