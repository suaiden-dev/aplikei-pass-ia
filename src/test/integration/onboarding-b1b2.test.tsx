import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import Onboarding from "@/pages/dashboard/onboarding";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mocking useAuth hook to simulate authenticated context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    session: { 
      user: { 
        id: "test-user-id", 
        email: "test@example.com",
        user_metadata: { full_name: "Test User" }
      } 
    },
    loading: false
  })
}));

// Mocking the repositories used in useOnboardingLogic
vi.mock("@/infrastructure/repositories/SupabaseOnboardingRepository", () => {
    return {
        SupabaseOnboardingRepository: vi.fn().mockImplementation(() => ({
            saveResponses: vi.fn().mockResolvedValue(true),
            getAllResponses: vi.fn().mockResolvedValue({}),
        }))
    }
});

vi.mock("@/infrastructure/repositories/SupabaseProfileRepository", () => {
    return {
        SupabaseProfileRepository: vi.fn().mockImplementation(() => ({
            getProfile: vi.fn().mockResolvedValue({ fullName: "Test User" }),
            findById: vi.fn().mockResolvedValue({ id: "test-user-id", fullName: "Test User", email: "test@example.com" }),
        }))
    }
});

vi.mock("@/infrastructure/repositories/SupabaseUserProcessRepository", () => {
    return {
        SupabaseUserProcessRepository: vi.fn().mockImplementation(() => ({
            findByUserId: vi.fn().mockResolvedValue([
                {
                    id: "test-b1b2-service",
                    userId: "test-user-id",
                    serviceSlug: "visto-b1-b2",
                    status: "ds160InProgress",
                    currentStep: 0,
                    createdAt: new Date().toISOString()
                }
            ]),
            findById: vi.fn().mockResolvedValue({
                id: "test-b1b2-service",
                userId: "test-user-id",
                serviceSlug: "visto-b1-b2",
                status: "ds160InProgress",
                currentStep: 0,
                createdAt: new Date().toISOString()
            }),
            updateStep: vi.fn().mockResolvedValue(true),
            updateStatus: vi.fn().mockResolvedValue(true),
        }))
    }
});

vi.mock("@/infrastructure/repositories/SupabaseVisaOrderRepository", () => {
    return {
        SupabaseVisaOrderRepository: vi.fn().mockImplementation(() => ({
            findLatestByProductAndUser: vi.fn().mockResolvedValue({
                id: "test-order",
                order_number: "ORD-123",
                contract_selfie_url: "http://selfie.url"
            })
        }))
    }
});

vi.mock("@/infrastructure/repositories/SupabaseDocumentRepository", () => {
    return {
        SupabaseDocumentRepository: vi.fn().mockImplementation(() => ({
            save: vi.fn().mockResolvedValue(true),
            delete: vi.fn().mockResolvedValue(true),
            findByServiceId: vi.fn().mockResolvedValue([]),
        }))
    }
});

vi.mock("@/infrastructure/services/SupabaseStorageService", () => {
    return {
        SupabaseStorageService: vi.fn().mockImplementation(() => ({
            uploadFile: vi.fn().mockResolvedValue({ path: 'test/path', error: null }),
            getPublicUrl: vi.fn().mockReturnValue('http://public.url'),
            createSignedUrl: vi.fn().mockResolvedValue('http://signed.url')
        }))
    }
});


describe("Onboarding Flow - B1/B2 Visa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render step 1 (Personal Info) successfully", async () => {
    render(<Onboarding />);
    
    // Wait for data loading sequence 
    await waitFor(() => {
        expect(screen.getByText(/Personal Information 1/i)).toBeInTheDocument();
    });

    // It should contain inputs like Full Name, etc.
    const lastNameInput = screen.getByLabelText(/Surname/i);
    const firstNameInput = screen.getByLabelText(/Given Names/i);
    expect(lastNameInput).toBeInTheDocument();
    expect(firstNameInput).toBeInTheDocument();
  });
});
