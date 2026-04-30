export const userAccountRoles = ["customer", "admin", "seller", "master"] as const;

export type UserAccountRole = (typeof userAccountRoles)[number];

export type UserAccountMetadata = Record<string, unknown>;

export interface UserAccountRecord {
  id: string;
  role: UserAccountRole;
  email: string | null;
  name: string;
  profile_url: string | null;
  phone: string | null;
  metadata: UserAccountMetadata;
  is_active: boolean;
  terms_accepted_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export type UserAccountInsert = Omit<UserAccountRecord, "created_at" | "updated_at">;

export type UserAccountUpdate = Partial<UserAccountInsert>;

export interface UserAccount {
  id: string;
  role: UserAccountRole;
  email: string | null;
  name: string;
  profileUrl: string | null;
  phone: string | null;
  metadata: UserAccountMetadata;
  isActive: boolean;
  termsAcceptedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserAccountInput {
  id: string;
  role?: UserAccountRole;
  email?: string | null;
  name: string;
  profileUrl?: string | null;
  phone?: string | null;
  metadata?: UserAccountMetadata;
  isActive?: boolean;
  termsAcceptedAt?: string | null;
  lastSignInAt?: string | null;
}

export interface UpdateUserAccountInput {
  role?: UserAccountRole;
  email?: string | null;
  name?: string;
  profileUrl?: string | null;
  phone?: string | null;
  metadata?: UserAccountMetadata;
  isActive?: boolean;
  termsAcceptedAt?: string | null;
  lastSignInAt?: string | null;
}

export function isUserAccountRole(value: string): value is UserAccountRole {
  return userAccountRoles.includes(value as UserAccountRole);
}

export function mapUserAccountRecord(record: UserAccountRecord): UserAccount {
  return {
    id: record.id,
    role: record.role,
    email: record.email,
    name: record.name,
    profileUrl: record.profile_url,
    phone: record.phone,
    metadata: record.metadata,
    isActive: record.is_active,
    termsAcceptedAt: record.terms_accepted_at,
    lastSignInAt: record.last_sign_in_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapUserAccountRecords(records: UserAccountRecord[]) {
  return records.map(mapUserAccountRecord);
}

export function toUserAccountInsert(input: CreateUserAccountInput): UserAccountInsert {
  return {
    id: input.id,
    role: input.role ?? "customer",
    email: input.email ?? null,
    name: input.name,
    profile_url: input.profileUrl ?? null,
    phone: input.phone ?? null,
    metadata: input.metadata ?? {},
    is_active: input.isActive ?? true,
    terms_accepted_at: input.termsAcceptedAt ?? null,
    last_sign_in_at: input.lastSignInAt ?? null,
  };
}

export function toUserAccountUpdate(input: UpdateUserAccountInput): UserAccountUpdate {
  const update: UserAccountUpdate = {};

  if (input.role !== undefined) update.role = input.role;
  if (input.email !== undefined) update.email = input.email;
  if (input.name !== undefined) update.name = input.name;
  if (input.profileUrl !== undefined) update.profile_url = input.profileUrl;
  if (input.phone !== undefined) update.phone = input.phone;
  if (input.metadata !== undefined) update.metadata = input.metadata;
  if (input.isActive !== undefined) update.is_active = input.isActive;
  if (input.termsAcceptedAt !== undefined) update.terms_accepted_at = input.termsAcceptedAt;
  if (input.lastSignInAt !== undefined) update.last_sign_in_at = input.lastSignInAt;

  return update;
}
