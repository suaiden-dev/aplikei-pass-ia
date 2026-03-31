# PDF Form Filling — I-539, G-1145, G-1450

Documentação técnica do processo de mapeamento e preenchimento automático dos formulários USCIS.

---

## Visão Geral

Os formulários USCIS são PDFs com campos AcroForm interativos. O objetivo é:

1. Descobrir os nomes internos de cada campo
2. Descriptografar o PDF (remoção de owner-encryption)
3. Preencher os campos com os dados do usuário no browser
4. Fazer upload do PDF preenchido para o Supabase Storage

Tudo roda **client-side** (browser) — sem Edge Functions, sem servidor Node.

---

## Ferramentas Utilizadas

### 1. `pdfjs-dist` — Descoberta de Campos

Usado **apenas localmente** para inspecionar os PDFs e listar todos os campos disponíveis.

Os PDFs da USCIS usam criptografia de dono (*owner-encryption*) que bloqueia `pdf-lib` de ler a estrutura. O `pdfjs-dist` ignora essa restrição na leitura.

```bash
npm install pdfjs-dist
```

Script de descoberta (`scripts/scrapingi539.ts`):

```ts
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const doc = await getDocument({ data, useSystemFonts: true }).promise;

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const annotations = await page.getAnnotations();
  for (const ann of annotations) {
    if (ann.subtype === "Widget" && ann.fieldName) {
      console.log(`[${ann.fieldType}] ${ann.fieldName}`);
    }
  }
}
```

**Tipos de campo retornados:**
| Código | Tipo |
|--------|------|
| `Tx`   | Campo de texto |
| `Btn`  | Checkbox ou radio button |
| `Ch`   | Dropdown (choice) |

---

### 2. `qpdf` — Descriptografia do PDF

Os PDFs originais da USCIS têm *owner-encryption* (sem senha de usuário, mas com restrições de edição). O `pdf-lib` se recusa a escrever em PDFs criptografados mesmo com `ignoreEncryption: true`.

A solução é descriptografar o PDF **uma única vez** localmente com `qpdf`.

**Instalação (Windows):**
```bash
winget install qpdf.qpdf
```

**Uso:**
```bash
qpdf --decrypt original.pdf decrypted.pdf
```

O PDF descriptografado é copiado para `public/forms/` e versionado no repositório. Em nenhuma outra máquina ou no deploy é necessário ter o `qpdf` instalado.

---

### 3. `pdf-lib` — Preenchimento no Browser

Biblioteca JavaScript pura que roda tanto no browser quanto no Node. Usada em produção para preencher os campos do PDF descriptografado.

```bash
npm install pdf-lib  # já incluso no projeto
```

**Fluxo em produção:**

```ts
// 1. Busca o template (arquivo estático em /public/forms/)
const res = await fetch("/forms/i539_template.pdf");
const bytes = new Uint8Array(await res.arrayBuffer());

// 2. Carrega o documento
const pdfDoc = await PDFDocument.load(bytes);
const form = pdfDoc.getForm();

// 3. Preenche os campos pelo nome exato
form.getTextField("form1[0].#subform[0].P1Line1a_FamilyName[0]").setText("Silva");
form.getCheckBox("form1[0].#subform[0].Part1_Item4_Unit[0]").check();
form.getDropdown("form1[0].#subform[0].Part2_Item11_State[0]").select("FL");

// 4. Serializa
const filledBytes = await pdfDoc.save();
```

---

## Estrutura dos Arquivos

```
public/
  forms/
    i539_template.pdf     ← template descriptografado (I-539)
    g1145_template.pdf    ← template descriptografado (G-1145)
    g1450_template.pdf    ← template descriptografado (G-1450)

src/
  domain/entities/
    I539FormData.ts       ← interface com todos os campos do I-539

  application/use-cases/
    FillI539Form.ts       ← busca template → preenche → upload
    FillG1145G1450Forms.ts ← idem para G-1145 e G-1450

scripts/
  scrapingi539.ts         ← ferramenta de descoberta de campos (uso local)
  upload-i539-template.ts ← script para upload do template no Supabase (alternativa)
```

---

## Mapeamento de Campos

### I-539 (159 campos — 7 páginas)

Os nomes seguem o padrão XFA da Adobe: `form1[0].#subform[N].NomeDoCampo[indice]`

| Campo do formulário | Nome interno no PDF |
|---|---|
| Sobrenome | `form1[0].#subform[0].P1Line1a_FamilyName[0]` |
| Nome | `form1[0].#subform[0].P1_Line1b_GivenName[0]` |
| A-Number | `form1[0].#subform[0].Pt1Line2_AlienNumber[0]` |
| Endereço (rua) | `form1[0].#subform[0].Part2_Item11_StreetName[0]` |
| Cidade | `form1[0].#subform[0].Part2_Item11_City[0]` |
| Estado (dropdown) | `form1[0].#subform[0].Part2_Item11_State[0]` |
| Data de nascimento | `form1[0].#subform[1].P1_Line8_DateOfBirth[0]` |
| Número I-94 | `form1[0].#subform[1].SupA_Line1j_ArrivalDeparture[0]` |
| Status atual (dropdown) | `form1[0].#subform[1].Pt1Line15a_NewStatus[0]` |
| Tipo de pedido (extend) | `form1[0].#subform[1].P2_checkbox4[0]` |
| Tipo de pedido (change) | `form1[0].#subform[1].P2_checkbox4[1]` |
| Novo status (dropdown) | `form1[0].#subform[1].Pt2Line2a_NewStatus[0]` |
| Telefone diurno | `form1[0].#subform[4].P5_Line3_DaytimePhoneNumber[0]` |
| E-mail | `form1[0].#subform[4].P5_Line5_EmailAddress[0]` |
| Assinatura | `form1[0].#subform[4].P6_Line7_SignatureApplicant[0]` |
| Data da assinatura | `form1[0].#subform[4].P6_Line7_DateofSignature[0]` |

> Lista completa gerada pelo script: `scripts/scrapingi539.ts list` → salva em `scripts/i539_fields.json`

### G-1145 (5 campos úteis)

| Campo | Nome interno |
|---|---|
| Sobrenome | `form1[0].#subform[0].LastName[0]` |
| Nome | `form1[0].#subform[0].FirstName[0]` |
| Nome do meio | `form1[0].#subform[0].MiddleName[0]` |
| E-mail | `form1[0].#subform[0].Email[0]` |
| Celular | `form1[0].#subform[0].MobilePhoneNumber[0]` |

### G-1450 (28 campos úteis)

| Campo | Nome interno |
|---|---|
| Sobrenome do solicitante | `form1[0].#subform[0].FamilyName[0]` |
| Nome do solicitante | `form1[0].#subform[0].GivenName[0]` |
| Sobrenome no cartão | `form1[0].#subform[0].CCHolderFamilyName[0]` |
| Endereço cobrança | `form1[0].#subform[0].Pt1Line2b_StreetNumberName[0]` |
| Estado (dropdown) | `form1[0].#subform[0].State[0]` |
| Bandeira (Visa) | `form1[0].#subform[0].CreditCardTypeChBx[0]` |
| Bandeira (Mastercard) | `form1[0].#subform[0].CreditCardTypeChBx[1]` |
| Bandeira (AmEx) | `form1[0].#subform[0].CreditCardTypeChBx[2]` |
| Bandeira (Discover) | `form1[0].#subform[0].CreditCardTypeChBx[3]` |
| Número cartão (grupo 1) | `form1[0].#subform[0].CreditCardNumber_1[0]` |
| Número cartão (grupo 2) | `form1[0].#subform[0].CreditCardNumber_2[0]` |
| Número cartão (grupo 3) | `form1[0].#subform[0].CreditCardNumber_3[0]` |
| Número cartão (grupo 4) | `form1[0].#subform[0].CreditCardNumber_4[0]` |
| Validade | `form1[0].#subform[0].ExpirationDate[0]` |
| Assinatura | `form1[0].#subform[0].SignatureOfApplicant[0]` |
| Valor autorizado | `form1[0].#subform[0].AuthorizedPaymentAmt[0]` |

---

## Variáveis de Ambiente

```env
VITE_I539_TEMPLATE_URL=/forms/i539_template.pdf
VITE_G1145_TEMPLATE_URL=/forms/g1145_template.pdf
VITE_G1450_TEMPLATE_URL=/forms/g1450_template.pdf
```

Em produção (Vercel/Netlify), adicionar as mesmas variáveis no painel de configurações. Como os templates são arquivos estáticos em `public/`, o valor `/forms/nome.pdf` funciona em qualquer ambiente sem alteração.

---

## Adicionando um Novo Formulário USCIS

1. Baixar o PDF oficial do USCIS
2. Descriptografar: `qpdf --decrypt original.pdf public/forms/novo_template.pdf`
3. Descobrir campos (adaptar o script):
   ```bash
   # Trocar o path no script e rodar:
   npx ts-node --esm scripts/scrapingi539.ts list
   ```
4. Criar use case em `src/application/use-cases/FillNovoForm.ts` mapeando os campos
5. Adicionar `VITE_NOVO_TEMPLATE_URL=/forms/novo_template.pdf` no `.env`
6. Chamar o use case no componente React correspondente
