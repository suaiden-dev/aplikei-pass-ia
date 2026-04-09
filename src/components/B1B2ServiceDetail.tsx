import { MdLanguage } from "react-icons/md";
import ServiceDetailTemplate, { type ServiceData } from "../templates/ServiceDetailTemplate";

const service: ServiceData = {
  slug: "visto-b1-b2",
  title: "Visto de Turismo e Negócios B1/B2",
  subtitle: "Guia completo passo a passo com checklist, preparação de documentos e simulador de entrevista consular.",
  price: "US$ 200,00",
  originalPrice: "US$ 400,00",
  dependentPrice: "US$ 80,00",
  description:
    "O guia Aplikei para o visto B1/B2 foi desenvolvido para brasileiros que desejam visitar os EUA a turismo ou negócios. Cobrimos desde o preenchimento do DS-160 até a preparação para a entrevista consular, com checklists detalhados e modelos de documentos.",
  forWhom: [
    "Turistas que desejam visitar os EUA pela primeira vez",
    "Profissionais que viajam a negócios sem vínculo empregatício nos EUA",
    "Pessoas que precisam renovar o visto B1/B2 vencido",
    "Quem busca organizar a documentação de forma independente",
  ],
  notForWhom: [
    "Quem deseja trabalhar formalmente nos EUA",
    "Casos com negativas consulares anteriores (recomendamos advogado)",
    "Quem precisa de assessoria jurídica personalizada",
  ],
  included: [
    "Guia DS-160: Instruções detalhadas para preencher o formulário sem erros",
    "Checklist de Documentos: Lista completa de tudo que você precisa reunir",
    "Preparação para Entrevista: Perguntas frequentes e como respondê-las",
    "Pacote PDF Final: Documento organizado e pronto para imprimir",
  ],
  requirements: [
    "Passaporte válido",
    "Formulário DS-160",
    "Comprovante de renda",
    "Extrato bancário",
    "Comprovante de vínculos",
    "Carta convite (se aplicável)",
    "Fotos 5x5cm",
    "Comprovante de pagamento",
    "Itinerário de viagem",
  ],
  steps: [
    "Acesso ao Guia: Receba acesso imediato ao guia completo após a compra",
    "Preencha o DS-160: Siga nossas instruções detalhadas para evitar erros comuns",
    "Reúna os Documentos: Use nosso checklist para garantir que nada seja esquecido",
    "Prepare-se para a Entrevista: Estude as perguntas frequentes e pratique as respostas",
    "Monte seu Pacote Final: Use a IA para organizar tudo em um PDF profissional",
    "Vá ao Consulado: Com confiança e documentação completa",
  ],
  faq: [
    {
      q: "Quanto tempo tenho acesso ao guia?",
      a: "Você tem acesso por 90 dias a partir da compra — tempo suficiente para organizar toda sua documentação.",
    },
    {
      q: "O guia garante aprovação do visto?",
      a: "Não. A decisão é exclusiva do consulado americano. Nosso guia maximiza suas chances ao garantir uma documentação organizada e completa.",
    },
    {
      q: "Posso adicionar dependentes?",
      a: "Sim. Cada dependente (cônjuge ou filho menor) pode ser incluído por US$ 80,00 adicionais.",
    },
    {
      q: "Funciona para renovação de visto?",
      a: "Sim. O guia cobre tanto a primeira solicitação quanto a renovação do visto B1/B2.",
    },
  ],
};

export default function B1B2ServiceDetail() {
  return (
    <ServiceDetailTemplate
      service={service}
      heroImage="https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=2070&auto=format&fit=crop"
      successRate="97.2%"
      processType="Processo Consular"
      HeroIcon={MdLanguage}
    />
  );
}
