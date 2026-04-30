import { RiInformationLine } from 'react-icons/ri'
import { MdAccountBalance, MdPerson } from 'react-icons/md'
import { DocUploadCard, type DocFile } from '../../../../components/DocUploadCard'
import { useT } from '../../../../i18n'

type OnboardingTranslations = ReturnType<typeof useT>

interface DocSlot {
  key: string
  title: string
  subtitle: string
  category: string
}

interface COSDocumentsStepProps {
  t: OnboardingTranslations
  docs: Record<string, DocFile>
  isReadOnly: boolean
  isFieldRejected: (key: string) => boolean
  getDocSlots: () => DocSlot[]
  onDocChange: (key: string, file: File) => void
}

export function COSDocumentsStep({
  t,
  docs,
  isReadOnly,
  isFieldRejected,
  getDocSlots,
  onDocChange,
}: COSDocumentsStepProps) {
  const categories = Array.from(new Set(getDocSlots().map((slot) => slot.category)))

  return (
    <>
      <div className='px-8 py-6 border-b border-slate-100 flex items-center gap-3'>
        <div className='w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500'>
          <MdPerson className='text-xl' />
        </div>
        <div>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            {t.cos.docs.title}
          </h2>
          <p className='text-sm text-slate-400 font-medium mt-0.5'>
            {t.cos.docs.desc}
          </p>
        </div>
      </div>

      <div className='px-8 py-6 space-y-8'>
        <div className='flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100'>
          <RiInformationLine className='text-blue-500 text-xl shrink-0 mt-0.5' />
          <div>
            <p className='text-sm font-black text-slate-800'>
              {t.cos.docs.i94Instructions}
            </p>
            <p className='text-xs text-slate-500 font-medium mt-0.5'>
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

        {categories.map((category) => (
          <div key={category}>
            <div className='flex items-center gap-2 mb-4'>
              {category.includes('Financial') ? (
                <MdAccountBalance className='text-slate-400 text-base' />
              ) : (
                <MdPerson className='text-slate-400 text-base' />
              )}
              <span className='text-[11px] font-black text-slate-400 uppercase tracking-widest'>
                {category}
              </span>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {getDocSlots()
                .filter((slot) => slot.category === category)
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
                    onChange={onDocChange}
                    isReadOnly={isReadOnly}
                    isRejected={isFieldRejected(`docs.${slot.key}`)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
