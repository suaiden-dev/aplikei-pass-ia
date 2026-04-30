import { mockAuthUsersSeed, type MockAuthUser } from "./auth-users";
import type { UserService } from "../models/process.model";
import type { NotificationRecord } from "../models/notification.model";
import {
  readNotificationRecords,
  writeNotificationRecords,
} from "../database/notifications.database";

export interface PortalChatMessage {
  id: string;
  process_id: string;
  sender_id: string;
  sender_role: "admin" | "customer";
  content: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
}

export type PortalNotification = NotificationRecord;

const USERS_STORAGE_KEY = "aplikei.mock-auth.users";
const SESSION_STORAGE_KEY = "aplikei.mock-auth.session";
const USER_SERVICES_KEY = "aplikei.customer.user-services";
const CHAT_MESSAGES_KEY = "aplikei.customer.chat-messages";
const SERVICE_AVAILABILITY_KEY = "aplikei.customer.service-availability";
const DEMO_RESET_KEY = "aplikei.demo-customer-reset";
const DEMO_RESET_VERSION = "2026-04-28-demo-customer-reset-v4";

const now = new Date("2026-04-27T19:00:00.000Z").toISOString();
const customerDemo = mockAuthUsersSeed.find((user) => user.email === "customer@aplikei.com");
const anaDemo = mockAuthUsersSeed.find((user) => user.email === "ana.silva@aplikei.com");

function ensure<T>(key: string, seed: () => T): T {
  maybeResetDemoCustomerData();

  if (typeof window === "undefined") {
    return seed();
  }

  const stored = window.localStorage.getItem(key);
  if (!stored) {
    const initial = seed();
    window.localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    const initial = seed();
    window.localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
}

function maybeResetDemoCustomerData() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.localStorage.getItem(DEMO_RESET_KEY) === DEMO_RESET_VERSION) {
    return;
  }

  const customerId = customerDemo?.id;
  if (!customerId) {
    window.localStorage.setItem(DEMO_RESET_KEY, DEMO_RESET_VERSION);
    return;
  }

  const storedServices = window.localStorage.getItem(USER_SERVICES_KEY);
  const removedProcessIds = new Set<string>();

  if (storedServices) {
    try {
      const parsed = JSON.parse(storedServices) as UserService[];
      const filtered = parsed.filter((service) => {
        if (service.user_id === customerId) {
          removedProcessIds.add(service.id);
          return false;
        }
        return true;
      });
      // Re-add the fresh seeded processes for the customer demo
      const freshCustomerSeed = seedCustomerDemoServices();
      freshCustomerSeed.forEach((s) => removedProcessIds.delete(s.id));
      window.localStorage.setItem(USER_SERVICES_KEY, JSON.stringify([...filtered, ...freshCustomerSeed]));
    } catch {
      window.localStorage.removeItem(USER_SERVICES_KEY);
    }
  }

  const storedMessages = window.localStorage.getItem(CHAT_MESSAGES_KEY);
  if (storedMessages) {
    try {
      const parsed = JSON.parse(storedMessages) as PortalChatMessage[];
      const filtered = parsed.filter((message) => (
        message.sender_id !== customerId && !removedProcessIds.has(message.process_id)
      ));
      window.localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(filtered));
    } catch {
      window.localStorage.removeItem(CHAT_MESSAGES_KEY);
    }
  }

  const filteredNotifications = readNotificationRecords().filter((notification) => (
    notification.user_id !== customerId &&
    notification.actor_user_id !== customerId &&
    (!notification.service_id || !removedProcessIds.has(notification.service_id))
  ));
  writeNotificationRecords(filteredNotifications);

  window.localStorage.setItem(DEMO_RESET_KEY, DEMO_RESET_VERSION);
}

export function emitPortalEvent(name: string, detail?: unknown) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

export function onPortalEvent(name: string, listener: (event: Event) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}

function seedCustomerDemoServices(): UserService[] {
  const customerId = customerDemo?.id ?? "00000000-0000-0000-0000-000000000002";
  return [
    {
      id: "proc-customer-b1b2-001",
      user_id: customerId,
      service_slug: "visto-b1-b2",
      status: "active",
      current_step: 0,
      step_data: {
        homeCountry: "Brasil",
        securityExceptions: "nao",
        docs: {},
      },
      created_at: now,
      updated_at: now,
    },
    {
      id: "proc-customer-cos-001",
      user_id: customerId,
      service_slug: "troca-status",
      status: "active",
      current_step: 0,
      step_data: {
        currentVisa: "B-2",
        targetVisa: "F-1",
        i94Date: "",
        dependents: [],
        docs: {},
      },
      created_at: now,
      updated_at: now,
    },
  ];
}

function seedUserServices(): UserService[] {
  const anaId = anaDemo?.id ?? "ana-demo";

  return [
    {
      id: "proc-ana-b1b2-001",
      user_id: anaId,
      service_slug: "visto-b1-b2",
      status: "active",
      current_step: 2,
      step_data: {
        docs: {},
      },
      created_at: now,
      updated_at: now,
    },
    ...seedCustomerDemoServices(),
  ];
}

function seedChatMessages(): PortalChatMessage[] {
  return [];
}

function seedAvailability() {
  return {
    "visto-b1-b2": true,
    "visto-b1-b2-reaplicacao": true,
    "visto-f1": true,
    "visto-f1-reaplicacao": true,
    "troca-status": true,
    "extensao-status": true,
  };
}

export function readMockUsers() {
  return ensure<MockAuthUser[]>(USERS_STORAGE_KEY, () => mockAuthUsersSeed);
}

export function writeMockUsers(users: MockAuthUser[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
}

export function readMockSession() {
  return ensure<{ userId: string; email: string; role: string; signedInAt: string } | null>(
    SESSION_STORAGE_KEY,
    () => null,
  );
}

export function writeMockSession(session: unknown) {
  if (typeof window !== "undefined") {
    if (session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
}

export function readUserServices() {
  return ensure<UserService[]>(USER_SERVICES_KEY, seedUserServices);
}

export function writeUserServices(services: UserService[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_SERVICES_KEY, JSON.stringify(services));
  }
  emitPortalEvent("aplikei:processes:changed");
}

export function readChatMessages() {
  return ensure<PortalChatMessage[]>(CHAT_MESSAGES_KEY, seedChatMessages);
}

export function writeChatMessages(messages: PortalChatMessage[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  }
  emitPortalEvent("aplikei:chat:changed");
}

export function readPortalNotifications() {
  return readNotificationRecords();
}

export function writePortalNotifications(notifications: PortalNotification[]) {
  writeNotificationRecords(notifications);
  emitPortalEvent("aplikei:notifications:changed");
}

export function readServiceAvailability() {
  return ensure<Record<string, boolean>>(SERVICE_AVAILABILITY_KEY, seedAvailability);
}
