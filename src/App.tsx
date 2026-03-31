import { Toaster } from "@/presentation/components/atoms/toaster";
import { Toaster as Sonner } from "@/presentation/components/atoms/sonner";
import { TooltipProvider } from "@/presentation/components/atoms/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Layout from "@/presentation/components/templates/Layout";
import UserDashboardLayout from "@/presentation/components/templates/UserDashboardLayout";
import ScrollToTop from "@/presentation/components/atoms/ScrollToTop";

// ... (todas as importações continuam aqui)
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import B1B2ServiceDetail from "./pages/B1B2ServiceDetail";
import F1ServiceDetail from "./pages/F1ServiceDetail";
import StatusExtensionDetail from "./pages/StatusExtensionDetail";
import ChangeOfStatusDetail from "./pages/ChangeOfStatusDetail";
import Login from "./pages/Login";

import Signup from "./pages/Signup";
import ConfirmPassword from "./pages/ConfirmPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CheckoutSuccess from "./pages/CheckoutSuccess";

import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Refund from "./pages/legal/Refund";
import Disclaimers from "./pages/legal/Disclaimers";
import ContractTerms from "./pages/legal/ContractTerms";

import UserDashboard from "./pages/dashboard/UserDashboard";
import UserProcesses from "./pages/dashboard/UserProcesses";
import Onboarding from "./pages/dashboard/Onboarding";
import Chat from "./pages/dashboard/Chat";
import Uploads from "./pages/dashboard/Uploads";
import PackagePDF from "./pages/dashboard/PackagePDF";
import HelpCenter from "./pages/dashboard/HelpCenter";
import TrackingTab from "./pages/dashboard/TrackingTab";


import AdminRoute from "@/presentation/components/molecules/AdminRoute";
import AdminLayout from "@/presentation/components/templates/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminContracts from "./pages/admin/AdminProcesses";
import AdminClients from "./pages/admin/AdminClients";
import AdminClientDetail from "./pages/admin/AdminClientDetail";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";
import AdminDS160ViewerPage from "./pages/admin/AdminDS160ViewerPage";
import AdminProcessDetail from "./pages/admin/AdminProcessDetail";
import Checkout from "./pages/Checkout";

import NotFound from "./pages/NotFound";
import { Navigate, Outlet } from "react-router-dom";

import { NotificationProvider } from "@/contexts/NotificationContext";
import { PromoModal } from "@/presentation/components/organisms/PromoModal";

const ProtectedRoute = () => {
  const { session, loading } = useAuth();
  const user = session?.user;
  if (loading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              <ScrollToTop />
              <Routes>
                {/* Public pages */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/como-funciona" element={<HowItWorks />} />
                  <Route path="/servicos" element={<Services />} />
                  <Route path="/servicos/visto-b1-b2" element={<B1B2ServiceDetail />} />
                  <Route path="/servicos/visto-f1" element={<F1ServiceDetail />} />
                  <Route path="/servicos/extensao-status" element={<StatusExtensionDetail />} />
                  <Route path="/servicos/troca-status" element={<ChangeOfStatusDetail />} />

                  <Route path="/servicos/status-extension" element={<StatusExtensionDetail />} />
                  <Route path="/servicos/extension" element={<StatusExtensionDetail />} />
                  <Route path="/servicos/:slug" element={<ServiceDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cadastro" element={<Signup />} />
                  <Route
                    path="/auth/confirm-password"
                    element={<ConfirmPassword />}
                  />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  <Route path="/termos" element={<Terms />} />
                  <Route path="/privacidade" element={<Privacy />} />
                  <Route path="/reembolso" element={<Refund />} />
                  <Route path="/disclaimers" element={<Disclaimers />} />
                  <Route path="/termos-contrato" element={<ContractTerms />} />
                  <Route path="/checkout/:slug" element={<Checkout />} />
                  <Route
                    path="/checkout-success"
                    element={<CheckoutSuccess />}
                  />
                </Route>

                {/* Dashboard area */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<UserDashboardLayout />}>
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route
                      path="/dashboard/processos"
                      element={<UserProcesses />}
                    />
                    <Route
                      path="/dashboard/onboarding"
                      element={<Onboarding />}
                    />
                    <Route path="/dashboard/chat" element={<Chat />} />
                    <Route path="/dashboard/uploads" element={<Uploads />} />
                    <Route path="/dashboard/pacote" element={<PackagePDF />} />
                    <Route path="/dashboard/ajuda" element={<HelpCenter />} />
                    <Route path="/dashboard/acompanhamento" element={<TrackingTab />} />
                  </Route>
                </Route>

                {/* Admin area */}
                <Route element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/pedidos" element={<AdminOrders />} />
                    <Route
                      path="/admin/pedidos/:id"
                      element={<AdminOrderDetail />}
                    />
                    <Route
                      path="/admin/pagamentos"
                      element={<AdminPayments />}
                    />
                    <Route path="/admin/clientes" element={<AdminClients />} />
                    <Route
                      path="/admin/clientes/:id"
                      element={<AdminClientDetail />}
                    />
                    <Route
                      path="/admin/documentos"
                      element={<AdminDocuments />}
                    />
                    <Route
                      path="/admin/contratos"
                      element={<AdminContracts />}
                    />
                    <Route
                      path="/admin/contratos/:id"
                      element={<AdminProcessDetail />}
                    />
                    <Route
                      path="/admin/ds160/:userId"
                      element={<AdminDS160ViewerPage />}
                    />
                    <Route
                      path="/admin/sellers"
                      element={<AdminPlaceholder title="Sellers" />}
                    />
                    <Route
                      path="/admin/parceiros"
                      element={<AdminPlaceholder title="Parceiros Globais" />}
                    />
                    <Route
                      path="/admin/recorrencias"
                      element={<AdminPlaceholder title="Recorrências" />}
                    />
                    <Route
                      path="/admin/produtos"
                      element={<AdminPlaceholder title="Produtos & Cupons" />}
                    />
                    <Route
                      path="/admin/suporte"
                      element={<AdminPlaceholder title="Suporte" />}
                    />
                    <Route
                      path="/admin/analytics"
                      element={<AdminPlaceholder title="Analytics" />}
                    />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <PromoModal />
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
