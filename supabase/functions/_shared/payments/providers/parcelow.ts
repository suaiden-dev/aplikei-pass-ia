export function cleanDocumentNumber(value: string | null | undefined): string | null {
  return value ? value.replace(/\D/g, "") : null;
}

export function resolveParcelowEnvironment(req: Request, originUrl = "") {
  const host = req.headers.get("host") || "";
  const origin = originUrl || req.headers.get("origin") || req.headers.get("referer") || "";
  const isProduction = origin.includes("aplikei.com") || host.includes("aplikei.com");

  return {
    name: isProduction ? "production" : "staging",
    apiUrl: isProduction ? "https://app.parcelow.com" : "https://sandbox-2.parcelow.com.br",
  } as const;
}

export async function createParcelowOrder(input: {
  apiUrl: string;
  clientId: number | string;
  clientSecret: string;
  payload: unknown;
}) {
  const authRes = await fetch(`${input.apiUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!authRes.ok) {
    throw new Error(`Falha na autenticação Parcelow (${authRes.status}).`);
  }

  const { access_token } = await authRes.json();
  const orderRes = await fetch(`${input.apiUrl}/api/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input.payload),
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.success) {
    throw new Error(orderData.message || "Erro ao gerar link na Parcelow.");
  }

  return orderData;
}
