import { getServiceBySlug } from "@shared/data/services";
import { supabase } from "@shared/lib/supabase";
import { isAnalysisServiceSlug, isProcessDenied, type UserService } from "@shared/types/process.model";

export interface CustomerRow {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email: string;
  phone?: string | null;
  phone_number?: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export interface CustomerWithStats extends CustomerRow {
  productsCount: number;
  totalSpent: number;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  stage: string;
  country: string;
  lifetimeValue: number;
  status: "active" | "new" | "risk";
  owner: string;
}

const HARDCODED_CUSTOMERS: CustomerRecord[] = [
  { id: "c-001", name: "Ana Silva",       email: "ana.silva@email.com",    stage: "Visto B1/B2 Premium",  country: "Brasil",   lifetimeValue: 4200, status: "active", owner: "Sarah" },
  { id: "c-002", name: "Carlos Costa",    email: "carlos.costa@email.com", stage: "Consultoria F-1",      country: "Brasil",   lifetimeValue: 3200, status: "new",    owner: "Bruno" },
  { id: "c-003", name: "Mariana Lima",    email: "mariana.lima@email.com", stage: "Troca de Status",      country: "Brasil",   lifetimeValue: 5100, status: "active", owner: "Sarah" },
  { id: "c-004", name: "John Miller",     email: "john.miller@email.com",  stage: "Extensão de Status",  country: "EUA",      lifetimeValue: 2800, status: "risk",   owner: "Bruno" },
  { id: "c-005", name: "Julia Rocha",     email: "julia.rocha@email.com",  stage: "Visto B1/B2",         country: "Brasil",   lifetimeValue: 3900, status: "new",    owner: "Bianca" },
  { id: "c-006", name: "Pedro Santos",    email: "pedro.santos@email.com", stage: "Mentoria Consular",   country: "Portugal", lifetimeValue: 1800, status: "active", owner: "Sarah" },
];

export interface AdminCustomerRecord extends CustomerRecord {
  stageDetails: string[];
}

export async function listCustomersWithStats(): Promise<CustomerWithStats[]> {
  const [
    { data: accountsData, error: accountsErr },
    { data: zelleData },
    { data: stripeData },
  ] = await Promise.all([
    supabase
      .from("user_accounts")
      .select("id, name, full_name, email, phone, phone_number, avatar_url, role, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("zelle_payments").select("amount, user_id, guest_email").eq("status", "approved"),
    supabase
      .from("orders")
      .select("total_price_usd, client_email")
      .in("payment_status", ["paid", "complete", "succeeded", "completed"]),
  ]);

  if (accountsErr) throw Error(accountsErr.message);

  return ((accountsData ?? []) as CustomerRow[]).map((customer) => {
    let productsCount = 0;
    let totalSpent = 0;

    zelleData?.forEach((payment) => {
      if (
        payment.user_id === customer.id ||
        payment.guest_email?.toLowerCase() === customer.email?.toLowerCase()
      ) {
        productsCount += 1;
        totalSpent += Number(payment.amount) || 0;
      }
    });

    stripeData?.forEach((order) => {
      if (order.client_email?.toLowerCase() === customer.email?.toLowerCase()) {
        productsCount += 1;
        const value = typeof order.total_price_usd === "string"
          ? parseFloat(order.total_price_usd)
          : order.total_price_usd;
        totalSpent += Number(value) || 0;
      }
    });

    return {
      ...customer,
      productsCount,
      totalSpent,
    };
  });
}

function parsePrice(price?: string) {
  if (!price) return 0;

  const normalized = price
    .replace(/[^\d.,]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function shouldIncludeService(service: UserService) {
  const slug = service.service_slug.toLowerCase();

  return (
    !isAnalysisServiceSlug(slug) &&
    !slug.startsWith("apoio-") &&
    !slug.startsWith("revisao-") &&
    !slug.startsWith("dependente-") &&
    !slug.startsWith("slot-") &&
    !slug.includes("rfe") &&
    !slug.includes("motion")
  );
}

function getProductLabel(service: UserService) {
  if (service.service_slug.startsWith("visto-b1-b2")) return "B1/B2";
  if (service.service_slug.startsWith("visto-f1")) return "F-1";
  if (service.service_slug === "troca-status") return "Troca de Status";
  if (service.service_slug === "extensao-status") return "Extensão de Status";

  return getServiceBySlug(service.service_slug)?.title ?? service.service_slug;
}

function getCurrentStepLabel(service: UserService) {
  const serviceMeta = getServiceBySlug(service.service_slug);
  const steps = serviceMeta?.steps ?? [];

  if (steps.length === 0) {
    return serviceMeta?.title ?? "Processo em andamento";
  }

  const currentIndex = Math.min(
    Math.max(service.current_step ?? 0, 0),
    steps.length - 1,
  );

  return steps[currentIndex]?.title ?? serviceMeta?.title ?? "Processo em andamento";
}

function getCustomerStatus(processes: UserService[]): CustomerRecord["status"] {
  if (processes.some((service) => isProcessDenied(service))) {
    return "risk";
  }

  if (
    processes.some((service) =>
      ["active", "awaiting_review", "completed"].includes(service.status as any),
    )
  ) {
    return "active";
  }

  return "new";
}

function buildDynamicCustomerRecords(): AdminCustomerRecord[] {
  // TODO: replace with real Supabase query for user_accounts + user_services
  const users: { id: string; name: string; email: string; role: string }[] = [];
  const services: UserService[] = [];

  return users
    .map((user) => {
      const customerProcesses = services
        .filter((service) => service.user_id === user.id)
        .sort(
          (left, right) =>
            new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
        );

      if (customerProcesses.length === 0) {
        return null;
      }

      const stageDetails = customerProcesses.map(
        (service) => `${getProductLabel(service)}: ${getCurrentStepLabel(service)}`,
      );

      const lifetimeValue = customerProcesses.reduce((sum, service) => {
        return sum + parsePrice(getServiceBySlug(service.service_slug)?.price);
      }, 0);

      return {
        id: user.id,
        name: user.name ?? "Cliente",
        email: user.email ?? "",
        stage: stageDetails[0] ?? "Sem etapa ativa",
        stageDetails,
        country: "Brasil",
        lifetimeValue,
        status: getCustomerStatus(customerProcesses),
        owner: "Aplikei Ops",
      } satisfies AdminCustomerRecord;
    })
    .filter((customer): customer is AdminCustomerRecord => customer !== null);
}

export const adminCustomerService = {
  listCustomers(): AdminCustomerRecord[] {
    const dynamicCustomers = buildDynamicCustomerRecords();
    const byEmail = new Map<string, AdminCustomerRecord>();

    HARDCODED_CUSTOMERS.forEach((customer) => {
      byEmail.set(customer.email.toLowerCase(), {
        ...customer,
        stageDetails: [customer.stage],
      });
    });

    dynamicCustomers.forEach((customer) => {
      const key = customer.email.toLowerCase();
      const existing = byEmail.get(key);

      byEmail.set(key, existing ? { ...existing, ...customer } : customer);
    });

    return Array.from(byEmail.values()).sort((left, right) => {
      if (left.status !== right.status) {
        if (left.status === "active") return -1;
        if (right.status === "active") return 1;
        if (left.status === "new") return -1;
        if (right.status === "new") return 1;
      }

      return right.lifetimeValue - left.lifetimeValue || left.name.localeCompare(right.name);
    });
  },
};
