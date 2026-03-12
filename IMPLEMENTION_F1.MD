# Implementação do Fluxo de Visto F1/F2

## Contexto do Projeto

Já existe um fluxo funcional para **Visto B1/B2** dentro da plataforma.

Esse fluxo possui:

- arquitetura baseada em **steps**
- controle via **useOnboardingLogic**
- armazenamento em **onboarding_responses**
- upload de documentos via **documents**
- controle de progresso por **serviceStatus**
- internacionalização via **translations.ts + useLanguage**
- renderização centralizada em **Onboarding/index.tsx**

O novo fluxo **F1/F2 (Visto de Estudante)** deve reutilizar **essa mesma arquitetura**.

⚠️ **Não recriar componentes base.**

Reutilizar:

- Card
- Inputs
- Select
- PhoneInput
- Buttons
- Header progressivo
- Upload components
- sistema de documentos
- sistema de tradução
- sistema de status

---

# Novo Serviço

Slug do serviço:


visa-f1f2


---

# Estrutura Geral do Fluxo

1. Registro  
2. Pagamento (Stripe)  
3. Onboarding DS160 + documentos  
4. Processamento DS160  
5. Revisão e assinatura DS160  
6. Agendamento CASV / Consulado  
7. Pagamento da taxa consular  
8. Preparação entrevista  
9. Treinamento entrevista com IA  
10. Entrevista  
11. Resultado (Aprovado / Reprovado)  
12. Fluxo pós resultado  

---

# Estrutura de Steps

Criar novos steps dentro de:


/Onboarding/steps/F1F2/


## Steps de preenchimento DS160

Criar os seguintes componentes:


F1F2PersonalInfoStep.tsx
F1F2TravelInfoStep.tsx
F1F2AddressPhoneStep.tsx
F1F2PassportStep.tsx
F1F2FamilyInfoStep.tsx
F1F2EducationStep.tsx
F1F2SEVIStep.tsx
F1F2SocialMediaStep.tsx
F1F2AdditionalInfoStep.tsx
F1F2UploadDocumentsStep.tsx


---

# Campos adicionais obrigatórios (F1/F2)

Adicionar campos acadêmicos:


school_name
school_address
course_name
course_start_date
course_end_date
sevis_id


---

# Upload de documentos obrigatórios


I20_document
passport_photo


---

# Step Especial — Abertura da DS160

Criar step:


OpenDS160Step.tsx


Campos:


consulate_location
application_id
security_answer
ds160_application_screenshot


Fluxo:

1. Usuário acessa CEAC
2. Seleciona consulado
3. Cria a DS160
4. Salva Application ID
5. Faz upload do print da tela

Salvar no banco:


ds160_application_id
ds160_consulate
ds160_screenshot


---

# Status do Processo

Adicionar novos `serviceStatus`:


DS160_PROCESSING
REVIEW_AND_SIGN_DS160
WAITING_DS160_UPLOAD
CASV_SCHEDULING
FEE_PROCESSING
FEE_PAYMENT_PENDING
INTERVIEW_SCHEDULED
AWAITING_INTERVIEW
VISA_APPROVED
VISA_DENIED


---

# Fluxo de Status

## 1 — Preenchimento DS160

Usuário preenche todos os steps.

---

## 2 — Processamento

Status:


DS160_PROCESSING


Tela:


ProcessingStatusStep


Equipe revisa os dados.

---

## 3 — Revisão e Assinatura DS160

Status:


REVIEW_AND_SIGN_DS160


Tela:


ReviewAndSignDS160Step


Conteúdo:

tutorial ensinando o usuário a:

1 acessar CEAC  
2 inserir Application ID  
3 revisar dados  
4 assinar DS160  
5 baixar confirmação  

---

## 4 — Upload da confirmação

Usuário faz upload de:


ds160_confirmation
ds160_submission_receipt


Botão:


Confirmar e avançar


---

# Agendamento CASV / Consulado

Status:


CASV_SCHEDULING


Salvar no banco:


casv_date
casv_time
consulate_date
consulate_time


Tela:


CASVSchedulingStep


Mostrar datas para o usuário.

---

# Criação de Conta no Consulado

Usuário deve criar conta em:

https://ais.usvisa-info.com/pt-BR/niv

Botão:


Já confirmei meu email


---

# Pagamento da Taxa Consular

Status:


FEE_PROCESSING


Equipe gera taxa.

Upload no sistema:


mrv_fee_document


---

Status seguinte:


FEE_PAYMENT_PENDING


Tela:


PaymentPendingStep


Usuário realiza pagamento.

Integração possível com **Stripe**.

---

# Entrevista Agendada

Status:


INTERVIEW_SCHEDULED


Tela:


AwaitingInterviewStep


Mostrar:

- data da entrevista
- contagem regressiva

---

# Preparação para Entrevista

Criar step:


InterviewPreparationStep.tsx


Conteúdo:

## Documentos recomendados

- extratos bancários
- comprovante de propriedade
- vínculo empregatício
- DS160
- confirmação DS160
- confirmação agendamento

---

# Treinamento de Entrevista com IA

Criar agente:


F1F2VisaInterviewCoach


Fonte de dados:


DS160 responses
school data
travel data


A IA deve:

- simular entrevista consular
- gerar perguntas baseadas na DS160
- simular comportamento de oficial consular

---

# Upsell — Treinamento com Especialista

Integrações:

- **Calendly**
- **Stripe**

Fluxo:

1 escolher horário  
2 pagar sessão  
3 liberar link Meet ou Zoom  

---

# Acompanhamento do Status do Visto

Criar tela:


VisaStatusTrackingStep.tsx


Link oficial:

https://ceac.state.gov/ceacstattracker/status.aspx

Mostrar tutorial.

---

# Dia da Entrevista

Tela:


InterviewDayStep.tsx


Conteúdo:

Checklist de documentos.

Botões:


Fui aprovado
Fui reprovado


---

# Se Aprovado

Status:


VISA_APPROVED


Tela:


VisaApprovedStep.tsx


Pergunta:


Como deseja receber o passaporte?


Opções:

- retirar no consulado
- entrega pelos correios

Adicionar guia:


Chegada aos EUA


---

# Se Reprovado

Status:


VISA_DENIED


Tela:


VisaDeniedStep.tsx


Mensagem:

Reprovação pode ser revertida.

Opções:


Falar com especialista
Reaplicar sozinho


---

# Com Especialista

Integração:

- Calendly
- Stripe

---

# Sem Especialista

Fluxo reinicia:


novo processo DS160


Aplicar:


desconto automático


---

# Integrações

Utilizar:

### Stripe

- pagamento do serviço
- pagamento de mentoria

### Calendly

- agendamento com especialistas

### Docketwise API

- preencher DS160 automaticamente
- gerar Application ID
- acompanhar status

---

# Regras Importantes

1. Não quebrar o fluxo **B1/B2 existente**

2. Reutilizar:


useOnboardingLogic
Onboarding/index.tsx
translations.ts
document upload system
status system


3. Todos os novos componentes devem suportar:

- Português
- Inglês
- Espanhol

4. Utilizar **a mesma UI base do projeto**

---

# Resultado Esperado

Novo fluxo completo:


visa-f1f2


com:

- onboarding DS160
- upload I20
- revisão e assinatura
- agendamento CASV
- pagamento taxa consular
- treinamento de entrevista
- acompanhamento
- resultado final