import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import DashboardLayout from "./components/DashboardLayout";

import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Refund from "./pages/legal/Refund";
import Disclaimers from "./pages/legal/Disclaimers";

import DashboardHome from "./pages/dashboard/DashboardHome";
import Onboarding from "./pages/dashboard/Onboarding";
import Chat from "./pages/dashboard/Chat";
import Uploads from "./pages/dashboard/Uploads";
import PackagePDF from "./pages/dashboard/PackagePDF";
import HelpCenter from "./pages/dashboard/HelpCenter";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/reembolso" element={<Refund />} />
            <Route path="/disclaimers" element={<Disclaimers />} />
          </Route>

          {/* Dashboard (logged area) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/onboarding" element={<Onboarding />} />
            <Route path="/dashboard/chat" element={<Chat />} />
            <Route path="/dashboard/uploads" element={<Uploads />} />
            <Route path="/dashboard/pacote" element={<PackagePDF />} />
            <Route path="/dashboard/ajuda" element={<HelpCenter />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
