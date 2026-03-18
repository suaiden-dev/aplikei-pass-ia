/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    console.log("Calendly Webhook Payload:", JSON.stringify(payload, null, 2));

    const eventType = payload.event;
    
    if (eventType === "invitee.created") {
      const invitee = payload.payload;
      const email = invitee.email;
      const scheduledAt = invitee.created_at;
      const eventUri = invitee.event;
      
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Find user profile
      const { data: profile } = await (supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle() as any);

      if (profile) {
        // Find the service that was recently paid for specialist training
        const { data: service } = await (supabaseAdmin
          .from("user_services")
          .select("id, specialist_training_data")
          .eq("user_id", profile.id)
          .not("specialist_training_data", "is", null)
          .order("id", { ascending: false }) // Fallback to last updated or highest ID
          .limit(1)
          .maybeSingle() as any);

        if (service) {
          const currentData = (service.specialist_training_data as Record<string, unknown>) || {};
          
          await supabaseAdmin
            .from("user_services")
            .update({
              specialist_training_data: {
                ...currentData,
                scheduled: true,
                scheduled_at: scheduledAt,
                calendly_event_uri: eventUri,
                last_webhook_event: eventType,
                updated_at: new Date().toISOString()
              }
            })
            .eq("id", service.id);
            
          console.log(`[SUCCESS] Calendly: Updated scheduling for ${email} in user_services`);
        } else {
          console.warn(`[WARN] Calendly: User ${email} found, but no paid specialist service record found.`);
        }
      } else {
        console.warn(`[WARN] Calendly: No profile found for email ${email}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Calendly Webhook Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
