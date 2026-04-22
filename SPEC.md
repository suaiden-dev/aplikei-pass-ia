# SPEC.md — Refatoração MVC Clean Code
## aplikei-pass-ia

---

## 1. Overview

### 1.1 Projeto Atual
- **Stack:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Estado:** TanStack Query + React Contexts
- **UI:** shadcn/ui + TailwindCSS + Framer Motion
- **i18n:** pt, en, es

### 1.2 Problemas Identificados
1. **Pages** — lógica de negócio misturada com JSX (state, useEffect, services)
2. **Services** — acesso a dados E regras de negócio no mesmo lugar
3. **Contexts** — muita responsabilidade (AuthContext: 170+ linhas)
4. **Models** — incompletos, types espalhados
5. **Sem Repository Layer** — queries Supabase soltas em services

### 1.3 Arquitetura Alvo: MVC Clean Code

```
src/
├── controllers/      # Lógica de página (state, validação, orchestration)
├── models/          # Types/Interfaces do domínio
├── views/           # Componentes React (puros, sem lógica de negócio)
├── services/        # Regras de negócio puras
├── repositories/    # Acesso a dados (queries Supabase)
├── layouts/          # Layouts de página (não muda)
├── routes/           # Rotas (não muda)
└── contexts/         # Estado global (Auth, Notification, Language)
```

---

## 2. Camadas da Arquitetura

### 2.1 Models (`src/models/`)

**Responsabilidade:** Definir TODOS os tipos TypeScript do domínio.

```
src/models/
├── index.ts                    # Exports centralizados
├── user.model.ts               # ✅ Já existe
├── process.model.ts            # UserService, StepData, Status
├── payment.model.ts            # Pagamentos, Orders, Coupons
├── notification.model.ts       # Notification, NotificationTemplate
├── workflow.model.ts           # WorkflowStep, MotionWorkflow, RFEWorkflow
├── ds160.model.ts              # DS160FormValues
├── i539.model.ts              # I539FormValues
└── chat.model.ts               # ChatMessage, ChatThread
```

**Padrão:**
```typescript
// src/models/process.model.ts

export type ProcessStatus =
  | 'pending'
  | 'active'
  | 'awaiting_review'
  | 'completed'
  | 'rejected'
  | 'denied'
  | 'cancelled';

export interface StepData {
  [key: string]: unknown;
}

export interface UserService {
  id: string;
  user_id: string;
  service_slug: string;
  status: ProcessStatus;
  current_step: number | null;
  step_data: StepData;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}
```

### 2.2 Repositories (`src/repositories/`)

**Responsabilidade:** TODAS as queries Supabase. NENHUMA lógica de negócio aqui.

```
src/repositories/
├── index.ts
├── user.repository.ts
├── process.repository.ts
├── payment.repository.ts
├── notification.repository.ts
└── chat.repository.ts
```

**Padrão:**
```typescript
// src/repositories/process.repository.ts
import { supabase } from '../lib/supabase';
import type { UserService, ProcessStatus } from '../models';

export const processRepository = {
  async findById(id: string): Promise<UserService | null> {
    const { data, error } = await supabase
      .from('user_services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as UserService;
  },

  async findByUserAndSlug(userId: string, slug: string): Promise<UserService | null> {
    const { data } = await supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .eq('service_slug', slug)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data as UserService) ?? null;
  },

  async findByUser(userId: string): Promise<UserService[]> {
    const { data, error } = await supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as UserService[]) ?? [];
  },

  async updateStatus(id: string, status: ProcessStatus): Promise<void> {
    const { error } = await supabase
      .from('user_services')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async updateStepData(id: string, stepData: Record<string, unknown>): Promise<void> {
    const { data: current } = await supabase
      .from('user_services')
      .select('step_data')
      .eq('id', id)
      .single();

    const newData = { ...(current?.step_data as object || {}), ...stepData };

    const { error } = await supabase
      .from('user_services')
      .update({ step_data: newData })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};
```

### 2.3 Services (`src/services/`)

**Responsabilidade:** Regras de negócio PURAS. NENHUM acesso direto ao Supabase (usa repository).

```
src/services/
├── index.ts
├── auth.service.ts             # ✅ Já existe, simplificar
├── process.service.ts          # Simplificar, usar repository
├── payment.service.ts          # Simplificar, usar repository
├── notification.service.ts     # Mover lógica de templates para cá
├── ds160.service.ts            # Criar - validação DS160
├── i539.service.ts             # ✅ Já existe, simplificar
└── workflow.service.ts         # Criar - lógica de workflows
```

**Padrão:**
```typescript
// src/services/process.service.ts
import { processRepository } from '../repositories/process.repository';
import { notificationService } from './notification.service';
import type { UserService } from '../models';

function getProcessLink(serviceSlug: string): string {
  return `/dashboard/processes/${serviceSlug}`;
}

export const processService = {
  async getUserServiceBySlug(userId: string, slug: string): Promise<UserService | null> {
    return processRepository.findByUserAndSlug(userId, slug);
  },

  async updateStepData(serviceId: string, data: Record<string, unknown>): Promise<void> {
    return processRepository.updateStepData(serviceId, data);
  },

  async requestStepReview(serviceId: string): Promise<void> {
    const service = await processRepository.findById(serviceId);
    if (!service) throw new Error('Serviço não encontrado');

    await processRepository.updateStatus(serviceId, 'awaiting_review');

    await notificationService.notifyAdmin({
      title: 'Ação necessária: revisar etapa',
      body: `O cliente concluiu uma etapa e aguarda sua revisão.`,
      serviceId,
      userId: service.user_id,
      link: `/admin/processes/${serviceId}`,
    });
  },

  async approveStep(
    serviceId: string,
    nextStep: number,
    isFinal: boolean = false,
    result?: 'approved' | 'denied',
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    const service = await processRepository.findById(serviceId);
    if (!service) throw new Error('Serviço não encontrado');

    const newStepData = {
      ...(service.step_data as Record<string, unknown>),
      ...additionalData,
    };

    if (isFinal && result) {
      newStepData.motion_final_result = result;
    }

    await processRepository.updateStepData(serviceId, newStepData);
    await processRepository.updateStatus(
      serviceId,
      isFinal ? 'completed' : 'active'
    );

    if (service.user_id) {
      await notificationService.notifyClient({
        userId: service.user_id,
        template: isFinal ? 'process_completed_approved' : 'step_approved',
        serviceId,
        link: getProcessLink(service.service_slug),
      });
    }
  },
};
```

### 2.4 Controllers (`src/controllers/`)

**Responsabilidade:** Orquestrar página. State, validação de formulário (Formik), chamadas de serviço. NENHUMA lógica de negócio.

```
src/controllers/
├── index.ts
├── auth.controller.ts
├── dashboard.controller.ts
├── B1B2/
│   ├── index.ts
│   ├── B1B2OnboardingController.ts
│   └── B1B2ProcessDetailController.ts
├── COS/
│   ├── index.ts
│   ├── COSOnboardingController.ts
│   └── COSProcessDetailController.ts
├── F1/
│   ├── index.ts
│   └── F1OnboardingController.ts
├── checkout.controller.ts
├── admin/
│   ├── index.ts
│   ├── AdminDashboardController.ts
│   ├── AdminProcessController.ts
│   └── AdminChatController.ts
└── shared/
    ├── useServiceState.ts      # Hook reutilizável
    └── useStepNavigation.ts   # Hook reutilizável
```

**Padrão:**
```typescript
// src/controllers/B1B2/B1B2OnboardingController.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { processService } from '../../services/process.service';
import { notificationService } from '../../services/notification.service';
import type { UserService } from '../../models';
import type { DS160FormValues } from '../../schemas/ds160.schema';

const INITIAL_VALUES: Partial<DS160FormValues> = {
  homeCountry: 'Brasil',
  securityExceptions: 'nao',
};

interface UseB1B2OnboardingOptions {
  userId: string;
  slug: string;
  serviceId?: string;
}

export function useB1B2OnboardingController({
  userId,
  slug,
  serviceId: initialServiceId,
}: UseB1B2OnboardingOptions) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [procId, setProcId] = useState<string | null>(initialServiceId ?? null);
  const [procStatus, setProcStatus] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [savedValues, setSavedValues] = useState<Partial<DS160FormValues>>(INITIAL_VALUES);

  const loadService = useCallback(async (idParam?: string) => {
    setIsLoading(true);
    try {
      let data: UserService | null = null;

      if (idParam) {
        data = await processService.getServiceById(idParam);
        if (data && (data.user_id !== userId || data.service_slug !== slug)) {
          data = null;
        }
      } else {
        data = await processService.getUserServiceBySlug(userId, slug);
      }

      if (!data) {
        toast.error('Serviço não encontrado');
        navigate('/dashboard');
        return;
      }

      setProcId(data.id);
      setProcStatus(data.status);
      setCurrentStep(data.current_step ?? 0);

      if (data.step_data) {
        if (data.step_data.admin_feedback) {
          setAdminFeedback(data.step_data.admin_feedback as string);
        }
        setSavedValues({ ...INITIAL_VALUES, ...(data.step_data as Partial<DS160FormValues>) });
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar serviço');
    } finally {
      setIsLoading(false);
    }
  }, [userId, slug, navigate]);

  const handleSubmit = useCallback(async (values: Partial<DS160FormValues>) => {
    if (!procId) return;

    try {
      const payload: Record<string, unknown> = { ...values };
      delete payload.admin_feedback;
      delete payload.rejected_items;

      await processService.updateStepData(procId, payload);

      const freshProc = await processService.getServiceById(procId);
      const currentDBStep = freshProc?.current_step ?? 0;

      if (currentDBStep === 0) {
        await processService.approveStep(procId, 1, false);
      }

      await processService.requestStepReview(procId);

      await notificationService.notifyAdmin({
        title: '📝 DS-160 Preenchida',
        body: `O cliente finalizou a DS-160 para ${slug}.`,
        serviceId: procId,
        userId,
        link: `/admin/processes/${procId}`,
      });

      toast.success('Formulário enviado com sucesso!');
      navigate(`/dashboard/processes/${slug}`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar formulário');
    }
  }, [procId, userId, slug, navigate]);

  const handleSaveDraft = useCallback(async (values: Partial<DS160FormValues>) => {
    if (!procId) return;
    try {
      await processService.updateStepData(procId, values as Record<string, unknown>);
      toast.success('Rascunho salvo!');
    } catch {
      toast.error('Erro ao salvar rascunho');
    }
  }, [procId]);

  return {
    isLoading,
    procId,
    procStatus,
    currentStep,
    adminFeedback,
    savedValues,
    loadService,
    handleSubmit,
    handleSaveDraft,
  };
}
```

### 2.5 Views (`src/views/`)

**Responsabilidade:** Componentes React PUROS. Recebem dados via props, emitem eventos via callbacks. NENHUMA lógica de negócio.

```
src/views/
├── components/           # Componentes compartilhados
│   ├── ServiceCard.tsx
│   ├── ProcessCard.tsx
│   └── StepIndicator.tsx
├── dashboard/
│   ├── DashboardView.tsx
│   ├── ActiveProcessCard.tsx
│   └── ServiceCard.tsx
├── onboarding/
│   ├── B1B2OnboardingView.tsx
│   ├── COSOnboardingView.tsx
│   └── steps/
│       ├── DS160StepView.tsx
│       └── PaymentStepView.tsx
└── admin/
    ├── AdminDashboardView.tsx
    └── ProcessDetailView.tsx
```

**Padrão:**
```typescript
// src/views/onboarding/B1B2OnboardingView.tsx
import { Formik, Form } from 'formik';
import { motion } from 'framer-motion';
import { DS160SingleFormStep } from '../components/steps/DS160SingleFormStep';
import type { DS160FormValues } from '../../schemas/ds160.schema';

interface B1B2OnboardingViewProps {
  initialValues: Partial<DS160FormValues>;
  isLoading: boolean;
  procStatus?: string | null;
  currentStep: number;
  stepIdx: number;
  adminFeedback?: string | null;
  onSubmit: (values: Partial<DS160FormValues>) => Promise<void>;
  onSaveDraft: (values: Partial<DS160FormValues>) => Promise<void>;
  onBack: () => void;
  labels: {
    stepLabel: string;
    ds160Form: string;
    saveDraft: string;
    finalizeAndSubmit: string;
    awaitingReview: string;
  };
}

export function B1B2OnboardingView({
  initialValues,
  isLoading,
  procStatus,
  currentStep,
  stepIdx,
  adminFeedback,
  onSubmit,
  onSaveDraft,
  onBack,
  labels,
}: B1B2OnboardingViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validate={ds160Validator}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ isSubmitting, values }) => (
        <Form>
          {/* Admin Feedback Banner */}
          {adminFeedback && stepIdx !== 3 && (
            <AdminFeedbackBanner feedback={adminFeedback} />
          )}

          {/* Form */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl">
            <DS160SingleFormStep />
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <button type="button" onClick={() => onSaveDraft(values)}>
              {labels.saveDraft}
            </button>
            <button type="submit" disabled={isSubmitting}>
              {labels.finalizeAndSubmit}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
```

---

## 3. Convenções de Nomenclatura

| Layer | Sufixo | Exemplo |
|-------|--------|---------|
| Model | `.model.ts` | `process.model.ts` |
| Repository | `.repository.ts` | `process.repository.ts` |
| Service | `.service.ts` | `process.service.ts` |
| Controller | `.controller.ts` | `B1B2Onboarding.controller.ts` |
| View | `.view.tsx` | `B1B2Onboarding.view.tsx` |
| Hook (shared) | `use*.ts` | `useServiceState.ts` |

---

## 4. Estrutura de Arquivos Final

```
src/
├── controllers/              # NOVO
│   ├── index.ts
│   ├── dashboard/
│   │   ├── index.ts
│   │   └── DashboardController.ts
│   ├── B1B2/
│   │   ├── index.ts
│   │   ├── B1B2OnboardingController.ts
│   │   └── B1B2ProcessDetailController.ts
│   ├── COS/
│   │   ├── index.ts
│   │   ├── COSOnboardingController.ts
│   │   └── COSProcessDetailController.ts
│   └── shared/
│       ├── useServiceState.ts
│       └── useStepNavigation.ts
├── models/                   # EXPANDIR
│   ├── index.ts
│   ├── user.model.ts         # ✅ Existe
│   ├── process.model.ts      # NOVO
│   ├── payment.model.ts      # NOVO
│   ├── notification.model.ts # NOVO
│   ├── workflow.model.ts      # NOVO
│   ├── ds160.model.ts        # NOVO
│   └── i539.model.ts          # NOVO
├── repositories/             # NOVO
│   ├── index.ts
│   ├── user.repository.ts
│   ├── process.repository.ts
│   ├── payment.repository.ts
│   └── notification.repository.ts
├── services/                  # REFATORAR
│   ├── index.ts
│   ├── auth.service.ts        # Manter (já razoável)
│   ├── process.service.ts    # Simplificar
│   ├── payment.service.ts     # Simplificar
│   ├── notification.service.ts # Simplificar
│   ├── ds160.service.ts       # NOVO
│   └── i539.service.ts        # Simplificar
├── views/                     # NOVO
│   ├── components/
│   ├── dashboard/
│   ├── onboarding/
│   └── admin/
├── pages/                     # TRANSFORMAR (pages referenciam views + controllers)
│   ├── customer/
│   │   ├── DashboardPage/     # Usa: view + controller
│   │   ├── B1B2OnboardingPage/ # Usa: view + controller
│   │   └── ...
│   └── admin/
├── components/                # MANTER (UI components)
├── contexts/                  # MANTER (estado global)
├── layouts/                   # MANTER
└── routes/                    # MANTER
```

---

## 5. Estratégia de Migração

### 5.1 Princípios
1. **Backward Compatibility** — NÃO quebrar funcionalidades existentes
2. **Incremental** — Uma página por vez
3. **Teste em cada passo** — Rodar testes após cada refatoração

### 5.2 Passos

**Fase 1: Foundation (Sem quebrar nada)**
1. Criar pasta `src/models/` com todos os types
2. Criar pasta `src/repositories/` com queries extraídas
3. Atualizar `src/services/` para usar repositories
4. Criar `src/controllers/` com 1 controller piloto
5. Criar `src/views/` com 1 view piloto

**Fase 2: Dashboard (Pilot)**
1. Criar `DashboardController.ts`
2. Criar `DashboardView.tsx`
3. Modificar `DashboardPage` para usar controller + view
4. Testar se nada quebrou

**Fase 3: B1B2 Onboarding**
1. Criar `B1B2OnboardingController.ts`
2. Criar `B1B2OnboardingView.tsx`
3. Modificar `B1B2OnboardingPage` para usar controller + view

**Fase 4: COS Onboarding (se tempo permitir)**
- Mesmo padrão do B1B2

**Fase 5: Cleanup**
- Remover lógica duplicada
- Garantir que services estão "limpos"
- Documentar padrões

---

## 6. Dependências entre Camadas

```
View (tsx)
  ↓ usa
Controller (TS)
  ↓ usa
Service (TS) + Model (TS)
  ↓ usa
Repository (TS)
  ↓ usa
Supabase Client (lib/supabase)
```

```
View → Controller → Service → Repository → Supabase
  ↓         ↓           ↓
 Hooks   Hooks      Models
```

---

## 7. Critérios de Conclusão

### 7.1 Phase 1 Completo quando:
- [ ] Todos os models criados com types completos
- [ ] Repositories implementados para todas as tabelas
- [ ] Services simplificados (sem queries Supabase diretas)
- [ ] 1 controller + 1 view pilota funcionando

### 7.2 Phase 2 Completo quando:
- [ ] Dashboard completo com controller + view
- [ ] TanStack Query queries migradas para controller
- [ ] Realtime subscriptions no controller
- [ ] Testes passando

### 7.3 Refatoração Total Completa quando:
- [ ] TODAS as páginas usando controller + view
- [ ] Services com responsabilidade única
- [ ] Components são "dumb" (só renderizam)
- [ ] Cobertura de testes > 60%
