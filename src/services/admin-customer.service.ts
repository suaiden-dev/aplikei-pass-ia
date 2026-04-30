import { getServiceBySlug } from "../data/services";
import { readMockUsers, readUserServices } from "../mocks/customer-portal";
import { customerRecords, type CustomerRecord } from "../mocks/master-dashboard";
import { isAnalysisServiceSlug, isProcessDenied, type UserService } from "../models/process.model";

export interface AdminCustomerRecord extends CustomerRecord {
  stageDetails: string[];
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
      ["active", "awaiting_review", "completed"].includes(service.status),
    )
  ) {
    return "active";
  }

  return "new";
}

function buildDynamicCustomerRecords(): AdminCustomerRecord[] {
  const users = readMockUsers().filter((user) => user.role === "customer");
  const services = readUserServices().filter(shouldIncludeService);

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

    customerRecords.forEach((customer) => {
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
