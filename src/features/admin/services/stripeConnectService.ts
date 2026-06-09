import { supabase } from "@shared/lib/supabase";

export async function handleStripeConnectCallback(params: {
  code: string;
  state: string;
}): Promise<void> {
  const { error } = await supabase.functions.invoke("stripe-connect", {
    body: { action: "callback", code: params.code, state: params.state },
  });
  if (error) throw Error(error.message);
}

export async function createStripeConnectUrl(params: {
  userId: string;
  clientId: string;
  redirectUri: string;
}): Promise<string> {
  const saveRes = await supabase.functions.invoke("stripe-connect", {
    body: { action: "save-client-id", user_id: params.userId, client_id: params.clientId },
  });
  if (saveRes.error) throw Error(saveRes.error.message);

  const { data, error } = await supabase.functions.invoke("stripe-connect", {
    body: { action: "init", user_id: params.userId, redirect_uri: params.redirectUri },
  });
  if (error) throw Error(error.message);
  return data.url as string;
}

export async function disconnectStripeAccount(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("stripe-connect", {
    body: { action: "disconnect", user_id: userId },
  });
  if (error) throw Error(error.message);
}
