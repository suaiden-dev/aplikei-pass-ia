import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import RevenuePage from "./index";
import type { UnifiedPayment } from "@features/admin/hooks/useRevenuePage";

const hookMocks = vi.hoisted(() => ({
  state: {} as any,
}));

vi.mock("@features/admin/hooks/useRevenuePage", async () => {
  const actual = await vi.importActual<typeof import("@features/admin/hooks/useRevenuePage")>(
    "@features/admin/hooks/useRevenuePage",
  );
  return {
    ...actual,
    useRevenuePage: () => hookMocks.state,
  };
});

vi.mock("@app/app/i18n", () => ({
  useT: () => ({
    shared: {
      back: "Back",
      cancel: "Cancel",
      confirm: "Confirm",
      loading: "Loading...",
      rejection: { confirm: "Confirm Rejection" },
    },
    offices: {
      table: {
        office: "Office",
      },
    },
    payments: {
      title: "Payments",
      subtitle: "Payments dashboard",
      searchPlaceholder: "Search payments",
      tabs: {
        pending: "Payment Pending",
        officeRequests: "Office Requests",
      },
      table: {
        customer: "Customer",
        serviceName: "Service",
        payment: "Payment",
        noResults: "No results",
        detailsBtn: "Details",
        viewProof: "View proof",
      },
      modals: {
        detailsTitle: "Payment details",
        openOriginal: "Open original",
      },
      messages: {
        approveSuccess: "Approved",
        approveError: "Approval error",
        rejectSuccess: "Rejected",
        rejectError: "Reject error",
        updateStatusSuccess: "Updated {{status}}",
        updateStatusError: "Update error",
      },
    },
  }),
}));

const payment = (overrides: Partial<UnifiedPayment> = {}): UnifiedPayment => ({
  id: "payment-1",
  source: "order",
  clientName: "Client One",
  clientEmail: "client@example.com",
  serviceName: "VISTO F1",
  serviceSlug: "visto-f1",
  amount: 100,
  officeNetAmount: 90,
  platformFeeAmount: 10,
  method: "STRIPE",
  createdAt: "2026-06-10T12:00:00.000Z",
  officeName: "Office A",
  officeId: "office-a",
  status: "paid",
  ...overrides,
});

function baseState(overrides: Record<string, unknown> = {}) {
  const rows = [payment()];
  return {
    tab: "approved_payments",
    setTab: vi.fn(),
    search: "",
    setSearch: vi.fn(),
    officeRequestStatusFilter: "all",
    setOfficeRequestStatusFilter: vi.fn(),
    officeRequestPeriodFilter: "all",
    setOfficeRequestPeriodFilter: vi.fn(),
    paymentsStatusFilter: "all",
    setPaymentsStatusFilter: vi.fn(),
    paymentsPeriodFilter: "all",
    setPaymentsPeriodFilter: vi.fn(),
    isLoading: false,
    busy: null,
    selectedPayment: null,
    setSelectedPayment: vi.fn(),
    confirmPayLink: null,
    setConfirmPayLink: vi.fn(),
    pageByTab: { zelle: 1, office_requests: 1, approved_payments: 1 },
    setPageByTab: vi.fn(),
    filtered: rows,
    paginated: rows,
    safeCurrentPage: 1,
    totalPages: 1,
    pageStart: 0,
    pageEnd: rows.length,
    officePendingCount: 0,
    isMaster: false,
    isAdminLawyer: false,
    canAccessOfficeRequests: false,
    handleApproveZelle: vi.fn(),
    handleRejectZelle: vi.fn(),
    handleUpdateWithdrawalStatus: vi.fn(),
    ...overrides,
  };
}

describe("RevenuePage role rendering", () => {
  beforeEach(() => {
    hookMocks.state = baseState();
  });

  it("shows Office Requests tab and Office column for master", () => {
    hookMocks.state = baseState({
      isMaster: true,
      canAccessOfficeRequests: true,
    });

    render(<RevenuePage />);

    expect(screen.getByRole("button", { name: "Office Requests" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Office" })).toBeInTheDocument();
    expect(screen.getByText("Office A")).toBeInTheDocument();
  });

  it.each([
    ["admin_lawyer", true],
    ["manager", false],
    ["seller", false],
  ])("hides Office Requests tab and Office column for %s", (_role, isAdminLawyer) => {
    hookMocks.state = baseState({
      isMaster: false,
      isAdminLawyer,
      canAccessOfficeRequests: false,
    });

    render(<RevenuePage />);

    expect(screen.queryByRole("button", { name: "Office Requests" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Office" })).not.toBeInTheDocument();
    expect(screen.queryByText("Office A")).not.toBeInTheDocument();
  });
});
