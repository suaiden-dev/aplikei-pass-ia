import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";

import Layout from "./components/Layout";
import UserDashboardLayout from "./components/UserDashboardLayout";

import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ConfirmPassword from "./pages/ConfirmPassword";
import CheckoutSuccess from "./pages/CheckoutSuccess";


import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Refund from "./pages/legal/Refund";
import Disclaimers from "./pages/legal/Disclaimers";

import UserDashboard from "./pages/dashboard/UserDashboard";
import Onboarding from "./pages/dashboard/Onboarding";
import Chat from "./pages/dashboard/Chat";
import Uploads from "./pages/dashboard/Uploads";
import PackagePDF from "./pages/dashboard/PackagePDF";
import HelpCenter from "./pages/dashboard/HelpCenter";

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminClients from "./pages/admin/AdminClients";
import AdminClientDetail from "./pages/admin/AdminClientDetail";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";
import Checkout from "./pages/Checkout";

import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) return null;
  return session ? <Outlet /> : <Navigate to="/login" replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public pages */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/como-funciona" element={<HowItWorks />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/servicos/:slug" element={<ServiceDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Signup />} />
              <Route path="/auth/confirm-password" element={<ConfirmPassword />} />

              <Route path="/termos" element={<Terms />} />
              <Route path="/privacidade" element={<Privacy />} />
              <Route path="/reembolso" element={<Refund />} />
              <Route path="/disclaimers" element={<Disclaimers />} />
              <Route path="/checkout/:slug" element={<Checkout />} />
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
            </Route>

            {/* Dashboard (logged area) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<UserDashboardLayout />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/dashboard/onboarding" element={<Onboarding />} />
                <Route path="/dashboard/chat" element={<Chat />} />
                <Route path="/dashboard/uploads" element={<Uploads />} />
                <Route path="/dashboard/pacote" element={<PackagePDF />} />
                <Route path="/dashboard/ajuda" element={<HelpCenter />} />
              </Route>
            </Route>

            {/* Admin area */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/pedidos" element={<AdminOrders />} />
                <Route path="/admin/pedidos/:id" element={<AdminOrderDetail />} />
                <Route path="/admin/pagamentos" element={<AdminPayments />} />
                <Route path="/admin/clientes" element={<AdminClients />} />
                <Route path="/admin/clientes/:id" element={<AdminClientDetail />} />
                <Route path="/admin/documentos" element={<AdminDocuments />} />
                <Route path="/admin/sellers" element={<AdminPlaceholder title="Sellers" />} />
                <Route path="/admin/parceiros" element={<AdminPlaceholder title="Parceiros Globais" />} />
                <Route path="/admin/contratos" element={<AdminPlaceholder title="Contratos" />} />
                <Route path="/admin/recorrencias" element={<AdminPlaceholder title="Recorrências" />} />
                <Route path="/admin/produtos" element={<AdminPlaceholder title="Produtos & Cupons" />} />
                <Route path="/admin/suporte" element={<AdminPlaceholder title="Suporte" />} />
                <Route path="/admin/analytics" element={<AdminPlaceholder title="Analytics" />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
