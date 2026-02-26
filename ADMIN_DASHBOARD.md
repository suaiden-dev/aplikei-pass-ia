# Dashboard Admin — Documentação & Progresso

Este documento centraliza as funcionalidades, a arquitetura e o status de implementação do Painel Administrativo da Aplikei.

## 🏗️ Arquitetura
- **Localização**: `/admin/*`
- **Layout**: `AdminLayout.tsx` (Sidebar persistente + Header).
- **Segurança**: Protegido por `AdminRoute.tsx` e verificação de e-mail admin via `useAdmin.ts`.
- **Componentes**: Utiliza Shadcn UI + componentes customizados (`AdminDataTable`, `AdminStatCard`).

---

## ✅ Progresso de Implementação

### Fase 1: Infraestrutura + Overview (Concluído)
- [x] Criar hook useAdmin e AdminRoute (Proteção)
- [x] Criar Layout Admin com Sidebar e Header
- [x] Criar Página Dashboard (Overview KPIs)

### Fase 2: Gestão de Pedidos & Pagamentos (Concluído)
- [x] Criar Página Pedidos (Lista e Filtros)
- [x] Criar Página Detalhes do Pedido (Ações e Aprovações)
- [x] Criar Página Pagamentos (Fila de Verificação Zelle)

### Fase 3: Clientes & Documentos (Concluído)
- [x] Criar Página Clientes (Lista e Busca)
- [x] Criar Página Detalhes do Cliente (Perfil e Arquivos)
- [x] Criar Página Documentos (Fila de Uploads)

---

## 📅 Próximas Fases

### Fase 4: Sellers & Comissões (Pendente)
- [ ] Criar Página Sellers (Lista e Gestão)
- [ ] Criar Página Comissões (Dashboard e Saques)

### Fase 5: Parceiros Globais & Contratos (Pendente)
- [ ] Criar Página Parceiros (Aplicações e Gestão)
- [ ] Criar Página Contratos (Templates e Assinaturas)

### Fase 6: Recorrências & Produtos (Pendente)
- [ ] Criar Página Recorrências (EB-3 e Scholarships)
- [ ] Criar Página Produtos e Cupons (CRUD)

---

## 🔧 Notas Técnicas
- **Supabase**: Utiliza o cliente gerado em `@/integrations/supabase/client`.
- **Tipagem**: Sincronizado com `src/integrations/supabase/types.ts`.
- **Design**: Focado em produtividade admin, utilizando cores sóbrias e feedbacks visuais claros (Toast/Badges).
