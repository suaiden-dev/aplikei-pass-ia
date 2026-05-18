/**
 * Checkout token encoder/decoder.
 *
 * Compacts { office, product, ref } into a short URL-safe token:
 *   encode → "officeSlug.productSlug.base64urlUuid"
 *   decode → { office, product, ref }
 *
 * Example:
 *   encode({ office: "silva-law", product: "visa-b1b2", ref: "550e8400-e29b-41d4-a716-446655440000" })
 *   → "silva-law.visa-b1b2.VQ6EAOKbQdSnFkRmVUQA"  (~44 chars vs 80 chars full URL)
 */

function uuidToBase64Url(uuid: string): string {
  const hex = uuid.replace(/-/g, "");
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return btoa(String.fromCharCode(...Array.from(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlToUuid(b64: string): string {
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const hex = Array.from(binary)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

export interface CheckoutTokenPayload {
  office: string;
  product: string;
  ref: string;
}

export function encodeCheckoutToken(payload: CheckoutTokenPayload): string {
  const refPart = uuidToBase64Url(payload.ref);
  return `${payload.office}.${payload.product}.${refPart}`;
}

export function decodeCheckoutToken(token: string): CheckoutTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 3) return null;
    // last part is the base64url UUID, everything before the last two dots is office/product
    const refPart = parts[parts.length - 1];
    const productPart = parts[parts.length - 2];
    const officePart = parts.slice(0, parts.length - 2).join(".");
    if (!officePart || !productPart || !refPart) return null;
    return {
      office: officePart,
      product: productPart,
      ref: base64UrlToUuid(refPart),
    };
  } catch {
    return null;
  }
}
