/**
 * Supabase client mock for testing.
 * This mock replaces @/integrations/supabase/client across all tests.
 */
import { vi } from "vitest";

// Helper to create a chainable query builder mock
const createQueryBuilder = (data: any = [], error: any = null) => {
  const builder: any = {
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
    then: vi.fn((resolve: any) => resolve({ data, error })),
  };

  // Make the builder itself thenable (so `await supabase.from(...).select(...)` works)
  builder[Symbol.for("nodejs.util.promisify.custom")] = () =>
    Promise.resolve({ data, error });

  return builder;
};

// Auth mock
const mockAuth = {
  getSession: vi.fn().mockResolvedValue({
    data: { session: null },
    error: null,
  }),
  getUser: vi.fn().mockResolvedValue({
    data: { user: null },
    error: null,
  }),
  signInWithPassword: vi.fn().mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  }),
  signUp: vi.fn().mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  updateUser: vi.fn().mockResolvedValue({
    data: { user: null },
    error: null,
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
  data: any[] = [],
  error: any = null,
) => {
  const builder = createQueryBuilder(data, error);
  supabase.from.mockImplementation((table: string) => {
    if (table === tableName) return builder;
    return createQueryBuilder();
  });
  return builder;
};

// Utility to configure auth mock for logged-in user
export const mockAuthenticatedUser = (user: any = {
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
    data: { session },
    error: null,
  });

  mockAuth.getUser.mockResolvedValue({
    data: { user },
    error: null,
  });

  return { user, session };
};

// Reset all mocks
export const resetSupabaseMocks = () => {
  vi.clearAllMocks();
  supabase.from.mockReturnValue(createQueryBuilder());
};

export default supabase;
