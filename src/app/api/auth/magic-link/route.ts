import { NextResponse } from "next/server";
import { z } from "zod";
import { createAnonClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email("E-mail inválido"),
  redirectTo: z.string().optional(),
});

export async function POST(request: Request) {
  // Rate limit: 5 magic links por IP em 10 min. Supabase ja limita 1 por
  // email/minuto, mas isso protege contra spray (enumerar emails via brute).
  const limit = await checkRateLimit(clientKey(request, "magic-link"), {
    limit: 5,
    windowSeconds: 600,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Muitas tentativas. Tente de novo em ${Math.ceil(limit.retryAfterSeconds / 60)} minuto(s).`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload inválido" },
      { status: 400 },
    );
  }

  const { email, redirectTo } = parsed.data;
  const supabase = createAnonClient();

  const siteUrl =
    getEnv().NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/conta/entrar/callback${
        redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""
      }`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[magic-link] failed:", error);
    return NextResponse.json(
      { error: "Falha ao enviar link. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
