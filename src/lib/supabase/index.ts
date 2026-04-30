export * from "./client";
export * from "./env";
export * from "./http-client";
import {
  readMockSession,
  readPortalNotifications,
  readServiceAvailability,
  readUserServices,
  writePortalNotifications,
  writeUserServices,
} from "../../mocks/customer-portal";

type Row = Record<string, unknown>;
type ChannelHandler = (status: string, error?: Error) => void;

const uploadedFiles = new Map<string, string>();

function getTableRows(table: string): Row[] {
  if (table === "services_prices") {
    return Object.entries(readServiceAvailability()).map(([service_id, is_active]) => ({
      service_id,
      is_active,
      price: service_id === "apoio-rfe-motion-inicio" ? 1500 : 350,
    }));
  }

  if (table === "user_services") {
    return readUserServices() as unknown as Row[];
  }

  if (table === "notifications") {
    return readPortalNotifications() as unknown as Row[];
  }

  return [];
}

function persistTableRows(table: string, rows: Row[]) {
  if (table === "user_services") {
    writeUserServices(rows as never[]);
  }

  if (table === "notifications") {
    writePortalNotifications(rows as never[]);
  }
}

function createQuery(table: string) {
  const state: {
    filters: Array<(row: Row) => boolean>;
    orderBy?: { column: string; ascending: boolean };
    limit?: number;
    mode: "select" | "update";
    updateValues?: Row;
  } = {
    filters: [],
    mode: "select",
  };

  const api = {
    select(_columns?: string) {
      state.mode = "select";
      return api;
    },
    update(values: Row) {
      state.mode = "update";
      state.updateValues = values;
      return api;
    },
    eq(column: string, value: unknown) {
      state.filters.push((row) => row[column] === value);
      return api;
    },
    in(column: string, values: unknown[]) {
      state.filters.push((row) => values.includes(row[column]));
      return api;
    },
    order(column: string, options?: { ascending?: boolean }) {
      state.orderBy = { column, ascending: options?.ascending ?? true };
      return api;
    },
    limit(value: number) {
      state.limit = value;
      return api;
    },
    async maybeSingle() {
      const result = await api.execute();
      return { data: result.data[0] ?? null, error: result.error };
    },
    async single() {
      const result = await api.execute();
      return { data: result.data[0] ?? null, error: result.error };
    },
    async execute() {
      let rows = getTableRows(table);
      rows = rows.filter((row) => state.filters.every((filter) => filter(row)));

      if (state.orderBy) {
        rows = [...rows].sort((a, b) => {
          const left = a[state.orderBy!.column];
          const right = b[state.orderBy!.column];
          if (left === right) return 0;
          if (left == null) return 1;
          if (right == null) return -1;
          return state.orderBy!.ascending ? String(left).localeCompare(String(right)) : String(right).localeCompare(String(left));
        });
      }

      if (typeof state.limit === "number") {
        rows = rows.slice(0, state.limit);
      }

      if (state.mode === "update") {
        const originalRows = getTableRows(table);
        const nextRows = originalRows.map((row) =>
          state.filters.every((filter) => filter(row))
            ? { ...row, ...state.updateValues }
            : row,
        );
        persistTableRows(table, nextRows);
        return {
          data: nextRows.filter((row) => state.filters.every((filter) => filter(row))),
          error: null as { message: string } | null,
        };
      }

      return { data: rows, error: null as { message: string } | null };
    },
    then<TResult1 = { data: Row[]; error: { message: string } | null }, TResult2 = never>(
      onfulfilled?: ((value: { data: Row[]; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return api.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
    },
  };

  return api;
}

function createMockChannel() {
  return {
    on(_event?: string, _config?: unknown, _callback?: unknown) {
      return this;
    },
    subscribe(handler?: ChannelHandler) {
      handler?.("SUBSCRIBED");
      return this;
    },
    unsubscribe() {},
  };
}

export const supabase = {
  auth: {
    async updateUser(_payload?: unknown) {
      return { data: { user: null }, error: null };
    },
    async getSession() {
      const session = readMockSession();
      return {
        data: {
          session: session
            ? {
                user: {
                  id: session.userId,
                  email: session.email,
                },
              }
            : null,
        },
        error: null,
      };
    },
  },
  storage: {
    from(_bucket?: string) {
      return {
        async upload(path: string, file: File, _options?: unknown) {
          uploadedFiles.set(path, URL.createObjectURL(file));
          return { error: null as { message: string } | null };
        },
        async update(path: string, file: File) {
          uploadedFiles.set(path, URL.createObjectURL(file));
          return { error: null as { message: string } | null };
        },
        getPublicUrl(path: string) {
          return {
            data: {
              publicUrl: uploadedFiles.get(path) ?? path,
            },
          };
        },
        async remove(paths: string[]) {
          paths.forEach((path) => uploadedFiles.delete(path));
          return { error: null as { message: string } | null };
        },
      };
    },
  },
  from(table: string) {
    return createQuery(table);
  },
  channel(_name?: string) {
    return createMockChannel();
  },
  async removeChannel(channel?: { unsubscribe?: () => void }) {
    channel?.unsubscribe?.();
    return "ok";
  },
};
