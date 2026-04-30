import { mockAuthUsersSeed } from "../mocks/auth-users";
import {
  normalizeNotificationRole,
  type NotificationCreateInput,
  type NotificationFilters,
  type NotificationRecord,
  type NotificationUpdateInput,
} from "../models/notification.model";

const NOTIFICATIONS_STORAGE_KEY = "aplikei.notifications.records";
const LEGACY_NOTIFICATIONS_STORAGE_KEY = "aplikei.customer.notifications";
const now = new Date("2026-04-27T19:00:00.000Z").toISOString();
const customerDemo = mockAuthUsersSeed.find((user) => user.email === "customer@aplikei.com");

function ensure<T>(key: string, seed: () => T): T {
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

function readLegacyNotifications() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(LEGACY_NOTIFICATIONS_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Array<Record<string, unknown>>;
  } catch {
    return null;
  }
}

function normalizeLegacyNotification(record: Record<string, unknown>): NotificationRecord {
  const createdAt = typeof record.created_at === "string" ? record.created_at : now;
  const kind = typeof record.kind === "string" ? record.kind : "system_notice";
  const category = typeof record.category === "string" ? record.category : (
    kind.includes("payment") ? "payment" : kind.includes("chat") ? "chat" : "system"
  );

  return {
    id: typeof record.id === "string" ? record.id : crypto.randomUUID(),
    user_id: typeof record.user_id === "string" ? record.user_id : null,
    actor_user_id: typeof record.actor_user_id === "string" ? record.actor_user_id : null,
    actor_role: typeof record.actor_role === "string" ? record.actor_role as NotificationRecord["actor_role"] : null,
    target_role: normalizeNotificationRole(
      (typeof record.target_role === "string" ? record.target_role : "customer") as "admin" | "client" | "customer",
    ),
    type: (typeof record.type === "string" ? record.type : "system") as NotificationRecord["type"],
    kind: kind as NotificationRecord["kind"],
    category: category as NotificationRecord["category"],
    service_id: typeof record.service_id === "string" ? record.service_id : null,
    title: typeof record.title === "string" ? record.title : "Notificação",
    message: typeof record.message === "string" ? record.message : null,
    link: typeof record.link === "string" ? record.link : null,
    is_read: Boolean(record.is_read),
    read_at: typeof record.read_at === "string" ? record.read_at : null,
    send_email: Boolean(record.send_email),
    email_sent: Boolean(record.email_sent),
    email_sent_at: typeof record.email_sent_at === "string" ? record.email_sent_at : null,
    metadata: typeof record.metadata === "object" && record.metadata !== null
      ? record.metadata as Record<string, unknown>
      : {},
    created_at: createdAt,
    updated_at: typeof record.updated_at === "string" ? record.updated_at : createdAt,
  };
}

function seedNotifications(): NotificationRecord[] {
  void customerDemo;
  return [];
}

function persistNotifications(records: NotificationRecord[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(records));
  }
}

function sortNotifications(records: NotificationRecord[]) {
  return [...records].sort((left, right) => (
    new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  ));
}

export function readNotificationRecords() {
  const seeded = ensure<NotificationRecord[]>(NOTIFICATIONS_STORAGE_KEY, () => {
    const legacy = readLegacyNotifications();
    if (legacy?.length) {
      return legacy.map(normalizeLegacyNotification);
    }

    return seedNotifications();
  });

  return sortNotifications(seeded);
}

export function writeNotificationRecords(records: NotificationRecord[]) {
  persistNotifications(sortNotifications(records));
}

export function listNotificationRecords(filters: NotificationFilters = {}) {
  const normalizedRole = filters.role ? normalizeNotificationRole(filters.role) : undefined;

  let records = readNotificationRecords().filter((record) => {
    if (normalizedRole === "admin") {
      return record.target_role === "admin";
    }

    if (normalizedRole === "customer") {
      return record.target_role === "customer" && (!filters.userId || record.user_id === filters.userId);
    }

    if (filters.userId && record.user_id !== filters.userId) {
      return false;
    }

    return true;
  });

  if (filters.serviceId) {
    records = records.filter((record) => record.service_id === filters.serviceId);
  }

  if (filters.unreadOnly) {
    records = records.filter((record) => !record.is_read);
  }

  if (filters.kinds?.length) {
    records = records.filter((record) => filters.kinds!.includes(record.kind));
  }

  if (filters.types?.length) {
    records = records.filter((record) => filters.types!.includes(record.type));
  }

  if (typeof filters.limit === "number") {
    records = records.slice(0, filters.limit);
  }

  return records;
}

export function insertNotificationRecord(input: NotificationCreateInput): NotificationRecord {
  const timestamp = input.created_at ?? new Date().toISOString();
  const record: NotificationRecord = {
    id: crypto.randomUUID(),
    user_id: input.user_id ?? null,
    actor_user_id: input.actor_user_id ?? null,
    actor_role: input.actor_role ?? null,
    target_role: normalizeNotificationRole(input.target_role),
    type: input.type ?? "system",
    kind: input.kind ?? "system_notice",
    category: input.category ?? "system",
    service_id: input.service_id ?? null,
    title: input.title,
    message: input.message ?? null,
    link: input.link ?? null,
    is_read: input.is_read ?? false,
    read_at: input.read_at ?? null,
    send_email: input.send_email ?? false,
    email_sent: input.email_sent ?? false,
    email_sent_at: input.email_sent_at ?? null,
    metadata: input.metadata ?? {},
    created_at: timestamp,
    updated_at: input.updated_at ?? timestamp,
  };

  writeNotificationRecords([record, ...readNotificationRecords()]);
  return record;
}

export function updateNotificationRecord(id: string, input: NotificationUpdateInput) {
  let updatedRecord: NotificationRecord | null = null;

  writeNotificationRecords(
    readNotificationRecords().map((record) => {
      if (record.id !== id) {
        return record;
      }

      updatedRecord = {
        ...record,
        ...input,
        updated_at: input.updated_at ?? new Date().toISOString(),
      };

      return updatedRecord;
    }),
  );

  return updatedRecord;
}

export function markNotificationAsRead(id: string) {
  return updateNotificationRecord(id, {
    is_read: true,
    read_at: new Date().toISOString(),
  });
}

export function markNotificationsAsRead(filters: NotificationFilters = {}) {
  const ids = new Set(listNotificationRecords(filters).map((record) => record.id));

  if (ids.size === 0) {
    return [];
  }

  const readAt = new Date().toISOString();
  const updated: NotificationRecord[] = [];

  writeNotificationRecords(
    readNotificationRecords().map((record) => {
      if (!ids.has(record.id) || record.is_read) {
        return record;
      }

      const nextRecord = {
        ...record,
        is_read: true,
        read_at: readAt,
        updated_at: readAt,
      };

      updated.push(nextRecord);
      return nextRecord;
    }),
  );

  return updated;
}
