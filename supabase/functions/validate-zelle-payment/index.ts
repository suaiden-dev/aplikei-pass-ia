import { handler } from "../_shared/core/handler.ts";
import { err, json } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { validateZellePayment } from "../_shared/payments/application/validate-zelle-payment.ts";

Deno.serve(handler(async (req) => {
  const body = await req.json();
  const payment_id: string = body.payment_id;
  const admin_notes: string = body.admin_notes || body.reason || "";

  if (body.status !== "approved" && body.status !== "rejected") {
    return err("Invalid status: provide 'status' as 'approved' or 'rejected'", 400);
  }
  if (!payment_id) return err("payment_id is required", 400);

  const result = await validateZellePayment(createAdminClient(), {
    paymentId: payment_id,
    decision: body.status,
    adminNotes: admin_notes,
  });

  if (result.kind === "not_found") return json({ error: "Payment not found", details: result.details }, 404);
  if (result.kind === "already_processed") return json({ success: true, message: `Payment already ${result.status}, no changes made.` });
  return json({ success: true, result: result.result, payment_id });
}));
