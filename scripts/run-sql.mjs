import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sql = postgres({
  host: "db.dnobsclntsuadwgbpgye.supabase.co",
  port: 5432,
  database: "postgres",
  username: "postgres",
  password: "@basseven.automacao",
  ssl: "require",
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
});

async function run() {
  try {
    console.log("Conectando ao Supabase Postgres...");
    const test = await sql`SELECT 1 as connected`;
    console.log("✅ Conexão OK!\n");

    // Execute schema as a single batch
    console.log("Executando schema.sql (batch inteiro)...");
    const schemaSQL = readFileSync(
      resolve(__dirname, "../supabase/schema.sql"),
      "utf-8"
    );
    await sql.unsafe(schemaSQL);
    console.log("✅ Schema criado com sucesso!\n");

    // Execute seed as a single batch
    console.log("Executando seed.sql (batch inteiro)...");
    const seedSQL = readFileSync(
      resolve(__dirname, "../supabase/seed.sql"),
      "utf-8"
    );
    await sql.unsafe(seedSQL);
    console.log("✅ Seed inserido com sucesso!\n");

    // Update admin user profile
    console.log("Configurando admin user...");
    await sql.unsafe(`
      UPDATE public.profiles
      SET role = 'admin', nome = 'Administradora'
      WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@lifefitmembers.com' LIMIT 1)
    `);
    console.log("✅ Admin role configurado!");

    // Update member profile name
    await sql.unsafe(`
      UPDATE public.profiles
      SET nome = 'Maria Clara'
      WHERE id = (SELECT id FROM auth.users WHERE email = 'membro@lifefitmembers.com' LIMIT 1)
    `);
    console.log("✅ Membro profile atualizado!\n");

    // Verify
    console.log("--- Verificação ---");
    const profiles = await sql`SELECT nome, role, ativo FROM public.profiles`;
    console.log("Profiles:", profiles);

    const modulos = await sql`SELECT numero_semana, titulo FROM public.modulos ORDER BY ordem`;
    console.log("Módulos:", modulos);

    const aulasCount = await sql`SELECT count(*)::int as total FROM public.aulas`;
    console.log("Total de aulas:", aulasCount[0].total);

    console.log("\n=== SETUP COMPLETO ===");
    console.log("\nCredenciais de acesso:");
    console.log("  Admin:  admin@lifefitmembers.com / Admin@2026!");
    console.log("  Membro: membro@lifefitmembers.com / Membro@2026!");
  } catch (err) {
    console.error("❌ Erro:", err.message);
    if (err.detail) console.error("   Detalhe:", err.detail);
  } finally {
    await sql.end();
  }
}

run();
