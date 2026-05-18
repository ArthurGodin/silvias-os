import { getCloudflareContext } from "@opennextjs/cloudflare";

type AppEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  ADMIN_AUTH_ENABLED?: string;
  CANCEL_WINDOW_HOURS?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  MERCADOPAGO_ACCESS_TOKEN?: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_PRIVATE_KEY?: string;
  GOOGLE_CALENDAR_OWNER_EMAIL?: string;
};

/**
 * Lê env vars de forma compatível com Node (dev local) e Cloudflare Workers (produção).
 *
 * No Cloudflare Workers, as variáveis configuradas no painel/wrangler.jsonc chegam via
 * `getCloudflareContext().env`, não `process.env`. Algumas variáveis (`NEXT_PUBLIC_*` em
 * server components, valores presentes no `vars` do wrangler.jsonc) também aparecem em
 * `process.env` — então fazemos merge dos dois.
 */
export function getEnv(): AppEnv {
  const fromNode: AppEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    ADMIN_AUTH_ENABLED: process.env.ADMIN_AUTH_ENABLED,
    CANCEL_WINDOW_HOURS: process.env.CANCEL_WINDOW_HOURS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_CALENDAR_OWNER_EMAIL: process.env.GOOGLE_CALENDAR_OWNER_EMAIL,
  };

  try {
    const cf = getCloudflareContext().env as AppEnv | undefined;
    if (!cf) return fromNode;
    return {
      NEXT_PUBLIC_SUPABASE_URL:
        cf.NEXT_PUBLIC_SUPABASE_URL ?? fromNode.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        cf.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? fromNode.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY:
        cf.SUPABASE_SERVICE_ROLE_KEY ?? fromNode.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SITE_URL:
        cf.NEXT_PUBLIC_SITE_URL ?? fromNode.NEXT_PUBLIC_SITE_URL,
      ADMIN_AUTH_ENABLED: cf.ADMIN_AUTH_ENABLED ?? fromNode.ADMIN_AUTH_ENABLED,
      CANCEL_WINDOW_HOURS:
        cf.CANCEL_WINDOW_HOURS ?? fromNode.CANCEL_WINDOW_HOURS,
      RESEND_API_KEY: cf.RESEND_API_KEY ?? fromNode.RESEND_API_KEY,
      RESEND_FROM_EMAIL: cf.RESEND_FROM_EMAIL ?? fromNode.RESEND_FROM_EMAIL,
      MERCADOPAGO_ACCESS_TOKEN:
        cf.MERCADOPAGO_ACCESS_TOKEN ?? fromNode.MERCADOPAGO_ACCESS_TOKEN,
      GOOGLE_SERVICE_ACCOUNT_EMAIL:
        cf.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? fromNode.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY: cf.GOOGLE_PRIVATE_KEY ?? fromNode.GOOGLE_PRIVATE_KEY,
      GOOGLE_CALENDAR_OWNER_EMAIL:
        cf.GOOGLE_CALENDAR_OWNER_EMAIL ?? fromNode.GOOGLE_CALENDAR_OWNER_EMAIL,
    };
  } catch {
    // Em alguns contextos (build time, dev sem initOpenNextCloudflareForDev),
    // getCloudflareContext lança. Caímos no fallback puro process.env.
    return fromNode;
  }
}
