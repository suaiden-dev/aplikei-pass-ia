# Spec: Permission System (Policy-based ABAC)

## Problema atual

O sistema só distingue papéis (`UserRole`: master / admin / seller / customer) e usa `allowedRoles[]` em rotas.  
Não há como expressar **o que cada papel pode fazer em cada recurso**, nem **condições contextuais** (ex: "admin só vê processos da sua organização").

---

## Modelo de política (o que o usuário mostrou)

```ts
const writerPolicy: Policy[] = [
  {
    actions: ['read'],
    resource: 'post',
  },
  {
    actions: ['create'],
    resource: 'post',
    condition: (user, resource) => resource.organizationId === user.organizationId,
  },
]
```

Uma **policy** é uma lista de regras. Cada regra diz:
- quais **actions** são permitidas (`read`, `create`, `update`, `delete`, `manage`)
- sobre qual **resource** (`post`, `process`, `payment`, `user`, `product`, …)
- sob qual **condition** opcional — função pura `(user, resource?) => boolean`

---

## Tipos centrais

```ts
// src/features/permissions/types.ts

export type Action = 'read' | 'create' | 'update' | 'delete' | 'manage';
// 'manage' = todos os actions acima

export type Resource =
  | 'process'
  | 'payment'
  | 'product'
  | 'coupon'
  | 'user'
  | 'role'
  | 'chat'
  | 'report'
  | 'page';          // page builder

export interface PolicyRule<R = unknown> {
  actions: Action[];
  resource: Resource;
  condition?: (user: UserAccount, resource?: R) => boolean;
}

export type Policy = PolicyRule[];

export type RolePolicies = Record<UserRole, Policy>;
```

`UserAccount` e `UserRole` já existem em `src/features/auth/types.ts`.

---

## Estrutura de arquivos

```
src/features/permissions/
├── types.ts              ← tipos acima
├── policies.ts           ← RolePolicies (um objeto com policy por role)
├── engine.ts             ← can() — função pura que avalia uma regra
├── usePermission.ts      ← hook React: can(action, resource, resourceObj?)
└── PermissionGuard.tsx   ← componente JSX: <PermissionGuard action="create" resource="process">
```

---

## policies.ts — tabela de permissões por role

```ts
// src/features/permissions/policies.ts

import type { RolePolicies } from './types';

export const rolePolicies: RolePolicies = {

  master: [
    { actions: ['manage'], resource: 'process' },
    { actions: ['manage'], resource: 'payment' },
    { actions: ['manage'], resource: 'product' },
    { actions: ['manage'], resource: 'coupon' },
    { actions: ['manage'], resource: 'user' },
    { actions: ['manage'], resource: 'role' },
    { actions: ['manage'], resource: 'chat' },
    { actions: ['manage'], resource: 'report' },
    { actions: ['manage'], resource: 'page' },
  ],

  admin: [
    { actions: ['read', 'update'], resource: 'process' },
    { actions: ['read'],           resource: 'payment' },
    { actions: ['read', 'update'], resource: 'product' },
    { actions: ['read', 'update'], resource: 'coupon' },
    { actions: ['read'],           resource: 'user' },
    { actions: ['read', 'update'], resource: 'role' },
    { actions: ['read', 'create'], resource: 'chat' },
    { actions: ['read'],           resource: 'report' },
    { actions: ['manage'],         resource: 'page' },
  ],

  seller: [
    { actions: ['read'],           resource: 'process' },
    { actions: ['read'],           resource: 'payment' },
    { actions: ['read', 'create'], resource: 'coupon' },
    { actions: ['read', 'create'], resource: 'chat' },
    { actions: ['read'],           resource: 'user',
      condition: (user, resource) => resource?.organizationId === user.organizationId },
  ],

  customer: [
    { actions: ['read'],   resource: 'process',
      condition: (user, resource) => resource?.ownerId === user.id },
    { actions: ['create'], resource: 'process' },
    { actions: ['read'],   resource: 'payment',
      condition: (user, resource) => resource?.ownerId === user.id },
    { actions: ['read', 'create'], resource: 'chat',
      condition: (user, resource) => resource?.participantId === user.id },
  ],

};
```

> **Nota:** `organizationId` não existe ainda no `UserAccount`. A spec prevê adicionar isso  
> quando o modelo de multi-org for implementado. Por ora, as condições com `organizationId`  
> são definidas mas nunca disparam (o campo retorna `undefined`, condição falha safe).

---

## engine.ts — avaliador puro

```ts
// src/features/permissions/engine.ts

import type { Action, Resource, PolicyRule } from './types';
import type { UserAccount } from '../auth/types';
import { rolePolicies } from './policies';

function ruleAllows(
  rule: PolicyRule,
  action: Action,
  resource: Resource,
  resourceObj?: unknown,
  user?: UserAccount,
): boolean {
  const actionMatch =
    rule.actions.includes('manage') || rule.actions.includes(action);

  if (!actionMatch || rule.resource !== resource) return false;

  if (rule.condition) {
    if (!user) return false;
    return rule.condition(user, resourceObj);
  }

  return true;
}

export function can(
  user: UserAccount | null,
  action: Action,
  resource: Resource,
  resourceObj?: unknown,
): boolean {
  if (!user) return false;

  const policy = rolePolicies[user.role] ?? [];

  return policy.some((rule) =>
    ruleAllows(rule, action, resource, resourceObj, user),
  );
}
```

### Características do engine

| Característica | Comportamento |
|---|---|
| Role sem policy | nega tudo (safe-default deny) |
| `manage` action | permite qualquer action daquele resource |
| Condição ausente | aprovação por papel é suficiente |
| Condição presente | papel + condição devem ser `true` |
| `user === null` | nega tudo, sem exceção |
| Múltiplas regras | basta UMA aprovar (`some`) |

---

## usePermission.ts — hook React

```ts
// src/features/permissions/usePermission.ts

import { useAuth } from '../../hooks/useAuth';
import { can } from './engine';
import type { Action, Resource } from './types';

export function usePermission() {
  const { user } = useAuth();

  return {
    can: (action: Action, resource: Resource, resourceObj?: unknown) =>
      can(user, action, resource, resourceObj),
  };
}
```

**Uso:**

```tsx
const { can } = usePermission();

if (can('create', 'process')) { ... }
if (can('read', 'payment', payment)) { ... }   // com condição
```

---

## PermissionGuard.tsx — componente JSX

```tsx
// src/features/permissions/PermissionGuard.tsx

interface Props {
  action: Action;
  resource: Resource;
  resourceObj?: unknown;
  fallback?: React.ReactNode;   // default: null (renderiza nada)
  children: React.ReactNode;
}

export function PermissionGuard({ action, resource, resourceObj, fallback = null, children }: Props) {
  const { can } = usePermission();
  return can(action, resource, resourceObj) ? <>{children}</> : <>{fallback}</>;
}
```

**Uso:**

```tsx
<PermissionGuard action="delete" resource="process">
  <Button variant="destructive">Excluir processo</Button>
</PermissionGuard>

<PermissionGuard action="create" resource="page" fallback={<p>Sem acesso</p>}>
  <Link to="/admin/page-builder">Page Builder</Link>
</PermissionGuard>
```

---

## Integração com o roteador existente

`RoleRoute.tsx` existe mas só verifica role. Criar `PermissionRoute.tsx`:

```tsx
// src/routes/PermissionRoute.tsx

interface Props {
  action: Action;
  resource: Resource;
}

export function PermissionRoute({ action, resource }: Props) {
  const { user } = useAuth();
  const { isLoading } = useAuth();

  if (isLoading) return <RouteGuardLoader />;

  if (!can(user, action, resource)) {
    return <Navigate to={getDefaultRouteForRole(user?.role ?? 'customer')} replace />;
  }

  return <Outlet />;
}
```

**Uso em App.tsx:**

```tsx
<Route element={<PermissionRoute action="manage" resource="page" />}>
  <Route path="page-builder" element={<PageBuilderPage />} />
</Route>
```

---

## Página de gestão no admin (`/admin/permissions`)

Interface visual para o master inspecionar e editar as políticas sem tocar no código.  
**Nesta versão: leitura apenas (exibe a tabela `rolePolicies` em tempo real).**

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Permissões & Acessos                    [Exportar JSON]        │
├─────────────────────────────────────────────────────────────────┤
│  Tabs: [master] [admin] [seller] [customer]                     │
├──────────────┬──────────────────────────────────────────────────┤
│  Resource    │  read  create  update  delete  manage  Condição  │
├──────────────┼──────────────────────────────────────────────────┤
│  process     │   ✓      ✓       ✓       –       –     ownerId  │
│  payment     │   ✓      –       –       –       –      –       │
│  product     │   –      –       –       –       –      –       │
│  ...         │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

- Tab por role
- Uma linha por resource
- Célula com ✓ (verde) / – (cinza) por action
- Coluna "Condição": badge se a regra tem `condition` definida
- Botão "Exportar JSON": serializa `rolePolicies` (sem as funções de condição) para clipboard

---

## Estrutura de arquivos da página

```
src/pages/admin/PermissionsPage/
├── index.tsx                  ← export default PermissionsPage
├── components/
│   ├── PolicyTable.tsx        ← tabela role × resource × action
│   └── RoleTabs.tsx           ← tabs de seleção de role
└── utils/
    └── serialize-policy.ts    ← serializa policy para JSON (sem funções)
```

---

## O que NÃO está no escopo desta versão

- Edição de políticas via UI (só leitura)
- Persistência no banco (políticas ficam no código)
- Políticas por usuário individual (só por role)
- Auditoria de ações (logs de quem fez o quê)
- Políticas dinâmicas vindas do Supabase

---

## Checklist de implementação

- [ ] `src/features/permissions/types.ts`
- [ ] `src/features/permissions/policies.ts`
- [ ] `src/features/permissions/engine.ts`
- [ ] `src/features/permissions/engine.test.ts` ← testar `can()` com casos unitários
- [ ] `src/features/permissions/usePermission.ts`
- [ ] `src/features/permissions/PermissionGuard.tsx`
- [ ] `src/routes/PermissionRoute.tsx`
- [ ] `src/pages/admin/PermissionsPage/index.tsx`
- [ ] Registrar rota `/admin/permissions` em `App.tsx`
- [ ] Adicionar nav item em `AdminDashboardLayout.tsx`
- [ ] Adicionar chave i18n `nav.permissions` nos 3 idiomas
- [ ] Proteger `/admin/page-builder` com `<PermissionRoute action="manage" resource="page" />`
