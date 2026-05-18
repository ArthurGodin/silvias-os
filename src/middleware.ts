import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/admin", "/equipe", "/conta"] as const;
const PUBLIC_EXCEPTIONS = [
  "/admin/login",
  "/conta/entrar",
  "/conta/entrar/callback",
  "/conta/sair",
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const needsAuth =
    PROTECTED_PREFIXES.some((p) => path.startsWith(p)) &&
    !PUBLIC_EXCEPTIONS.includes(path);

  if (!needsAuth) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isAccount = path.startsWith("/conta");
  const isStaffArea = path.startsWith("/admin") || path.startsWith("/equipe");

  // Sem credenciais Supabase configuradas: libera tudo (modo dev sem banco).
  if (!supabaseUrl || !supabaseAnon) return NextResponse.next();

  // Dev local: opt-in pra ativar auth real do admin via ADMIN_AUTH_ENABLED=true.
  // /conta SEMPRE exige auth (cliente final).
  if (
    isStaffArea &&
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_AUTH_ENABLED !== "true"
  ) {
    return NextResponse.next();
  }

  // Em runtime de Cloudflare Workers, algumas chamadas podem lançar
  // (ex: cookies malformados ou Supabase indisponível). Tratamos como
  // "não autenticado" — redireciona pro login em vez de 500.
  try {
    let response = NextResponse.next({ request: req });

    const supabase = createServerClient(supabaseUrl, supabaseAnon, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              response.cookies.set(name, value, options as never);
            } catch {
              // Silencia: alguns response objects do edge não aceitam set após body.
            }
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = req.nextUrl.clone();
      if (isAccount) {
        url.pathname = "/conta/entrar";
        url.searchParams.set("next", path);
      } else {
        url.pathname = "/admin/login";
        url.searchParams.set("next", path);
      }
      return NextResponse.redirect(url);
    }

    // /conta: qualquer user autenticado entra. Não exige role de staff.
    if (isAccount) return response;

    // /admin e /equipe: bloqueio por role.
    const { data: staffRow } = await supabase
      .from("staff")
      .select("role,is_active,deleted_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const isActiveStaff =
      staffRow && staffRow.is_active && !staffRow.deleted_at;

    if (!isActiveStaff) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/admin") && staffRow.role === "stylist") {
      const url = req.nextUrl.clone();
      url.pathname = "/equipe";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    console.error("[middleware] erro inesperado:", err);
    // Fail closed: redireciona pra login ao invés de mostrar 500.
    const url = req.nextUrl.clone();
    url.pathname = isAccount ? "/conta/entrar" : "/admin/login";
    url.searchParams.set("error", "auth_failed");
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/equipe/:path*", "/conta/:path*"],
};
