import {
  RiAddLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiInformationLine,
} from 'react-icons/ri'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog'
import { DatePicker } from '../../../../components/ui/DatePicker'
import imgTutor1 from '../../../../assets/tutor_i94/arrastar_ate_o_final_para_aceitar.png'
import imgTutor2 from '../../../../assets/tutor_i94/fazerupload_ou_usar_a_camera_do_documento.png'
import imgTutor3 from '../../../../assets/tutor_i94/preencher_campos.png'
import type { Dependent } from '../useCOSOnboardingPage'
import { useT } from '../../../../i18n'

const CURRENT_VISA_OPTIONS = [
  { label: 'B1/B2', icon: '🌐', color: 'text-sky-500' },
  { label: 'F1/F2', icon: '🎓', color: 'text-green-500' },
  { label: 'J1/J2', icon: '🔄', color: 'text-violet-500' },
  { label: 'L1/L2', icon: '📋', color: 'text-orange-500' },
  { label: 'R1/R2', icon: '🏛️', color: 'text-red-500' },
  { label: 'Other', icon: '···', color: 'text-slate-400' },
] as const

const TARGET_VISA_OPTIONS = [
  { label: 'B1/B2', icon: '🌐', color: 'text-sky-500' },
  { label: 'F1', icon: '🎓', color: 'text-green-500' },
  { label: 'J1', icon: '🔄', color: 'text-violet-500' },
] as const

type OnboardingTranslations = ReturnType<typeof useT>

interface COSApplicationStepProps {
  t: OnboardingTranslations
  procStepData: Record<string, unknown> | undefined
  currentVisa: string | null
  targetVisa: string | null
  i94Date: string
  dependents: Dependent[]
  isReadOnly: boolean
  isFieldRejected: (key: string) => boolean
  setCurrentVisa: (value: string | null) => void
  setTargetVisa: (value: string | null) => void
  setI94Date: (value: string) => void
  addDependent: () => void
  updateDependent: (id: string, field: keyof Dependent, value: string) => void
  removeDependent: (id: string) => void
  onBuyDependentSlot: () => void
  onRefreshSlots: () => void
}

function calculateAge(birthDate: string) {
  if (!birthDate) return 0
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDelta = today.getMonth() - birth.getMonth()
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birth.getDate())
  ) {
    age--
  }
  return age
}

function getMarriageAge(birthDate: string, marriageDate: string) {
  if (!birthDate || !marriageDate) return 0
  const birth = new Date(birthDate)
  const marriage = new Date(marriageDate)
  let age = marriage.getFullYear() - birth.getFullYear()
  const monthDelta = marriage.getMonth() - birth.getMonth()
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && marriage.getDate() < birth.getDate())
  ) {
    age--
  }
  return age
}

export function COSApplicationStep({
  t,
  procStepData,
  currentVisa,
  targetVisa,
  i94Date,
  dependents,
  isReadOnly,
  isFieldRejected,
  setCurrentVisa,
  setTargetVisa,
  setI94Date,
  addDependent,
  updateDependent,
  removeDependent,
  onBuyDependentSlot,
  onRefreshSlots,
}: COSApplicationStepProps) {
  const rawPaidValue = procStepData?.paid_dependents
  const paidDependents = parseInt(String(rawPaidValue ?? 0), 10)
  const hasPaidSlots = paidDependents > 0
  const reachedLimit = dependents.length >= paidDependents

  return (
    <>
      <div className='px-8 py-6 border-b border-slate-100 flex items-center gap-3'>
        <div className='w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary'>
          <span className='text-lg'>🛂</span>
        </div>
        <div>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            {t.cos.form.title}
          </h2>
          <p className='text-sm text-slate-400 font-medium mt-0.5'>
            {t.cos.form.desc}
          </p>
        </div>
      </div>

      <div className='px-8 py-6 space-y-10'>
        <div className='space-y-8'>
          <div>
            <label className='text-sm font-bold text-slate-700 mb-3 flex items-center gap-1'>
              {t.cos.form.currentVisaLabel}{' '}
              <span className='text-red-500'>*</span>
            </label>
            <div className='grid grid-cols-3 gap-3'>
              {CURRENT_VISA_OPTIONS.map((visa) => {
                const isRejected = isFieldRejected('currentVisa')
                return (
                  <button
                    key={visa.label}
                    disabled={isReadOnly}
                    onClick={() => !isReadOnly && setCurrentVisa(visa.label)}
                    className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 px-1 sm:px-4 py-3 sm:py-4 rounded-xl border-2 font-bold text-[12px] sm:text-sm transition-all ${
                      currentVisa === visa.label
                        ? isRejected
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-primary bg-primary/5 text-primary'
                        : isRejected
                          ? 'border-red-100 bg-red-50/30 text-slate-400'
                          : 'border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                    } ${isReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                  >
                    <span className={`hidden sm:inline-block text-xl ${visa.color}`}>
                      {visa.icon}
                    </span>
                    {visa.label}
                    {isRejected && (
                      <RiErrorWarningLine className='ml-auto text-red-500 animate-pulse' />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className='text-sm font-bold text-slate-700 mb-3 flex items-center gap-1'>
              {t.cos.form.targetVisaLabel}{' '}
              <span className='text-red-500'>*</span>
            </label>
            <div className='grid grid-cols-3 gap-3'>
              {TARGET_VISA_OPTIONS.map((visa) => {
                const isRejected = isFieldRejected('targetVisa')
                return (
                  <button
                    key={visa.label}
                    disabled={isReadOnly}
                    onClick={() => !isReadOnly && setTargetVisa(visa.label)}
                    className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 px-1 sm:px-4 py-3 sm:py-4 rounded-xl border-2 font-bold text-[12px] sm:text-sm transition-all ${
                      targetVisa === visa.label
                        ? isRejected
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-primary bg-primary/5 text-primary'
                        : isRejected
                          ? 'border-red-100 bg-red-50/30 text-slate-400'
                          : 'border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                    } ${isReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                  >
                    <span className={`hidden sm:inline-block text-xl ${visa.color}`}>
                      {visa.icon}
                    </span>
                    {visa.label}
                    {isRejected && (
                      <RiErrorWarningLine className='ml-auto text-red-500 animate-pulse' />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className='text-sm font-bold text-slate-700 mb-2 flex items-center gap-1'>
              {t.cos.form.i94DateLabel} <span className='text-red-500'>*</span>
            </label>
            <DatePicker
              value={i94Date}
              onChange={setI94Date}
              disabled={isReadOnly}
              placeholder={t.cos.form.i94DateLabel}
              className='w-full sm:w-64'
              buttonClassName={`disabled:text-slate-500 ${
                isFieldRejected('i94Date')
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-700 disabled:bg-slate-50'
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
                  <button className='text-xs text-slate-500 font-bold hover:text-primary transition-colors flex items-center gap-1'>
                    <RiInformationLine className='text-sm' />
                    {t.cos.form.i94TutorialLink}
                  </button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl bg-white p-0 overflow-hidden border-none rounded-3xl shadow-2xl'>
                  <DialogHeader className='p-8 bg-slate-900 border-b border-slate-800'>
                    <DialogTitle className='text-xl font-black text-white tracking-tight flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white'>
                        <RiInformationLine className='text-2xl' />
                      </div>
                      {t.cos.form.i94Tutorial.title}
                    </DialogTitle>
                  </DialogHeader>

                  <div className='p-8 space-y-12 max-h-[70vh] overflow-y-auto custom-scrollbar'>
                    {[
                      {
                        number: 1,
                        title: t.cos.form.i94Tutorial.step1,
                        subtitle: t.cos.form.i94Tutorial.step1Sub,
                        image: imgTutor1,
                        alt: 'Accept Terms',
                      },
                      {
                        number: 2,
                        title: t.cos.form.i94Tutorial.step2,
                        subtitle: t.cos.form.i94Tutorial.step2Sub,
                        image: imgTutor2,
                        alt: 'Upload/Camera Document',
                      },
                      {
                        number: 3,
                        title: t.cos.form.i94Tutorial.step3,
                        subtitle: t.cos.form.i94Tutorial.step3Sub,
                        image: imgTutor3,
                        alt: 'Fill in fields',
                      },
                    ].map((tutorialStep) => (
                      <div key={tutorialStep.number} className='flex gap-6'>
                        <div className='flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-black text-slate-900'>
                          {tutorialStep.number}
                        </div>
                        <div className='flex-1 space-y-4'>
                          <p className='text-base font-black text-slate-800 tracking-tight leading-relaxed'>
                            {tutorialStep.title}
                            <span className='block text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest'>
                              {tutorialStep.subtitle}
                            </span>
                          </p>
                          <div className='rounded-2xl overflow-hidden border border-slate-100 shadow-sm'>
                            <img
                              src={tutorialStep.image}
                              alt={tutorialStep.alt}
                              className='w-full h-auto'
                            />
                          </div>
                        </div>
                      </div>
                    ))}

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

          <div className='pt-4'>
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-base font-black text-slate-800 flex items-center gap-2'>
                    {t.cos.form.dependents.title}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        hasPaidSlots
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {dependents.length} / {paidDependents}{' '}
                      {t.cos.form.dependents.slots}
                    </span>
                  </h3>
                  <p className='text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5'>
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
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                    }`}
                  >
                    <RiAddLine className='text-base' />
                    {reachedLimit
                      ? t.cos.form.dependents.limitReached
                      : t.cos.form.dependents.addBtn}
                  </button>
                )}
              </div>

              {reachedLimit && !isReadOnly && (
                <div className='p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left'>
                  <div className='flex flex-col sm:flex-row items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                      <RiAddLine className='text-xl' />
                    </div>
                    <div>
                      <p className='text-xs font-black text-slate-800 uppercase tracking-tight'>
                        {t.cos.form.dependents.needMoreSlots}
                      </p>
                      <p className='text-[11px] text-slate-500 font-medium leading-tight'>
                        {t.cos.form.dependents.addFamilyPrompt}
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col sm:flex-row items-center gap-2'>
                    <button
                      onClick={onBuyDependentSlot}
                      className='w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1649c0] transition-all shadow-lg shadow-primary/20'
                    >
                      {t.cos.form.dependents.buySlot}
                    </button>
                    <button
                      onClick={onRefreshSlots}
                      className='w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all'
                    >
                      🔄 Atualizar Slots
                    </button>
                  </div>
                </div>
              )}
            </div>

            {dependents.length === 0 && (
              <div className='text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl'>
                <p className='text-xs text-slate-300 font-bold uppercase tracking-widest leading-loose'>
                  {t.cos.form.dependents.noDependents}
                </p>
              </div>
            )}

            <div className='space-y-6'>
              {dependents.map((dependent) => {
                const age = calculateAge(dependent.birthDate)
                const isNear21 =
                  dependent.relation === 'child' && age >= 20
                const marriageAge = getMarriageAge(
                  dependent.birthDate,
                  dependent.marriageDate,
                )
                const marriageWarning =
                  dependent.relation === 'spouse' && marriageAge >= 18

                return (
                  <div
                    key={dependent.id}
                    className='relative p-7 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm'
                  >
                    {!isReadOnly && (
                      <button
                        onClick={() => removeDependent(dependent.id)}
                        className='absolute top-4 right-4 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all'
                      >
                        <RiDeleteBinLine className='text-lg' />
                      </button>
                    )}

                    <div className='grid grid-cols-2 gap-x-6 gap-y-5'>
                      <div className='col-span-2 sm:col-span-1'>
                        <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                          {t.cos.form.dependents.fullName}
                        </label>
                        <input
                          value={dependent.name}
                          disabled={isReadOnly}
                          onChange={(event) =>
                            updateDependent(
                              dependent.id,
                              'name',
                              event.target.value,
                            )
                          }
                          placeholder={t.cos.form.dependents.passportPlaceholder}
                          className='w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-slate-50 disabled:text-slate-500'
                        />
                      </div>

                      <div className='col-span-2 sm:col-span-1'>
                        <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                          {t.cos.form.dependents.relationship}
                        </label>
                        <select
                          value={dependent.relation}
                          disabled={isReadOnly}
                          onChange={(event) =>
                            updateDependent(
                              dependent.id,
                              'relation',
                              event.target.value,
                            )
                          }
                          className='w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-default'
                        >
                          <option value=''>{t.cos.form.dependents.select}</option>
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
                        <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                          {t.cos.form.dependents.dob}
                        </label>
                        <input
                          type='date'
                          value={dependent.birthDate}
                          disabled={isReadOnly}
                          onChange={(event) =>
                            updateDependent(
                              dependent.id,
                              'birthDate',
                              event.target.value,
                            )
                          }
                          className='w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-slate-50 disabled:text-slate-500'
                        />
                      </div>

                      <div>
                        <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                          {t.cos.form.dependents.i94Exp}
                        </label>
                        <input
                          type='date'
                          value={dependent.i94Date}
                          disabled={isReadOnly}
                          onChange={(event) =>
                            updateDependent(
                              dependent.id,
                              'i94Date',
                              event.target.value,
                            )
                          }
                          className='w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-slate-50 disabled:text-slate-500'
                        />
                      </div>

                      {dependent.relation === 'spouse' && (
                        <div className='col-span-2'>
                          <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-primary'>
                            {t.cos.form.dependents.marriageDate}
                          </label>
                          <input
                            type='date'
                            value={dependent.marriageDate}
                            disabled={isReadOnly}
                            onChange={(event) =>
                              updateDependent(
                                dependent.id,
                                'marriageDate',
                                event.target.value,
                              )
                            }
                            className='w-full bg-white border border-primary/20 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-slate-50 disabled:text-slate-500'
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
      </div>
    </>
  )
}
