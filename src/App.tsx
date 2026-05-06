import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { MasterDashboardLayout } from "./layouts/MasterDashboardLayout";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { SellerDashboardLayout } from "./layouts/SellerDashboardLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { ScrollToTop } from "./components/organisms/ScrollToTop";

function lazyPage<T extends React.ComponentType<unknown>>(importFn: () => Promise<{ default: T }>) {
  return lazy(() => importFn().then((m) => ({ default: m.default })));
}

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
// Public
const HomePage            = lazyPage(() => import("./pages/HomePage"));
const ServiceDetailPage   = lazyPage(() => import("./pages/ServiceDetailPage"));
const Login               = lazyPage(() => import("./pages/Login"));
const SignUpPage           = lazyPage(() => import("./pages/SignUp"));
const ForgotPasswordPage  = lazyPage(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage   = lazyPage(() => import("./pages/ResetPasswordPage"));
const CheckoutPage        = lazyPage(() => import("./pages/CheckoutPage"));
const CheckoutSuccessPage = lazyPage(() => import("./pages/CheckoutSuccessPage"));
const QuemSomosPage       = lazyPage(() => import("./pages/QuemSomosPage"));
const ServicosPage        = lazyPage(() => import("./pages/ServicosPage"));
const ContactPage         = lazyPage(() => import("./pages/ContactPage"));

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
const PageBuilderPage        = lazyPage(() => import("./pages/admin/PageBuilderPage"));

// Customer
const CustomerDashboardPage = lazyPage(() => import("./pages/customer/DashboardPage"));
const MyProcessesPage       = lazyPage(() => import("./pages/customer/MyProcessesPage"));
const ProcessDetailPage     = lazyPage(() => import("./pages/customer/ProcessDetailPage"));
const AIChatPage            = lazyPage(() => import("./pages/customer/AIChatPage"));
const COSOnboardingPage     = lazyPage(() => import("./pages/customer/COSOnboardingPage"));
const ProfileSettingsPage   = lazyPage(() => import("./pages/customer/ProfileSettingsPage"));

// Legal
const Terms         = lazyPage(() => import("./pages/Legal/Terms"));
const Privacy       = lazyPage(() => import("./pages/Legal/Privacy"));
const Refund        = lazyPage(() => import("./pages/Legal/Refund"));
const Disclaimers   = lazyPage(() => import("./pages/Legal/Disclaimers"));
const ContractTerms = lazyPage(() => import("./pages/Legal/ContractTerms"));

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
            <Route path="/quem-somos" element={<QuemSomosPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/servicos/:slug" element={<ServiceDetailPage />} />
            <Route path="/contato" element={<ContactPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/sign-in" element={<Login />} />
            <Route path="/cadastro" element={<SignUpPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Checkout */}
          <Route path="/checkout/:slug" element={<CheckoutPage />} />

          {/* Legal */}
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/reembolso" element={<Refund />} />
          <Route path="/avisos-legais" element={<Disclaimers />} />
          <Route path="/contrato" element={<ContractTerms />} />

          {/* Rotas protegidas — exigem autenticação */}
          <Route element={<ProtectedRoute />}>
            {/* Checkout success — protected so user is guaranteed authenticated */}
            <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

            {/* Customer routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/dashboard/processes" element={<MyProcessesPage />} />
              {/* Onboarding genérico */}
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
              <Route path="page-builder" element={<PageBuilderPage />} />
            </Route>

            {/* Seller routes */}
            <Route path="/seller" element={<SellerDashboardLayout />}>
              <Route path="payments" element={<ZellePaymentsPage />} />
              <Route path="chats" element={<AdminChatsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="coupons" element={<CouponsPage />} />
            </Route>
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
