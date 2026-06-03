import type { Database } from "./database";

type PublicSchema = Database["public"];
type PublicTables = PublicSchema["Tables"];

export type DbTableRow<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type DbTableInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type DbTableUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];

export type UserServiceRow = DbTableRow<"user_services">;
export type UserServiceInsert = DbTableInsert<"user_services">;
export type UserServiceUpdate = DbTableUpdate<"user_services">;

// New notification schema types
export type NotificationMessageRow = {
  id: string;
  sender_user_id: string | null;
  status: string;
  category: string;
  action: string;
  /** Routing intent: "client" | "admin" | "master" | "admin_lawyer" */
  target_role: string | null;
  /** Office scope resolved at creation time */
  target_office_id: string | null;
  process_id: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  send_email: boolean;
  created_at: string;
};

export type NotificationGroupRow = {
  id: string;
  notification_id: string;
  user_id: string;
  role: string | null;
  office_id: string | null;
  viewed: boolean;
  email_sent: boolean;
  created_at: string;
};
