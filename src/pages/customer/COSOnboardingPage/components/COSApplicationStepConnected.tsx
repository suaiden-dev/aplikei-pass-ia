/**
 * COSApplicationStepConnected
 *
 * Conecta COSApplicationStep ao workflow (user_product_instances + user_steps).
 * Gerencia os slots de dependentes pagos, modal de compra e botões salvar/enviar.
 */

import { useState } from 'react'
import {
  RiCheckLine, RiDraftLine, RiLoader4Line, RiLock2Line,
  RiGroupLine, RiShieldCheckLine, RiCloseLine, RiArrowRightLine,
} from 'react-icons/ri'
import { MdGroupAdd } from 'react-icons/md'
import { COSApplicationStep } from './COSApplicationStep'
import { useStepInitialInfo } from '../hooks/useStepInitialInfo'
import { useT } from '../../../../i18n'
import type { Dependent } from '../useCOSOnboardingPage'

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending:            'Não iniciado',
  in_progress:        'Em andamento',
  completed:          'Concluído',
  in_review:          'Aguardando análise',
  approved:           'Aprovado',
  revision_requested: 'Revisão solicitada',
  skipped:            'Pulado',
}

const STATUS_COLOR: Record<string, string> = {
  pending:            'bg-slate-100 text-slate-500',
  in_progress:        'bg-primary/10 text-primary',
  completed:          'bg-emerald-50 text-emerald-600',
  in_review:          'bg-amber-50 text-amber-600',
  approved:           'bg-emerald-50 text-emerald-700',
  revision_requested: 'bg-red-50 text-red-600',
  skipped:            'bg-slate-50 text-slate-400',
}

// ─── Modal de confirmação de compra de dependente ─────────────────────────────

interface DependentSlotModalProps {
  instanceId: string
  onClose:    () => void
  onConfirm:  () => void
}

function DependentSlotModal({ onClose, onConfirm }: DependentSlotModalProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-slate-900/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Card */}
      <div className='relative z-10 w-full max-w-sm rounded-[2rem] border border-border bg-card shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-7 pt-7 pb-5 border-b border-border'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center'>
              <MdGroupAdd className='text-primary text-xl' />
            </div>
            <div>
              <p className='text-base font-black text-text leading-none'>Adicionar Dependente</p>
              <p className='text-xs text-text-muted font-medium mt-0.5'>COS / EOS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-xl text-text-muted hover:text-text hover:bg-bg-subtle transition-colors'
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='px-7 py-6 space-y-5'>
          {/* Preço */}
          <div className='rounded-2xl bg-bg-subtle border border-border p-5 text-center'>
            <p className='text-xs font-black text-text-muted uppercase tracking-widest mb-2'>Valor por dependente</p>
            <p className='text-4xl font-black text-primary'>US$ 100<span className='text-lg text-text-muted'>,00</span></p>
            <p className='text-xs text-text-muted font-medium mt-1 line-through'>US$ 200,00</p>
            <span className='inline-block mt-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200'>
              50% OFF
            </span>
          </div>

          {/* O que inclui */}
          <ul className='space-y-2.5'>
            {[
              'Slot extra no formulário I-539',
              'Revisão dos documentos do familiar',
              'Inclusão no pacote final do processo',
            ].map((item) => (
              <li key={item} className='flex items-center gap-3 text-sm text-text font-medium'>
                <RiShieldCheckLine className='text-emerald-500 shrink-0 text-base' />
                {item}
              </li>
            ))}
          </ul>

          {/* Quem se qualifica */}
          <div className='rounded-xl bg-amber-50 border border-amber-200 px-4 py-3'>
            <div className='flex items-start gap-2'>
              <RiGroupLine className='text-amber-600 shrink-0 mt-0.5' />
              <p className='text-xs text-amber-800 font-medium leading-relaxed'>
                Cônjuge ou filhos menores de 21 anos que estejam nos EUA na mesma condição de visto.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-7 pb-7 flex flex-col gap-3'>
          <button
            onClick={onConfirm}
            className='flex items-center justify-center gap-2 w-full rounded-2xl bg-primary px-6 py-4 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all'
          >
            Comprar slot — US$ 100,00
            <RiArrowRightLine className='text-base' />
          </button>
          <button
            onClick={onClose}
            className='text-xs font-bold text-text-muted hover:text-text transition-colors'
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface COSApplicationStepConnectedProps {
  instanceId:    string
  productStepId: string
  onSubmitted?:  () => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function COSApplicationStepConnected({
  instanceId,
  productStepId,
  onSubmitted,
}: COSApplicationStepConnectedProps) {
  const t    = useT('visas' as 'common')
  const step = useStepInitialInfo({ instanceId, productStepId })

  const [showSlotModal, setShowSlotModal] = useState(false)

  // Adapta dependentes para o shape esperado pelo componente visual
  const visualDependents: Dependent[] = step.data.dependents.map((d) => ({
    id:           d.id,
    name:         d.name,
    relation:     d.relation as Dependent['relation'],
    birthDate:    d.birthDate,
    i94Date:      d.i94Date,
    marriageDate: d.marriageDate,
  }))

  const procStepData: Record<string, unknown> = {
    paid_dependents: step.paidDependentSlots,
  }

  async function handleSubmit() {
    await step.submitStep()
    onSubmitted?.()
  }

  function handleBuySlot() {
    // Navega para o checkout do subproduto com referência da instância
    window.location.assign(
      `/checkout/slot-dependente-cos?instanceId=${instanceId}&upgrade=true`,
    )
  }

  const statusKey          = step.userStep?.status ?? 'pending'
  const isRevisionRequested = statusKey === 'revision_requested'

  return (
    <>
      {/* Modal de compra de dependente */}
      {showSlotModal && (
        <DependentSlotModal
          instanceId={instanceId}
          onClose={() => setShowSlotModal(false)}
          onConfirm={() => { setShowSlotModal(false); handleBuySlot() }}
        />
      )}

      <div className='flex flex-col'>
        {/* Status badge */}
        {step.userStep && (
          <div className='flex items-center gap-2 px-8 pt-5'>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${STATUS_COLOR[statusKey] ?? 'bg-slate-100 text-slate-500'}`}>
              {STATUS_LABEL[statusKey] ?? statusKey}
            </span>
            {isRevisionRequested && (
              <span className='text-[10px] text-red-500 font-bold animate-pulse'>
                Corrija os campos destacados e reenvie
              </span>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {step.isLoading ? (
          <div className='flex items-center justify-center py-24'>
            <RiLoader4Line className='text-3xl text-primary animate-spin' />
          </div>
        ) : (
          <COSApplicationStep
            t={t}
            procStepData={procStepData}
            currentVisa={step.data.currentVisa}
            targetVisa={step.data.targetVisa}
            i94Date={step.data.i94Date}
            dependents={visualDependents}
            isReadOnly={step.isReadOnly}
            isFieldRejected={step.isFieldRevised}
            setCurrentVisa={(v) => step.setCurrentVisa(v as Parameters<typeof step.setCurrentVisa>[0])}
            setTargetVisa={(v)  => step.setTargetVisa(v  as Parameters<typeof step.setTargetVisa>[0])}
            setI94Date={step.setI94Date}
            addDependent={step.addDependent}
            updateDependent={(id, field, value) =>
              step.updateDependent(id, field as keyof typeof step.data.dependents[0], value)
            }
            removeDependent={step.removeDependent}
            onBuyDependentSlot={() => setShowSlotModal(true)}
            onRefreshSlots={step.refreshSlots}
          />
        )}

        {/* Erro de save */}
        {step.saveError && (
          <div className='mx-8 mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>
            {step.saveError}
          </div>
        )}

        {/* Rodapé de ações */}
        {!step.isReadOnly && !step.isLoading && (
          <div className='sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-card/95 px-8 py-4 backdrop-blur'>
            <p className='text-[11px] font-bold text-text-muted'>
              {step.isSaving ? 'Salvando rascunho...' : 'Rascunho salvo automaticamente'}
            </p>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={step.saveDraft}
                disabled={step.isSaving || step.isSubmitting}
                className='flex items-center gap-2 rounded-xl border border-border bg-bg-subtle px-4 py-2.5 text-sm font-bold text-text transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50'
              >
                {step.isSaving
                  ? <RiLoader4Line className='animate-spin text-base' />
                  : <RiDraftLine className='text-base' />}
                Salvar rascunho
              </button>

              <button
                type='button'
                onClick={handleSubmit}
                disabled={!step.isComplete || step.isSubmitting || step.isSaving}
                className='flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40'
              >
                {step.isSubmitting
                  ? <RiLoader4Line className='animate-spin text-base' />
                  : step.isComplete
                    ? <RiCheckLine className='text-base' />
                    : <RiLock2Line className='text-base' />}
                {step.isSubmitting
                  ? 'Enviando...'
                  : isRevisionRequested
                    ? 'Reenviar para análise'
                    : 'Enviar para revisão'}
              </button>
            </div>
          </div>
        )}

        {/* Banners de status */}
        {statusKey === 'approved' && (
          <div className='mx-8 mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4'>
            <RiCheckLine className='text-2xl text-emerald-600 shrink-0' />
            <div>
              <p className='text-sm font-black text-emerald-800'>Formulário aprovado!</p>
              <p className='text-xs text-emerald-600 font-medium'>Nossa equipe validou suas informações.</p>
            </div>
          </div>
        )}
        {statusKey === 'in_review' && (
          <div className='mx-8 mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4'>
            <RiLoader4Line className='text-2xl text-amber-600 shrink-0 animate-spin' />
            <div>
              <p className='text-sm font-black text-amber-800'>Em análise</p>
              <p className='text-xs text-amber-600 font-medium'>Nossa equipe está revisando seu formulário inicial.</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
