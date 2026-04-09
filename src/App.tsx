import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import HomePage from "./pages/HomePage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import Login from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import NotFoundPage from "./pages/NotFoundPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import ComoFuncionaPage from "./pages/ComoFuncionaPage";
import ServicosPage from "./pages/ServicosPage";
import CustomersPage from "./pages/admin/CustomersPage";

import OverviewPage from "./pages/admin/OverviewPage";
import ZellePaymentsPage from "./pages/admin/ZellePaymentsPage";
import ProductsPage from "./pages/admin/ProductsPage";
import AdminProcessesPage from "./pages/admin/ProcessesPage";
import AdminProcessDetailPage from "./pages/admin/ProcessDetailPage";

import CustomerDashboardPage from "./pages/customer/DashboardPage";
import MyProcessesPage from "./pages/customer/MyProcessesPage";
import ProcessDetailPage from "./pages/customer/ProcessDetailPage";
import SupportPage from "./pages/customer/SupportPage";
import AIChatPage from "./pages/customer/AIChatPage";
import COSOnboardingPage from "./pages/customer/COSOnboardingPage";

import ProfileSettingsPage from "./pages/customer/ProfileSettingsPage";
import B1B2OnboardingPage from "./pages/customer/B1B2OnboardingPage";
import F1OnboardingPage from "./pages/customer/F1OnboardingPage";

export default function App() {
  return (
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
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
