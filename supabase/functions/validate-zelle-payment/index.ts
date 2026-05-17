import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { err, json, options } from "../_shared/core/http.ts";
import { validateZellePayment } from "../_shared/payments/application/validate-zelle-payment.ts";

/**
 * validate-zelle-payment
 *
 * Chamado por:
 *   1. N8N (callback assíncrono) com { payment_id, approved: true/false }
 *   2. Admin Panel (via paymentOps) com { payment_id, status: "approved"|"rejected", admin_notes }
 */
serve(async (req) => {
    if (req.method === "OPTIONS") return options();

    try {
        const supabase = createAdminClient();

        const body = await req.json();
        const payment_id: string = body.payment_id;
        const admin_notes: string = body.admin_notes || body.reason || "";

        if (body.status !== "approved" && body.status !== "rejected") {
            return err("Invalid status: provide 'status' as 'approved' or 'rejected'", 400);
        }

        if (!payment_id) {
            return err("payment_id is required", 400);
        }

        const result = await validateZellePayment(supabase, {
            paymentId: payment_id,
            decision: body.status,
            adminNotes: admin_notes,
        });

        if (result.kind === "not_found") {
            return json({ error: "Payment not found", details: result.details }, 404);
        }

        if (result.kind === "already_processed") {
            return json({
                success: true,
                message: `Payment already ${result.status}, no changes made.`,
            });
        }

        return json({ success: true, result: result.result, payment_id });
    } catch (err: unknown) {
        console.error("[validate-zelle-payment] Error:", err);
        return err instanceof Error ? json({ error: err.message }, 500) : json({ error: "Unknown error" }, 500);
    }
});
