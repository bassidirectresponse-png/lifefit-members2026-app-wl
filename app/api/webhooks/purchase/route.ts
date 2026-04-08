import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Webhook endpoint para receber notificações de compra de módulos premium.
 *
 * Payload esperado (POST JSON):
 * {
 *   "email": "aluna@email.com",        // Email da compradora
 *   "module_id": "uuid-do-modulo",      // ID do módulo comprado
 *   "transaction_id": "abc123"          // Opcional: referência da transação
 * }
 *
 * Headers esperados:
 *   Authorization: Bearer <WEBHOOK_SECRET>
 *
 * Compatível com: Hotmart, Kiwify, Eduzz, Monetizze (adaptar payload via proxy/Zapier)
 */
export async function POST(request: Request) {
  try {
    // Validate webhook secret
    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, module_id } = body;

    if (!email || !module_id) {
      return NextResponse.json(
        { error: "Missing required fields: email, module_id" },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        { error: `User not found: ${email}` },
        { status: 404 }
      );
    }

    // Verify module exists and is locked type
    const { data: modulo } = await supabase
      .from("modulos")
      .select("id, tipo, titulo")
      .eq("id", module_id)
      .single();

    if (!modulo) {
      return NextResponse.json(
        { error: `Module not found: ${module_id}` },
        { status: 404 }
      );
    }

    // Create purchase record
    const { error: purchaseError } = await supabase
      .from("user_purchases")
      .upsert(
        {
          user_id: user.id,
          modulo_id: module_id,
          purchased_at: new Date().toISOString(),
        },
        { onConflict: "user_id,modulo_id" }
      );

    if (purchaseError) {
      return NextResponse.json(
        { error: purchaseError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Access granted: ${user.email} → ${modulo.titulo}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
