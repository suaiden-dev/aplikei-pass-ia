#!/bin/bash
set -e

# ─── 1. i18n ──────────────────────────────────────────────────────────────────
git add \
  src/app/i18n/locales/en/admin.ts \
  src/app/i18n/locales/pt/admin.ts \
  src/app/i18n/types.ts
git commit -m "chore: update i18n types and admin translations"

# ─── 2. Auth ─────────────────────────────────────────────────────────────────
git add \
  src/features/auth/types.ts \
  src/features/auth/services/authService.ts \
  src/features/auth/services/mockAuthService.ts \
  src/features/auth/pages/LoginPage.tsx \
  src/features/auth/pages/SignUpPage.tsx \
  src/features/auth/pages/ForgotPasswordPage.tsx \
  src/features/auth/pages/ResetPasswordPage.tsx
git commit -m "feat: update auth service and pages"

# ─── 3. Router e guards ───────────────────────────────────────────────────────
git add \
  src/app/router/appRoutes.tsx \
  src/app/router/authGuard.ts \
  src/app/router/authGuard.test.ts \
  src/app/router/authRedirect.ts \
  src/app/router/authRedirect.test.ts
git commit -m "feat: update routes and auth guards"

# ─── 4. Layouts e providers ───────────────────────────────────────────────────
git add \
  src/app/layouts/AdminDashboardLayout.tsx \
  src/app/layouts/AuthLayout.tsx \
  src/app/layouts/CustomerLayout.tsx \
  src/app/layouts/MasterDashboardLayout.tsx \
  src/app/layouts/RoleDashboardLayout.tsx \
  src/app/layouts/SellerDashboardLayout.tsx \
  src/app/providers/NotificationProvider.tsx \
  src/shared/components/organisms/DashboardNavbar.tsx \
  src/shared/components/organisms/PublicNavbar.tsx
git commit -m "feat: update layouts and navbar"

# ─── 5. Offices ───────────────────────────────────────────────────────────────
git add \
  src/features/offices/types/office.ts \
  src/features/offices/types/index.ts \
  src/features/offices/services/officeOps.ts \
  src/features/offices/pages/OfficesPage/index.tsx \
  src/features/offices/pages/OfficeDetailsPage/index.tsx
git commit -m "feat: update offices types, service and pages"

# ─── 6. Notifications e chat ─────────────────────────────────────────────────
git add \
  src/features/notifications/lib/localizeNotification.ts \
  src/features/notifications/services/notify.ts \
  src/features/chat/hooks/useCustomerChats.ts \
  src/features/chat/services/eligibility.ts
git commit -m "feat: update notification and chat services"

# ─── 7. Legal ────────────────────────────────────────────────────────────────
git add \
  src/features/legal/services/legalTermsService.ts \
  src/features/legal/types.ts \
  src/features/legal/pages/LegalLayout.tsx \
  src/features/legal/pages/Privacy/index.tsx \
  src/features/legal/pages/Terms/index.tsx
git commit -m "feat: extract legal service and update pages"

# ─── 8. Marketing / Homepage ─────────────────────────────────────────────────
git add \
  src/features/marketing/types.ts \
  src/features/marketing/pages/HomePage/index.tsx
git commit -m "feat: homepage redesign"

# ─── 9. Seller ───────────────────────────────────────────────────────────────
git add \
  src/features/seller/services/earningsService.ts \
  src/features/seller/types.ts \
  src/features/seller/pages/EarningsPage/index.tsx
git commit -m "feat: extract seller service and update earnings page"

# ─── 10. Payments ────────────────────────────────────────────────────────────
git add \
  src/features/payments/services/checkoutPageService.ts \
  src/features/payments/services/checkoutSuccessService.ts \
  src/features/payments/pages/CheckoutPage/index.tsx \
  src/features/payments/pages/CheckoutSuccessPage/index.tsx \
  src/features/payments/pages/OfficeCheckoutPage/index.tsx
git commit -m "feat: extract payment services and update checkout pages"

# ─── 11. Process ─────────────────────────────────────────────────────────────
git add \
  src/features/process/services/caseOnboardingService.ts \
  src/features/process/services/officeNamesService.ts \
  src/features/process/services/processDetailService.ts \
  src/features/process/types.ts \
  src/features/process/pages/CaseOnboardingPage.tsx \
  src/features/process/pages/MyProcessesPage/index.tsx \
  src/features/process/pages/ProcessDetailPage/index.tsx
git commit -m "feat: extract process services and update pages"

# ─── 12. Onboarding ──────────────────────────────────────────────────────────
git add \
  src/features/onboarding/services/addressLookupService.ts \
  src/features/onboarding/services/cosOnboardingService.ts \
  src/features/onboarding/services/finalPreparationService.ts \
  src/features/onboarding/services/interviewTrainingService.ts \
  src/features/onboarding/services/onboardingProcessDataService.ts \
  src/features/onboarding/services/onboardingStorageService.ts \
  src/features/onboarding/types.ts \
  src/features/onboarding/b1b2/pages/B1B2OnboardingPage/steps/B1B2FinalPreparationStep.tsx \
  src/features/onboarding/b1b2/pages/B1B2OnboardingPage/steps/B1B2MRVPaymentStep.tsx \
  src/features/onboarding/b1b2/pages/B1B2OnboardingPage/steps/B1B2UserReviewSignStep.tsx \
  src/features/onboarding/b1b2/pages/B1B2OnboardingPage/steps/DS160SingleFormStep.tsx \
  src/features/onboarding/cos/pages/COSOnboardingPage/I20UploadStep.tsx \
  src/features/onboarding/cos/pages/COSOnboardingPage/I539FormStep.tsx \
  src/features/onboarding/cos/pages/COSOnboardingPage/MotionWorkflow.tsx \
  src/features/onboarding/cos/pages/COSOnboardingPage/RFEWorkflow.tsx \
  src/features/onboarding/cos/pages/COSOnboardingPage/SevisFeeStep.tsx \
  src/features/onboarding/cos/pages/COSOnboardingPage/hooks/useStepInitialInfo.ts \
  src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx \
  src/features/onboarding/cos/pages/COSOnboardingPage/useCOSOnboardingPage.ts \
  src/features/onboarding/f1/pages/F1OnboardingPage/steps/F1FinalPreparationStep.tsx \
  src/features/onboarding/f1/pages/F1OnboardingPage/steps/F1I20UploadStep.tsx
git commit -m "feat: extract onboarding services and update pages"

# ─── 13. Page Builder ────────────────────────────────────────────────────────
git add \
  src/features/page-builder/services/pageBuilderStorageService.ts \
  src/features/page-builder/types.ts \
  src/features/page-builder/pages/PublicLandingPage/index.tsx \
  src/features/page-builder/pages/PageBuilderPage/components/InspectorPanel.tsx \
  src/features/page-builder/pages/PageBuilderPage/hooks/usePageBuilder.ts \
  src/features/page-builder/pages/PageBuilderPage/index.tsx \
  src/features/page-builder/pages/PageBuilderPage/lib/templateHtml.ts \
  src/features/page-builder/pages/PageBuilderPage/templates/LandingTemplate.tsx \
  src/features/page-builder/pages/PageBuilderPage/types.ts
git commit -m "feat: page builder services and public landing page"

# ─── 14. Admin services ───────────────────────────────────────────────────────
git add \
  src/features/admin/services/adminCustomerService.ts \
  src/features/admin/services/adminProcessesService.ts \
  src/features/admin/services/companyProfileService.ts \
  src/features/admin/services/couponManagementService.ts \
  src/features/admin/services/discountRulesService.ts \
  src/features/admin/services/interactionLogsService.ts \
  src/features/admin/services/lawyersService.ts \
  src/features/admin/services/paymentSettingsService.ts \
  src/features/admin/services/productsService.ts \
  src/features/admin/services/revenuePageService.ts \
  src/features/admin/services/stripeConnectService.ts \
  src/features/admin/services/subscriptionPageService.ts \
  src/features/admin/services/subscriptionPlansService.ts \
  src/features/admin/services/withdrawalsService.ts \
  src/features/admin/services/zellePaymentsPageService.ts \
  src/features/admin/types.ts
git commit -m "refactor: extract admin service layer"

# ─── 15. Admin hooks ─────────────────────────────────────────────────────────
git add \
  src/features/admin/hooks/useProductsPage.ts \
  src/features/admin/hooks/useRevenuePage.ts \
  src/features/admin/hooks/useSubscriptionPage.ts \
  src/features/admin/hooks/useZellePayments.ts \
  src/features/admin/hooks/useSubscription.ts
git commit -m "refactor: extract admin page hooks"

# ─── 16. Admin pages ─────────────────────────────────────────────────────────
git add \
  src/features/admin/pages/CompanyProfilePage/index.tsx \
  src/features/admin/pages/CouponsPage/index.tsx \
  src/features/admin/pages/CustomersPage/index.tsx \
  src/features/admin/pages/DiscountRulesPage/index.tsx \
  src/features/admin/pages/InteractionLogsPage/index.tsx \
  src/features/admin/pages/LawyersPage/index.tsx \
  src/features/admin/pages/LegalTermsPage/RichEditor.tsx \
  src/features/admin/pages/LegalTermsPage/index.tsx \
  src/features/admin/pages/PaymentMethodsSettingsPage.tsx \
  src/features/admin/pages/PlansPage/index.tsx \
  src/features/admin/pages/ProcessesPage/index.tsx \
  src/features/admin/pages/ProductsPage/index.tsx \
  src/features/admin/pages/RevenuePage/index.tsx \
  src/features/admin/pages/SubscriptionPage/index.tsx \
  src/features/admin/pages/ZellePaymentsPage/index.tsx \
  src/features/admin/pages/billings/PaymentSettingsPage/index.tsx \
  src/features/admin/pages/billings/WithdrawalsPage/index.tsx
git commit -m "refactor: update admin pages to use service layer"

# ─── 17. Customer profile service ────────────────────────────────────────────
git add \
  src/features/customer/services/profileSettingsService.ts \
  src/features/customer/types.ts \
  src/features/customer/pages/ProfileSettingsPage/index.tsx
git commit -m "refactor: extract customer profile settings service"

# ─── 18. Supabase functions ───────────────────────────────────────────────────
git add \
  supabase/functions/_shared/application/contact-form/send.ts \
  supabase/functions/_shared/domain/catalog/slugs.ts \
  supabase/functions/_shared/domain/catalog/slugs.test.ts \
  supabase/functions/_shared/notifications/providers/smtp.ts \
  supabase/migrations/20260608120000_scalable_plan_min_fee_per_transaction.sql \
  supabase/migrations/scalable-plan-min-fee.test.ts
git commit -m "feat: supabase functions and scalable plan migration"

# ─── 19. System types e vitest ───────────────────────────────────────────────
git add \
  src/features/system/types.ts \
  vitest.config.ts
git commit -m "chore: system types and vitest config"

# ─── 20. Temp e docs ─────────────────────────────────────────────────────────
git add \
  temp/relatory/relatorio-desenvolvimento-2026-06-08.md \
  temp/specs/scalable-plan-min-fee.md \
  temp/scripts/commit01.sh
git rm --cached \
  temp/mentoria-purchase-flow.md \
  temp/relatorio-02-06-2026.md \
  temp/relatorio-03-06-2026.md \
  tempory/test_relatory.md \
  test-results/.last-run.json \
  .agents/rules/antigravity-rtk-rules.md \
  2>/dev/null || true
git commit -m "chore: update temp docs and remove stale files"
