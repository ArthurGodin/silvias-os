import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function redirectError(
  origin: string,
  next: string,
  kind: "invalid" | "expired",
) {
  const u = new URL("/conta/entrar", origin);
  u.searchParams.set("error", kind);
  if (next && next !== "/conta") u.searchParams.set("next", next);
  return NextResponse.redirect(u);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/conta";

  const supabase = await createClient();

  let userEmail: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirectError(origin, next, "invalid");
    userEmail = data.user?.email ?? null;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "signup" | "email",
    });
    if (error) return redirectError(origin, next, "expired");
    userEmail = data.user?.email ?? null;
  } else {
    // Quando o magic link vem no formato implicit (tokens em #access_token),
    // não temos como processar server-side (fragments não chegam ao servidor).
    // Redireciona pra /conta/entrar onde o client-side handler completa o
    // fluxo extraindo do hash.
    return redirectError(origin, next, "invalid");
  }

  // Vincular client.user_id automaticamente (mesmo email → mesmo cliente).
  if (userEmail) {
    try {
      const admin = createAdminClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await admin
          .from("clients")
          .update({ user_id: user.id })
          .ilike("email", userEmail)
          .is("user_id", null);
      }
    } catch (err) {
      console.error("[auth/callback] link client failed:", err);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
