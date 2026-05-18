import { useState, type ReactNode } from 'react'
import { Formik, Form, type FormikHelpers } from 'formik'
import { motion } from 'framer-motion'
import {
  RiAlertLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiLoader4Line,
} from 'react-icons/ri'
import { useT } from '../../../i18n'
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
  previousLabel?: string
  nextSectionLabel?: string
  sectionFields: readonly (readonly string[])[]
  isBusy?: boolean
  readOnly?: boolean
  children: (currentSection: number) => ReactNode
  renderHeader?: () => ReactNode
  renderFooter?: (args: {
    values: Partial<DS160FormValues>
    isSubmitting: boolean
    currentSection: number
    totalSections: number
    isFirstSection: boolean
    isLastSection: boolean
    isValid: boolean
    onPrevious: () => void
    onNext: () => Promise<void>
    onFinalize: () => void
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
  previousLabel,
  nextSectionLabel,
  sectionFields,
  isBusy = false,
  readOnly = false,
  children,
  renderHeader,
  renderFooter,
}: DS160FormShellProps) {
  const t = useT('visas') as any
  const [currentSection, setCurrentSection] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const totalSections = sectionFields.length

  return (
    <Formik<Partial<DS160FormValues>>
      initialValues={initialValues}
      validate={validate}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnBlur
      validateOnChange={true}
    >
      {({
        errors,
        values,
        touched,
        isSubmitting: formSubmitting,
        validateForm,
        setTouched,
        submitForm,
        isValid,
      }) => {
        const currentFields = sectionFields[currentSection] ?? []
        const formErrors = errors as Record<string, unknown>
        const currentSectionErrors = currentFields.filter((field) => formErrors[field])
        const hasVisibleErrors =
          showErrors && currentSectionErrors.length > 0
        const submitting = formSubmitting || isBusy || isValidating
        const isFirstSection = currentSection === 0
        const isLastSection = currentSection >= totalSections - 1

        const goToPrevious = () => {
          setShowErrors(false)
          if (!isFirstSection) {
            setCurrentSection((section) => Math.max(0, section - 1))
          }
        }

        const goToNext = async () => {
          if (readOnly) {
            setShowErrors(false)
            setCurrentSection((s) => Math.min(totalSections - 1, s + 1))
            return
          }

          const errors = await validateForm()
          const blockingFields = currentFields.filter(
            (field) => (errors as Record<string, unknown>)[field],
          )

          if (blockingFields.length > 0) {
            setShowErrors(true)
            const touchedFields = currentFields.reduce<Record<string, boolean>>(
              (acc, field) => {
                acc[field] = true
                return acc
              },
              {},
            )
            setTouched({ ...touched, ...touchedFields })
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
          }

          setShowErrors(false)
          setCurrentSection((s) => Math.min(totalSections - 1, s + 1))
        }

        const handleFinalize = async () => {
          if (readOnly) return

          if (!isLastSection) {
            void goToNext()
            return
          }

          setIsValidating(true)
          const errors = await validateForm()
          const nextFormErrors = errors as Record<string, unknown>
          const allFields = sectionFields.flat()
          const firstErrorField = allFields.find((f) => nextFormErrors[f])

          if (firstErrorField) {
            const errorSectionIdx = sectionFields.findIndex((fields) =>
              fields.includes(firstErrorField),
            )

            if (errorSectionIdx !== -1) {
              setCurrentSection(errorSectionIdx)
              setShowErrors(true)
              setTouched(
                allFields.reduce<Record<string, boolean>>((acc, field) => {
                  acc[field] = true
                  return acc
                }, {}),
              )
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            setIsValidating(false)
            return
          }

          setIsValidating(false)
          submitForm()
        }

        return (
          <Form
            noValidate
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.preventDefault()
              }
            }}
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            {renderHeader?.()}
            <div className='mb-6 rounded-2xl border border-border bg-card/90 p-5 shadow-sm'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='text-[11px] font-black uppercase tracking-widest text-primary'>
                    {t.onboardingPage?.section || 'Seção'} {currentSection + 1} {t.onboardingPage?.of || 'de'} {totalSections}
                  </p>
                  {!readOnly && (
                    <p className='mt-1 text-sm font-medium text-text-muted'>
                      {t.onboardingPage?.fillStepAndAdvance || 'Preencha esta etapa e avance para a próxima seção da DS-160.'}
                    </p>
                  )}
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-black text-text'>
                    {Math.round(((currentSection + 1) / totalSections) * 100)}%
                  </p>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-text-muted'>
                    Progresso do formulário
                  </p>
                </div>
              </div>

              <div className='mt-4 h-2 w-full overflow-hidden rounded-full bg-bg-subtle'>
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

            <div className='bg-card rounded-3xl border border-border shadow-xl shadow-border/40 overflow-hidden'>
              {showErrors && currentSectionErrors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3'
                >
                  <RiAlertLine className='text-red-500 text-xl shrink-0 mt-0.5' />
                  <div>
                    <p className='text-xs font-black text-red-900 uppercase tracking-tight mb-1'>
                      {requiredTitle}
                    </p>
                    <p className='text-[11px] text-red-700 font-medium leading-relaxed'>
                      {t.onboardingPage?.scrollUpToFindErrors || 'Role para cima para localizar os erros destacados em vermelho.'}
                    </p>
                  </div>
                </motion.div>
              )}
              <div className='p-6 sm:p-10 space-y-0'>{children(currentSection)}</div>

              {renderFooter ? (
                renderFooter({
                  values,
                  isSubmitting: submitting,
                  currentSection,
                  totalSections,
                  isFirstSection,
                  isLastSection,
                  isValid,
                  onPrevious: goToPrevious,
                  onNext: goToNext,
                  onFinalize: handleFinalize,
                })
              ) : (
                <div className='px-6 sm:px-10 py-6 bg-bg-subtle/70 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4'>
                  <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
                    {!isFirstSection && (
                      <button
                        type='button'
                        onClick={goToPrevious}
                        disabled={submitting}
                        className='w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border text-text font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-50 flex items-center justify-center gap-2'
                      >
                        <RiArrowLeftLine className='text-lg' />
                        {previousLabel || 'Anterior'}
                      </button>
                    )}
                    <button
                      type='button'
                      onClick={() => void onSaveDraft(values)}
                      disabled={submitting}
                      className='w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border text-text font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-50'
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
                      {nextSectionLabel || 'Próxima seção'}
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
