import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { webhookPurchaseSchema, checkRateLimit } from "@/lib/security";

/**
 * POST /api/webhooks/purchase
 *
 * Receives purchase notifications from external checkout providers.
 * REQUIRES: Authorization: Bearer <WEBHOOK_SECRET>
 *
 * Payload: { "email": "user@email.com", "module_id": "uuid", "transaction_id": "optional" }
 */
export async function POST(request: Request) {
  // Rate limit: 30 requests per minute per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const rl = checkRateLimit(`webhook:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  // Auth is MANDATORY — no WEBHOOK_SECRET = endpoint disabled
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${webhookSecret}`) {
    // Constant-time-ish comparison wouldn't matter here but we return generic error
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate body with Zod
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = webhookPurchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email, module_id } = parsed.data;

  // Service role key is SERVER-ONLY — never in client bundles
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Find user by email
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    // Generic error — don't reveal if email exists
    return NextResponse.json({ error: "Processing failed" }, { status: 422 });
  }

  // Verify module exists
  const { data: modulo } = await supabase
    .from("modulos")
    .select("id, titulo")
    .eq("id", module_id)
    .single();

  if (!modulo) {
    return NextResponse.json({ error: "Invalid module" }, { status: 422 });
  }

  // Grant access
  const { error: purchaseError } = await supabase
    .from("user_purchases")
    .upsert(
      { user_id: user.id, modulo_id: module_id, purchased_at: new Date().toISOString() },
      { onConflict: "user_id,modulo_id" }
    );

  if (purchaseError) {
    // Don't leak DB error details
    console.error("[webhook] Purchase error:", purchaseError.message);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Block other methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
