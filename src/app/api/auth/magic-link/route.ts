import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  email: z.string().email("E-mail inválido"),
  redirectTo: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload inválido" },
      { status: 400 },
    );
  }

  const { email, redirectTo } = parsed.data;
  const supabase = await createClient();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    new URL(request.url).origin;

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
