import {
  type CreateUserAccountInput,
  type UpdateUserAccountInput,
  type UserAccount,
  type UserAccountRecord,
  type UserAccountRole,
  mapUserAccountRecord,
  mapUserAccountRecords,
  toUserAccountInsert,
  toUserAccountUpdate,
} from "../models/users-account";
import type { HttpClient, HttpQueryParams } from "../lib/http";
import { createSupabaseHttpClient } from "../lib/supabase";

export type UserAccountSortField =
  | "createdAt"
  | "updatedAt"
  | "name"
  | "email"
  | "lastSignInAt";

export interface ListUserAccountsFilters {
  role?: UserAccountRole;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: UserAccountSortField;
  sortDirection?: "asc" | "desc";
}

export interface UsersAccountsServiceOptions {
  accessToken?: string;
  client?: HttpClient;
}

const sortFieldMap: Record<UserAccountSortField, string> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  name: "name",
  email: "email",
  lastSignInAt: "last_sign_in_at",
};

function createRestClient(accessToken?: string) {
  return createSupabaseHttpClient({
    target: "rest",
    accessToken,
  });
}

function sanitizeSearchTerm(value: string) {
  return value.trim().replaceAll(",", " ").replaceAll("(", "").replaceAll(")", "");
}

function buildListQuery(filters: ListUserAccountsFilters = {}): HttpQueryParams {
  const {
    role,
    isActive,
    search,
    limit,
    offset,
    sortBy = "createdAt",
    sortDirection = "desc",
  } = filters;

  const query: HttpQueryParams = {
    select: "*",
    order: `${sortFieldMap[sortBy]}.${sortDirection}`,
  };

  if (role) {
    query.role = `eq.${role}`;
  }

  if (typeof isActive === "boolean") {
    query.is_active = `eq.${isActive}`;
  }

  if (typeof limit === "number") {
    query.limit = limit;
  }

  if (typeof offset === "number") {
    query.offset = offset;
  }

  if (search && sanitizeSearchTerm(search)) {
    const term = sanitizeSearchTerm(search);
    query.or = `(name.ilike.*${term}*,email.ilike.*${term}*)`;
  }

  return query;
}

export class UsersAccountsService {
  private readonly client: HttpClient;

  constructor(options: UsersAccountsServiceOptions = {}) {
    this.client = options.client ?? createRestClient(options.accessToken);
  }

  async list(filters: ListUserAccountsFilters = {}): Promise<UserAccount[]> {
    const records = await this.client.get<UserAccountRecord[]>("/user_accounts", {
      query: buildListQuery(filters),
    });

    return mapUserAccountRecords(records);
  }

  async getById(id: string): Promise<UserAccount | null> {
    const records = await this.client.get<UserAccountRecord[]>("/user_accounts", {
      query: {
        select: "*",
        id: `eq.${id}`,
        limit: 1,
      },
    });

    const [record] = records;
    return record ? mapUserAccountRecord(record) : null;
  }

  async getByEmail(email: string): Promise<UserAccount | null> {
    const records = await this.client.get<UserAccountRecord[]>("/user_accounts", {
      query: {
        select: "*",
        email: `eq.${email}`,
        limit: 1,
      },
    });

    const [record] = records;
    return record ? mapUserAccountRecord(record) : null;
  }

  async create(input: CreateUserAccountInput): Promise<UserAccount> {
    const records = await this.client.post<UserAccountRecord[], ReturnType<typeof toUserAccountInsert>>(
      "/user_accounts",
      {
        query: { select: "*" },
        headers: {
          Prefer: "return=representation",
        },
        body: toUserAccountInsert(input),
      },
    );

    const [record] = records;

    if (!record) {
      throw new Error("Failed to create user_accounts record.");
    }

    return mapUserAccountRecord(record);
  }

  async upsert(input: CreateUserAccountInput): Promise<UserAccount> {
    const records = await this.client.post<UserAccountRecord[], ReturnType<typeof toUserAccountInsert>>(
      "/user_accounts",
      {
        query: { select: "*" },
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: toUserAccountInsert(input),
      },
    );

    const [record] = records;

    if (!record) {
      throw new Error("Failed to upsert user_accounts record.");
    }

    return mapUserAccountRecord(record);
  }

  async update(id: string, input: UpdateUserAccountInput): Promise<UserAccount> {
    const records = await this.client.patch<UserAccountRecord[], ReturnType<typeof toUserAccountUpdate>>(
      "/user_accounts",
      {
        query: {
          select: "*",
          id: `eq.${id}`,
        },
        headers: {
          Prefer: "return=representation",
        },
        body: toUserAccountUpdate(input),
      },
    );

    const [record] = records;

    if (!record) {
      throw new Error(`user_accounts record not found for id "${id}".`);
    }

    return mapUserAccountRecord(record);
  }

  async delete(id: string): Promise<UserAccount | null> {
    const records = await this.client.delete<UserAccountRecord[]>("/user_accounts", {
      query: {
        select: "*",
        id: `eq.${id}`,
      },
      headers: {
        Prefer: "return=representation",
      },
    });

    const [record] = records;
    return record ? mapUserAccountRecord(record) : null;
  }
}

export function createUsersAccountsService(options: UsersAccountsServiceOptions = {}) {
  return new UsersAccountsService(options);
}
