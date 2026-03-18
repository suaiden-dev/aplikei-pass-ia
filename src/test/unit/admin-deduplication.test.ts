/**
 * Admin De-duplication Logic Tests
 * Tests the filtering and grouping logic used in AdminProcesses.
 */
import { describe, it, expect } from "vitest";

// Simulates the slug filter used in AdminProcesses.tsx
const MAIN_SERVICE_SLUGS = [
  "visto-b1-b2",
  "visto-f1",
  "extensao-status",
  "guia-visto-consular-b1b2",
];

function filterMainServices<T extends { product_slug: string }>(
  orders: T[],
) {
  return orders.filter((o) => MAIN_SERVICE_SLUGS.includes(o.product_slug));
}

// Simulates the de-duplication logic from AdminProcesses.tsx
function deduplicateOrders<T extends { user_id: string; product_slug: string }>(
  orders: T[],
) {
  const uniqueOrders: T[] = [];
  const seen = new Set<string>();

  orders.forEach((order) => {
    const key = `${order.user_id}-${order.product_slug}`;
    if (!seen.has(key)) {
      uniqueOrders.push(order);
      seen.add(key);
    }
  });

  return uniqueOrders;
}

describe("Admin De-duplication Logic", () => {
  describe("filterMainServices", () => {
    it("should keep main visa service orders", () => {
      const orders = [
        { product_slug: "visto-b1-b2", user_id: "u1" },
        { product_slug: "visto-f1", user_id: "u2" },
        { product_slug: "extensao-status", user_id: "u3" },
      ];
      expect(filterMainServices(orders)).toHaveLength(3);
    });

    it("should filter out specialist training orders", () => {
      const orders = [
        { product_slug: "visto-b1-b2", user_id: "u1" },
        { product_slug: "specialist-training", user_id: "u1" },
        { product_slug: "specialist-review", user_id: "u1" },
      ];
      expect(filterMainServices(orders)).toHaveLength(1);
      expect(filterMainServices(orders)[0].product_slug).toBe("visto-b1-b2");
    });

    it("should filter out unknown slugs", () => {
      const orders = [
        { product_slug: "visto-b1-b2", user_id: "u1" },
        { product_slug: "unknown", user_id: "u1" },
      ];
      expect(filterMainServices(orders)).toHaveLength(1);
    });

    it("should return empty array when no main services", () => {
      const orders = [
        { product_slug: "unknown", user_id: "u1" },
        { product_slug: "specialist-training", user_id: "u2" },
      ];
      expect(filterMainServices(orders)).toHaveLength(0);
    });
  });

  describe("deduplicateOrders", () => {
    it("should keep single orders as-is", () => {
      const orders = [
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-01-01" },
        { user_id: "u2", product_slug: "visto-f1", created_at: "2024-01-02" },
      ];
      expect(deduplicateOrders(orders)).toHaveLength(2);
    });

    it("should de-duplicate restart payments (same user, same service)", () => {
      const orders = [
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-03-01" },
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-01-01" },
      ];
      const result = deduplicateOrders(orders);
      expect(result).toHaveLength(1);
      // Should keep the first one (most recent, since data is ordered desc)
      expect(result[0].created_at).toBe("2024-03-01");
    });

    it("should keep different services for the same user", () => {
      const orders = [
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-01-01" },
        { user_id: "u1", product_slug: "visto-f1", created_at: "2024-01-02" },
      ];
      expect(deduplicateOrders(orders)).toHaveLength(2);
    });

    it("should keep same service for different users", () => {
      const orders = [
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-01-01" },
        { user_id: "u2", product_slug: "visto-b1-b2", created_at: "2024-01-02" },
      ];
      expect(deduplicateOrders(orders)).toHaveLength(2);
    });

    it("should handle multiple duplicates from a user who restarted 3 times", () => {
      const orders = [
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-05-01" },
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-03-01" },
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-01-01" },
      ];
      const result = deduplicateOrders(orders);
      expect(result).toHaveLength(1);
      expect(result[0].created_at).toBe("2024-05-01");
    });

    it("should handle empty array", () => {
      expect(deduplicateOrders([])).toHaveLength(0);
    });

    it("should handle complex scenario with mixed users and services", () => {
      const orders = [
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-05-01" },
        { user_id: "u2", product_slug: "visto-b1-b2", created_at: "2024-04-01" },
        { user_id: "u1", product_slug: "visto-b1-b2", created_at: "2024-03-01" }, // dup of u1
        { user_id: "u2", product_slug: "visto-f1", created_at: "2024-02-01" },    // different service
        { user_id: "u3", product_slug: "extensao-status", created_at: "2024-01-01" },
      ];
      const result = deduplicateOrders(orders);
      expect(result).toHaveLength(4); // u1-b1b2, u2-b1b2, u2-f1, u3-extensao
    });
  });

  describe("Full pipeline: filter then deduplicate", () => {
    it("should correctly process real-world scenario", () => {
      const rawOrders = [
        // Geraldo's first purchase
        { user_id: "geraldo", product_slug: "visto-b1-b2", created_at: "2024-01-01" },
        // Geraldo buys specialist training (upsell)
        { user_id: "geraldo", product_slug: "unknown", created_at: "2024-02-01" },
        // Geraldo gets rejected and pays to restart
        { user_id: "geraldo", product_slug: "visto-b1-b2", created_at: "2024-03-01" },
        // Geraldo buys specialist review (upsell)
        { user_id: "geraldo", product_slug: "specialist-review", created_at: "2024-04-01" },
        // Maria's normal purchase
        { user_id: "maria", product_slug: "visto-f1", created_at: "2024-02-15" },
      ];

      const filtered = filterMainServices(rawOrders);
      expect(filtered).toHaveLength(3); // 2x geraldo b1b2 + 1x maria f1

      const deduped = deduplicateOrders(filtered);
      expect(deduped).toHaveLength(2); // 1x geraldo (most recent) + 1x maria
      expect(deduped[0].user_id).toBe("geraldo");
      expect(deduped[0].created_at).toBe("2024-01-01"); // first in sorted desc list
      expect(deduped[1].user_id).toBe("maria");
    });
  });
});
