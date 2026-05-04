import type { Database } from "../../types/supabase";

type PublicSchema = Database["public"];
type PublicTables = PublicSchema["Tables"];

export type DbTableRow<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type DbTableInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type DbTableUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];

export type UserServiceRow = DbTableRow<"user_services">;
export type UserServiceInsert = DbTableInsert<"user_services">;
export type UserServiceUpdate = DbTableUpdate<"user_services">;

export type NotificationRow = DbTableRow<"notifications">;
