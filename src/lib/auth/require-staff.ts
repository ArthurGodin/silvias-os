import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type StaffRole = "admin" | "manager" | "stylist" | "receptionist";

export type AuthorizedStaff = {
  userId: string;
  staffId: string;
  role: StaffRole;
};

/**
 * Garante que a request veio de um membro ativo da equipe com role permitido.
 * Retorna { staff } se OK, ou { response } com 401/403 pra retornar direto da handler.
 *
 * Uso típico:
 *
 *   const guard = await requireStaff(["admin", "manager"]);
 *   if ("response" in guard) return guard.response;
 *   const { staff } = guard;
 *
 * Em modo dev (NODE_ENV !== "production" + ADMIN_AUTH_ENABLED !== "true"),
 * libera sem checar pra facilitar desenvolvimento local. Em prod, sempre exige.
 */
export async function requireStaff(
  allowedRoles: StaffRole[],
): Promise<{ staff: AuthorizedStaff } | { response: NextResponse }> {
  // Modo dev sem auth ativada: passa direto, igual ao middleware.
  // Mantém paridade com o comportamento existente.
  const isDev = process.env.NODE_ENV !== "production";
  const adminAuthEnabled = process.env.ADMIN_AUTH_ENABLED === "true";
  if (isDev && !adminAuthEnabled) {
    return {
      staff: {
        userId: "dev-bypass",
        staffId: "dev-bypass",
        role: "admin",
      },
    };
  }

  let user;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (err) {
    console.error("[requireStaff] auth.getUser failed:", err);
    return {
      response: NextResponse.json(
        { error: "Falha ao verificar sessão" },
        { status: 500 },
      ),
    };
  }

  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 },
      ),
    };
  }

  // Lookup do staff associado ao user. Vai pelo admin client porque a tabela
  // `staff` está sob RLS e o usuário autenticado pode não conseguir ler outras
  // colunas via RLS (ex: a role).
  const admin = createAdminClient();
  const { data: staffRow, error } = await admin
    .from("staff")
    .select("id, role, is_active, deleted_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[requireStaff] staff lookup failed:", error);
    return {
      response: NextResponse.json(
        { error: "Falha ao verificar permissão" },
        { status: 500 },
      ),
    };
  }

  if (!staffRow || !staffRow.is_active || staffRow.deleted_at) {
    return {
      response: NextResponse.json(
        { error: "Sem permissão" },
        { status: 403 },
      ),
    };
  }

  const role = staffRow.role as StaffRole;
  if (!allowedRoles.includes(role)) {
    return {
      response: NextResponse.json(
        { error: "Sem permissão pra essa operação" },
        { status: 403 },
      ),
    };
  }

  return {
    staff: {
      userId: user.id,
      staffId: staffRow.id,
      role,
    },
  };
}
