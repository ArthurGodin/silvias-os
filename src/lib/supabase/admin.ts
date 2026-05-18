import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

export function createAdminClient() {
  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ausente. Necessário em rotas de API que precisam escrever sem RLS.",
    );
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Cliente Supabase com chave ANON (sem RLS bypass). Usado em rotas server-side
 * que precisam disparar fluxos de auth (ex: signInWithOtp), porque o service
 * role NÃO pode chamar esses métodos.
 */
export function createAnonClient() {
  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase credentials ausentes (anon).");
  }
  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
