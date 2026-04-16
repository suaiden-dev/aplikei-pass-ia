import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Lê o arquivo .env manualmente para não depender do dotenv no TSX
const envPath = path.resolve(process.cwd(), ".env");
const envFile = fs.readFileSync(envPath, "utf-8");
const envs: Record<string, string> = {};
envFile.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
       val = val.slice(1, -1);
    }
    envs[match[1].trim()] = val;
  }
});

const supabaseUrl = envs["VITE_SUPABASE_URL"];
const supabaseKey = envs["VITE_SUPABASE_PUBLISHABLE_KEY"];

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não encontradas.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// E-mail do usuário que receberá os dados criados (ajuste se necessário)
const TARGET_USER_EMAIL = "teste1@teste.com"; 
// Você pode trocar para qual usuário quiser receber os dados.
// NOTA: Certifique-se de que o usuário tem um serviço B1/B2 criado.

const MOCK_DS160 = {
  interviewLocation: "São Paulo",
  isBrazilian: "sim",
  fullName: "Joãozinho da Silva Fictício",
  hasOtherNames: "nao",
  gender: "masculino",
  maritalStatus: "SOLTEIRO",
  birthDate: "1990-01-01",
  birthCity: "São Paulo",
  birthState: "São Paulo",
  birthCountry: "Brasil",
  hasOtherNationality: "nao",
  hasOtherResidence: "nao",
  cpf: "123.456.789-00",
  passportNumber: "FY123456",
  passportIssueDate: "2020-01-01",
  passportExpDate: "2030-01-01",
  lostPassport: "nao",
  travelPurpose: "B1/B2 - TURISMO E NEGÓCIOS",
  specificTravelPlan: "sim",
  arrivalDate: "2026-10-10",
  arrivalCity: "Orlando",
  departureDate: "2026-10-25",
  usStayName: "Hotel Teste Inc",
  usStayStreet: "123 Disney Way",
  usStayCity: "Orlando",
  usStayState: "FL",
  payingTrip: "eu",
  travelingWithOthers: "nao",
  beenToUS: "nao",
  hadUSVisa: "nao",
  refusedUSVisa: "nao",
  immigrationPetition: "nao",
  homeStreet: "Rua das Flores 123",
  homeZip: "01000-000",
  homeCity: "São Paulo",
  homeState: "SP",
  homeCountry: "Brasil",
  differentMailingAddress: "nao",
  primaryPhone: "(11) 99999-9999",
  otherPhones5Y: "nao",
  primaryEmail: "joaoquinho@testeficticio.com",
  otherEmails5Y: "nao",
  socialMediaAccounts: "Instagram: @joaozinho_test",
  primaryJobSector: "Tecnologia",
  primaryJobEntity: "Empresa XPTO SA",
  employedLast5Y: "nao",
  higherEducation: "nao",
  fluentLanguages: "Português, Inglês",
  servedMilitary: "nao",
  securityExceptions: "nao",
};

async function main() {
  console.log("🚀 Iniciando script de preenchimento da DS-160...");

  // 1. Procurar a conta do usuário
  const { data: userAccount, error: userError } = await supabase
    .from("user_accounts")
    .select("id")
    .eq("email", TARGET_USER_EMAIL)
    .single();

  if (userError || !userAccount) {
    console.error(`❌ Usuário com e-mail ${TARGET_USER_EMAIL} não encontrado!`);
    console.error("💡 Dica: mude a variável TARGET_USER_EMAIL no script para um e-mail válido.");
    process.exit(1);
  }

  // 2. Procurar o serviço do visto B1/B2 pendente desse usuário
  const { data: service, error: serviceError } = await supabase
    .from("user_services")
    .select("id, step_data")
    .eq("user_id", userAccount.id)
    .like("service_slug", "visto-b1-b2%")
    .neq("status", "completed")
    .single();

  if (serviceError || !service) {
    console.error(`❌ Serviço ativo de visto B1/B2 não encontrado para o usuário ${TARGET_USER_EMAIL}!`);
    console.error("Ele precisa comprar o visto (ou ter um atribuído a ele) primeiro.");
    process.exit(1);
  }

  // 3. Mesclar os dados novos com o step_data atual
  const updatedStepData = {
    ...(service.step_data || {}),
    ...MOCK_DS160
  };

  // 4. Salvar no Supabase e aprovar etapa se necessário
  console.log(`📝 Preenchendo DS-160 para o serviço ID: ${service.id}...`);
  const { error: updateError } = await supabase
    .from("user_services")
    .update({ 
      step_data: updatedStepData,
    })
    .eq("id", service.id);

  if (updateError) {
    console.error("❌ Erro ao salvar dados no banco:", updateError);
    process.exit(1);
  }

  console.log("✅ DS-160 preenchida com sucesso com dados fictícios!");
  console.log("💡 Se o cliente estiver na etapa de forms (etapa 0 do B1/B2), ele já pode clicar em Finale e Submit.");
}

main().catch(console.error);
