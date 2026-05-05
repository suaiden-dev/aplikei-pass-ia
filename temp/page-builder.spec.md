# Spec: Admin Page Builder

## Visão geral

Página administrativa para criar e editar landing pages de serviços via interface visual. Dados mockados. A rota vive em `/admin/page-builder`.

---

## Rota e registro

```
App.tsx          →  <Route path="page-builder" element={<PageBuilderPage />} />
AdminDashboard   →  navItem { to: "/admin/page-builder", label: t.nav.pageBuilder, icon: LayoutTemplate }
```

---

## Estrutura de arquivos

```
src/pages/admin/PageBuilderPage/
├── index.tsx                   ← export default PageBuilderPage
├── components/
│   ├── BlockPanel.tsx          ← sidebar esquerda: lista de blocos disponíveis
│   ├── Canvas.tsx              ← área central: blocos adicionados (drag-to-reorder)
│   ├── BlockItem.tsx           ← item renderizado dentro do Canvas
│   ├── InspectorPanel.tsx      ← sidebar direita: configuração do bloco selecionado
│   └── PreviewModal.tsx        ← modal fullscreen: render real da página montada
├── data/
│   └── mock-blocks.ts          ← definições mockadas de tipos de bloco
├── hooks/
│   └── usePageBuilder.ts       ← estado central: blocos na tela, selecionado, ações
└── types.ts                    ← BlockDef, BlockInstance, BlockFieldDef
```

---

## Tipos

```ts
// types.ts

export type FieldType = "text" | "textarea" | "image_url" | "color" | "select" | "boolean";

export interface BlockFieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];          // para select
  defaultValue?: unknown;
}

export interface BlockDef {
  type: string;                // "hero" | "faq" | "features" | "cta" | "testimonials"
  label: string;
  icon: string;                // nome do ícone ri (ex: "RiLayoutLine")
  fields: BlockFieldDef[];
  previewComponent: React.ComponentType<Record<string, unknown>>;
}

export interface BlockInstance {
  id: string;                  // uuid gerado localmente
  type: string;
  props: Record<string, unknown>;
}
```

---

## Blocos mockados (mock-blocks.ts)

| type           | label             | Campos configuráveis                                      |
|----------------|-------------------|------------------------------------------------------------|
| `hero`         | Hero Section      | título, subtítulo, label do botão, cor de fundo           |
| `features`     | Funcionalidades   | título da seção, lista de 3 items (icon + texto)          |
| `testimonials` | Depoimentos       | título, 3 cards (autor, texto, nota 1-5)                  |
| `faq`          | FAQ               | título, lista de perguntas/respostas                      |
| `cta`          | Call to Action    | título, subtítulo, label do botão, destino (/checkout/:slug) |

Todos os valores têm `defaultValue` preenchido para que a preview seja imediata.

---

## Hook `usePageBuilder`

```ts
interface PageBuilderState {
  blocks: BlockInstance[];          // ordem = ordem na página
  selectedId: string | null;
  isPreviewOpen: boolean;
}

// Ações
addBlock(type: string): void        // insere no final com valores default
removeBlock(id: string): void
moveBlock(id: string, direction: "up" | "down"): void
selectBlock(id: string | null): void
updateProp(id: string, key: string, value: unknown): void
openPreview(): void
closePreview(): void
```

Estado totalmente local (useState). Sem persistência nesta versão.

---

## Layout da página

```
┌──────────────────────────────────────────────────────────┐
│  Header  "Page Builder"   [Visualizar] [Salvar (disabled)]│
├──────────────┬──────────────────────────┬────────────────┤
│  BlockPanel  │        Canvas            │ InspectorPanel │
│  (240px)     │  (flex-1, scroll)        │  (320px)       │
│              │                          │                │
│  ┌────────┐  │  ┌──────────────────┐    │  ── sem seleção│
│  │ Hero   │  │  │ [Hero Block]  ↑↓🗑│    │     → dica     │
│  │ FAQ    │  │  │ [CTA Block]   ↑↓🗑│    │                │
│  │ Features│  │  │               ↑↓🗑│    │  ── selecionado│
│  │  ...   │  │  └──────────────────┘    │  → campos do   │
│  └────────┘  │                          │    bloco       │
│  clique      │  drop zone vazia         │                │
│  = adiciona  │  (drag-to-reorder)       │                │
└──────────────┴──────────────────────────┴────────────────┘
```

- Colunas fixas, layout `flex h-[calc(100vh-64px)]`.
- Canvas com `overflow-y-auto`.
- BlockPanel: scroll se necessário.
- InspectorPanel: scroll independente.

---

## BlockPanel

- Lista vertical com ícone + label de cada `BlockDef`.
- Clique → `addBlock(type)`.
- Sem drag-from-panel nesta versão (simplifica).

---

## Canvas

- Lista os `BlockInstance[]` com `AnimatePresence` (framer-motion, fade+slide).
- Cada item mostra:
  - **Thumbnail preview** do próprio bloco (escala reduzida ~30% via `transform: scale(0.3)` em container clampado).
  - Label do tipo à esquerda.
  - Botões: `↑` `↓` `🗑` à direita.
  - Borda highlight quando `selectedId === block.id`.
- Clique no item → `selectBlock(id)`.
- Drag-to-reorder: `@dnd-kit/core` + `@dnd-kit/sortable` (já deve estar disponível ou instalar).

---

## InspectorPanel

- Se `selectedId === null`: placeholder "Selecione um bloco no canvas".
- Se selecionado: renderiza campos do `BlockDef.fields` com inputs conforme `FieldType`:
  - `text` / `textarea` → `<Input>` / `<Textarea>` do atoms
  - `color` → `<input type="color">` com preview da cor
  - `select` → `<Select>` do atoms
  - `boolean` → `<Checkbox>` do atoms
  - `image_url` → `<Input>` + thumbnail preview da URL
- Cada mudança chama `updateProp(selectedId, key, value)` → atualiza em tempo real.

---

## PreviewModal

- Abre quando clica em **Visualizar**.
- `<Dialog>` fullscreen (sem padding, `max-w-none w-screen h-screen`).
- Toolbar interna com botões de viewport:
  - 📱 Mobile (375 px)
  - 💻 Tablet (768 px)  
  - 🖥 Desktop (100%)
- Conteúdo: `<iframe srcdoc={...}>` **OU** renderiza direto em div com `overflow-y-auto` e largura controlada por estado.
  - Preferir renderização direta (não iframe) para reutilizar contexto React.
- Sequência de blocos renderizados usando `block.previewComponent` com `block.props`.
- Botão **Fechar** no canto superior direito.

---

## Preview dos blocos (previewComponent)

Cada BlockDef tem um `previewComponent` simples e auto-contido que recebe os props e renderiza HTML real com Tailwind. Não depende de hooks externos. Exemplos:

```tsx
// HeroPreview
export function HeroPreview({ title, subtitle, buttonLabel, bgColor }) {
  return (
    <section style={{ background: bgColor }} className="py-24 px-8 text-center">
      <h1 className="text-5xl font-black">{title}</h1>
      <p className="mt-4 text-lg text-text-muted">{subtitle}</p>
      <button className="mt-8 px-8 py-3 bg-primary text-white rounded-full font-bold">
        {buttonLabel}
      </button>
    </section>
  );
}
```

---

## Estado inicial (seed)

Ao montar a página, o canvas já começa com 2 blocos para demonstrar:
1. `hero` com valores default
2. `cta` com valores default

---

## O que NÃO está no escopo desta versão

- Persistência (banco / localStorage)
- Upload real de imagem (aceitar URL)
- Publicação da página
- Multi-página / múltiplos templates
- Undo/redo
- Drag do painel de blocos para canvas (só clique)

---

## Dependências

| Pacote | Já instalado? | Uso |
|--------|--------------|-----|
| `framer-motion` | ✓ | Animação dos blocos no canvas |
| `@dnd-kit/core` + `@dnd-kit/sortable` | verificar | Drag-to-reorder no canvas |
| `react-icons/ri` | ✓ | Ícones dos blocos |

Verificar `@dnd-kit` no package.json antes de instalar.

---

## Checklist de implementação

- [ ] `temp/page-builder.spec.md` (este arquivo)
- [ ] `types.ts`
- [ ] `data/mock-blocks.ts` + preview components dos 5 blocos
- [ ] `hooks/usePageBuilder.ts`
- [ ] `components/BlockPanel.tsx`
- [ ] `components/BlockItem.tsx`
- [ ] `components/Canvas.tsx` (com dnd-kit)
- [ ] `components/InspectorPanel.tsx`
- [ ] `components/PreviewModal.tsx`
- [ ] `pages/admin/PageBuilderPage/index.tsx`
- [ ] Registrar rota em `App.tsx`
- [ ] Registrar nav item em `AdminDashboardLayout.tsx`
- [ ] Adicionar chave `pageBuilder` no i18n (pt/en/es)
