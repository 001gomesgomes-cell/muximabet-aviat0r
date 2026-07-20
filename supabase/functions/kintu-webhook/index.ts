// Muxima Bet — webhook de confirmação de depósito (Kintu)
// Recebe a notificação de pagamento da plataforma, identifica o lead
// e credita o saldo (valor + bónus) no perfil. Idempotente por external_id.

import { createClient } from "npm:@supabase/supabase-js@2";

const SECRET = "12b764d47c3cbbd1996e4029fea5e7294a9b027ec341580e";

// Produtos Kintu -> pacote de depósito
const PRODUCTS: Record<string, { amount: number; bonus: number }> = {
  "9b161c75-c33a-40ed-8fa4-22892f1aa7f0": { amount: 3000, bonus: 0 },
  "618f309f-85b2-4baf-9f4a-33e494987e03": { amount: 5000, bonus: 1000 },
  "087022cb-cc2f-48ef-911e-70d2d9d1671d": { amount: 10000, bonus: 2500 },
  "5ef7883f-802b-48d7-a195-dbe8c3e9ec51": { amount: 15000, bonus: 5000 },
};

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const FAILED_STATUSES = ["failed", "cancelled", "canceled", "refused", "expired", "refunded", "pending"];

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Achata um objeto aninhado em pares chave->valor (chaves em minúsculas)
function flatten(obj: unknown, prefix = "", out: Record<string, string> = {}): Record<string, string> {
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = (prefix ? prefix + "." : "") + k.toLowerCase();
      if (v && typeof v === "object") flatten(v, key, out);
      else if (v !== null && v !== undefined) out[key] = String(v);
    }
  }
  return out;
}

function pick(flat: Record<string, string>, patterns: string[]): string | null {
  for (const [k, v] of Object.entries(flat)) {
    if (patterns.some((p) => k === p || k.endsWith("." + p) || k.includes(p))) {
      if (v && v.trim()) return v.trim();
    }
  }
  return null;
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  if (url.searchParams.get("secret") !== SECRET) {
    return json({ error: "unauthorized" }, 401);
  }
  if (req.method !== "POST") {
    return json({ ok: true, info: "Webhook Muxima Bet ativo. Envie POST com os dados do pagamento." });
  }

  const raw = await req.text();
  let body: unknown = {};
  try {
    body = JSON.parse(raw);
  } catch {
    body = Object.fromEntries(new URLSearchParams(raw));
  }
  const flat = flatten(body);

  // 0) Se a plataforma enviar um estado claramente não-pago, ignora
  const status = (pick(flat, ["status", "state", "payment_status"]) || "").toLowerCase();
  if (status && FAILED_STATUSES.some((s) => status.includes(s))) {
    return json({ ok: true, skipped: `status=${status}` });
  }

  // 1) Identificar o pacote: por query (?amount=), por produto no payload, ou por valor pago
  let pack: { amount: number; bonus: number } | null = null;
  const qAmount = Number(url.searchParams.get("amount"));
  const qBonus = Number(url.searchParams.get("bonus") || 0);
  if (qAmount > 0) {
    pack = { amount: qAmount, bonus: qBonus };
  }
  if (!pack) {
    const uuidsInPayload = raw.match(UUID_RE) || [];
    for (const u of uuidsInPayload) {
      const p = PRODUCTS[u.toLowerCase()];
      if (p) { pack = p; break; }
    }
  }
  if (!pack) {
    const paid = Number((pick(flat, ["amount", "total", "value", "price", "valor"]) || "").replace(/[^\d.]/g, ""));
    const byValue = Object.values(PRODUCTS).find((p) => p.amount === paid);
    if (byValue) pack = byValue;
    else if (paid > 0) pack = { amount: paid, bonus: 0 };
  }
  if (!pack) {
    return json({ error: "pacote não identificado", hint: "configure ?amount= e ?bonus= na URL do webhook do produto" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 2) Identificar o lead: ref (user_id) no payload, ou telefone
  let userId: string | null = null;

  const refCandidates = [
    pick(flat, ["ref", "reference", "custom", "metadata.ref", "external_reference"]),
    ...(raw.match(UUID_RE) || []),
  ].filter(Boolean) as string[];

  for (const cand of refCandidates) {
    const ids = cand.match(UUID_RE) || [];
    for (const id of ids) {
      if (PRODUCTS[id.toLowerCase()]) continue; // é um produto, não um utilizador
      const { data } = await supabase.from("profiles").select("user_id").eq("user_id", id.toLowerCase()).maybeSingle();
      if (data) { userId = data.user_id; break; }
    }
    if (userId) break;
  }

  if (!userId) {
    const phoneRaw = pick(flat, ["phone", "telefone", "msisdn", "mobile", "celular", "customer_phone", "buyer_phone"]);
    if (phoneRaw) {
      const digits = phoneRaw.replace(/\D/g, "");
      const local = digits.slice(-9); // número angolano sem indicativo
      if (local.length === 9) {
        const { data } = await supabase.from("profiles").select("user_id").like("phone", `%${local}`).limit(2);
        if (data && data.length === 1) userId = data[0].user_id;
      }
    }
  }

  if (!userId) {
    return json({ error: "lead não identificado", hint: "o payload precisa de conter o ref (user_id) ou o telefone usado no registo" }, 400);
  }

  // 3) Idempotência: id externo do pagamento (ou hash do payload como fallback)
  let externalId = pick(flat, ["transaction_id", "order_id", "payment_id", "invoice", "id"]);
  if (!externalId) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
    externalId = "hash_" + Array.from(new Uint8Array(digest)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // 4) Creditar
  const { data: result, error } = await supabase.rpc("credit_deposit", {
    p_user_id: userId,
    p_amount: pack.amount,
    p_bonus: pack.bonus,
    p_external_id: `kintu_${externalId}`,
    p_method: "kintu",
  });

  if (error) {
    console.error("credit_deposit error:", error);
    return json({ error: error.message }, 500);
  }

  console.log("deposit credited:", { userId, ...pack, externalId, result });
  return json({ ok: true, user_id: userId, amount: pack.amount, bonus: pack.bonus, result });
});
