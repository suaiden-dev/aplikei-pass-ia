# Análise de Fluxo — Advogado (Admin Lawyer)

**Data:** 2026-06-29  
**Escopo:** Onboarding, Company Profile, Products, Cases, Teams, Subscription

---

## 1. Jornada Atual do Advogado (como está hoje)

```
Registro (/sign-up)
  → Login (/login)
  → Dashboard /admin
    → Onboarding modal (steps: Company + Subscription)
      → Step 1: Company Profile (/settings/company)
      → Step 2: Subscription (/subscription)
    → (após ativar) Plataforma completa liberada
```

O acesso às seções principais (Products, Cases, Teams) fica **bloqueado** enquanto a subscription não está ativa. A tela mostra o banner:
> "Your subscription is not active — Activate now"

---

## 2. Problemas Identificados por Seção

### 2.1 Registro / Sign-up

| # | Problema | Impacto |
|---|---|---|
| 1 | Não existe feedback claro de que o advogado precisa completar onboarding após cadastro | Alto |
| 2 | Convite de time (`/cadastro?role=seller&officeId=...`) usa a mesma página de cadastro geral sem diferenciação visual | Médio |
| 3 | Após cadastro, redirecionamento vai para `/admin` mas o onboarding modal aparece em cima — usuário pode fechar acidentalmente e ficar travado | Alto |

---

### 2.2 Onboarding Modal (Company + Subscription steps)

| # | Problema | Impacto |
|---|---|---|
| 4 | Apenas 2 steps exibidos (Company, Subscription) — o step de **Products** não está incluído no onboarding guiado, mas é obrigatório para o negócio funcionar | **Crítico** |
| 5 | O botão "Continue" no step Company vai para Subscription mesmo se o perfil não foi salvo | Alto |
| 6 | Não há indicação de **progresso persistente** — se o usuário fechar e reabrir, não é claro em qual step estava | Médio |
| 7 | Company Profile está como "Pending" sempre que o nome não foi salvo, mas não mostra o que exatamente está pendente | Médio |

---

### 2.3 Company Profile (`/settings/company`)

| # | Problema | Impacto |
|---|---|---|
| 8 | **Botão "Save" fica na parte inferior da página** — em telas menores/scrolladas, o usuário não vê que precisa salvar após preencher | Alto |
| 9 | O slug é gerado automaticamente pelo nome, mas o campo mostra vazio até o usuário digitar algo no slug manualmente | Confuso |
| 10 | Quando o nome muda, o slug **não** é auto-atualizado (somente no save) — usuário pode não perceber que o slug está desatualizado | Médio |
| 11 | CNPJ label diz "CNPJ / Tax ID" mas o placeholder formata como CNPJ brasileiro — confuso para advogados nos EUA | Médio |
| 12 | Logo upload acontece imediatamente (auto-save parcial) mas os outros campos só salvam no submit — inconsistência | Médio |
| 13 | Após salvar, `window.location.reload()` força refresh completo da página — perda de contexto, experiência ruim | Baixo |
| 14 | Campos de redes sociais (Instagram, LinkedIn, Facebook) ficam numa card separada mas têm **mesma** importância visual que contatos essenciais | Baixo |

---

### 2.4 Products (`/products`)

| # | Problema | Impacto |
|---|---|---|
| 15 | **Maior problema reportado.** O advogado não sabe por onde começar — vê 3 fases (Initial, Add-ons, Finalization) sem contexto do que cada uma significa para o cliente | **Crítico** |
| 16 | O botão **"Save Configuration"** fica no **topo direito da página** — após configurar preços (que exige scroll até o meio/final da página), o usuário não vê o botão de salvar sem rolar de volta ao topo | **Crítico** |
| 17 | Ativar/desativar um produto no painel lateral esquerdo **não** salva automaticamente — usuário pode achar que o toggle já salvou | Alto |
| 18 | Não há feedback de "unsaved changes" — se o usuário mudar preços e navegar para outra página, as mudanças são perdidas silenciosamente | Alto |
| 19 | O produto **Interview Specialist** tem lógica oculta (cross-flow: mudar B1/B2 afeta F1) — aviso aparece mas só dentro do produto, sem destaque | Alto |
| 20 | Não há **preview** de como o cliente verá o checkout — advogado não sabe o que está publicando | Médio |
| 21 | Preços de add-ons ficam dentro de um modal de "more info" — para configurar precisa clicar em settings → modal → preço. Fluxo não óbvio | Médio |
| 22 | Add-ons sem preço definido aparecem com switch disabled mas **sem explicação clara de por que não pode ativar** | Médio |
| 23 | Stats no topo (Main Visas, Active, Avg Ticket) ficam antes do conteúdo principal — ocupam espaço sem utilidade imediata no onboarding | Baixo |
| 24 | Nenhum "Get Started" ou estado vazio orientado quando o advogado acessa Products pela primeira vez | Médio |

---

### 2.5 Cases / Processes (`/processes`)

| # | Problema | Impacto |
|---|---|---|
| 25 | Acesso bloqueado por subscription — mas o advogado pode querer explorar antes de assinar | Médio |
| 26 | Sem dados mocados ou estado vazio explicativo — lista vazia não orienta o que fazer | Baixo |

---

### 2.6 Teams (`/roles`)

| # | Problema | Impacto |
|---|---|---|
| 27 | Geração de link de convite está presente, mas não há tutorial de como o convidado se cadastra e precisa de aprovação | Médio |
| 28 | Status "pending" do membro convidado não é óbvio — não há distinção visual clara entre pending/approved/rejected | Médio |

---

### 2.7 Subscription (`/subscription`)

| # | Problema | Impacto |
|---|---|---|
| 29 | Planos exibidos sem preço visível na listagem inicial (é calculado por porcentagem/fixo mas o advogado precisa calcular mentalmente o custo) | Médio |
| 30 | Após assinar, não há redirect ou confirmação clara de que a plataforma foi desbloqueada | Médio |

---

## 3. Fluxo Proposto (Melhorado)

```
Registro
  → Email confirmado
  → Login
  → Onboarding Wizard (3 steps obrigatórios com barra de progresso persistente)
      Step 1: Company Profile
        - Auto-slug do nome
        - Save inline com feedback imediato (sem reload)
        - Botão "Save & Continue" fixo no fundo (sticky footer)
      Step 2: Products (NOVO — atualmente ausente do wizard)
        - Guia contextual: "Configure o preço do seu serviço principal"
        - Só exige ativar 1 produto e definir preço — resto é opcional
        - Botão "Save & Continue" fixo no fundo
      Step 3: Subscription
        - Assinar plano
        - Após assinar → redirect direto para /admin com confetti/mensagem de boas-vindas
  → Dashboard desbloqueado
```

---

## 4. Melhorias de UX por Componente

### Products Page — Prioridade Crítica

1. **Botão Save duplicado**: adicionar um botão "Save Configuration" sticky no rodapé da página (além do topo), visível ao scrollar
2. **Unsaved changes warning**: banner amarelo quando há mudanças não salvas + confirmação ao tentar navegar para outra rota
3. **Empty state orientado**: primeira vez que o advogado acessa, mostrar um card com "Por onde começar: 1. Selecione o tipo de visto  2. Defina o preço  3. Ative o produto  4. Copie o link de checkout"
4. **Preview do checkout**: botão "Preview" que abre o checkout em modo visualização (não compra)
5. **Preços de add-ons inline**: mostrar input de preço diretamente na listagem, sem precisar abrir modal
6. **Auto-save dos toggles**: ao ativar/desativar produto, salvar apenas aquela alteração imediatamente com toast discreto

### Company Profile — Prioridade Alta

1. **Sticky Save button**: fixar o botão Save no rodapé da tela (position sticky)
2. **Auto-slug**: quando o usuário digitar o nome, preencher o campo slug em tempo real (com debounce de 500ms)
3. **Save sem reload**: após salvar, atualizar estado local e mostrar toast — remover `window.location.reload()`
4. **Campos obrigatórios claros**: destacar Name e Slug com label diferenciado (já têm `*` mas sem explicação)

### Onboarding Modal — Prioridade Alta

1. **Adicionar step de Products** entre Company e Subscription
2. **Progresso persistente**: salvar em localStorage qual step o usuário completou
3. **Validação antes de Continue**: checar se nome foi preenchido e salvo antes de avançar
4. **Não fechar acidentalmente**: overlay modal com confirmação ao tentar fechar sem completar

### Teams — Prioridade Média

1. **Tutorial de convite**: após gerar link, mostrar instrução "O convidado deve clicar neste link, se cadastrar e aguardar sua aprovação aqui"
2. **Badges de status visuais**: `Pending` (amarelo), `Active` (verde), `Rejected` (vermelho) com ações claras por status

---

## 5. Checklist de Teste Manual

### Fluxo Completo do Advogado

- [ ] Acessar `/sign-up` e criar conta nova
- [ ] Confirmar que redireciona para `/admin` com modal de onboarding
- [ ] Fechar modal acidentalmente — consegue reabrir? Como?
- [ ] Preencher Company Profile — slug é auto-gerado do nome?
- [ ] Salvar Company Profile — aparece toast? Página recarrega?
- [ ] Botão Save visível sem scroll?
- [ ] Avançar para Subscription sem salvar Company — o que acontece?
- [ ] Assinar plano — plataforma desbloqueia imediatamente?
- [ ] Acessar `/products` — o que o advogado vê primeiro?
- [ ] Selecionar B1/B2 → definir preço → ativar produto
- [ ] Botão "Save Configuration" visível após scroll?
- [ ] Mudar preço → navegar para outra página sem salvar — dados perdidos?
- [ ] Copiar checkout link → abrir em aba anônima → fluxo de compra funciona?
- [ ] Ativar Interview Specialist sem definir preços → mensagem de erro?
- [ ] Acessar `/roles` → gerar link de convite → cadastrar com outro usuário → aprovar

### Regressão

- [ ] Login normal ainda funciona após mudanças
- [ ] Customer portal (`/track-my-visa`) não afetado
- [ ] Master dashboard não afetado

---

## 6. Priorização

| Prioridade | Item | Esforço |
|---|---|---|
| 🔴 Crítico | Botão Save sticky em Products | Baixo |
| 🔴 Crítico | Unsaved changes warning em Products | Médio |
| 🔴 Crítico | Adicionar step Products no onboarding wizard | Médio |
| 🟠 Alto | Empty state orientado em Products | Baixo |
| 🟠 Alto | Sticky Save em Company Profile | Baixo |
| 🟠 Alto | Auto-slug em Company Profile | Baixo |
| 🟠 Alto | Remover window.location.reload() do save | Baixo |
| 🟡 Médio | Preview do checkout em Products | Alto |
| 🟡 Médio | Preços de add-ons inline (sem modal) | Médio |
| 🟡 Médio | Tutorial de convite em Teams | Baixo |
| 🟢 Baixo | Badges de status em Teams | Baixo |
| 🟢 Baixo | Remover stats cards do topo de Products | Baixo |
