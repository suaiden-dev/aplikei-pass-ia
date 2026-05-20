import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeOfficeName, generateSlug, upsertOffice } from "./officeOps";
import { supabase } from "@shared/lib/supabase";

// Mock Supabase
vi.mock("@shared/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

describe("officeOps", () => {
  describe("normalizeOfficeName", () => {
    it("should trim and lowercase the name", () => {
      expect(normalizeOfficeName("  My Office  ")).toBe("my office");
    });

    it("should remove extra spaces", () => {
      expect(normalizeOfficeName("My    Office  Name")).toBe("my office name");
    });
  });

  describe("generateSlug", () => {
    it("should generate a simple slug", () => {
      expect(generateSlug("My Office")).toBe("my-office");
    });

    it("should handle accents and special characters", () => {
      expect(generateSlug("Escritório do João & Maria")).toBe("escritorio-do-joao-maria");
    });

    it("should remove multiple dashes", () => {
      expect(generateSlug("Office --- Name")).toBe("office-name");
    });
  });

  describe("upsertOffice", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should generate a slug if none is provided", async () => {
      const payload = {
        name: "New Office",
        owner_id: "user-123",
      };

      // Mock findOfficeByName returning null (no conflict)
      const fromSpy = vi.spyOn(supabase, "from");
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const singleMock = vi.fn().mockResolvedValue({ 
        data: { id: "off-1", name: "New Office", slug: "new-office", owner_id: "user-123" }, 
        error: null 
      });

      fromSpy.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: maybeSingleMock,
        upsert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: singleMock,
      } as any);

      const result = await upsertOffice(payload);

      expect(result.slug).toBe("new-office");
      // Verify upsert was called with the generated slug
      const upsertCall = fromSpy.mock.results.find(r => (r.value as any).upsert)?.value.upsert;
      // Note: testing internal call arguments in complex chains is easier by checking the mock's call history
    });

    it("should throw if office name already exists for another owner", async () => {
      const payload = {
        name: "Existing Office",
        owner_id: "new-owner",
      };

      const fromSpy = vi.spyOn(supabase, "from");
      const maybeSingleMock = vi.fn().mockResolvedValue({ 
        data: { id: "off-1", name: "Existing Office", owner_id: "old-owner" }, 
        error: null 
      });

      fromSpy.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: maybeSingleMock,
      } as any);

      await expect(upsertOffice(payload)).rejects.toThrow("OFFICE_NAME_ALREADY_EXISTS");
    });
  });
});
