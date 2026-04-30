import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { MasterDashboardLayout } from "./layouts/MasterDashboardLayout";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { SellerDashboardLayout } from "./layouts/SellerDashboardLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { ScrollToTop } from "./components/ScrollToTop";

function lazyPage<T extends React.ComponentType<unknown>>(importFn: () => Promise<{ default: T }>) {
  return lazy(() => importFn().then((m) => ({ default: m.default })));
}

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

          <Route path="/master" element={<MasterDashboardLayout />}>
            <Route index element={<MasterOverviewPage />} />
            <Route path="payments" element={<MasterPaymentsPage />} />
            <Route path="products" element={<MasterProductsPage />} />
            <Route path="chats" element={<MasterChatsPage />} />
            <Route path="customers" element={<MasterCustomersPage />} />
            <Route path="coupons" element={<MasterCouponsPage />} />
            <Route path="cases" element={<MasterCasesPage />} />
            <Route path="cases/:caseId" element={<MasterCaseOnboardingPage />} />
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
