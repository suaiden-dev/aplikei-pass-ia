import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SellerOverviewPage from "./index";
import type { SellerEarningsData } from "@features/seller/types";

const serviceMocks = vi.hoisted(() => ({
  fetchSellerEarningsData: vi.fn(),
}));

vi.mock("@features/seller/services/earningsService", () => ({
  fetchSellerEarningsData: serviceMocks.fetchSellerEarningsData,
}));

vi.mock("@shared/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "seller-1", role: "seller", officeId: "office-1" },
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <SellerOverviewPage />
    </MemoryRouter>,
  );
}

async function flushAsyncEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("SellerOverviewPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00.000Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders seller overview metrics and product ranking from paid orders", async () => {
    const data: SellerEarningsData = {
      office: { id: "office-1", slug: "office-one", name: "Office One" },
      services: [
        { id: "svc-1", name: "F1", slug: "visto-f1", category: "main_visa", price: 100 },
        { id: "svc-2", name: "B1/B2", slug: "visto-b1-b2", category: "main_visa", price: 200 },
      ],
      orders: [
        {
          id: "order-1",
          total_price_usd: 100,
          payment_status: "paid",
          created_at: "2026-06-01T12:00:00.000Z",
          client_name: "Client A",
          product_slug: "visto-f1",
        },
        {
          id: "order-2",
          total_price_usd: 200,
          payment_status: "paid",
          created_at: "2026-06-09T12:00:00.000Z",
          client_name: "Client B",
          product_slug: "visto-b1-b2",
        },
        {
          id: "order-3",
          total_price_usd: 300,
          payment_status: "paid",
          created_at: "2026-05-15T12:00:00.000Z",
          client_name: "Client C",
          product_slug: "visto-f1",
        },
      ],
    };
    serviceMocks.fetchSellerEarningsData.mockResolvedValue(data);

    renderPage();
    await flushAsyncEffects();

    expect(screen.getAllByText("$600.00")).toHaveLength(2);
    expect(screen.getAllByText("$300.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("$200.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("3 paid sales")).toBeInTheDocument();
    expect(screen.getByText("2 sales this month")).toBeInTheDocument();
    expect(screen.getByText("Office One")).toBeInTheDocument();
    expect(screen.getAllByText("visto-f1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2 sales")).toBeInTheDocument();
    expect(serviceMocks.fetchSellerEarningsData).toHaveBeenCalledWith({
      sellerId: "seller-1",
      officeId: "office-1",
    });
  });

  it("renders empty states when the seller has no sales", async () => {
    serviceMocks.fetchSellerEarningsData.mockResolvedValue({
      office: null,
      services: [],
      orders: [],
    } satisfies SellerEarningsData);

    renderPage();
    await flushAsyncEffects();

    expect(screen.getAllByText("No sales yet").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("No product ranking yet")).toBeInTheDocument();
    expect(screen.getByText("Not linked")).toBeInTheDocument();
  });
});
