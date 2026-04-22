# MVC Clean Architecture - Padrões e Convenções

## Visão Geral

Este documento descreve os padrões e convenções estabelecidos durante a refatoração do projeto para MVC Clean Architecture.

---

## Estrutura de Diretórios

```
src/
├── controllers/      # Lógica de página (hooks React)
├── models/          # Tipos e interfaces TypeScript
├── repositories/     # Acesso a dados (Supabase)
├── services/        # Regras de negócio
├── views/           # Componentes React puros
├── pages/           # Glue code (usa controller + view)
├── components/      # Componentes UI compartilhados
├── contexts/        # Estado global
├── layouts/         # Layouts de página
└── hooks/           # Hooks reutilizáveis
```

---

## Camadas da Arquitetura

### 1. Models (`src/models/`)

**Responsabilidade:** Definir TODOS os tipos TypeScript do domínio.

**Padrão:**
```typescript
// src/models/process.model.ts
export type ProcessStatus = 'pending' | 'active' | 'completed' | 'rejected';

export interface UserService {
  id: string;
  user_id: string;
  service_slug: string;
  status: ProcessStatus;
  current_step: number | null;
  step_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

**Arquivos:**
- `process.model.ts` - Processos e serviços
- `payment.model.ts` - Pagamentos e cupons
- `notification.model.ts` - Notificações
- `workflow.model.ts` - Workflows (Motion/RFE)
- `chat.model.ts` - Mensagens de chat
- `user.model.ts` - Usuários

---

### 2. Repositories (`src/repositories/`)

**Responsabilidade:** TODAS as queries ao Supabase. NENHUMA lógica de negócio aqui.

**Padrão:**
```typescript
// src/repositories/process.repository.ts
import { supabase } from '../lib/supabase';
import type { UserService } from '../models';

export const processRepository = {
  async findById(id: string): Promise<UserService | null> {
    const { data, error } = await supabase
      .from('user_services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[processRepository.findById]', error);
      return null;
    }

    return data as UserService;
  },
  // ... outros métodos
};
```

**Arquivos:**
- `user.repository.ts`
- `process.repository.ts`
- `payment.repository.ts`
- `notification.repository.ts`
- `chat.repository.ts`

**Regras:**
- Cada método deve fazer APENAS acesso a dados
- Nenhuma lógica de validação ou negócio
- Logging de erros para debugging
- Retornar tipos do Model, não do banco diretamente

---

### 3. Services (`src/services/`)

**Responsabilidade:** Regras de negócio PURAS. USAM repositories para acesso a dados.

**Padrão:**
```typescript
// src/services/process.service.ts
import { processRepository } from '../repositories/process.repository';
import { notificationService } from './notification.service';
import type { UserService } from '../models';

export const processService = {
  async getUserServiceBySlug(userId: string, slug: string): Promise<UserService | null> {
    return processRepository.findByUserAndSlug(userId, slug);
  },

  async approveStep(serviceId: string, nextStep: number): Promise<void> {
    const service = await processRepository.findById(serviceId);
    if (!service) throw new Error('Serviço não encontrado');

    // Lógica de negócio
    await processRepository.updateStep(serviceId, nextStep, 'active');

    // Notificações (lógica de negócio)
    await notificationService.notifyClient({
      userId: service.user_id,
      template: 'step_approved',
      // ...
    });
  },
};
```

**Regras:**
- USAM repositories para acesso a dados
- Contêm lógica de negócio (validações, notificações)
- NENHUMA query direta ao Supabase
- NENHUMA lógica de UI ou estado React

---

### 4. Controllers (`src/controllers/`)

**Responsabilidade:** Orquestrar a página. State, validação de formulário, chamadas de serviço. NENHUMA lógica de negócio.

**Padrão:**
```typescript
// src/controllers/dashboard/DashboardController.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { processService } from '../services/process.service';
import type { UserService } from '../models';

export interface DashboardLabels {
  title: string;
  sections: Record<string, string>;
}

export interface UseDashboardControllerOptions {
  userId: string | undefined;
  labels: DashboardLabels;
}

export interface UseDashboardControllerResult {
  activeProcesses: UserService[];
  isLoading: boolean;
  refetch: () => void;
}

export function useDashboardController({
  userId,
}: UseDashboardControllerOptions): UseDashboardControllerResult {
  const { data: userServices = [], isLoading } = useQuery({
    queryKey: ['user-services', userId],
    queryFn: () => processService.getUserServices(userId!),
    enabled: !!userId,
  });

  const activeProcesses = userServices.filter(
    s => s.status === 'active' || s.status === 'awaiting_review'
  );

  return { activeProcesses, isLoading, refetch: () => {} };
}
```

**Arquivos:**
- `dashboard/DashboardController.ts`
- `B1B2/B1B2OnboardingController.ts`
- `COS/COSOnboardingController.ts`
- `F1/F1OnboardingController.ts`
- `MyProcesses/MyProcessesController.ts`
- `ProcessDetail/ProcessDetailController.ts`
- `Checkout/CheckoutController.ts`

**Regras:**
- São hooks React (custom hooks)
- Gerenciam estado local com `useState`
- Fazem queries com `@tanstack/react-query`
- Chamam services para lógica de negócio
- NENHUMA renderização de UI

---

### 5. Views (`src/views/`)

**Responsabilidade:** Componentes React PUROS. Recebem dados via props, emitem eventos via callbacks. NENHUMA lógica de negócio.

**Padrão:**
```typescript
// src/views/dashboard/DashboardView.tsx
import { Link } from 'react-router-dom';
import { ActiveProcessCard } from './ActiveProcessCard';

interface DashboardViewProps {
  activeProcesses: Array<{
    proc: { id: string; service_slug: string };
    progress: number;
    isApproved: boolean;
  }>;
  isLoading: boolean;
  onRefresh: () => void;
}

export function DashboardView({
  activeProcesses,
  isLoading,
}: DashboardViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {activeProcesses.map((item) => (
        <ActiveProcessCard key={item.proc.id} {...item} />
      ))}
    </div>
  );
}
```

**Arquivos:**
- `dashboard/DashboardView.tsx`
- `dashboard/ActiveProcessCard.tsx`
- `dashboard/ServiceCard.tsx`
- `onboarding/B1B2OnboardingView.tsx`
- `components/AdminFeedbackBanner.tsx`

**Regras:**
- Recebem dados APENAS via props
- Emitem eventos via callbacks (onClick, onSubmit, etc.)
- NENHUM useState, useEffect, useQuery
- NENHUMA chamada direta a services ou repositories
- Componentes "dumb" (puros)

---

### 6. Pages (`src/pages/`)

**Responsabilidade:** Glue code. Usam controller + view. Mínimo código possível.

**Padrão:**
```typescript
// src/pages/customer/DashboardPage/index.tsx
import { useAuth } from '../../../hooks/useAuth';
import { useT } from '../../../i18n';
import { useDashboardController } from '../../../controllers/dashboard/DashboardController';
import { DashboardView } from '../../../views/dashboard/DashboardView';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const t = useT('dashboard');

  const {
    activeProcesses,
    isLoading,
  } = useDashboardController({
    userId: user?.id,
    labels: t,
  });

  return (
    <DashboardView
      activeProcesses={activeProcesses}
      isLoading={isLoading}
    />
  );
}
```

---

## Fluxo de Dados

```
User Action (View)
    ↓ callback
Page (Glue Code)
    ↓ hook call
Controller (State + Orchestration)
    ↓ service call
Service (Business Logic)
    ↓ repository call
Repository (Data Access)
    ↓
Supabase
```

---

## Convenções de Nomenclatura

| Layer | Sufixo | Exemplo |
|-------|--------|---------|
| Model | `.model.ts` | `process.model.ts` |
| Repository | `.repository.ts` | `process.repository.ts` |
| Service | `.service.ts` | `process.service.ts` |
| Controller | `.controller.ts` | `Dashboard.controller.ts` |
| Controller Hook | `useXController` | `useDashboardController` |
| View | `.view.tsx` | `Dashboard.view.tsx` |

---

## Regras de Dependência

```
View → Controller → Service → Repository → Supabase
 ↓         ↓           ↓
 Hooks   Models    Models
```

**NUNCA faça:**
- View chamando Service diretamente
- Controller fazendo query direta ao Supabase
- Service importando de pages
- Repository importando de services

---

## Criando uma Nova Feature (Passo a Passo)

### 1. Criar Model
```typescript
// src/models/feature.model.ts
export interface FeatureData {
  id: string;
  name: string;
  // ...
}
```

### 2. Criar Repository
```typescript
// src/repositories/feature.repository.ts
import { supabase } from '../lib/supabase';
import type { FeatureData } from '../models';

export const featureRepository = {
  async findById(id: string): Promise<FeatureData | null> {
    // ...
  },
};
```

### 3. Criar/Atualizar Service
```typescript
// src/services/feature.service.ts
import { featureRepository } from '../repositories/feature.repository';

export const featureService = {
  async getFeature(id: string): Promise<FeatureData | null> {
    return featureRepository.findById(id);
  },
};
```

### 4. Criar Controller
```typescript
// src/controllers/feature/FeatureController.ts
import { useQuery } from '@tanstack/react-query';
import { featureService } from '../../services/feature.service';

export function useFeatureController(featureId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['feature', featureId],
    queryFn: () => featureService.getFeature(featureId),
    enabled: !!featureId,
  });

  return { feature: data, isLoading };
}
```

### 5. Criar View
```typescript
// src/views/feature/FeatureView.tsx
interface FeatureViewProps {
  feature: FeatureData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function FeatureView({ feature, isLoading }: FeatureViewProps) {
  if (isLoading) return <Skeleton />;
  if (!feature) return <NotFound />;
  return <FeatureCard {...feature} />;
}
```

### 6. Usar no Page
```typescript
// src/pages/feature/FeaturePage/index.tsx
import { useFeatureController } from '../../controllers/feature/FeatureController';
import { FeatureView } from '../../views/feature/FeatureView';

export default function FeaturePage() {
  const { feature, isLoading } = useFeatureController('123');
  return <FeatureView feature={feature} isLoading={isLoading} />;
}
```

---

## Troubleshooting

### Erro: "Cannot find module"
Verifique se o arquivo está exportando corretamente e se o path está correto.

### Erro: "Property does not exist on type"
Verifique se o Model está corretamente tipado e exportado.

### Erro: "Hook cannot be called inside a callback"
Hooks só podem ser usados no topo de componentes React ou outros hooks.

### Build failing com erros de tipos
1. Verifique se todos os Models estão exportados em `src/models/index.ts`
2. Verifique se os Repositories estão exportados em `src/repositories/index.ts`
3. Limpe o cache: `rm -rf node_modules/.cache`
