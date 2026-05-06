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
    ShieldCheck,
    TicketPercent,
    Users,
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
const ComoFuncionaPage = lazyPage(() => import("../pages/ComoFuncionaPage"));
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
const OverviewPage = lazyPage(() => import("../pages/admin/OverviewPage"));
const CustomersPage = lazyPage(() => import("../pages/admin/CustomersPage"));
const ZellePaymentsPage = lazyPage(
    () => import("../pages/admin/ZellePaymentsPage"),
);
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
const RolesPage = lazyPage(() => import("../pages/admin/RolesPage"));
const PageBuilderPage = lazyPage(() => import("../pages/PageBuilderPage"));

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
        path: "/como-funciona",
        title: "Como Funciona",
        component: ComoFuncionaPage,
        authRequired: false,
        accessLevels: [],
        layout: "public",
    },
    {
        path: "/servicos",
        title: "Serviços",
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
        title: "Cadastro",
        component: SignUpPage,
        authRequired: false,
        accessLevels: [],
        layout: "auth",
    },
    {
        path: "/sign-up",
        title: "Cadastro",
        component: SignUpPage,
        authRequired: false,
        accessLevels: [],
        layout: "auth",
    },
    {
        path: "/recuperar-senha",
        title: "Recuperar Senha",
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
        title: "Redefinir Senha",
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
        path: "/checkout",
        title: "Office Checkout",
        component: OfficeCheckoutPage,
        authRequired: false,
        accessLevels: [],
        layout: "standalone",
    },
    {
        path: "/termos",
        title: "Termos",
        component: Terms,
        authRequired: false,
        accessLevels: [],
        layout: "standalone",
    },
    {
        path: "/privacidade",
        title: "Privacidade",
        component: Privacy,
        authRequired: false,
        accessLevels: [],
        layout: "standalone",
    },
    {
        path: "/reembolso",
        title: "Reembolso",
        component: Refund,
        authRequired: false,
        accessLevels: [],
        layout: "standalone",
    },
    {
        path: "/avisos-legais",
        title: "Avisos Legais",
        component: Disclaimers,
        authRequired: false,
        accessLevels: [],
        layout: "standalone",
    },
    {
        path: "/contrato",
        title: "Contrato",
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
        title: "Dashboard",
        titleKey: "dashboard",
        component: OverviewPage,
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
        title: "Dashboard",
        titleKey: "dashboard",
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
        titleKey: "pageBuilder",
        component: PageBuilderPage,
        authRequired: true,
        accessLevels: STAFF,
        layout: "protected",
        showInSidebar: true,
        sidebarLayouts: ["admin_lawyer"],
        sidebarGroup: "Configurações",
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
        sidebarLayouts: ["master", "manager", "seller"],
        icon: Users,
    },
    {
        path: "/payments",
        title: "Revenue",
        titleKey: "revenue",
        component: ZellePaymentsPage,
        authRequired: true,
        accessLevels: STAFF_AND_SELLER,
        layout: "protected",
        showInSidebar: true,
        sidebarLayouts: ["master", "manager", "seller"],
        icon: CreditCard,
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
        sidebarLayouts: ["master", "manager", "seller"],
        icon: MessageSquare,
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
        sidebarLayouts: ["master", "manager", "seller"],
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
        sidebarLayouts: ["admin_lawyer", "manager"],
        sidebarGroup: "Configurações",
        icon: Package2,
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
        sidebarLayouts: ["admin_lawyer", "manager", "master"],
        sidebarGroup: "Configurações",
        icon: CreditCard,
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
        sidebarLayouts: ["master", "manager"],
        icon: Users,
    },
    {
        path: "/processes",
        title: "Processes",
        titleKey: "matters",
        component: AdminProcessesPage,
        authRequired: true,
        accessLevels: STAFF,
        layout: "protected",
        showInSidebar: true,
        sidebarLayouts: ["master", "manager"],
        icon: BriefcaseBusiness,
    },
    {
        path: "/roles",
        title: "Roles",
        titleKey: "roles",
        component: RolesPage,
        authRequired: true,
        accessLevels: STAFF,
        layout: "protected",
        showInSidebar: true,
        sidebarLayouts: ["master", "admin_lawyer"],
        icon: ShieldCheck,
    },
    {
        path: "/processes/:id",
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
        title: "Meus Processos",
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
        title: "Detalhe Processo",
        component: ProcessDetailPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
    {
        path: "/dashboard/support",
        title: "Suporte",
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
        title: "Minha Conta",
        component: ProfileSettingsPage,
        authRequired: true,
        accessLevels: [AccessLevel.CUSTOMER],
        layout: "customer",
    },
];

export function routesByLayout(layout: RouteLayout) {
    return appRoutes.filter((route) => route.layout === layout);
}
