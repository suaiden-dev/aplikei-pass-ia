import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@shared/lib/supabase";
import { uploadPageBuilderAsset } from "./pageBuilderStorageService";

vi.mock("@shared/lib/supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}));

function file(name: string, type: string, size = 12) {
  return new File([new Uint8Array(size)], name, { type });
}

describe("uploadPageBuilderAsset", () => {
  const upload = vi.fn();
  const getPublicUrl = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    upload.mockResolvedValue({ error: null });
    getPublicUrl.mockReturnValue({ data: { publicUrl: "https://cdn.example.com/asset.png" } });
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload,
      getPublicUrl,
    } as any);
  });

  it("uploads allowed images with a sanitized path", async () => {
    const result = await uploadPageBuilderAsset({
      file: file("Meu Logo Final.png", "image/png"),
      userId: "user-1",
      folder: "landing-logos",
    });

    expect(result).toBe("https://cdn.example.com/asset.png");
    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload.mock.calls[0][0]).toMatch(/^landing-logos\/user-1\/\d+-meu-logo-final\.png$/);
    expect(upload.mock.calls[0][2]).toEqual({ contentType: "image/png", upsert: false });
  });

  it("blocks svg and other unsupported image types", async () => {
    await expect(
      uploadPageBuilderAsset({
        file: file("payload.svg", "image/svg+xml"),
        userId: "user-1",
        folder: "landing-testimonials",
      }),
    ).rejects.toThrow("PAGE_BUILDER_ASSET_INVALID_TYPE");

    expect(upload).not.toHaveBeenCalled();
  });

  it("blocks mismatched extension and mime type", async () => {
    await expect(
      uploadPageBuilderAsset({
        file: file("payload.png", "image/jpeg"),
        userId: "user-1",
        folder: "landing-favicons",
      }),
    ).rejects.toThrow("PAGE_BUILDER_ASSET_INVALID_TYPE");

    expect(upload).not.toHaveBeenCalled();
  });

  it("blocks files larger than 2MB", async () => {
    await expect(
      uploadPageBuilderAsset({
        file: file("large.webp", "image/webp", 2 * 1024 * 1024 + 1),
        userId: "user-1",
        folder: "landing-testimonials",
      }),
    ).rejects.toThrow("PAGE_BUILDER_ASSET_TOO_LARGE");

    expect(upload).not.toHaveBeenCalled();
  });
});
