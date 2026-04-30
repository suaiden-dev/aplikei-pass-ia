import { useState, type ReactNode } from 'react'
import { Formik, Form, type FormikHelpers } from 'formik'
import { motion } from 'framer-motion'
import {
  RiAlertLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiLoader4Line,
} from 'react-icons/ri'
import type { DS160FormValues } from '../../../schemas/ds160.schema'

interface DS160FormShellProps {
  initialValues: Partial<DS160FormValues>
  validate: (values: Partial<DS160FormValues>) => Record<string, string>
  onSubmit: (
    values: Partial<DS160FormValues>,
    helpers: FormikHelpers<Partial<DS160FormValues>>,
  ) => void | Promise<void>
  onSaveDraft: (values: Partial<DS160FormValues>) => Promise<void>
  requiredTitle: string
  requiredDescription: string
  saveLabel: string
  submitLabel: string
  sectionFields: readonly (readonly string[])[]
  isBusy?: boolean
  children: (currentSection: number) => ReactNode
  renderFooter?: (args: {
    values: Partial<DS160FormValues>
    isSubmitting: boolean
    currentSection: number
    totalSections: number
    isFirstSection: boolean
    isLastSection: boolean
    onPrevious: () => void
    onNext: () => Promise<void>
  }) => ReactNode
}

export function DS160FormShell({
  initialValues,
  validate,
  onSubmit,
  onSaveDraft,
  requiredTitle,
  requiredDescription,
  saveLabel,
  submitLabel,
  sectionFields,
  isBusy = false,
  children,
  renderFooter,
}: DS160FormShellProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const totalSections = sectionFields.length

  return (
    <Formik<Partial<DS160FormValues>>
      initialValues={initialValues}
      validate={validate}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnBlur
      validateOnChange={false}
    >
      {({
        errors,
        values,
        touched,
        submitCount,
        isSubmitting: formSubmitting,
        validateForm,
        setTouched,
      }) => {
        const currentFields = sectionFields[currentSection] ?? []
        const formErrors = errors as Record<string, unknown>
        const currentSectionErrors = currentFields.filter((field) => formErrors[field])
        const hasVisibleErrors =
          submitCount > 0 && currentSectionErrors.length > 0
        const submitting = formSubmitting || isBusy
        const isFirstSection = currentSection === 0
        const isLastSection = currentSection >= totalSections - 1

        const goToPrevious = () => {
          if (!isFirstSection) {
            setCurrentSection((section) => Math.max(0, section - 1))
          }
        }

        const goToNext = async () => {
          const nextErrors = await validateForm()
          const nextFormErrors = nextErrors as Record<string, unknown>
          const blockingFields = currentFields.filter((field) => nextFormErrors[field])

          if (blockingFields.length > 0) {
            setTouched({
              ...touched,
              ...blockingFields.reduce<Record<string, boolean>>((acc, field) => {
                acc[field] = true
                return acc
              }, {}),
            })
            return
          }

          setCurrentSection((section) =>
            Math.min(totalSections - 1, section + 1),
          )
        }

        return (
          <Form noValidate>
            <div className='mb-6 rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='text-[11px] font-black uppercase tracking-widest text-primary'>
                    Seção {currentSection + 1} de {totalSections}
                  </p>
                  <p className='mt-1 text-sm font-medium text-slate-500'>
                    Preencha esta etapa e avance para a próxima seção da DS-160.
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-black text-slate-900'>
                    {Math.round(((currentSection + 1) / totalSections) * 100)}%
                  </p>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                    Progresso do formulário
                  </p>
                </div>
              </div>

              <div className='mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentSection + 1) / totalSections) * 100}%`,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className='h-full rounded-full bg-primary'
                />
              </div>
            </div>

            {hasVisibleErrors && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className='mb-8 p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4'
              >
                <div className='w-9 h-9 rounded-xl bg-red-400 text-white flex items-center justify-center shrink-0'>
                  <RiAlertLine className='text-lg' />
                </div>
                <div>
                  <h3 className='text-[11px] font-black text-red-900 uppercase tracking-widest mb-1'>
                    {requiredTitle}
                  </h3>
                  <p className='text-sm text-red-600 font-medium'>
                    {requiredDescription.replace(
                      '{count}',
                      currentSectionErrors.length.toString(),
                    )}
                  </p>
                </div>
              </motion.div>
            )}

            <div className='bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden'>
              <div className='p-6 sm:p-10 space-y-0'>{children(currentSection)}</div>

              {renderFooter ? (
                renderFooter({
                  values,
                  isSubmitting: submitting,
                  currentSection,
                  totalSections,
                  isFirstSection,
                  isLastSection,
                  onPrevious: goToPrevious,
                  onNext: goToNext,
                })
              ) : (
                <div className='px-6 sm:px-10 py-6 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4'>
                  <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
                    {!isFirstSection && (
                      <button
                        type='button'
                        onClick={goToPrevious}
                        disabled={submitting}
                        className='w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2'
                      >
                        <RiArrowLeftLine className='text-lg' />
                        Anterior
                      </button>
                    )}
                    <button
                      type='button'
                      onClick={() => void onSaveDraft(values)}
                      disabled={submitting}
                      className='w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50'
                    >
                      {saveLabel}
                    </button>
                  </div>

                  {isLastSection ? (
                    <button
                      type='submit'
                      disabled={submitting}
                      className='w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50'
                    >
                      {submitting ? (
                        <RiLoader4Line className='animate-spin text-lg' />
                      ) : (
                        <>
                          {submitLabel}
                          <RiArrowRightLine className='text-lg' />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type='button'
                      onClick={() => void goToNext()}
                      disabled={submitting}
                      className='w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50'
                    >
                      Próxima seção
                      <RiArrowRightLine className='text-lg' />
                    </button>
                  )}
                </div>
              )}
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}
