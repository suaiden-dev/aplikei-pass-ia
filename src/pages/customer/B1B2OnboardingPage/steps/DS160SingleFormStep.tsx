import { useFormikContext, Field, ErrorMessage } from "formik";
import type { DS160FormValues } from "../../../../schemas/ds160.schema";
import { useT } from "../../../../i18n/LanguageContext";

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldError = ({ name }: { name: string }) => (
  <ErrorMessage name={name}>
    {(msg) => (
      <p className="mt-1.5 text-[11px] font-semibold text-red-500 flex items-center gap-1">
        <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
        {msg}
      </p>
    )}
  </ErrorMessage>
);

const FormInput = ({
  name,
  label,
  type = "text",
  placeholder = "",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) => {
  const { errors, touched } = useFormikContext<any>();
  const hasError = !!(errors[name] && touched[name]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all outline-none focus:ring-2 focus:ring-primary/20 ${
          hasError
            ? "border-red-300 bg-red-50/50 focus:border-red-400"
            : "border-slate-200 bg-white focus:border-primary"
        }`}
      />
      <FieldError name={name} />
    </div>
  );
};

const FormTextarea = ({
  name,
  label,
  placeholder = "",
  required = false,
  rows = 3,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) => {
  const { errors, touched } = useFormikContext<any>();
  const hasError = !!(errors[name] && touched[name]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <Field
        as="textarea"
        id={name}
        name={name}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all outline-none focus:ring-2 focus:ring-primary/20 resize-none ${
          hasError
            ? "border-red-300 bg-red-50/50 focus:border-red-400"
            : "border-slate-200 bg-white focus:border-primary"
        }`}
      />
      <FieldError name={name} />
    </div>
  );
};

const FormSelect = ({
  name,
  label,
  options,
  required = false,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  const { errors, touched } = useFormikContext<any>();
  const hasError = !!(errors[name] && touched[name]);
  const t = useT("visas");

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <Field
        as="select"
        id={name}
        name={name}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-slate-800 transition-all outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")] bg-[length:18px] bg-no-repeat bg-[right_12px_center] pr-10 ${
          hasError
            ? "border-red-300 bg-red-50/50 focus:border-red-400"
            : "border-slate-200 bg-white focus:border-primary"
        }`}
      >
        <option value="">{t.onboardingPage.form.selectPlaceholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Field>
      <FieldError name={name} />
    </div>
  );
};

const YesNo = ({
  name,
  label,
  required = false,
}: {
  name: string;
  label: string;
  required?: boolean;
}) => {
  const { errors, touched } = useFormikContext<any>();
  const hasError = !!(errors[name] && touched[name]);
  const t = useT("visas");

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-primary">*</span>}
      </p>
      <div role="group" className="flex gap-3">
        <label className="flex-1 cursor-pointer">
          <Field type="radio" name={name} value="sim" className="sr-only peer" />
          <span className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary border-slate-200 text-slate-500 hover:border-slate-300">
            <span className="w-2 h-2 rounded-full border border-current" />
            {t.onboardingPage.form.yes}
          </span>
        </label>
        <label className="flex-1 cursor-pointer">
          <Field type="radio" name={name} value="nao" className="sr-only peer" />
          <span className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all peer-checked:border-slate-800 peer-checked:bg-slate-50 peer-checked:text-slate-800 border-slate-200 text-slate-500 hover:border-slate-300">
            <span className="w-2 h-2 rounded-full border border-current" />
            {t.onboardingPage.form.no}
          </span>
        </label>
      </div>
      {hasError && <FieldError name={name} />}
    </div>
  );
};

// Generic radio group for any set of options
const RadioGroup = ({
  name,
  label,
  options,
  required = false,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  const { errors, touched } = useFormikContext<any>();
  const hasError = !!(errors[name] && touched[name]);

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          {label} {required && <span className="text-primary">*</span>}
        </p>
      )}
      <div role="group" className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label key={opt.value} className="flex-1 min-w-[100px] cursor-pointer">
            <Field type="radio" name={name} value={opt.value} className="sr-only peer" />
            <span className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary border-slate-200 text-slate-500 hover:border-slate-300">
              <span className="w-2 h-2 rounded-full border border-current" />
              {opt.label}
            </span>
          </label>
        ))}
      </div>
      {hasError && <FieldError name={name} />}
    </div>
  );
};

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="relative">
    <div className="mb-6">
      <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 font-medium mt-1">{subtitle}</p>}
    </div>
    <div className="space-y-5">{children}</div>
  </div>
);

const Divider = () => <div className="border-t border-slate-100 my-8" />;

// ─── Main Component ───────────────────────────────────────────────────────────

export const DS160SingleFormStep = () => {
  const { values } = useFormikContext<DS160FormValues>();
  const t = useT("visas");

  return (
    <div className="space-y-8">

      {/* ── 1. Entrevista ── */}
      <Section title={t.onboardingPage.form.interviewLocationTitle} subtitle={t.onboardingPage.form.interviewLocationSubtitle}>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {t.onboardingPage.form.interviewLocationLabel} <span className="text-primary">*</span>
          </p>
          <div role="group" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {["Brasilia", "Rio de Janeiro", "São Paulo", "Recife", "Porto Alegre"].map((city) => (
              <label key={city} className="cursor-pointer">
                <Field type="radio" name="interviewLocation" value={city} className="sr-only peer" />
                <span className="flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold text-center transition-all peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary border-slate-200 text-slate-500 hover:border-slate-300 h-full">
                  {city}
                </span>
              </label>
            ))}
          </div>
          <FieldError name="interviewLocation" />
        </div>

        <YesNo name="isBrazilian" label={t.onboardingPage.form.isBrazilian} required />
      </Section>

      <Divider />

      {/* ── 2. Dados Pessoais ── */}
      <Section title={t.onboardingPage.form.personalInfoTitle} subtitle={t.onboardingPage.form.personalInfoSubtitle}>
        <FormInput name="fullName" label={t.onboardingPage.form.fullNameLabel} placeholder="EX: JOAO DA SILVA" required />

        <YesNo name="hasOtherNames" label={t.onboardingPage.form.hasOtherNames} required />
        {values.hasOtherNames === "sim" && (
          <FormInput name="otherNames" label={t.onboardingPage.form.whatName} required />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <RadioGroup
            name="gender"
            label={t.onboardingPage.form.genderLabel}
            required
            options={[
              { value: "masculino", label: t.onboardingPage.form.genderMale },
              { value: "feminino", label: t.onboardingPage.form.genderFemale },
            ]}
          />
          <FormSelect
            name="maritalStatus"
            label={t.onboardingPage.form.maritalStatusLabel}
            required
            options={[
              { value: "solteiro", label: t.onboardingPage.form.maritalSingle },
              { value: "casado", label: t.onboardingPage.form.maritalMarried },
              { value: "divorciado", label: t.onboardingPage.form.maritalDivorced },
              { value: "viuvo", label: t.onboardingPage.form.maritalWidowed },
              { value: "uniao_estavel", label: t.onboardingPage.form.maritalCommonLaw },
              { value: "separado", label: t.onboardingPage.form.maritalSeparated },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FormInput name="birthDate" label={t.onboardingPage.form.birthDateLabel} type="date" required />
          <FormInput name="birthCity" label={t.onboardingPage.form.birthCityLabel} placeholder={t.onboardingPage.form.birthCityPlaceholder} required />
          <FormInput name="birthState" label={t.onboardingPage.form.birthStateLabel} placeholder={t.onboardingPage.form.birthStatePlaceholder} required />
          <FormInput name="birthCountry" label={t.onboardingPage.form.birthCountryLabel} placeholder={t.onboardingPage.form.birthCountryPlaceholder} required />
        </div>
      </Section>

      <Divider />

      {/* ── 3. Nacionalidade ── */}
      <Section title={t.onboardingPage.form.nationalityIdentificationTitle}>
        <YesNo name="hasOtherNationality" label={t.onboardingPage.form.hasOtherNationality} required />
        {values.hasOtherNationality === "sim" && (
          <FormInput name="otherNationalityDetails" label={t.onboardingPage.form.otherNationalityDetailsLabel} placeholder={t.onboardingPage.form.otherNationalityDetailsPlaceholder} />
        )}

        <YesNo name="hasOtherResidence" label={t.onboardingPage.form.hasOtherResidence} required />
        {values.hasOtherResidence === "sim" && (
          <FormInput name="otherResidenceCountry" label={t.onboardingPage.form.whatCountry} required />
        )}

        <div className="max-w-xs">
          <FormInput name="cpf" label={t.onboardingPage.form.cpfLabel} placeholder={t.onboardingPage.form.cpfPlaceholder} required />
        </div>
      </Section>

      <Divider />

      {/* ── 4. Passaporte ── */}
      <Section title={t.onboardingPage.form.passportDataTitle}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormInput name="passportNumber" label={t.onboardingPage.form.passportNumberLabel} required />
          <FormInput name="passportIssueDate" label={t.onboardingPage.form.passportIssueDateLabel} type="date" required />
          <FormInput name="passportExpDate" label={t.onboardingPage.form.passportExpDateLabel} type="date" required />
        </div>

        <YesNo name="lostPassport" label={t.onboardingPage.form.lostPassport} required />
        {values.lostPassport === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <FormInput name="lostPassportNumber" label={t.onboardingPage.form.lostPassportNumberLabel} required />
            <FormInput name="lostPassportExpanation" label={t.onboardingPage.form.briefExplanationLabel} placeholder={t.onboardingPage.form.briefExplanationPlaceholder} required />
          </div>
        )}
      </Section>

      <Divider />

      {/* ── 5. Viagem ── */}
      <Section title={t.onboardingPage.form.travelDetailsTitle}>
        <FormSelect
          name="travelPurpose"
          label={t.onboardingPage.form.travelPurposeLabel}
          required
          options={[
            { value: "b2", label: t.onboardingPage.form.purposeTourism },
            { value: "b1", label: t.onboardingPage.form.purposeBusiness },
            { value: "b1b2", label: t.onboardingPage.form.purposeBoth },
            { value: "medico", label: t.onboardingPage.form.purposeMedical },
          ]}
        />

        <YesNo name="specificTravelPlan" label={t.onboardingPage.form.specificTravelPlan} required />

        {values.specificTravelPlan === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="arrivalDate" label={t.onboardingPage.form.arrivalDateLabel} type="date" required />
            <FormInput name="arrivalFlight" label={t.onboardingPage.form.arrivalFlightLabel} placeholder={t.onboardingPage.form.arrivalFlightPlaceholder} />
            <FormInput name="arrivalCity" label={t.onboardingPage.form.arrivalCityLabel} required />
            <FormInput name="placesToVisit" label={t.onboardingPage.form.placesToVisitLabel} placeholder={t.onboardingPage.form.placesToVisitPlaceholder} />
            <FormInput name="departureDate" label={t.onboardingPage.form.departureDateLabel} type="date" />
            <FormInput name="departureFlight" label={t.onboardingPage.form.departureFlightLabel} />
            <FormInput name="departureCity" label={t.onboardingPage.form.departureCityLabel} />
          </div>
        )}

        {values.specificTravelPlan === "nao" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="estArrivalDate" label={t.onboardingPage.form.estArrivalDateLabel} type="date" required />
            <FormInput name="estStayLength" label={t.onboardingPage.form.estStayLengthLabel} placeholder={t.onboardingPage.form.estStayLengthPlaceholder} />
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">{t.onboardingPage.form.usStayAddressLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="sm:col-span-2">
              <FormInput name="usStayName" label={t.onboardingPage.form.usStayNameLabel} placeholder={t.onboardingPage.form.usStayNamePlaceholder} required />
            </div>
            <div className="sm:col-span-2">
              <FormInput name="usStayStreet" label={t.onboardingPage.form.streetNumberLabel} required />
            </div>
            <FormInput name="usStayCity" label={t.onboardingPage.form.cityLabel} required />
            <FormInput name="usStayState" label={t.onboardingPage.form.stateLabelShort} placeholder={t.onboardingPage.form.statePlaceholderShort} required />
            <FormInput name="usStayZip" label={t.onboardingPage.form.zipCodeLabel} placeholder={t.onboardingPage.form.zipCodePlaceholder} />
          </div>
        </div>

        <FormSelect
          name="payingTrip"
          label={t.onboardingPage.form.payingTripLabel}
          required
          options={[
            { value: "eu", label: t.onboardingPage.form.payingMe },
            { value: "outra_pessoa", label: t.onboardingPage.form.payingOther },
            { value: "empresa", label: t.onboardingPage.form.payingCompany },
          ]}
        />

        {values.payingTrip && values.payingTrip !== "eu" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="payerName" label={t.onboardingPage.form.payerNameLabel} required />
            <FormInput name="payerRelation" label={t.onboardingPage.form.payerRelationLabel} placeholder={t.onboardingPage.form.payerRelationPlaceholder} required />
            <FormInput name="payerPhone" label={t.onboardingPage.form.phoneLabel} />
            <FormInput name="payerEmail" label={t.onboardingPage.form.emailLabel} type="email" />
          </div>
        )}
      </Section>

      <Divider />

      {/* ── 6. Acompanhantes ── */}
      <Section title={t.onboardingPage.form.companionsTitle}>
        <YesNo name="travelingWithOthers" label={t.onboardingPage.form.travelingWithOthers} required />

        {values.travelingWithOthers === "sim" && (
          <div className="space-y-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <YesNo name="travelGroup" label={t.onboardingPage.form.travelGroup} />
            <FormTextarea
              name="companionsDetails"
              label={t.onboardingPage.form.companionsDetailsLabel}
              placeholder={t.onboardingPage.form.companionsDetailsPlaceholder}
              rows={3}
            />
          </div>
        )}
      </Section>

      <Divider />

      {/* ── 7. Viagens Anteriores ── */}
      <Section title={t.onboardingPage.form.previousTravelTitle}>
        <YesNo name="beenToUS" label={t.onboardingPage.form.beenToUS} required />
        {values.beenToUS === "sim" && (
          <div className="space-y-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormTextarea
              name="previousVisitsDetails"
              label={t.onboardingPage.form.previousVisitsDetailsLabel}
              placeholder={t.onboardingPage.form.previousVisitsDetailsPlaceholder}
              required
            />
            <YesNo name="hadUSDriverLicense" label={t.onboardingPage.form.hadUSDriverLicense} />
          </div>
        )}

        <YesNo name="hadUSVisa" label={t.onboardingPage.form.hadUSVisa} required />
        {values.hadUSVisa === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="lastVisaDate" label={t.onboardingPage.form.lastVisaDateLabel} type="date" required />
            <FormInput name="lastVisaNumber" label={t.onboardingPage.form.lastVisaNumberLabel} placeholder={t.onboardingPage.form.lastVisaNumberPlaceholder} />
            <FormSelect name="sameVisaType" label={t.onboardingPage.form.sameVisaType} options={[{value:"sim",label:t.onboardingPage.form.yes},{value:"nao",label:t.onboardingPage.form.no}]} />
            <FormSelect name="sameVisaCountry" label={t.onboardingPage.form.sameVisaCountry} options={[{value:"sim",label:t.onboardingPage.form.yes},{value:"nao",label:t.onboardingPage.form.no}]} />
            <FormSelect name="tenPrinted" label={t.onboardingPage.form.tenPrinted} options={[{value:"sim",label:t.onboardingPage.form.yes},{value:"nao",label:t.onboardingPage.form.no}]} />
            <FormSelect name="visaLost" label={t.onboardingPage.form.visaLost} options={[{value:"sim",label:t.onboardingPage.form.yes},{value:"nao",label:t.onboardingPage.form.no}]} />
            <FormSelect name="visaCancelled" label={t.onboardingPage.form.visaCancelled} options={[{value:"sim",label:t.onboardingPage.form.yes},{value:"nao",label:t.onboardingPage.form.no}]} />
          </div>
        )}

        <YesNo name="refusedUSVisa" label={t.onboardingPage.form.refusedUSVisa} required />
        {values.refusedUSVisa === "sim" && (
          <FormTextarea name="refusedExpanation" label={t.onboardingPage.form.explainDetailLabel} required />
        )}

        <YesNo name="immigrationPetition" label={t.onboardingPage.form.immigrationPetition} required />
        {values.immigrationPetition === "sim" && (
          <FormInput name="petitionExpanation" label={t.onboardingPage.form.explainLabel} required />
        )}
      </Section>

      <Divider />

      {/* ── 8. Contato ── */}
      <Section title={t.onboardingPage.form.contactAddressTitle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <FormInput name="homeStreet" label={t.onboardingPage.form.homeStreetLabel} required />
          </div>
          <FormInput name="homeCity" label={t.onboardingPage.form.cityLabel} required />
          <FormInput name="homeState" label={t.onboardingPage.form.stateProvinceLabel} required />
          <FormInput name="homeZip" label={t.onboardingPage.form.zipCodeLabel} required />
          <FormInput name="homeCountry" label={t.onboardingPage.form.countryLabel} required />
        </div>

        <YesNo name="differentMailingAddress" label={t.onboardingPage.form.differentMailingAddress} required />
        {values.differentMailingAddress === "sim" && (
          <FormTextarea name="mailingAddressFull" label={t.onboardingPage.form.mailingAddressFullLabel} />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormInput name="primaryPhone" label={t.onboardingPage.form.primaryPhoneLabel} placeholder={t.onboardingPage.form.phonePlaceholder} required />
          <FormInput name="secondaryPhone" label={t.onboardingPage.form.secondaryPhoneLabel} />
          <FormInput name="cellPhone" label={t.onboardingPage.form.cellPhoneLabel} />
        </div>

        <YesNo name="otherPhones5Y" label={t.onboardingPage.form.otherPhones5Y} required />
        {values.otherPhones5Y === "sim" && (
          <FormInput name="otherPhonesList" label={t.onboardingPage.form.otherPhonesListLabel} />
        )}

        <div className="max-w-sm">
          <FormInput name="primaryEmail" label={t.onboardingPage.form.primaryEmailLabel} type="email" required />
        </div>

        <YesNo name="otherEmails5Y" label={t.onboardingPage.form.otherEmails5Y} required />
        {values.otherEmails5Y === "sim" && (
          <FormInput name="otherEmailList" label={t.onboardingPage.form.otherEmailListLabel} />
        )}

        <FormTextarea
          name="socialMediaAccounts"
          label={t.onboardingPage.form.socialMediaAccountsLabel}
          placeholder={t.onboardingPage.form.socialMediaAccountsPlaceholder}
          required
          rows={3}
        />
      </Section>

      <Divider />

      {/* ── 9. Família ── */}
      <Section title={t.onboardingPage.form.familyInfoTitle}>
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.onboardingPage.form.fatherLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="fatherName" label={t.onboardingPage.form.fatherNameLabel} />
            <FormInput name="fatherBirth" label={t.onboardingPage.form.birthDateLabel} type="date" />
            <div className="sm:col-span-2">
              <YesNo name="fatherInUS" label={t.onboardingPage.form.fatherInUS} />
            </div>
            {values.fatherInUS === "sim" && (
              <div className="sm:col-span-2">
                <FormInput name="fatherUSStatus" label={t.onboardingPage.form.fatherUSStatusLabel} placeholder={t.onboardingPage.form.usStatusPlaceholder} />
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.onboardingPage.form.motherLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="motherName" label={t.onboardingPage.form.motherNameLabel} />
            <FormInput name="motherBirth" label={t.onboardingPage.form.birthDateLabel} type="date" />
            <div className="sm:col-span-2">
              <YesNo name="motherInUS" label={t.onboardingPage.form.motherInUS} />
            </div>
            {values.motherInUS === "sim" && (
              <div className="sm:col-span-2">
                <FormInput name="motherUSStatus" label={t.onboardingPage.form.motherUSStatusLabel} placeholder={t.onboardingPage.form.usStatusPlaceholder} />
              </div>
            )}
          </div>
        </div>

        <YesNo name="otherRelInUS" label={t.onboardingPage.form.otherRelInUS} />

        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.onboardingPage.form.spouseLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="spouseName" label={t.onboardingPage.form.fullNameLabel} />
            <FormInput name="spouseBirth" label={t.onboardingPage.form.birthDateLabel} type="date" />
            <FormInput name="spouseCity" label={t.onboardingPage.form.birthCityLabel} />
            <FormInput name="spouseCountry" label={t.onboardingPage.form.birthCountryLabel} />
            <div className="sm:col-span-2">
              <YesNo name="spouseSameAddress" label={t.onboardingPage.form.spouseSameAddress} />
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── 10. Trabalho e Educação ── */}
      <Section title={t.onboardingPage.form.workEducationTitle}>
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.onboardingPage.form.currentJobLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="primaryJobSector" label={t.onboardingPage.form.jobSectorLabel} placeholder={t.onboardingPage.form.jobSectorPlaceholder} required />
            <FormInput name="primaryJobEntity" label={t.onboardingPage.form.jobEntityLabel} required />
            <div className="sm:col-span-2">
              <FormInput name="primaryJobAddress" label={t.onboardingPage.form.fullAddressLabel} />
            </div>
            <FormInput name="primaryJobPhone" label={t.onboardingPage.form.phoneLabel} />
            <FormInput name="primaryJobSalary" label={t.onboardingPage.form.monthlySalaryLabel} placeholder={t.onboardingPage.form.monthlySalaryPlaceholder} />
            <div className="sm:col-span-2">
              <FormTextarea name="primaryJobDuties" label={t.onboardingPage.form.jobDutiesLabel} rows={2} />
            </div>
          </div>
        </div>

        <YesNo name="employedLast5Y" label={t.onboardingPage.form.employedLast5Y} required />
        {values.employedLast5Y === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="prevEmployerName" label={t.onboardingPage.form.prevEmployerNameLabel} required />
            <FormInput name="prevEmployerTitle" label={t.onboardingPage.form.prevEmployerTitleLabel} />
            <FormInput name="prevEmployerStart" label={t.onboardingPage.form.startDateLabel} type="date" />
            <FormInput name="prevEmployerEnd" label={t.onboardingPage.form.endDateLabel} type="date" />
            <div className="sm:col-span-2">
              <FormInput name="prevEmployerDuties" label={t.onboardingPage.form.jobDutiesLabel} />
            </div>
          </div>
        )}

        <YesNo name="higherEducation" label={t.onboardingPage.form.higherEducation} required />
        {values.higherEducation === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="sm:col-span-2">
              <FormInput name="eduName" label={t.onboardingPage.form.eduNameLabel} required />
            </div>
            <div className="sm:col-span-2">
              <FormInput name="eduCourse" label={t.onboardingPage.form.eduCourseLabel} />
            </div>
            <FormInput name="eduStart" label={t.onboardingPage.form.startDateLabel} type="date" />
            <FormInput name="eduEnd" label={t.onboardingPage.form.endDateLabel} type="date" />
          </div>
        )}

        <YesNo name="belongsToTribe" label={t.onboardingPage.form.belongsToTribe} required />
        <FormInput name="fluentLanguages" label={t.onboardingPage.form.fluentLanguagesLabel} placeholder={t.onboardingPage.form.fluentLanguagesPlaceholder} required />
        <FormTextarea name="countriesVisited5Y" label={t.onboardingPage.form.countriesVisited5YLabel} placeholder={t.onboardingPage.form.countriesVisited5YPlaceholder} rows={2} />

        <YesNo name="servedMilitary" label={t.onboardingPage.form.servedMilitary} required />
        {values.servedMilitary === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="militaryBranch" label={t.onboardingPage.form.militaryBranchLabel} placeholder={t.onboardingPage.form.militaryBranchPlaceholder} />
            <FormInput name="militarySpecialty" label={t.onboardingPage.form.militarySpecialtyLabel} />
          </div>
        )}
      </Section>

      <Divider />

      {/* ── 11. Segurança ── */}
      <Section
        title={t.onboardingPage.form.securityQuestionsTitle}
        subtitle={t.onboardingPage.form.securityQuestionsSubtitle}
      >
        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-4">
          <p className="text-sm font-medium text-amber-800 leading-relaxed">
            {t.onboardingPage.form.securityExceptionsPrompt}
          </p>
          <YesNo name="securityExceptions" label="" />
          {values.securityExceptions === "sim" && (
            <FormInput
              name="securityExceptionsDetails"
              label={t.onboardingPage.form.securityExceptionsLabel}
              placeholder={t.onboardingPage.form.securityExceptionsPlaceholder}
              required
            />
          )}
        </div>
      </Section>

    </div>
  );
};
