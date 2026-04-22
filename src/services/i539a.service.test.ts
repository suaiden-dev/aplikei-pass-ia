import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { PDFDocument } from "pdf-lib";

vi.unmock("./i539a.service");

vi.mock("../forms/i539a_flat_template.pdf?url", () => ({ default: "/mock-i539a-flat.pdf" }));

import { fillI539AForm, type I539AData } from "./i539a.service";

describe("i539a.service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) !== "/mock-i539a-flat.pdf") {
        return new Response(null, { status: 404 });
      }

      const filePath = path.join(process.cwd(), "src/forms/i539a_flat_template.pdf");
      const bytes = await readFile(filePath);
      return new Response(bytes, { status: 200, headers: { "Content-Type": "application/pdf" } });
    }) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("fills I-539A data into a stable PDF without crashing", async () => {
    const data: I539AData = {
      familyName: "Silva",
      givenName: "Maria",
      q1No: true,
      q2No: true,
      email: "maria@example.com",
    };

    const filled = await fillI539AForm(data);
    const doc = await PDFDocument.load(filled, { ignoreEncryption: true });

    expect(filled).toBeInstanceOf(Uint8Array);
    expect(filled.length).toBeGreaterThan(0);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(3);
  });
});
