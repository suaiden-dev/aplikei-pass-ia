import { lazy } from "react";
import type React from "react";
import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  CreditCard,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquare,
  Package2,
  TicketPercent,
  TrendingUp,
  Users,
  Building2,
  Landmark,
  DollarSign,
  History,
} from "lucide-react";
import { AccessLevel } from "./accessLevels";
import { siteConfig } from "../config/site";
import LandingRedirect from "./LandingRedirect";

function lazyPage<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
) {
  return lazy(() => importFn().then((m) => ({ default: m.default })));
}

// ─── Access level groups ──────────────────────────────────────────────────────

const STAFF = [
  AccessLevel.MASTER,
  AccessLevel.MANAGER,
  AccessLevel.ADMIN_LAWYER,
];
const STAFF_AND_SELLER = [...STAFF, AccessLevel.SELLER];

// ─── Pages ───────────────────────────────────────────────────────────────────

// Public
const HomePage = lazyPage(() => import("@features/marketing/pages/HomePage"));
const MaintenancePage = lazyPage(() => import("@features/system/pages/MaintenancePage"));
const ServiceDetailPage = lazyPage(() => import("@features/marketing/pages/ServiceDetailPage"));
const ServicosPage = lazyPage(() => import("@features/marketing/pages/ServicosPage"));
const QuemSomosPage = lazyPage(() => import("@features/marketing/pages/QuemSomosPage"));
const ContactPage = lazyPage(() => import("@features/marketing/pages/ContactPage"));



// Auth
const Login = lazyPage(() => import("@features/auth/pages/LoginPage"));
const SignUpPage = lazyPage(() => import("@features/auth/pages/SignUpPage"));
const ForgotPasswordPage = lazyPage(
  () => import("@features/auth/pages/ForgotPasswordPage"),
);
const ResetPasswordPage = lazyPage(() => import("@features/auth/pages/ResetPasswordPage"));

// Standalone
const CheckoutPage = lazyPage(() => import("@features/payments/pages/CheckoutPage"));
const CheckoutSuccessPage = lazyPage(
  () => import("@features/payments/pages/CheckoutSuccessPage"),
);
const OfficeCheckoutPage = lazyPage(
  () => import("@features/payments/pages/OfficeCheckoutPage"),
);
const Terms = lazyPage(() => import("@features/legal/pages/Terms"));
const Privacy = lazyPage(() => import("@features/legal/pages/Privacy"));
const Refund = lazyPage(() => import("@features/legal/pages/Refund"));
const Disclaimers = lazyPage(() => import("@features/legal/pages/Disclaimers"));
const ContractTerms = lazyPage(() => import("@features/legal/pages/ContractTerms"));

// Staff shared (rendered under admin + master sidebar layouts)
const OverviewPage = lazyPage(() => import("@features/admin/pages/OverviewPage/index"));
const CustomersPage = lazyPage(() => import("@features/admin/pages/master/CustomersPage"));
const RevenuePage = lazyPage(() => import("@features/admin/pages/RevenuePage/index"));
const FinanceAnalyticsPage = lazyPage(() => import("@features/admin/pages/FinanceAnalyticsPage/index"));
const PlansPage = lazyPage(() => import("@features/admin/pages/PlansPage/index"));
// const ZellePaymentsPage = lazyPage(
//     () => import("@features/admin/pages/ZellePaymentsPage"),
// );
const AdminChatsPage = lazyPage(() => import("@features/admin/pages/ChatsPage"));
const CouponsPage = lazyPage(() => import("@features/admin/pages/CouponsPage/index"));
const ProductsPage = lazyPage(() => import("@features/admin/pages/ProductsPage"));
const PaymentMethodsSettingsPage = lazyPage(
  () => import("@features/admin/pages/PaymentMethodsSettingsPage"),
);
const LawyersPage = lazyPage(() => import("@features/admin/pages/LawyersPage/index"));
const AdminProcessesPage = lazyPage(
  () => import("@features/admin/pages/ProcessesPage/index"),
);
const AdminProcessDetailPage = lazyPage(
  () => import("@features/admin/pages/ProcessDetailPage/index"),
);
// const RolesPage = lazyPage(() => import("@features/admin/pages/RolesPage"));
const TeamsPage = lazyPage(() => import("@features/admin/pages/TeamsPage/index"));
const PageBuilderPage = lazyPage(() => import("@features/page-builder/pages/PageBuilderPage"));
const SellerEarningsPage = lazyPage(() => import("@features/seller/pages/EarningsPage"));
const DiscountRulesPage = lazyPage(() => import("@features/admin/pages/DiscountRulesPage/index"));
const SubscriptionPage = lazyPage(() => import("@features/admin/pages/SubscriptionPage/index"));
const OfficesPage = lazyPage(() => import("@features/offices/pages/OfficesPage"));
const OfficeDetailsPage = lazyPage(() => import("@features/offices/pages/OfficeDetailsPage"));
const CompanyProfilePage = lazyPage(() => import("@features/admin/pages/CompanyProfilePage/index"));
const PayoutSettingsPage = lazyPage(() => import("@features/admin/pages/billings/PaymentSettingsPage/index"));
const WithdrawalsPage = lazyPage(() => import("@features/admin/pages/billings/WithdrawalsPage/index"));
const MasterOverviewPage = lazyPage(() => import("@features/admin/pages/MasterOverviewPage/index"));
const InteractionLogsPage = lazyPage(() => import("@features/admin/pages/InteractionLogsPage/index"));
const ShortLinkPage = lazyPage(() => import("@features/payments/pages/ShortLinkPage"));

// Customer
const CustomerDashboardPage = lazyPage(
  () => import("@features/customer/pages/DashboardPage"),
);
const MyProcessesPage = lazyPage(
  () => import("@features/process/pages/MyProcessesPage"),
);
const ProcessDetailPage = lazyPage(
  () => import("@features/process/pages/ProcessDetailPage"),
);
const AIChatPage = lazyPage(() => import("@features/chat/pages/AIChatPage"));
const COSOnboardingPage = lazyPage(
  () => import("@features/onboarding/cos/pages/COSOnboardingPage"),
);
const ProfileSettingsPage = lazyPage(
  () => import("@features/customer/pages/ProfileSettingsPage"),
);
const B1B2OnboardingPage = lazyPage(
  () => import("@features/onboarding/b1b2/pages/B1B2OnboardingPage"),
);
const F1OnboardingPage = lazyPage(
  () => import("@features/onboarding/f1/pages/F1OnboardingPage"),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type RouteLayout =
  | "public"
  | "auth"
  | "standalone"
  | "protected"
  | "customer"
  | "master"
  | "manager"
  | "seller"
  | "admin_lawyer";

export interface AppRouteDefinition {
  path: string;
  title: string;
  titleKey?: string;
  component: React.ComponentType;
  authRequired: boolean;
  accessLevels: AccessLevel[];
  layout: RouteLayout;
  showInSidebar?: boolean;
  sidebarLayouts?: Array<
    Extract<RouteLayout, "master" | "manager" | "seller" | "admin_lawyer">
  >;
  sidebarGroup?: string;
  sidebarGroupKey?: string;
  icon?: LucideIcon;
  exact?: boolean;
}

// ─── Route table ─────────────────────────────────────────────────────────────

export const appRoutes: AppRouteDefinition[] = [
  // ── Public ─────────────────────────────────────────────────────────────────
  {
    path: "/",
    title: "Home",
    component: siteConfig.isProd ? HomePage : MaintenancePage,
    authRequired: false,
    accessLevels: [],
    layout: "public",
  },
  {
    path: "/landing",
    title: "Landing",
    component: siteConfig.isProd ? LandingRedirect : HomePage,
    authRequired: false,
    accessLevels: [],
    layout: "public",
  },
  {
    path: "/servicos",
    title: "Services",
    component: ServicosPage,
    authRequired: false,
    accessLevels: [],
    layout: "public",
  },
  {
    path: "/servicos/:slug",
    title: "Serviço",
    component: ServiceDetailPage,
    authRequired: false,
    accessLevels: [],
    layout: "public",
  },
  {
    path: "/quem-somos",
    title: "Quem Somos",
    component: QuemSomosPage,
    authRequired: false,
    accessLevels: [],
    layout: "public",
  },
  {
    path: "/contato",
    title: "Contato",
    component: ContactPage,
    authRequired: false,
    accessLevels: [],
    layout: "public",
  },



  // ── Auth ───────────────────────────────────────────────────────────────────
  {
    path: "/login-office",
    title: "Login Advogado",
    component: Login,
    authRequired: false,
    accessLevels: [],
    layout: "auth",
  },
  {
    path: "/login",
    title: "Login",
    component: Login,
    authRequired: false,
    accessLevels: [],
    layout: "auth",
  },
  {
    path: "/sign-in",
    title: "Login",
    component: Login,
    authRequired: false,
    accessLevels: [],
    layout: "auth",
  },
  {
    path: "/cadastro",
    title: "Sign Up",
    component: SignUpPage,
    authRequired: false,
    accessLevels: [],
    layout: "auth",
  },
  {
    path: "/sign-up",
    title: "Sign Up",
    component: SignUpPage,
    authRequired: false,
    accessLevels: [],
    layout: "auth",
  },
  {
    path: "/recuperar-senha",
    title: "Recover Password",
    component: ForgotPasswordPage,
    authRequired: false,
    accessLevels: [],
    layout: "auth",
  },
  {
    path: "/forgot-password",
    title: "Forgot Password",
    component: ForgotPasswordPage,
    authRequired: false,
    accessLevels: [],
    layout: "auth",
  },
  {
    path: "/redefinir-senha",
    title: "Reset Password",
    component: ResetPasswordPage,
    authRequired: false,
    accessLevels: [],
    layout: "auth",
  },
  {
    path: "/reset-password",
    title: "Reset Password",
    component: ResetPasswordPage,
    authRequired: false,
    accessLevels: [],
    layout: "auth",
  },

  // ── Standalone ─────────────────────────────────────────────────────────────
  {
    path: "/checkout/:slug",
    title: "Checkout",
    component: CheckoutPage,
    authRequired: false,
    accessLevels: [],
    layout: "standalone",
  },
  {
    path: "/l/:token",
    title: "Link",
    component: ShortLinkPage,
    authRequired: false,
    accessLevels: [],
    layout: "standalone",
  },
  {
    path: "/checkout",
    title: "Office Checkout",
    component: OfficeCheckoutPage,
    authRequired: false,
    accessLevels: [],
    layout: "standalone",
  },
  {
    path: "/termos",
    title: "Terms",
    component: Terms,
    authRequired: false,
    accessLevels: [],
    layout: "standalone",
  },
  {
    path: "/privacidade",
    title: "Privacy",
    component: Privacy,
    authRequired: false,
    accessLevels: [],
    layout: "standalone",
  },
  {
    path: "/reembolso",
    title: "Refund",
    component: Refund,
    authRequired: false,
    accessLevels: [],
    layout: "standalone",
  },
  {
    path: "/avisos-legais",
    title: "Legal Disclaimers",
    component: Disclaimers,
    authRequired: false,
    accessLevels: [],
    layout: "standalone",
  },
  {
    path: "/contrato",
    title: "Contract",
    component: ContractTerms,
    authRequired: false,
    accessLevels: [],
    layout: "standalone",
  },
  {
    path: "/checkout-success",
    title: "Checkout Success",
    component: CheckoutSuccessPage,
    authRequired: true,
    accessLevels: [...STAFF_AND_SELLER, AccessLevel.CUSTOMER],
    layout: "standalone",
  },

  // ── Master ─────────────────────────────────────────────────────────────────
  {
    path: "/master",
    title: "Master Overview",
    titleKey: "overview",
    component: MasterOverviewPage,
    authRequired: true,
    accessLevels: [AccessLevel.MASTER],
    layout: "master",
    showInSidebar: true,
    icon: LayoutDashboard,
    exact: true,
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  {
    path: "/admin",
    title: "Overview",
    component: OverviewPage,
    authRequired: true,
    accessLevels: [AccessLevel.MASTER, AccessLevel.ADMIN_LAWYER],
    layout: "manager",
    showInSidebar: true,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    path: "/page-builder",
    title: "Page Builder",
    component: PageBuilderPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer"],
    sidebarGroupKey: "settings",
    icon: LayoutTemplate,
  },

  // ── Staff shared (admin + master sidebar) ──────────────────────────────────
  {
    path: "/customers",
    title: "Customers",
    titleKey: "customers",
    component: CustomersPage,
    authRequired: true,
    accessLevels: STAFF_AND_SELLER,
    layout: "protected",
    showInSidebar: true,
    icon: Users,
  },
  {
    path: "/payments",
    title: "Finance",
    titleKey: "revenue",
    component: RevenuePage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["master", "admin_lawyer"],
    icon: Landmark,
  },
  {
    path: "/finance-analytics",
    title: "Finance Analytics",
    titleKey: "finance_analytics",
    component: FinanceAnalyticsPage,
    authRequired: true,
    accessLevels: [AccessLevel.MASTER, AccessLevel.ADMIN_LAWYER],
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["master", "admin_lawyer"],
    icon: TrendingUp,
  },
  {
    path: "/plans",
    title: "Plans",
    titleKey: "plans",
    component: PlansPage,
    authRequired: true,
    accessLevels: [AccessLevel.MASTER],
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["master"],
    icon: Package2,
  },
  {
    path: "/chats",
    title: "Chats",
    titleKey: "chats",
    component: AdminChatsPage,
    authRequired: true,
    accessLevels: STAFF_AND_SELLER,
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["manager"],
    icon: MessageSquare,
  },
  {
    path: "/messages",
    title: "Messages",
    component: AdminChatsPage,
    authRequired: true,
    accessLevels: STAFF_AND_SELLER,
    layout: "protected",
    sidebarLayouts: ["manager"],
  },
  {
    path: "/coupons",
    title: "Coupons",
    titleKey: "coupons",
    component: CouponsPage,
    authRequired: true,
    accessLevels: STAFF_AND_SELLER,
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["seller"],
    icon: TicketPercent,
  },
  {
    path: "/products",
    title: "Products",
    titleKey: "products",
    component: ProductsPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer"],
    icon: Package2,
  },
  {
    path: "/earnings",
    title: "Billing",
    titleKey: "earnings",
    component: SellerEarningsPage,
    authRequired: true,
    accessLevels: [AccessLevel.SELLER],
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["seller"],
    icon: TrendingUp,
  },
  {
    path: "/settings/discount-rules",
    title: "Discount Rules",
    titleKey: "discountRules",
    component: DiscountRulesPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer"],
    sidebarGroupKey: "settings",
    icon: TicketPercent,
  },
  {
    path: "/settings/payment-methods",
    title: "Payment Methods",
    titleKey: "paymentSettings",
    component: PaymentMethodsSettingsPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
    showInSidebar: true,
    sidebarGroupKey: "settings",
    icon: CreditCard,
  },
  {
    path: "/settings/company",
    title: "Company Profile",
    component: CompanyProfilePage,
    authRequired: true,
    accessLevels: [AccessLevel.ADMIN_LAWYER],
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer"],
    sidebarGroupKey: "settings",
    icon: Landmark,
  },
  {
    path: "/settings/payout",
    title: "Withdrawal Configuration",
    titleKey: "payoutSettings",
    component: PayoutSettingsPage,
    authRequired: true,
    accessLevels: [AccessLevel.ADMIN_LAWYER],
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer"],
    sidebarGroupKey: "billings",
    icon: Landmark,
  },
  {
    path: "/billings/withdrawals",
    title: "Withdrawals",
    titleKey: "withdrawals",
    component: WithdrawalsPage,
    authRequired: true,
    accessLevels: [AccessLevel.ADMIN_LAWYER],
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer"],
    sidebarGroupKey: "billings",
    icon: DollarSign,
  },
  {
    path: "/lawyers",
    title: "Lawyers",
    titleKey: "lawyers",
    component: LawyersPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
    showInSidebar: true,
    icon: Users,
  },
  {
    path: "/interaction-logs",
    title: "Logs de Interação",
    component: InteractionLogsPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer"],
    sidebarGroupKey: "settings",
    icon: History,
  },

  {
    path: "/processes",
    title: "Cases",
    titleKey: "Cases",
    component: AdminProcessesPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer", "manager"],
    icon: BriefcaseBusiness,
  },
  {
    path: "/admin/processes",
    title: "Cases",
    titleKey: "matters",
    component: AdminProcessesPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
  },
  {
    path: "/manager/processes",
    title: "Cases",
    titleKey: "matters",
    component: AdminProcessesPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
  },
  {
    path: "/master/processes",
    title: "Cases",
    titleKey: "matters",
    component: AdminProcessesPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
  },
  {
    path: "/roles",
    title: "Teams",
    component: TeamsPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer"],
    icon: Users,
  },
  {
    path: "/master/offices",
    title: "Offices",
    titleKey: "offices",
    component: OfficesPage,
    authRequired: true,
    accessLevels: [AccessLevel.MASTER],
    layout: "master",
    showInSidebar: true,
    icon: Building2,
  },
  {
    path: "/master/offices/:officeId",
    title: "Office Details",
    component: OfficeDetailsPage,
    authRequired: true,
    accessLevels: [AccessLevel.MASTER],
    layout: "master",
  },
  {
    path: "/subscription",
    title: "My Subscription",
    component: SubscriptionPage,
    authRequired: true,
    accessLevels: [AccessLevel.ADMIN_LAWYER, AccessLevel.MASTER],
    layout: "protected",
    showInSidebar: true,
    sidebarLayouts: ["admin_lawyer"],
    icon: CreditCard,
  },
  {
    path: "/processes/:id",
    title: "Process Detail",
    component: AdminProcessDetailPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
  },
  {
    path: "/admin/processes/:id",
    title: "Process Detail",
    component: AdminProcessDetailPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
  },
  {
    path: "/manager/processes/:id",
    title: "Process Detail",
    component: AdminProcessDetailPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
  },
  {
    path: "/master/processes/:id",
    title: "Process Detail",
    component: AdminProcessDetailPage,
    authRequired: true,
    accessLevels: STAFF,
    layout: "protected",
  },

  // ── Customer ───────────────────────────────────────────────────────────────
  {
    path: "/dashboard",
    title: "Dashboard",
    component: CustomerDashboardPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "customer",
  },
  {
    path: "/dashboard/processes",
    title: "My Processes",
    component: MyProcessesPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "customer",
  },
  {
    path: "/dashboard/processes/visto-b1-b2/onboarding",
    title: "Onboarding B1/B2",
    component: B1B2OnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/visto-b1-b2-reaplicacao/onboarding",
    title: "Onboarding B1/B2",
    component: B1B2OnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/visa-b1b2/onboarding",
    title: "Onboarding B1/B2",
    component: B1B2OnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/visa-b1b2-reaplicacao/onboarding",
    title: "Onboarding B1/B2",
    component: B1B2OnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/visto-f1/onboarding",
    title: "Onboarding F1",
    component: F1OnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/visto-f1-reaplicacao/onboarding",
    title: "Onboarding F1",
    component: F1OnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/visa-f1/onboarding",
    title: "Onboarding F1",
    component: F1OnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/visa-f1-reaplicacao/onboarding",
    title: "Onboarding F1",
    component: F1OnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/extensao-status/onboarding",
    title: "Onboarding COS",
    component: COSOnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/troca-status/onboarding",
    title: "Onboarding COS",
    component: COSOnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/:slug/onboarding",
    title: "Onboarding",
    component: COSOnboardingPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "standalone",
  },
  {
    path: "/dashboard/processes/:slug",
    title: "Process Detail",
    component: ProcessDetailPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "customer",
  },
  {
    path: "/dashboard/support",
    title: "Support",
    component: AIChatPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "customer",
  },
  {
    path: "/dashboard/ai-chat",
    title: "AI Chat",
    component: AIChatPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "customer",
  },
  {
    path: "/minha-conta",
    title: "My Account",
    component: ProfileSettingsPage,
    authRequired: true,
    accessLevels: [AccessLevel.CUSTOMER],
    layout: "customer",
  },
];

export function routesByLayout(layout: RouteLayout) {
  return appRoutes.filter((route) => route.layout === layout);
}
