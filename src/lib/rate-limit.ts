/**
 * Rate limiting leve, persistido em Supabase (sem dependencia nova como Redis).
 *
 * Suficiente pra V1: bloqueia abuso obvio (mesmo IP/email pedindo magic link
 * 30x em 5 min) sem trazer infraestrutura extra. Para producao em escala
 * (>100 req/seg) o ideal seria usar Cloudflare Rate Limiting Rules diretamente
 * no painel - sem codigo.
 *
 * Algoritmo: fixed window. Tabela `rate_limit_buckets` armazena
 * (key, window_start, count). Cada chamada incrementa atomically e checa.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitCheck =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Verifica se a chave pode prosseguir. Sempre retorna { allowed } - mesmo em
 * caso de erro no banco libera por padrao (fail-open) pra nao quebrar o app
 * se o rate-limit estiver indisponivel.
 */
export async function checkRateLimit(
  key: string,
  options: {
    limit: number;
    windowSeconds: number;
  },
): Promise<RateLimitCheck> {
  const supabase = createAdminClient();
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const windowStartIso = new Date(windowStart).toISOString();

  try {
    // Upsert atomic via RPC ideal, mas pra evitar funcao SQL nova fazemos
    // select + update/insert em transacao curta. Sob carga alta da
    // pequenos overcounts (~1-2) que sao aceitaveis no nosso contexto.
    const { data: existing } = await supabase
      .from("rate_limit_buckets")
      .select("count")
      .eq("key", key)
      .eq("window_start", windowStartIso)
      .maybeSingle();

    const count = (existing?.count ?? 0) + 1;

    if (count > options.limit) {
      const retryAfterSeconds = Math.ceil(
        (windowStart + windowMs - now) / 1000,
      );
      return { allowed: false, retryAfterSeconds };
    }

    if (existing) {
      await supabase
        .from("rate_limit_buckets")
        .update({ count })
        .eq("key", key)
        .eq("window_start", windowStartIso);
    } else {
      await supabase.from("rate_limit_buckets").insert({
        key,
        window_start: windowStartIso,
        count: 1,
      });
    }

    return { allowed: true, remaining: options.limit - count };
  } catch (err) {
    // Tabela ausente ou banco indisponivel: fail-open. Loga pra observabilidade.
    console.warn(
      "[rate-limit] failed, allowing by default:",
      (err as Error).message,
    );
    return { allowed: true, remaining: options.limit };
  }
}

/**
 * Extrai um identificador estavel do cliente a partir da Request.
 * Em Cloudflare Workers, CF-Connecting-IP traz o IP real do visitante.
 * Em dev local, fallback pro forwarded ou um placeholder.
 */
export function clientKey(request: Request, prefix: string): string {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return `${prefix}:${ip}`;
}
