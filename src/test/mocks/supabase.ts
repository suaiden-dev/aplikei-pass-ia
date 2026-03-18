/**
 * Supabase client mock for testing.
 * This mock replaces @/integrations/supabase/client across all tests.
 */
import { vi } from "vitest";

// Helper to create a chainable query builder mock
// Helper to create a chainable query builder mock
const createQueryBuilder = (data: unknown[] = [], error: Error | null = null) => {
  const builder: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: data[0] ?? null, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data: data[0] ?? null, error }),
    then: vi.fn((resolve: (val: { data: unknown; error: Error | null }) => void) => resolve({ data, error })),
  };

  // Make the builder itself thenable (so `await supabase.from(...).select(...)` works)
  Object.defineProperty(builder, Symbol.for("nodejs.util.promisify.custom"), {
    value: () => Promise.resolve({ data, error }),
    configurable: true,
  });

  return builder;
};

// Auth mock
const mockAuth = {
  getSession: vi.fn().mockResolvedValue({
    data: { session: null as unknown },
    error: null as Error | null,
  }),
  getUser: vi.fn().mockResolvedValue({
    data: { user: null as unknown },
    error: null as Error | null,
  }),
  signInWithPassword: vi.fn().mockResolvedValue({
    data: { user: null as unknown, session: null as unknown },
    error: null as Error | null,
  }),
  signUp: vi.fn().mockResolvedValue({
    data: { user: null as unknown, session: null as unknown },
    error: null as Error | null,
  }),
  signOut: vi.fn().mockResolvedValue({ error: null as Error | null }),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null as Error | null }),
  updateUser: vi.fn().mockResolvedValue({
    data: { user: null as unknown },
    error: null as Error | null,
  }),
};

// Storage mock
const mockStorage = {
  from: vi.fn().mockReturnValue({
    upload: vi.fn().mockResolvedValue({ data: { path: "test-path" }, error: null }),
    download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://test.supabase.co/storage/test" } }),
    createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: "https://test.supabase.co/signed" }, error: null }),
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    list: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
};

// Functions mock
const mockFunctions = {
  invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
};

// Channel / Realtime mock
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue("subscribed"),
};

// The main mock
export const supabase = {
  auth: mockAuth,
  from: vi.fn().mockReturnValue(createQueryBuilder()),
  storage: mockStorage,
  functions: mockFunctions,
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
};

// Utility to configure mock responses for specific tables
export const mockSupabaseTable = (
  tableName: string,
  data: unknown[] = [],
  error: Error | null = null,
) => {
  const builder = createQueryBuilder(data, error);
  (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    if (table === tableName) return builder;
    return createQueryBuilder();
  });
  return builder;
};

// Utility to configure auth mock for logged-in user
export const mockAuthenticatedUser = (user: Record<string, unknown> = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: { full_name: "Test User" },
}) => {
  const session = {
    user,
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
  };

  mockAuth.getSession.mockResolvedValue({
    data: { session: session as unknown },
    error: null,
  });

  mockAuth.getUser.mockResolvedValue({
    data: { user: user as unknown },
    error: null,
  });

  return { user, session };
};

// Reset all mocks
export const resetSupabaseMocks = () => {
  vi.clearAllMocks();
  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(createQueryBuilder());
};

export default supabase;
