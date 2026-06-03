import {
  getOfficeStripeConfig,
  resolveUseAplicei,
} from "../office-payment.ts";

type ResolveStripeAccountParams = {
  supabase: any;
  officeId?: string;
  env: "TEST" | "PROD";
};

export type ResolvedStripeAccount = {
  stripeSecret: string;
  connectAccountId: string | null;
};

export async function resolveStripeAccount({
  supabase,
  officeId,
  env,
}: ResolveStripeAccountParams): Promise<ResolvedStripeAccount> {
  const platformSecret =
    Deno.env.get(`STRIPE_SECRET_KEY_${env}`) ||
    Deno.env.get("STRIPE_SECRET_KEY");

  if (!platformSecret) {
    throw new Error(`Stripe secret key não configurada para ambiente ${env}.`);
  }

  let stripeSecret = platformSecret;
  let connectAccountId: string | null = null;

  if (!officeId) {
    return {
      stripeSecret,
      connectAccountId,
    };
  }

  const useAplicei = await resolveUseAplicei(supabase, officeId);

  if (useAplicei) {
    return {
      stripeSecret,
      connectAccountId,
    };
  }

  const officeStripe = await getOfficeStripeConfig(supabase, officeId);

  if (officeStripe.accountId) {
    connectAccountId = officeStripe.accountId;

    return {
      stripeSecret,
      connectAccountId,
    };
  }

  if (officeStripe.secretKey) {
    stripeSecret = officeStripe.secretKey;

    return {
      stripeSecret,
      connectAccountId,
    };
  }

  return {
    stripeSecret,
    connectAccountId,
  };
}
