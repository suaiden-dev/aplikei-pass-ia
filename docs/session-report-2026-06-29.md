# Session Report — 2026-06-29

Branch: `feat/admin-onboarding`

---

## 1. Revert "1º Processo Grátis" Promotion

Removed all code related to the "Primeiro Processo Grátis" promotional feature that had been partially implemented but never deployed.

- Removed promo banner from `OverviewPage`
- Removed `✨ 1º Processo Grátis Ativo` badge from `ProductsPage`
- No migration was ever applied to Supabase, so no rollback needed

---

## 2. Admin Lawyer Dashboard — Major Improvements

### Empty State
When `admin_lawyer` has zero processes, the dashboard now shows an `EmptyDashboardState` instead of empty charts.

- **With active services configured:** Shows "Your office is ready!" + checkout link + copy button
- **Without active services:** Shows "Almost there!" + "Set up your services" CTA button (no checkout link — nothing to sell)

### Checkout Link Widget
When the office already has processes, a `CheckoutLinkCard` widget appears below the stat cards showing the direct checkout URL with a one-click copy button.

### "Awaiting Payment" Stat Card
Added a new stat card for `admin_lawyer` showing the count of orders with `payment_status = "pending"`.

**Files changed:**
- `src/features/offices/hooks/useOfficeSlug.ts` — new hook to fetch office slug
- `src/features/offices/hooks/useOfficeHasActiveProducts.ts` — new hook to check if office has at least one active service with price > 0
- `src/features/offices/types/office.ts` — added `pendingPayments` to `OfficeStats`
- `src/features/offices/hooks/useOfficeOverview.ts` — computes `pendingPayments` from orders
- `src/features/admin/pages/OverviewPage/index.tsx` — all UI changes above

### No Active Services Alert
When `admin_lawyer` has processes but no active services configured, a warning banner appears at the top of the dashboard with a "Configure →" link to `/admin/services`.

---

## 3. "Products" → "Services" Rename

Renamed the sidebar item and route from "Products" to "Services" throughout the app.

- `src/app/router/appRoutes.tsx` — path `/products` → `/services`, title `"Products"` → `"Services"`
- `src/app/layouts/RoleDashboardLayout.tsx` — updated `subscriptionLockedPaths`

---

## 4. Page Builder — Back Button & Exit Removal

- Added a "← Back" button before the "Landing Builder" title in the Page Builder header
- Removed the "Exit" button from the bottom of the Builder sidebar

**Files changed:**
- `src/features/page-builder/pages/PageBuilderPage/index.tsx`
- `src/features/page-builder/pages/PageBuilderPage/components/BuilderSidebar.tsx`

---

## 5. Finance Analytics — OFFICE CONTEXT Badge Spacing

Fixed cramped text in the `OFFICE CONTEXT` badge on the Finance Analytics page.

- `px-2 py-0.5` → `px-3 py-1 tracking-wider`

**File:** `src/features/admin/pages/FinanceAnalyticsPage/index.tsx`

---

## 6. Checkout — Zelle UX Redesign

Redesigned the Zelle payment section in `CheckoutPage` to match the MatriculaUSA UX pattern.

### Before
A static box showing name/email/phone with a plain file upload and no guidance.

### After
Three numbered steps with clear instructions:

1. **Open your Zelle app** — with subtitle explaining bank app or standalone app
2. **Send the exact amount** — email card with one-click copy button + amount card + red danger warning ("Send exactly $X.XX — wrong amounts delay approval")
3. **Upload your payment receipt** — existing drag-and-drop upload preserved

Additional improvements:
- `ZelleEmailCopyCard` component — `font-mono` display, copy button with `RiFileCopyLine` → `RiCheckLine` icon swap + toast "Copied!" feedback
- Processing overlay — when `isRedirecting === true` after submit, a full-screen `backdrop-blur` overlay with spinner appears
- Both the left panel (sidebar summary) and right panel (main form) were updated

**File:** `src/features/payments/pages/CheckoutPage/index.tsx`

---

## 7. Playwright E2E Tests

Created 14 automated tests covering all dashboard improvements.

**Files:**
- `tests/e2e/support/admin-lawyer-dashboard.ts` — mock helper that intercepts Supabase REST API calls
- `tests/e2e/admin-lawyer-dashboard.spec.ts` — test suite

### Test coverage
| Suite | Tests |
|---|---|
| Empty State | Empty state renders, checkout link with slug, "Almost there!" CTA, copy button feedback |
| With Processes | Charts don't appear when empty, checkout link widget visible |
| Pending Payments StatCard | Shows count, shows 0 when none |
| Products Alert | Alert shows/hides, links to `/admin/services` |
| Promotion Removal | No promo banner on dashboard, no badge on services page |
| Finance Analytics | OFFICE CONTEXT badge is visible and has adequate width (>100px) |

---

## 8. Git Hygiene

- Added `test-results/` to `.gitignore` (was polluting git with 130+ Playwright error markdown files)
- Added `.claude/settings.local.json` to `.gitignore`
- Ran `git rm -r --cached test-results/` to untrack already-committed files
