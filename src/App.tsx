import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { MasterDashboardLayout } from "./layouts/MasterDashboardLayout";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { SellerDashboardLayout } from "./layouts/SellerDashboardLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
<<<<<<< HEAD
import { ScrollToTop } from "./components/ScrollToTop";
=======
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { ScrollToTop } from "./components/organisms/ScrollToTop";
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)

function lazyPage<T extends React.ComponentType<unknown>>(importFn: () => Promise<{ default: T }>) {
  return lazy(() => importFn().then((m) => ({ default: m.default })));
}

<<<<<<< HEAD
const HomePage = lazyPage(() => import("./pages/HomePage"));
const ComoFuncionaPage = lazyPage(() => import("./pages/ComoFuncionaPage"));
const ServicosPage = lazyPage(() => import("./pages/ServicosPage"));
const ServiceDetailPage = lazyPage(() => import("./pages/ServiceDetailPage"));
const LoginPage = lazyPage(() => import("./pages/LoginPage"));
const SignUpPage = lazyPage(() => import("./pages/SignUpPage"));
const ForgotPasswordPage = lazyPage(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazyPage(() => import("./pages/ResetPasswordPage"));
const MasterOverviewPage = lazyPage(() => import("./pages/master/OverviewPage"));
const MasterPaymentsPage = lazyPage(() => import("./pages/master/PaymentsPage"));
const MasterProductsPage = lazyPage(() => import("./pages/master/ProductsPage"));
const MasterChatsPage = lazyPage(() => import("./pages/master/ChatsPage"));
const MasterCustomersPage = lazyPage(() => import("./pages/master/CustomersPage"));
const MasterCouponsPage = lazyPage(() => import("./pages/master/CouponsPage"));
const MasterCasesPage = lazyPage(() => import("./pages/master/CasesPage"));
const MasterCaseOnboardingPage = lazyPage(() => import("./pages/master/CaseOnboardingPage"));
const AdminOverviewPage = lazyPage(() => import("./pages/admin/OverviewPage"));
const AdminPaymentsPage = lazyPage(() => import("./pages/admin/PaymentsPage"));
const AdminProductsPage = lazyPage(() => import("./pages/admin/ProductsPage"));
const AdminChatsPage = lazyPage(() => import("./pages/admin/ChatsPage"));
const AdminCustomersPage = lazyPage(() => import("./pages/admin/CustomersPage"));
const AdminCouponsPage = lazyPage(() => import("./pages/admin/CouponsPage"));
const AdminCasesPage = lazyPage(() => import("./pages/admin/CasesPage"));
const AdminCaseOnboardingPage = lazyPage(() => import("./pages/admin/CaseOnboardingPage"));
const SellerPaymentsPage = lazyPage(() => import("./pages/seller/PaymentsPage"));
const SellerChatsPage = lazyPage(() => import("./pages/seller/ChatsPage"));
const SellerCustomersPage = lazyPage(() => import("./pages/seller/CustomersPage"));
const SellerCouponsPage = lazyPage(() => import("./pages/seller/CouponsPage"));
const CustomerDashboardPage = lazyPage(() => import("./pages/customer/DashboardPage"));
const CustomerMyProcessesPage = lazyPage(() => import("./pages/customer/MyProcessesPage"));
const CustomerProcessDetailPage = lazyPage(() => import("./pages/customer/ProcessDetailPage"));
const CustomerAIChatPage = lazyPage(() => import("./pages/customer/AIChatPage"));
const CustomerB1B2OnboardingPage = lazyPage(() => import("./pages/customer/B1B2OnboardingPage"));
const CustomerF1OnboardingPage = lazyPage(() => import("./pages/customer/F1OnboardingPage"));
const CustomerCOSOnboardingPage = lazyPage(() => import("./pages/customer/COSOnboardingPage"));
const CustomerProfileSettingsPage = lazyPage(() => import("./pages/customer/ProfileSettingsPage"));
const CustomerCheckoutPage = lazyPage(() => import("./pages/customer/CheckoutPage"));
const CustomerCheckoutSuccessPage = lazyPage(() => import("./pages/customer/CheckoutSuccessPage"));
=======
// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
// Public
const HomePage            = lazyPage(() => import("./pages/HomePage"));
const ServiceDetailPage   = lazyPage(() => import("./pages/ServiceDetailPage"));
const Login               = lazyPage(() => import("./pages/Login"));
const SignUpPage           = lazyPage(() => import("./pages/SignUp"));
const NotFoundPage        = lazyPage(() => import("./pages/NotFoundPage"));
const CheckoutPage        = lazyPage(() => import("./pages/CheckoutPage"));
const CheckoutSuccessPage = lazyPage(() => import("./pages/CheckoutSuccessPage"));
const ComoFuncionaPage    = lazyPage(() => import("./pages/ComoFuncionaPage"));
const ServicosPage        = lazyPage(() => import("./pages/ServicosPage"));

// Admin/Master/Seller
const CustomersPage          = lazyPage(() => import("./pages/admin/CustomersPage"));
const OverviewPage           = lazyPage(() => import("./pages/admin/OverviewPage"));
const ZellePaymentsPage      = lazyPage(() => import("./pages/admin/ZellePaymentsPage"));
const ProductsPage           = lazyPage(() => import("./pages/admin/ProductsPage"));
const AdminProcessesPage     = lazyPage(() => import("./pages/admin/ProcessesPage"));
const AdminProcessDetailPage = lazyPage(() => import("./pages/admin/ProcessDetailPage"));
const AdminChatsPage         = lazyPage(() => import("./pages/admin/ChatsPage"));
const CouponsPage            = lazyPage(() => import("./pages/admin/CouponsPage"));
const RolesPage              = lazyPage(() => import("./pages/admin/RolesPage"));
const LawyersPage            = lazyPage(() => import("./pages/admin/LawyersPage"));

// Customer
const CustomerDashboardPage = lazyPage(() => import("./pages/customer/DashboardPage"));
const MyProcessesPage       = lazyPage(() => import("./pages/customer/MyProcessesPage"));
const ProcessDetailPage     = lazyPage(() => import("./pages/customer/ProcessDetailPage"));
const AIChatPage            = lazyPage(() => import("./pages/customer/AIChatPage"));
const COSOnboardingPage     = lazyPage(() => import("./pages/customer/COSOnboardingPage"));
const ProfileSettingsPage   = lazyPage(() => import("./pages/customer/ProfileSettingsPage"));
const B1B2OnboardingPage    = lazyPage(() => import("./pages/customer/B1B2OnboardingPage"));
const F1OnboardingPage      = lazyPage(() => import("./pages/customer/F1OnboardingPage"));

// Legal
const Terms         = lazyPage(() => import("./pages/Legal/Terms"));
const Privacy       = lazyPage(() => import("./pages/Legal/Privacy"));
const Refund        = lazyPage(() => import("./pages/Legal/Refund"));
const Disclaimers   = lazyPage(() => import("./pages/Legal/Disclaimers"));
const ContractTerms = lazyPage(() => import("./pages/Legal/ContractTerms"));

import { useLocale } from "./i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LogoLoader } from "./components/atoms/logo-loader";

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
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)

function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/como-funciona" element={<ComoFuncionaPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/servicos/:slug" element={<ServiceDetailPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-in" element={<LoginPage />} />
            <Route path="/cadastro" element={<SignUpPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

<<<<<<< HEAD
          <Route path="/master" element={<MasterDashboardLayout />}>
            <Route index element={<MasterOverviewPage />} />
            <Route path="payments" element={<MasterPaymentsPage />} />
            <Route path="products" element={<MasterProductsPage />} />
            <Route path="chats" element={<MasterChatsPage />} />
            <Route path="customers" element={<MasterCustomersPage />} />
            <Route path="coupons" element={<MasterCouponsPage />} />
            <Route path="cases" element={<MasterCasesPage />} />
            <Route path="cases/:caseId" element={<MasterCaseOnboardingPage />} />
=======
          {/* Rotas protegidas — exigem autenticação */}
          <Route element={<ProtectedRoute />}>
            {/* Checkout success — protected so user is guaranteed authenticated */}
            <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

            {/* Customer routes */}
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
              <Route path="/dashboard/support" element={<AIChatPage />} />
              <Route path="/dashboard/ai-chat" element={<AIChatPage />} />
              <Route path="/minha-conta" element={<ProfileSettingsPage />} />
            </Route>

            {/* Master routes */}
            <Route path="/master" element={<MasterDashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="payments" element={<ZellePaymentsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="lawyers" element={<LawyersPage />} />
              <Route path="cases" element={<AdminProcessesPage />} />
              <Route path="cases/:id" element={<AdminProcessDetailPage />} />
              <Route path="chats" element={<AdminChatsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="roles" element={<RolesPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="payments" element={<ZellePaymentsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="lawyers" element={<LawyersPage />} />
              <Route path="processes" element={<AdminProcessesPage />} />
              <Route path="processes/:id" element={<AdminProcessDetailPage />} />
              <Route path="chats" element={<AdminChatsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="roles" element={<RolesPage />} />
            </Route>

            {/* Seller routes */}
            <Route path="/seller" element={<SellerDashboardLayout />}>
              <Route path="payments" element={<ZellePaymentsPage />} />
              <Route path="chats" element={<AdminChatsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="coupons" element={<CouponsPage />} />
            </Route>
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)
          </Route>

          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="chats" element={<AdminChatsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="cases" element={<AdminCasesPage />} />
            <Route path="cases/:caseId" element={<AdminCaseOnboardingPage />} />
          </Route>

          <Route path="/seller" element={<SellerDashboardLayout />}>
            <Route path="payments" element={<SellerPaymentsPage />} />
            <Route path="chats" element={<SellerChatsPage />} />
            <Route path="customers" element={<SellerCustomersPage />} />
            <Route path="coupons" element={<SellerCouponsPage />} />
          </Route>

          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/dashboard/processes" element={<CustomerMyProcessesPage />} />
            <Route path="/dashboard/processes/visto-b1-b2/onboarding" element={<CustomerB1B2OnboardingPage />} />
            <Route path="/dashboard/processes/visto-b1-b2-reaplicacao/onboarding" element={<CustomerB1B2OnboardingPage />} />
            <Route path="/dashboard/processes/visto-f1/onboarding" element={<CustomerF1OnboardingPage />} />
            <Route path="/dashboard/processes/visto-f1-reaplicacao/onboarding" element={<CustomerF1OnboardingPage />} />
            <Route path="/dashboard/processes/extensao-status/onboarding" element={<CustomerCOSOnboardingPage />} />
            <Route path="/dashboard/processes/troca-status/onboarding" element={<CustomerCOSOnboardingPage />} />
            <Route path="/dashboard/processes/:slug/onboarding" element={<CustomerCOSOnboardingPage />} />
            <Route path="/dashboard/processes/:slug" element={<CustomerProcessDetailPage />} />
            <Route path="/dashboard/support" element={<CustomerAIChatPage />} />
            <Route path="/dashboard/ai-chat" element={<CustomerAIChatPage />} />
            <Route path="/minha-conta" element={<CustomerProfileSettingsPage />} />
            <Route path="/checkout/success" element={<CustomerCheckoutSuccessPage />} />
            <Route path="/checkout/:slug" element={<CustomerCheckoutPage />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg text-text">
                <h1 className="text-6xl font-black text-primary">404</h1>
                <p className="text-text-muted">Página não encontrada</p>
                <a href="/" className="text-primary underline">Voltar ao início</a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
