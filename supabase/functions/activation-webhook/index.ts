// Muxima Bet — webhook de confirmação da taxa de ativação (Kursinha)
// Identifica o lead (por ref ou telefone) e marca activation_paid = true no perfil.
// Idempotente: chamar duas vezes para o mesmo utilizador não causa erro.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPA_URL  = Deno.env.get("SUPABASE_URL")!;
const SVC_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SECRET    = "12b764d47c3cbbd1996e4029fea5e7294a9b027ec341580e";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "content-type" },
    });
  }

  const url = new URL(req.url);

  if (url.searchParams.get("secret") !== SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, any> = {};
  try { body = await req.json(); } catch { /* empty */ }

  const status = (body.status || "").toString().toLowerCase();
  if (status && status !== "paid" && status !== "approved" && status !== "completed") {
    return Response.json({ ok: false, reason: "status_not_paid" });
  }

  const phone = (body.phone || body.customer_phone || body.payer_phone || "")
    .toString().replace(/\D/g, "").slice(-9);
  const ref = url.searchParams.get("ref") || body.ref || body.metadata?.ref || null;
  const externalId = body.transaction_id || body.id || body.payment_id || null;

  const supabase = createClient(SUPA_URL, SVC_KEY);

  let userId: string | null = ref;

  if (!userId && phone.length === 9) {
    const { data } = await supabase
      .from("profiles")
      .select("user_id")
      .like("phone", `%${phone}`)
      .limit(2);
    if (data && data.length === 1) userId = data[0].user_id;
  }

  if (!userId) {
    return Response.json({ ok: false, reason: "user_not_found", phone }, { status: 404 });
  }

  const { data, error } = await supabase.rpc("mark_activation_paid", {
    p_user_id: userId,
    p_external_id: externalId,
  });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, user_id: userId, ...(data as object) });
});
