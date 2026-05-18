/**
 * Cria (ou atualiza) usuário admin no Supabase e vincula ao staff "silvia-meneses".
 *
 * Uso:
 *   node scripts/seed-admin.mjs <email>
 *
 * Exemplo:
 *   node scripts/seed-admin.mjs arthurgodinho155@gmail.com
 *
 * O script:
 *   1. Lê SUPABASE_URL + SERVICE_ROLE_KEY do .env.local
 *   2. Cria user em auth.users (email confirmado, sem senha — login via magic link)
 *   3. Faz UPDATE staff SET user_id = <id_do_user> WHERE slug = 'silvia-meneses'
 *   4. Reporta resultado
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

const envText = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✗ Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("✗ Forneça um email: node scripts/seed-admin.mjs <email>");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`\n→ Criando ou atualizando admin para "${email}"...\n`);

// 1) Procura user existente pelo email
const { data: listed, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) {
  console.error("✗ Falha ao listar users:", listErr.message);
  process.exit(1);
}
const existing = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

let userId;
if (existing) {
  userId = existing.id;
  console.log(`✓ User já existe (id=${userId.slice(0, 8)}…)`);
  // Garante confirmado
  if (!existing.email_confirmed_at) {
    await supabase.auth.admin.updateUserById(userId, { email_confirm: true });
    console.log("  → email confirmado");
  }
} else {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (createErr) {
    console.error("✗ Falha ao criar user:", createErr.message);
    process.exit(1);
  }
  userId = created.user.id;
  console.log(`✓ User criado (id=${userId.slice(0, 8)}…)`);
}

// 2) Vincula ao staff silvia-meneses
const { data: updated, error: updErr } = await supabase
  .from("staff")
  .update({ user_id: userId })
  .eq("slug", "silvia-meneses")
  .select("slug, name, role")
  .maybeSingle();

if (updErr) {
  console.error("✗ Falha ao vincular staff:", updErr.message);
  process.exit(1);
}

if (!updated) {
  console.error("✗ Staff 'silvia-meneses' não encontrado no banco. Rode supabase/setup.sql primeiro.");
  process.exit(1);
}

console.log(`✓ Vinculado a staff: ${updated.name} (${updated.role})`);

console.log("\n🎉 Pronto!\n");
console.log("Agora você consegue entrar em:");
console.log(`   ${env.NEXT_PUBLIC_SITE_URL ?? "https://silvias-os.arthurgodinho155.workers.dev"}/admin/login`);
console.log(`   Email: ${email}`);
console.log(`   (Sem senha — vai chegar magic link)\n`);
