# Test Checklist — Melhorias Recentes

## 1. Onboarding do Advogado (`/admin/onboarding`)

> Limpe o localStorage antes: DevTools → Application → Local Storage → deletar `admin_lawyer_onboarding_step_v1`

### Step Indicator
- [ ] 4 dots aparecem (company, subscription, products, done)
- [ ] Dot atual pulsa (animação ping)
- [ ] Dots anteriores ficam verdes com ✓
- [ ] Label abaixo muda conforme o step atual
- [ ] No mobile: dots centralizado, sem texto cortado

### Company Step (3 sub-steps internos)
- [ ] Sub-step 1: logo upload, nome*, slug (auto-preenchido), CNPJ, endereço
- [ ] Sub-step 2: email, phone, website
- [ ] Sub-step 3: Instagram, LinkedIn, Facebook + botão "Save & Continue"
- [ ] Dots internos (3 bolinhas) aparecem no topo
- [ ] Navegação Back/Next entre sub-steps funciona
- [ ] Salvar no sub-step 3 avança para Subscription

### Subscription Step
- [ ] Card de plano aparece centralizado e com `max-w-sm` (não estica full-width)
- [ ] Preço hero em `text-5xl`
- [ ] Badge de tipo (ex: PERCENTAGE) no canto superior direito
- [ ] Features em grid 2 colunas
- [ ] Botão "Get Started" com shadow colorido
- [ ] Após confirmar o plano → avança para Products

### Products Step (4 sub-steps internos)
- [ ] 4 dots no topo (F-1, B1/B2, EOS, COS)
- [ ] Cada sub-step mostra ícone + nome + descrição do visto
- [ ] Toggle ativo/inativo funciona
- [ ] Campo de preço desabilitado quando toggle está OFF
- [ ] Ativar visto sem preencher preço → toast de erro ao tentar avançar
- [ ] Visto inativo → pode avançar sem preço
- [ ] Back/Next navegam entre os 4 vistos
- [ ] "Skip for now" → avança para Done sem salvar
- [ ] "Save & Continue" no último visto (COS) → salva no banco → avança para Done

### Done Step
- [ ] Se pulou products → aparece aviso para configurar depois
- [ ] Botão "Go to Dashboard" redireciona para `/admin`

---

## 2. Dashboard do Advogado (`/admin`)

### StatCard "Awaiting Payment"
- [ ] Card aparece no grid com contagem de pedidos com `payment_status = pending`
- [ ] Valor correto (verificar na tabela `orders`)

### Banner de produtos não configurados
- [ ] Se nenhum produto ativo com preço → banner amarelo aparece abaixo dos cards
- [ ] Texto: "Nenhum serviço configurado"
- [ ] Link "Configurar →" leva para `/admin/products`
- [ ] Após configurar um produto com preço → banner some

### Empty State (escritório sem processos)
- [ ] Se `totalProcesses === 0` → gráficos NÃO aparecem
- [ ] Card centralizado com ícone e título "Seu escritório está pronto!"
- [ ] Link de checkout aparece no campo readonly
- [ ] Botão "Copiar" copia a URL e exibe toast "Link copiado!"
- [ ] Se sem produtos: badge de aviso "Configure seus produtos antes de compartilhar"

### Widget de Checkout (escritório com processos)
- [ ] Card pequeno aparece abaixo dos gráficos com o link do office
- [ ] URL no formato: `{origem}/checkout?office={slug}`
- [ ] Botão "Copiar link" funciona com toast de confirmação

### Sem impacto em outros roles
- [ ] Login como `master` → nenhum dos novos elementos aparece
- [ ] Login como `manager` → nenhum dos novos elementos aparece

---

## 3. Finance Analytics (`/admin/finance-analytics`)

- [ ] Badge "OFFICE CONTEXT" tem padding adequado (não colado)
- [ ] Texto legível com espaçamento interno

---

## 4. Promoção "1º Processo Grátis" — REMOVIDA

- [ ] Dashboard (`/admin`) → **nenhum** banner de promoção aparece
- [ ] Products page (`/admin/products`) → **nenhum** badge "✨ 1º Processo Grátis Ativo"
- [ ] Verificar no Supabase: migration `20260629000000_first_process_free_promotion.sql` **não existe** nas migrations aplicadas
