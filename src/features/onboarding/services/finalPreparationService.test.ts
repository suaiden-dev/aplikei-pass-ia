import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@shared/lib/supabase";
import {
  extractProcessPurchaseSlugs,
  incrementScheduledCount,
  loadFinalPlanPrices,
  openFinalPreparationSupportChat,
  reportInterviewOutcome,
} from "./finalPreparationService";

vi.mock("@shared/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("finalPreparationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts purchase slugs and canonical aliases from mixed purchase fields", () => {
    const slugs = extractProcessPurchaseSlugs({
      purchases: [
        { slug: "mentoria-prata" },
        { service_slug: "mentoring-gold" },
        { productSlug: "consultoria-especialista" },
        { product_slug: "" },
      ],
    });

    expect(slugs.has("mentoria-prata")).toBe(true);
    expect(slugs.has("mentoring-gold")).toBe(true);
    expect(slugs.has("consultoria-especialista")).toBe(true);
    expect(slugs.has("")).toBe(false);
  });

  it("returns default plan prices when services are not found", async () => {
    vi.mocked(supabase.from).mockReturnValueOnce(
      {
        select: vi.fn(() => ({
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      } as any,
    );

    await expect(
      loadFinalPlanPrices("office-1", {
        slugsToResolve: ["mentoring-bronze"],
        defaults: { "mentoring-bronze": 197 },
        aliases: { "mentoring-bronze": ["mentoring-bronze"] },
      }),
    ).resolves.toEqual({ "mentoring-bronze": 197 });
  });

  it("maps office prices by configured slug aliases", async () => {
    const servicesQuery = {
      select: vi.fn(() => ({
        in: vi.fn().mockResolvedValue({
          data: [
            { id: "svc-bronze", slug: "mentoria-individual" },
            { id: "svc-gold", slug: "mentoring-gold" },
          ],
          error: null,
        }),
      })),
    };
    const pricesQuery = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          in: vi.fn(() => ({
            or: vi.fn().mockResolvedValue({
              data: [
                { service_id: "svc-bronze", price: "211", is_active: true },
                { service_id: "svc-gold", price: 799, is_active: true },
              ],
              error: null,
            }),
          })),
        })),
      })),
    };

    vi.mocked(supabase.from)
      .mockReturnValueOnce(servicesQuery as any)
      .mockReturnValueOnce(pricesQuery as any);

    await expect(
      loadFinalPlanPrices("office-1", {
        slugsToResolve: ["mentoria-individual", "mentoring-gold"],
        defaults: { "mentoring-bronze": 197, "mentoring-gold": 697 },
        aliases: {
          "mentoring-bronze": ["mentoring-bronze", "mentoria-individual"],
          "mentoring-gold": ["mentoring-gold"],
        },
      }),
    ).resolves.toEqual({
      "mentoring-bronze": 211,
      "mentoring-gold": 799,
    });
  });

  it("increments scheduled_count without dropping existing step data", async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn(() => ({ eq: eqMock }));
    vi.mocked(supabase.from).mockImplementationOnce(() => ({ update: updateMock }) as any);

    const result = await incrementScheduledCount({
      id: "svc-1",
      step_data: { scheduled_count: 1, kept: true },
    });

    expect(updateMock).toHaveBeenCalledWith({
      step_data: { scheduled_count: 2, kept: true },
    });
    expect(result).toEqual({
      id: "svc-1",
      step_data: { scheduled_count: 2, kept: true },
    });
  });

  it("reports interview outcome and preserves previous step data", async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn(() => ({ eq: eqMock }));
    vi.mocked(supabase.from).mockImplementationOnce(() => ({ update: updateMock }) as any);

    const result = await reportInterviewOutcome({
      procId: "proc-1",
      outcome: "approved",
      freshStepData: { final_casv_date: "2026-06-09" },
    });

    expect(updateMock).toHaveBeenCalledWith({
      status: "completed",
      step_data: expect.objectContaining({
        final_casv_date: "2026-06-09",
        interview_outcome: "approved",
        reported_at: expect.any(String),
      }),
    });
    expect(result).toEqual(expect.objectContaining({ interview_outcome: "approved" }));
  });

  it("reuses an active support conversation and inserts the initial message only when empty", async () => {
    const activeQuery = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: "conv-1" }, error: null }),
          })),
        })),
      })),
    };
    const insertMock = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "conversations") return activeQuery as any;
      if (table === "conversation_messages") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
          })),
          insert: insertMock,
        } as any;
      }
      throw new Error(`Unexpected table ${table}`);
    });

    await openFinalPreparationSupportChat({
      processId: "proc-1",
      customerId: "user-1",
      officeId: "office-1",
      initialMessage: "hello",
    });

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      conversation_id: "conv-1",
      content: "hello",
      sender_id: "user-1",
      sender_role: "customer",
    }));
  });
});
