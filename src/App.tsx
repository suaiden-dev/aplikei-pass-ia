import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
// Public
const HomePage            = lazy(() => import("./pages/HomePage"));
const ServiceDetailPage   = lazy(() => import("./pages/ServiceDetailPage"));
const Login               = lazy(() => import("./pages/Login"));
const SignUpPage           = lazy(() => import("./pages/SignUp"));
const NotFoundPage        = lazy(() => import("./pages/NotFoundPage"));
const CheckoutPage        = lazy(() => import("./pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccessPage"));
const ComoFuncionaPage    = lazy(() => import("./pages/ComoFuncionaPage"));
const ServicosPage        = lazy(() => import("./pages/ServicosPage"));

// Admin
const CustomersPage          = lazy(() => import("./pages/admin/CustomersPage"));
const OverviewPage           = lazy(() => import("./pages/admin/OverviewPage"));
const ZellePaymentsPage      = lazy(() => import("./pages/admin/ZellePaymentsPage"));
const ProductsPage           = lazy(() => import("./pages/admin/ProductsPage"));
const AdminProcessesPage     = lazy(() => import("./pages/admin/ProcessesPage"));
const AdminProcessDetailPage = lazy(() => import("./pages/admin/ProcessDetailPage"));
const CouponsPage            = lazy(() => import("./pages/admin/CouponsPage"));

// Customer
const CustomerDashboardPage = lazy(() => import("./pages/customer/DashboardPage"));
const MyProcessesPage       = lazy(() => import("./pages/customer/MyProcessesPage"));
const ProcessDetailPage     = lazy(() => import("./pages/customer/ProcessDetailPage"));
const SupportPage           = lazy(() => import("./pages/customer/SupportPage"));
const AIChatPage            = lazy(() => import("./pages/customer/AIChatPage"));
const COSOnboardingPage     = lazy(() => import("./pages/customer/COSOnboardingPage"));
const ProfileSettingsPage   = lazy(() => import("./pages/customer/ProfileSettingsPage"));
const B1B2OnboardingPage    = lazy(() => import("./pages/customer/B1B2OnboardingPage"));
const F1OnboardingPage      = lazy(() => import("./pages/customer/F1OnboardingPage"));

// Legal
const Terms         = lazy(() => import("./pages/Legal/Terms"));
const Privacy       = lazy(() => import("./pages/Legal/Privacy"));
const Refund        = lazy(() => import("./pages/Legal/Refund"));
const Disclaimers   = lazy(() => import("./pages/Legal/Disclaimers"));
const ContractTerms = lazy(() => import("./pages/Legal/ContractTerms"));

import { useLocale } from "./i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LogoLoader } from "./components/ui/LogoLoader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { isLanguageLoading } = useLocale();

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      {/* 
        Global loading overlay that doesn't unmount the route tree.
      */}
      {isLanguageLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/95 backdrop-blur-md z-[9999]">
          <LogoLoader />
        </div>
      )}
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
          <LogoLoader />
        </div>
      }>
        <Routes>
          {/* Rotas públicas — com Navbar e Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/servicos/:slug" element={<ServiceDetailPage />} />
            <Route path="/como-funciona" element={<ComoFuncionaPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<SignUpPage />} />
            <Route path="/checkout/:slug" element={<CheckoutPage />} />
            
            {/* Legal Routes */}
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/refund" element={<Refund />} />
            <Route path="/legal/disclaimers" element={<Disclaimers />} />
            <Route path="/legal/contract-terms" element={<ContractTerms />} />
          </Route>

          {/* Rotas protegidas — exigem autenticação */}
          <Route element={<ProtectedRoute />}>
            {/* Checkout success — protected so user is guaranteed authenticated */}
            <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
            {/* Customer Dashboard */}
            <Route element={<CustomerLayout />}>
              <Route path="/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/dashboard/processes" element={<MyProcessesPage />} />
              {/* Onboarding por produto */}
              <Route path="/dashboard/processes/visto-b1-b2/onboarding" element={<B1B2OnboardingPage />} />
              <Route path="/dashboard/processes/visto-b1-b2-reaplicacao/onboarding" element={<B1B2OnboardingPage />} />
              <Route path="/dashboard/processes/visto-f1/onboarding" element={<F1OnboardingPage />} />
              <Route path="/dashboard/processes/visto-f1-reaplicacao/onboarding" element={<F1OnboardingPage />} />
              <Route path="/dashboard/processes/extensao-status/onboarding" element={<COSOnboardingPage />} />
              <Route path="/dashboard/processes/troca-status/onboarding" element={<COSOnboardingPage />} />
              {/* Onboarding genérico (outros slugs COS) */}
              <Route path="/dashboard/processes/:slug/onboarding" element={<COSOnboardingPage />} />

              <Route path="/dashboard/processes/:slug" element={<ProcessDetailPage />} />
              <Route path="/dashboard/support" element={<SupportPage />} />
              <Route path="/dashboard/ai-chat" element={<AIChatPage />} />
              <Route path="/minha-conta" element={<ProfileSettingsPage />} />
            </Route>

            {/* Admin */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<OverviewPage />} />
              <Route path="/admin/payments" element={<ZellePaymentsPage />} />
              <Route path="/admin/customers" element={<CustomersPage />} />
              <Route path="/admin/processes" element={<AdminProcessesPage />} />
              <Route path="/admin/processes/:id" element={<AdminProcessDetailPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/coupons" element={<CouponsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </QueryClientProvider>
  );
}
