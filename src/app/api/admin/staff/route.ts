import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use apenas a-z, 0-9 e hífens"),
  name: z.string().min(2),
  role: z.enum(["admin", "manager", "stylist", "receptionist"]),
  bio: z.string().max(500).optional().default(""),
  imageUrl: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional(),
  credentials: z.array(z.string()).optional().default([]),
  primaryUnitSlug: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const supabase = createAdminClient();

  let primaryUnitId: string | null = null;
  if (data.primaryUnitSlug) {
    const { data: u } = await supabase
      .from("units")
      .select("id")
      .eq("slug", data.primaryUnitSlug)
      .maybeSingle();
    primaryUnitId = u?.id ?? null;
  }

  const { data: inserted, error } = await supabase
    .from("staff")
    .insert({
      slug: data.slug,
      name: data.name,
      role: data.role,
      bio: data.bio || null,
      image_url: data.imageUrl || null,
      credentials: data.credentials,
      primary_unit_id: primaryUnitId,
      is_active: true,
    })
    .select("id, slug, name")
    .single();

  if (error) {
    console.error("[admin/staff] insert failed:", error);
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "Já existe um profissional com esse slug."
            : "Falha ao cadastrar profissional.",
      },
      { status: 500 },
    );
  }

  // Vincula a unidade primária também via staff_units (se houver)
  if (primaryUnitId && inserted) {
    await supabase
      .from("staff_units")
      .insert({ staff_id: inserted.id, unit_id: primaryUnitId });
  }

  return NextResponse.json({ ok: true, staff: inserted });
}
