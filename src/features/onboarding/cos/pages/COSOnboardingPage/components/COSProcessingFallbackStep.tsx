import { RiLoader4Line } from 'react-icons/ri'

interface COSProcessingFallbackStepProps {
  title?: string
  description?: string
}

export function COSProcessingFallbackStep({
  title,
  description,
}: COSProcessingFallbackStepProps) {
  return (
    <div className='p-16 text-center'>
      <div className='w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mx-auto mb-4'>
        <RiLoader4Line className='text-3xl animate-spin' />
      </div>
      <h2 className='text-xl font-black text-slate-900 mb-2'>
        Análise em Andamento
      </h2>
      <p className='text-sm text-slate-400 font-medium'>
        {title || 'Etapa Administrativa'}:{' '}
        {description || 'Nossa equipe está processando sua solicitação.'}
      </p>
      <div className='mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto'>
        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
          Status do Processo
        </p>
        <p className='text-xs font-bold text-slate-600'>
          Aguardando revisão interna de nossa equipe.
        </p>
      </div>
    </div>
  )
}

export default COSProcessingFallbackStep
