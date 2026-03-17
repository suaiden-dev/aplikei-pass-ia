# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite, port 5173)
npm run build        # Production build
npm run build:dev    # Dev-mode build
npm run lint         # ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
```

To run a single test file:
```bash
npx vitest run src/test/unit/checkout-pricing.test.ts
```

## Architecture

This is a Brazilian visa application platform (Aplikei Pass) built with React 18 + TypeScript + Vite, with Supabase as the backend.

### Hexagonal Architecture (mandatory)

The codebase enforces strict layer separation:

- **`src/domain/`** — Business entities and pure rules. No external dependencies allowed.
- **`src/application/`** — Ports (`ports/` — interfaces like `IAuthService`, `IPaymentService`) and use cases. The presentation layer must always depend on these interfaces, not on infrastructure directly.
- **`src/infrastructure/`** — Concrete adapters: `SupabaseAuthService`, `StripePaymentService`, `SupabaseOnboardingRepository`, etc.
- **`src/presentation/`** — React UI layer following Atomic Design:
  - `atoms/` — Base components (Button, Input)
  - `molecules/` — Composed atoms (form fields with labels)
  - `organisms/` — Complex sections (Header, modals)
  - `templates/` — Page layout wrappers (Layout, AdminLayout, UserDashboardLayout)

### Pages (`src/pages/`)

- Public pages: root-level (`Index`, `Login`, `Signup`, `Checkout`, `Services`, etc.)
- `admin/` — Full admin panel (orders, payments, clients, documents, processes)
- `dashboard/` — Authenticated user panel
  - `onboarding/` — Multi-step visa application flows:
    - `steps/visto-b1-b2/` — B1/B2 tourist/business visa (20+ steps)
    - `steps/F1F2/` — F1/F2 student visa
    - `steps/ChangeOfStatus/` — Change of status flow

### Key Contexts

- `AuthContext` — Supabase session; access user as `session.user`. Use `useAuth()` hook.
- `LanguageContext` — Custom i18n with PT/EN translations in `src/i18n/translations.ts`
- `NotificationContext` — In-app notifications

### Admin Access

Use `useAdmin()` hook for permission checks. Admin routes are guarded by `AdminRoute`.

### Supabase Edge Functions (`supabase/functions/`)

Serverless functions for: Stripe checkout/webhook, Zelle checkout/webhook, Parcelow checkout/webhook, Calendly webhook, AI chat (Gemini), notification emails.

## TypeScript Rules

- **`any` is strictly forbidden.** Use `unknown` with safe type casting when needed.
- Always use `interface` or `type` for data contracts.
- All functions, parameters, and return values must be explicitly typed.

## Import Paths

Always use the `@/` alias for absolute imports:
```ts
// Correct
import { Button } from "@/presentation/components/atoms/button";
// Wrong
import { Button } from "../../../components/ui/button";
```

## Tech Stack

- **UI:** shadcn/ui (Radix UI primitives) + Tailwind CSS — design uses dark mode, glassmorphism, and Framer Motion micro-animations
- **Icons:** Lucide React only
- **Forms:** React Hook Form + Zod validation
- **Data fetching:** TanStack React Query v5
- **Payments:** Stripe, Zelle, Parcelow (three separate integrations)
- **Testing:** Vitest + @testing-library/react, test setup in `src/test/setup.ts`
