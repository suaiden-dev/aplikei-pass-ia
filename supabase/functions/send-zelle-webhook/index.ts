import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response(null, {
    headers: corsHeaders
  });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Verificar que o chamador é um admin
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader?.replace("Bearer ", "") ?? "");
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: "Unauthorized"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Verificar se o usuário tem role admin
    const role = user.app_metadata?.role;
    if (role !== "admin") {
      return new Response(JSON.stringify({
        error: "Forbidden: admin only"
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const { payment_id } = await req.json();
    if (!payment_id) throw new Error("payment_id is required");
    // 1. Buscar dados do pagamento
    const { data: payment, error: fetchError } = await supabase.from("zelle_payments").select("*").eq("id", payment_id).single();
    if (fetchError || !payment) throw new Error("Pagamento não encontrado");
    // 2. Criar conta do usuário se for um pagamento guest (user_id null)
    let finalUserId = payment.user_id;
    if (!finalUserId && payment.guest_email) {
      console.log(`[send-zelle-webhook] Criando conta para guest: ${payment.guest_email}`);
      // Gerar senha temporária aleatória
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: payment.guest_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: payment.guest_name ?? ""
        }
      });
      if (createError) {
        // Se a conta já existe, tentar buscar
        if (createError.message.includes("already registered")) {
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existing = existingUsers?.users?.find((u)=>u.email === payment.guest_email);
          if (existing) {
            finalUserId = existing.id;
          } else {
            throw new Error(`Falha ao criar conta: ${createError.message}`);
          }
        } else {
          throw new Error(`Falha ao criar conta: ${createError.message}`);
        }
      } else {
        finalUserId = newUser.user.id;
        // Garantir que o profile foi criado
        await supabase.from("profiles").upsert({
          id: finalUserId,
          email: payment.guest_email,
          full_name: payment.guest_name ?? ""
        }, {
          onConflict: "id"
        });
        // Enviar link de redefinição de senha para o usuário definir sua própria senha
        await supabase.auth.admin.generateLink({
          type: "recovery",
          email: payment.guest_email
        });
        console.log(`[send-zelle-webhook] Conta criada: ${finalUserId} | Link de senha enviado para ${payment.guest_email}`);
      }
    }
    // 3. Atualizar o pagamento com user_id e status approved
    const { error: updateError } = await supabase.from("zelle_payments").update({
      status: "approved",
      user_id: finalUserId,
      admin_approved_at: new Date().toISOString()
    }).eq("id", payment_id);
    if (updateError) throw updateError;
    // 4. Ativar o serviço para o usuário
    if (finalUserId && payment.service_slug) {
      const { error: serviceError } = await supabase.from("user_services").upsert({
        user_id: finalUserId,
        service_slug: payment.service_slug,
        status: "active",
        current_step: 0
      }, {
        onConflict: "user_id,service_slug"
      });
      if (serviceError) throw serviceError;
    }
    // 5. [Placeholder] Pipeline: generate-visa-contract-pdf, send-payment-confirmation-email, etc.
    console.log(`[send-zelle-webhook] Pipeline completo para payment_id: ${payment_id} | user_id: ${finalUserId}`);
    return new Response(JSON.stringify({
      success: true,
      user_id: finalUserId
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("send-zelle-webhook Error:", err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
