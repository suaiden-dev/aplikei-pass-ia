# Regras e Padrões do Projeto - Aplikei

Este documento define as diretrizes técnicas e arquiteturais que devem ser seguidas em todo o desenvolvimento do projeto Aplikei. **Todas as interações e novos códigos devem respeitar rigorosamente estas regras.**

---

## 1. Arquitetura Hexagonal (Ports & Adapters)

O projeto segue a separação de responsabilidades em camadas:

- **Domain (`src/domain/`)**: Contém as entidades de negócio e regras puras. Não deve ter dependências externas.
- **Application (`src/application/`)**: Define as "Portas" (`ports/`) - interfaces que definem como o sistema interage com o mundo externo - e os "Casos de Uso".
- **Infrastructure (`src/infrastructure/`)**: Contém as implementações reais ("Adaptadores"). Ex: `SupabaseAuthService`, `SupabaseOnboardingRepository`.
- **Presentation (`src/presentation/`)**: Camada visual (React). Contém componentes, hooks de interface e contextos.

> [!IMPORTANT]
> A lógica de negócio deve ser agnóstica à infraestrutura. Sempre utilize as interfaces definidas em `application/ports` na camada de apresentação.

---

## 2. Design Atômico (UI)

Os componentes de interface devem ser organizados em `src/presentation/components/`:

- **Atoms**: Componentes base (Botões, Inputs, Badges).
- **Molecules**: Combinação de átomos (Campos de formulário com label, busca).
- **Organisms**: Seções complexas e funcionais (Header, Sidebar, Modais de Processo).
- **Templates**: Layouts de página que definem a estrutura visual.

---

## 3. Padrões de Código e TypeScript

### 🛑 Proibição do `any`
- **É estritamente proibido o uso do tipo `any`**.
- Toda e qualquer variável, parâmetro ou retorno deve possuir tipagem explícita.
- Utilize `interface` ou `type` para definir contratos de dados.
- Caso um tipo seja desconhecido de bibliotecas externas, utilize `unknown` e realize o type casting seguro.

### Importações
- Utilize sempre caminhos absolutos baseados no alias `@/`.
- Exemplo: `import { Button } from "@/presentation/components/atoms/button";` em vez de caminhos relativos como `../../../components/ui/button`.

### Estado e Autenticação
- O `useAuth` fornece `session`. Acesse o usuário sempre via `session.user`.
- Verificações de permissão devem utilizar o hook `useAdmin`.

---

## 4. Tecnologias e Estética

- **Framework**: React com TypeScript e Vite.
- **UI**: Tailwind CSS para estilização e Framer Motion para animações.
- **Ícones**: Lucide React.
- **Banco/Auth**: Supabase.
- **Design**: Manter estética "Premium" com modo escuro robusto, vidromorfismo (glassmorphism) e micro-interações suaves.

---

## 5. Fluxo de Trabalho com IA

Sempre que solicitar ou implementar uma nova funcionalidade:
1. Verifique se a lógica de dados pertence ao `domain`.
2. Verifique se o componente de UI está no nível correto do Design Atômico.
3. Garanta que todas as novas funções e componentes estejam 100% tipados.
