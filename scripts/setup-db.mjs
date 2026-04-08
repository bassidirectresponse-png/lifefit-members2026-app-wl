import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://dnobsclntsuadwgbpgye.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRub2JzY2xudHN1YWR3Z2JwZ3llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4OTg4MCwiZXhwIjoyMDkxMTY1ODgwfQ.RJyw_8qjf_P6rioJNN7M7Qkqs02x1VkzXHZuxyUIlCU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("=== Setup Life Fit Members DB ===\n");

  // Step 1: Create tables via individual operations since we can't run raw SQL via REST API
  // We'll use the Supabase Management API instead

  // Actually - let's try using the pg endpoint
  const PROJECT_REF = "dnobsclntsuadwgbpgye";

  // Read SQL files
  const schemaSQL = readFileSync(resolve(__dirname, "../supabase/schema.sql"), "utf-8");
  const seedSQL = readFileSync(resolve(__dirname, "../supabase/seed.sql"), "utf-8");

  console.log("Executing schema via Management API...");

  // Use the Supabase Management API to run SQL
  const schemaRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: schemaSQL }),
    }
  );

  if (!schemaRes.ok) {
    const errText = await schemaRes.text();
    console.log("Management API not available (needs personal access token):", schemaRes.status);
    console.log("Response:", errText.substring(0, 200));
    console.log("\nFalling back to table-by-table creation...\n");

    // Fallback: try the tables individually via PostgREST
    // This won't work for DDL - we need another approach
    console.log("❌ Cannot execute DDL via REST API.");
    console.log("\n📋 You need to run the SQL manually in the Supabase Dashboard.");
    console.log("   Go to: SQL Editor > New Query > paste schema.sql > Run");
    console.log("   Then: New Query > paste seed.sql > Run\n");

    // But we CAN still create users and check connectivity
    console.log("Testing connectivity...");
  } else {
    console.log("✅ Schema created successfully!");

    console.log("\nExecuting seed...");
    const seedRes = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: seedSQL }),
      }
    );

    if (seedRes.ok) {
      console.log("✅ Seed data inserted!");
    } else {
      console.log("❌ Seed failed:", await seedRes.text());
    }
  }

  // Step 2: Create admin user
  console.log("\nCreating admin user...");
  const { data: adminUser, error: adminErr } =
    await supabase.auth.admin.createUser({
      email: "admin@lifefitmembers.com",
      password: "Admin@2026!",
      email_confirm: true,
      user_metadata: { nome: "Administradora" },
    });

  if (adminErr) {
    console.log("Admin user:", adminErr.message);
  } else {
    console.log("✅ Admin user created:", adminUser.user.email);
  }

  // Step 3: Create test member
  console.log("Creating test member...");
  const { data: memberUser, error: memberErr } =
    await supabase.auth.admin.createUser({
      email: "membro@lifefitmembers.com",
      password: "Membro@2026!",
      email_confirm: true,
      user_metadata: { nome: "Maria Clara" },
    });

  if (memberErr) {
    console.log("Member user:", memberErr.message);
  } else {
    console.log("✅ Test member created:", memberUser.user.email);
  }

  console.log("\n=== Done ===");
  console.log("\nCredentials:");
  console.log("  Admin:  admin@lifefitmembers.com / Admin@2026!");
  console.log("  Membro: membro@lifefitmembers.com / Membro@2026!");
}

run().catch(console.error);
