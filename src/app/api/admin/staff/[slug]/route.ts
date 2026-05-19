import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["admin", "manager", "stylist", "receptionist"]).optional(),
  bio: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")).optional(),
  credentials: z.array(z.string()).optional(),
  primaryUnitSlug: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const supabase = createAdminClient();

  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.role !== undefined) update.role = data.role;
  if (data.bio !== undefined) update.bio = data.bio || null;
  if (data.imageUrl !== undefined) update.image_url = data.imageUrl || null;
  if (data.credentials !== undefined) update.credentials = data.credentials;
  if (data.isActive !== undefined) update.is_active = data.isActive;

  if (data.primaryUnitSlug !== undefined) {
    if (data.primaryUnitSlug === "") {
      update.primary_unit_id = null;
    } else {
      const { data: u } = await supabase
        .from("units")
        .select("id")
        .eq("slug", data.primaryUnitSlug)
        .maybeSingle();
      if (u) update.primary_unit_id = u.id;
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  const { error } = await supabase.from("staff").update(update).eq("slug", slug);

  if (error) {
    console.error("[admin/staff] update failed:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar profissional." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("staff")
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq("slug", slug);

  if (error) {
    console.error("[admin/staff] soft-delete failed:", error);
    return NextResponse.json(
      { error: "Falha ao arquivar profissional." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
