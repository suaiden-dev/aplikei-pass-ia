import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useB1B2Onboarding } from "./useB1B2Onboarding";
import { supabase } from "@shared/lib/supabase";
import { updateStepData, approveStep, requestStepReview } from "../../../process/services/processOps";
import { notifyAdmin } from "@features/notifications/services/notify";
import { toast } from "sonner";
import * as router from "react-router-dom";

// Mock das dependências externas
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(() => ({ pathname: "/dashboard/processes/visto-b1-b2/onboarding" })),
  useSearchParams: vi.fn(() => [new URLSearchParams({ step: "0", id: "proc-123" }), vi.fn()]),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@shared/lib/supabase", () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };
  return {
    supabase: {
      from: vi.fn(() => mockChain),
    },
  };
});

vi.mock("../../../process/services/processOps", () => ({
  updateStepData: vi.fn(),
  approveStep: vi.fn(),
  requestStepReview: vi.fn(),
}));

vi.mock("@features/notifications/services/notify", () => ({
  notifyAdmin: vi.fn(),
}));

const mockLabels = {
  errorNotFound: "Not found",
  errorLoad: "Load error",
  errorSave: "Save error",
  errorDraft: "Draft error",
  successSubmit: "Submit success",
  successDraft: "Draft success",
};

describe("useB1B2Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load the service data correctly on mount", async () => {
    const fromSpy = vi.spyOn(supabase, "from");
    const singleMock = vi.fn().mockResolvedValue({
      data: {
        id: "proc-123",
        user_id: "user-1",
        service_slug: "visto-b1-b2",
        status: "pending",
        current_step: 0,
        step_data: { homeCountry: "Brasil" },
      },
      error: null,
    });

    fromSpy.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: singleMock,
    } as any);

    const { result } = renderHook(() =>
      useB1B2Onboarding({ userId: "user-1", labels: mockLabels as any })
    );

    // Initial state
    expect(result.current.isLoading).toBe(true);

    // Wait for the async loadService to finish inside useEffect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.procId).toBe("proc-123");
    expect(result.current.procStatus).toBe("pending");
    expect(result.current.savedValues.homeCountry).toBe("Brasil");
  });

  it("should handle error if service data is not found", async () => {
    const fromSpy = vi.spyOn(supabase, "from");
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: null });

    fromSpy.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: singleMock,
    } as any);

    const mockNavigate = vi.fn();
    vi.spyOn(router, "useNavigate").mockReturnValue(mockNavigate);

    renderHook(() =>
      useB1B2Onboarding({ userId: "user-1", labels: mockLabels as any })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(toast.error).toHaveBeenCalledWith(mockLabels.errorNotFound);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("should successfully save a draft", async () => {
    // Setup for load
    const fromSpy = vi.spyOn(supabase, "from");
    fromSpy.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "proc-123", user_id: "user-1", service_slug: "visto-b1-b2", current_step: 0, step_data: {} },
      }),
    } as any);

    const { result } = renderHook(() =>
      useB1B2Onboarding({ userId: "user-1", labels: mockLabels as any })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Act
    await act(async () => {
      await result.current.handleSaveDraft({ givenName: "Matheus" });
    });

    expect(updateStepData).toHaveBeenCalledWith("proc-123", { givenName: "Matheus" });
    expect(toast.success).toHaveBeenCalledWith(mockLabels.successDraft);
  });

  it("should submit the form successfully, approve the first step, and notify admin", async () => {
    const fromSpy = vi.spyOn(supabase, "from");
    fromSpy.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "proc-123", user_id: "user-1", service_slug: "visto-b1-b2", current_step: 0, step_data: {} },
      }),
    } as any);

    const { result } = renderHook(() =>
      useB1B2Onboarding({ userId: "user-1", labels: mockLabels as any })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.handleSubmit({ surname: "Doe" });
    });

    expect(updateStepData).toHaveBeenCalledWith("proc-123", { surname: "Doe" });
    expect(approveStep).toHaveBeenCalledWith("proc-123", 1, false);
    expect(requestStepReview).toHaveBeenCalledWith("proc-123");
    expect(notifyAdmin).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(mockLabels.successSubmit);
  });
});
