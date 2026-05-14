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
} from "lucide-react";
import { AccessLevel } from "./accessLevels";

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
const HomePage = lazyPage(() => import("../pages/HomePage"));
const ServiceDetailPage = lazyPage(() => import("../pages/ServiceDetailPage"));
const ServicosPage = lazyPage(() => import("../pages/ServicosPage"));

// Auth
const Login = lazyPage(() => import("../pages/Login"));
const SignUpPage = lazyPage(() => import("../pages/SignUp"));
const ForgotPasswordPage = lazyPage(
    () => import("../pages/ForgotPasswordPage"),
);
const ResetPasswordPage = lazyPage(() => import("../pages/ResetPasswordPage"));

// Standalone
const CheckoutPage = lazyPage(() => import("../pages/CheckoutPage"));
const CheckoutSuccessPage = lazyPage(
    () => import("../pages/CheckoutSuccessPage"),
);
const OfficeCheckoutPage = lazyPage(
    () => import("../pages/OfficeCheckoutPage"),
);
const Terms = lazyPage(() => import("../pages/Legal/Terms"));
const Privacy = lazyPage(() => import("../pages/Legal/Privacy"));
const Refund = lazyPage(() => import("../pages/Legal/Refund"));
const Disclaimers = lazyPage(() => import("../pages/Legal/Disclaimers"));
const ContractTerms = lazyPage(() => import("../pages/Legal/ContractTerms"));

// Staff shared (rendered under admin + master sidebar layouts)
const OverviewPage = lazyPage(() => import("../pages/admin/OverviewPage/index"));
const CustomersPage = lazyPage(() => import("../pages/admin/CustomersPage"));
const RevenuePage = lazyPage(() => import("../pages/admin/RevenuePage"));
const FinanceAnalyticsPage = lazyPage(() => import("../pages/admin/FinanceAnalyticsPage"));
const PlansPage = lazyPage(() => import("../pages/admin/PlansPage"));
// const ZellePaymentsPage = lazyPage(
//     () => import("../pages/admin/ZellePaymentsPage"),
// );
const AdminChatsPage = lazyPage(() => import("../pages/admin/ChatsPage"));
const CouponsPage = lazyPage(() => import("../pages/admin/CouponsPage"));
const ProductsPage = lazyPage(() => import("../pages/admin/ProductsPage"));
const PaymentMethodsSettingsPage = lazyPage(
    () => import("../pages/admin/PaymentMethodsSettingsPage"),
);
const LawyersPage = lazyPage(() => import("../pages/admin/LawyersPage"));
const AdminProcessesPage = lazyPage(
    () => import("../pages/admin/ProcessesPage"),
);
const AdminProcessDetailPage = lazyPage(
    () => import("../pages/admin/ProcessDetailPage"),
);
// const RolesPage = lazyPage(() => import("../pages/admin/RolesPage"));
const TeamsPage = lazyPage(() => import("../pages/admin/TeamsPage"));
const PageBuilderPage = lazyPage(() => import("../pages/PageBuilderPage"));
const SellerEarningsPage = lazyPage(() => import("../pages/seller/EarningsPage"));
const DiscountRulesPage = lazyPage(() => import("../pages/admin/DiscountRulesPage"));
const SubscriptionPage = lazyPage(() => import("../pages/admin/SubscriptionPage"));
const OfficesPage = lazyPage(() => import("../pages/admin/OfficesPage"));
const OfficeDetailsPage = lazyPage(() => import("../pages/admin/OfficeDetailsPage"));
const CompanyProfilePage = lazyPage(() => import("../pages/admin/CompanyProfilePage"));
const PayoutSettingsPage = lazyPage(() => import("../pages/admin/billings/PaymentSettingsPage"));
const WithdrawalsPage = lazyPage(() => import("../pages/admin/billings/WithdrawalsPage"));
const MasterOverviewPage = lazyPage(() => import("../pages/admin/MasterOverviewPage"));
const ShortLinkPage = lazyPage(() => import("../pages/ShortLinkPage"));

// Customer
const CustomerDashboardPage = lazyPage(
    () => import("../pages/customer/DashboardPage"),
);
const MyProcessesPage = lazyPage(
    () => import("../pages/customer/MyProcessesPage"),
);
const ProcessDetailPage = lazyPage(
    () => import("../pages/customer/ProcessDetailPage"),
);
const AIChatPage = lazyPage(() => import("../pages/customer/AIChatPage"));
const COSOnboardingPage = lazyPage(
    () => import("../pages/customer/COSOnboardingPage"),
);
const ProfileSettingsPage = lazyPage(
    () => import("../pages/customer/ProfileSettingsPage"),
);
const B1B2OnboardingPage = lazyPage(
    () => import("../pages/customer/B1B2OnboardingPage"),
);
const F1OnboardingPage = lazyPage(
    () => import("../pages/customer/F1OnboardingPage"),
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
        component: HomePage,
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

    // ── Auth ───────────────────────────────────────────────────────────────────
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
        accessLevels: STAFF,
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
        component: ProductsPage,
        authRequired: true,
        accessLevels: STAFF,
        layout: "protected",
        showInSidebar: true,
        sidebarLayouts: ["admin_lawyer"],
        sidebarGroupKey: "settings",
        icon: Package2,
    },
    {
        path: "/earnings",
        title: "Earnings",
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
        title: "Payout Configuration",
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
        path: "/processes",
        title: "Processes",
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
        title: "Processes",
        component: AdminProcessesPage,
        authRequired: true,
        accessLevels: STAFF,
        layout: "protected",
    },
    {
        path: "/manager/processes",
        title: "Processes",
        component: AdminProcessesPage,
        authRequired: true,
        accessLevels: STAFF,
        layout: "protected",
    },
    {
        path: "/master/processes",
        title: "Processes",
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
        layout: "customer",
    },
    {
        path: "/dashboard/processes/visto-b1-b2-reaplicacao/onboarding",
        title: "Onboarding B1/B2",
        component: B1B2OnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/processes/visa-b1b2/onboarding",
        title: "Onboarding B1/B2",
        component: B1B2OnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/processes/visa-b1b2-reaplicacao/onboarding",
        title: "Onboarding B1/B2",
        component: B1B2OnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/processes/visto-f1/onboarding",
        title: "Onboarding F1",
        component: F1OnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/processes/visto-f1-reaplicacao/onboarding",
        title: "Onboarding F1",
        component: F1OnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/processes/visa-f1/onboarding",
        title: "Onboarding F1",
        component: F1OnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/processes/visa-f1-reaplicacao/onboarding",
        title: "Onboarding F1",
        component: F1OnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/processes/extensao-status/onboarding",
        title: "Onboarding COS",
        component: COSOnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/processes/troca-status/onboarding",
        title: "Onboarding COS",
        component: COSOnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/processes/:slug/onboarding",
        title: "Onboarding",
        component: COSOnboardingPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
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
