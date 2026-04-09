import { useFormikContext, Field, ErrorMessage } from "formik";
import type { DS160FormValues } from "../../../../schemas/ds160.schema";

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
        <option value="">Selecione...</option>
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
            Sim
          </span>
        </label>
        <label className="flex-1 cursor-pointer">
          <Field type="radio" name={name} value="nao" className="sr-only peer" />
          <span className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all peer-checked:border-slate-800 peer-checked:bg-slate-50 peer-checked:text-slate-800 border-slate-200 text-slate-500 hover:border-slate-300">
            <span className="w-2 h-2 rounded-full border border-current" />
            Não
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

  return (
    <div className="space-y-8">

      {/* ── 1. Entrevista ── */}
      <Section title="Local da Entrevista" subtitle="Selecione onde fará a entrevista consular">
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Local da Entrevista <span className="text-primary">*</span>
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

        <YesNo name="isBrazilian" label="Você é Brasileiro(a)?" required />
      </Section>

      <Divider />

      {/* ── 2. Dados Pessoais ── */}
      <Section title="Informações Pessoais" subtitle="Conforme consta no seu passaporte">
        <FormInput name="fullName" label="Nome Completo (Conforme Passaporte)" placeholder="EX: JOAO DA SILVA" required />

        <YesNo name="hasOtherNames" label="Possui outro nome (solteira, artístico, religioso)?" required />
        {values.hasOtherNames === "sim" && (
          <FormInput name="otherNames" label="Qual nome?" required />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <RadioGroup
            name="gender"
            label="Sexo"
            required
            options={[
              { value: "masculino", label: "Masculino" },
              { value: "feminino", label: "Feminino" },
            ]}
          />
          <FormSelect
            name="maritalStatus"
            label="Estado Civil"
            required
            options={[
              { value: "solteiro", label: "Solteiro(a)" },
              { value: "casado", label: "Casado(a)" },
              { value: "divorciado", label: "Divorciado(a)" },
              { value: "viuvo", label: "Viúvo(a)" },
              { value: "uniao_estavel", label: "União Estável" },
              { value: "separado", label: "Separado(a) Judicialmente" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FormInput name="birthDate" label="Data de Nascimento" type="date" required />
          <FormInput name="birthCity" label="Cidade" placeholder="Cidade de nascimento" required />
          <FormInput name="birthState" label="Estado" placeholder="Estado de nascimento" required />
          <FormInput name="birthCountry" label="País" placeholder="País de nascimento" required />
        </div>
      </Section>

      <Divider />

      {/* ── 3. Nacionalidade ── */}
      <Section title="Nacionalidade e Identificação">
        <YesNo name="hasOtherNationality" label="Tem ou já teve outra nacionalidade?" required />
        {values.hasOtherNationality === "sim" && (
          <FormInput name="otherNationalityDetails" label="País e número do passaporte (se tiver)" placeholder="Ex: Portugal — Passaporte AB123456" />
        )}

        <YesNo name="hasOtherResidence" label="É residente permanente em outro país além do de origem?" required />
        {values.hasOtherResidence === "sim" && (
          <FormInput name="otherResidenceCountry" label="Qual país?" required />
        )}

        <div className="max-w-xs">
          <FormInput name="cpf" label="CPF" placeholder="Apenas números" required />
        </div>
      </Section>

      <Divider />

      {/* ── 4. Passaporte ── */}
      <Section title="Dados do Passaporte">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormInput name="passportNumber" label="Nº do Passaporte" required />
          <FormInput name="passportIssueDate" label="Data de Emissão" type="date" required />
          <FormInput name="passportExpDate" label="Data de Vencimento" type="date" required />
        </div>

        <YesNo name="lostPassport" label="Já perdeu ou teve passaporte roubado?" required />
        {values.lostPassport === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <FormInput name="lostPassportNumber" label="Número do passaporte perdido" required />
            <FormInput name="lostPassportExpanation" label="Explique brevemente" placeholder="Ex: Furtado em viagem" required />
          </div>
        )}
      </Section>

      <Divider />

      {/* ── 5. Viagem ── */}
      <Section title="Detalhes da Viagem">
        <FormSelect
          name="travelPurpose"
          label="Finalidade da viagem para os EUA"
          required
          options={[
            { value: "b2", label: "Turismo / Férias (B2)" },
            { value: "b1", label: "Negócios (B1)" },
            { value: "b1b2", label: "Turismo e Negócios (B1/B2)" },
            { value: "medico", label: "Tratamento Médico (B2)" },
          ]}
        />

        <YesNo name="specificTravelPlan" label="Já tem um plano de viagem específico?" required />

        {values.specificTravelPlan === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="arrivalDate" label="Data de Chegada" type="date" required />
            <FormInput name="arrivalFlight" label="Voo de Chegada (opcional)" placeholder="Ex: LA 8015" />
            <FormInput name="arrivalCity" label="Cidade de Chegada" required />
            <FormInput name="placesToVisit" label="Locais que irá visitar" placeholder="Ex: Nova York, Miami" />
            <FormInput name="departureDate" label="Data de Partida" type="date" />
            <FormInput name="departureFlight" label="Voo de Partida (opcional)" />
            <FormInput name="departureCity" label="Cidade de Partida" />
          </div>
        )}

        {values.specificTravelPlan === "nao" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="estArrivalDate" label="Data Estimada da Viagem" type="date" required />
            <FormInput name="estStayLength" label="Tempo que pretende ficar" placeholder="Ex: 15 dias" />
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Endereço de hospedagem nos EUA</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="sm:col-span-2">
              <FormInput name="usStayName" label="Nome do hotel ou anfitrião" placeholder="Ex: Hotel Marriott / Nome do parente" required />
            </div>
            <div className="sm:col-span-2">
              <FormInput name="usStayStreet" label="Rua e Número" required />
            </div>
            <FormInput name="usStayCity" label="Cidade" required />
            <FormInput name="usStayState" label="Estado (sigla)" placeholder="Ex: NY, FL" required />
            <FormInput name="usStayZip" label="ZIP Code" placeholder="Ex: 10001" />
          </div>
        </div>

        <FormSelect
          name="payingTrip"
          label="Quem vai pagar pela viagem?"
          required
          options={[
            { value: "eu", label: "Eu Mesmo" },
            { value: "outra_pessoa", label: "Outra Pessoa / Parente" },
            { value: "empresa", label: "Empresa / Empregador" },
          ]}
        />

        {values.payingTrip && values.payingTrip !== "eu" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="payerName" label="Nome Completo do Pagador/Empresa" required />
            <FormInput name="payerRelation" label="Relação com você" placeholder="Pai, Mãe, Chefe, etc." required />
            <FormInput name="payerPhone" label="Telefone" />
            <FormInput name="payerEmail" label="E-mail" type="email" />
          </div>
        )}
      </Section>

      <Divider />

      {/* ── 6. Acompanhantes ── */}
      <Section title="Acompanhantes de Viagem">
        <YesNo name="travelingWithOthers" label="Mais alguém viajará com você?" required />

        {values.travelingWithOthers === "sim" && (
          <div className="space-y-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <YesNo name="travelGroup" label="Viajam como parte de um grupo ou organização?" />
            <FormTextarea
              name="companionsDetails"
              label="Nomes e parentesco de quem viaja com você"
              placeholder={"Ex: Maria Silva (Esposa)\nJoão Silva (Filho)"}
              rows={3}
            />
          </div>
        )}
      </Section>

      <Divider />

      {/* ── 7. Viagens Anteriores ── */}
      <Section title="Viagens Anteriores aos EUA">
        <YesNo name="beenToUS" label="Você já esteve nos EUA?" required />
        {values.beenToUS === "sim" && (
          <div className="space-y-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormTextarea
              name="previousVisitsDetails"
              label="Últimas 5 viagens (datas aproximadas e duração)"
              placeholder={"Ex: Jan/2018 — 15 dias\nMar/2015 — 10 dias"}
              required
            />
            <YesNo name="hadUSDriverLicense" label="Já teve carteira de motorista dos EUA?" />
          </div>
        )}

        <YesNo name="hadUSVisa" label="Já teve o visto americano emitido?" required />
        {values.hadUSVisa === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="lastVisaDate" label="Data de emissão do último visto" type="date" required />
            <FormInput name="lastVisaNumber" label="Número do Visto (Folio em vermelho)" placeholder="Ex: 00123456789" />
            <FormSelect name="sameVisaType" label="Aplicando para o mesmo tipo?" options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
            <FormSelect name="sameVisaCountry" label="Mesmo país de emissão (Brasil)?" options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
            <FormSelect name="tenPrinted" label="Já tirou as 10 digitais?" options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
            <FormSelect name="visaLost" label="Visto foi perdido ou roubado?" options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
            <FormSelect name="visaCancelled" label="Visto foi cancelado ou revogado?" options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
          </div>
        )}

        <YesNo name="refusedUSVisa" label="Seu visto ou entrada nos EUA já foi negado?" required />
        {values.refusedUSVisa === "sim" && (
          <FormTextarea name="refusedExpanation" label="Explique detalhadamente" required />
        )}

        <YesNo name="immigrationPetition" label="Alguém preencheu uma petição de imigração para você no USCIS?" required />
        {values.immigrationPetition === "sim" && (
          <FormInput name="petitionExpanation" label="Explique" required />
        )}
      </Section>

      <Divider />

      {/* ── 8. Contato ── */}
      <Section title="Contato e Endereço">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <FormInput name="homeStreet" label="Rua, Número e Bairro" required />
          </div>
          <FormInput name="homeCity" label="Cidade" required />
          <FormInput name="homeState" label="Estado / Província" required />
          <FormInput name="homeZip" label="CEP" required />
          <FormInput name="homeCountry" label="País" required />
        </div>

        <YesNo name="differentMailingAddress" label="O endereço de correspondência é diferente do residencial?" required />
        {values.differentMailingAddress === "sim" && (
          <FormTextarea name="mailingAddressFull" label="Endereço de correspondência completo" />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormInput name="primaryPhone" label="Telefone Principal" placeholder="(DD) 9XXXX-XXXX" required />
          <FormInput name="secondaryPhone" label="Telefone Secundário" />
          <FormInput name="cellPhone" label="Celular" />
        </div>

        <YesNo name="otherPhones5Y" label="Usou outros números nos últimos 5 anos?" required />
        {values.otherPhones5Y === "sim" && (
          <FormInput name="otherPhonesList" label="Liste os números (separados por vírgula)" />
        )}

        <div className="max-w-sm">
          <FormInput name="primaryEmail" label="E-mail Principal" type="email" required />
        </div>

        <YesNo name="otherEmails5Y" label="Usou outros e-mails nos últimos 5 anos?" required />
        {values.otherEmails5Y === "sim" && (
          <FormInput name="otherEmailList" label="Liste os e-mails (separados por vírgula)" />
        )}

        <FormTextarea
          name="socialMediaAccounts"
          label="Redes sociais e usuários"
          placeholder={"Ex: Instagram — @meuperfil\nFacebook — /meunome\nLinkedIn — /in/meunome"}
          required
          rows={3}
        />
      </Section>

      <Divider />

      {/* ── 9. Família ── */}
      <Section title="Informações Familiares">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Pai</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="fatherName" label="Nome Completo do Pai" />
            <FormInput name="fatherBirth" label="Data de Nascimento" type="date" />
            <div className="sm:col-span-2">
              <YesNo name="fatherInUS" label="Seu pai está nos EUA?" />
            </div>
            {values.fatherInUS === "sim" && (
              <div className="sm:col-span-2">
                <FormInput name="fatherUSStatus" label="Status dele nos EUA" placeholder="Cidadão, Residente, Visitante, Não sei..." />
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Mãe</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="motherName" label="Nome Completo da Mãe" />
            <FormInput name="motherBirth" label="Data de Nascimento" type="date" />
            <div className="sm:col-span-2">
              <YesNo name="motherInUS" label="Sua mãe está nos EUA?" />
            </div>
            {values.motherInUS === "sim" && (
              <div className="sm:col-span-2">
                <FormInput name="motherUSStatus" label="Status dela nos EUA" placeholder="Cidadão, Residente, Visitante, Não sei..." />
              </div>
            )}
          </div>
        </div>

        <YesNo name="otherRelInUS" label="Tem outros parentes de 1º grau nos EUA (não listados acima)?" />

        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Cônjuge (preencha se casado/união estável)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="spouseName" label="Nome Completo" />
            <FormInput name="spouseBirth" label="Data de Nascimento" type="date" />
            <FormInput name="spouseCity" label="Cidade de Nascimento" />
            <FormInput name="spouseCountry" label="País de Nascimento" />
            <div className="sm:col-span-2">
              <YesNo name="spouseSameAddress" label="Endereço do cônjuge é o mesmo que o seu?" />
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── 10. Trabalho e Educação ── */}
      <Section title="Trabalho e Educação">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Atividade/Emprego Atual</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="primaryJobSector" label="Área de Atuação" placeholder="Engenharia, Saúde, Estudante..." required />
            <FormInput name="primaryJobEntity" label="Nome da Empresa / Escola" required />
            <div className="sm:col-span-2">
              <FormInput name="primaryJobAddress" label="Endereço Completo" />
            </div>
            <FormInput name="primaryJobPhone" label="Telefone" />
            <FormInput name="primaryJobSalary" label="Salário Mensal Bruto (R$)" placeholder="Aproximado" />
            <div className="sm:col-span-2">
              <FormTextarea name="primaryJobDuties" label="Resumo das suas funções" rows={2} />
            </div>
          </div>
        </div>

        <YesNo name="employedLast5Y" label="Foi empregado(a) anteriormente nos últimos 5 anos?" required />
        {values.employedLast5Y === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="prevEmployerName" label="Nome do Empregador Anterior" required />
            <FormInput name="prevEmployerTitle" label="Cargo" />
            <FormInput name="prevEmployerStart" label="Data de Início" type="date" />
            <FormInput name="prevEmployerEnd" label="Data de Fim" type="date" />
            <div className="sm:col-span-2">
              <FormInput name="prevEmployerDuties" label="Resumo de Funções" />
            </div>
          </div>
        )}

        <YesNo name="higherEducation" label="Frequentou ensino superior, técnico ou profissional?" required />
        {values.higherEducation === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="sm:col-span-2">
              <FormInput name="eduName" label="Nome da Instituição" required />
            </div>
            <div className="sm:col-span-2">
              <FormInput name="eduCourse" label="Curso / Área" />
            </div>
            <FormInput name="eduStart" label="Data de Início" type="date" />
            <FormInput name="eduEnd" label="Data de Término" type="date" />
          </div>
        )}

        <YesNo name="belongsToTribe" label="Pertence a alguma tribo, clã ou organização?" required />
        <FormInput name="fluentLanguages" label="Idiomas que fala fluentemente" placeholder="Ex: Português, Inglês, Espanhol" required />
        <FormTextarea name="countriesVisited5Y" label="Países visitados nos últimos 5 anos" placeholder="Ex: Argentina, França, Portugal..." rows={2} />

        <YesNo name="servedMilitary" label="Já serviu às Forças Armadas?" required />
        {values.servedMilitary === "sim" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <FormInput name="militaryBranch" label="Ramo" placeholder="Ex: Exército" />
            <FormInput name="militarySpecialty" label="Especialidade" />
          </div>
        )}
      </Section>

      <Divider />

      {/* ── 11. Segurança ── */}
      <Section
        title="Perguntas de Segurança"
        subtitle="Por padrão, todas as alternativas são assinaladas como NÃO pela nossa equipe para otimização da DS-160."
      >
        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-4">
          <p className="text-sm font-medium text-amber-800 leading-relaxed">
            Deseja declarar <strong>SIM</strong> para algum evento de segurança no seu histórico? (Ex: prisão, deportação, doença transmissível grave)
          </p>
          <YesNo name="securityExceptions" label="" />
          {values.securityExceptions === "sim" && (
            <FormInput
              name="securityExceptionsDetails"
              label="Descreva brevemente o evento"
              placeholder="Explique brevemente a exceção..."
              required
            />
          )}
        </div>
      </Section>

    </div>
  );
};
