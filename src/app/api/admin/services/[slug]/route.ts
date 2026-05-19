import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth/require-staff";

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().max(500).optional(),
  durationMinutes: z.coerce.number().int().min(5).max(480).optional(),
  fromPriceCents: z.coerce.number().int().min(0).max(10_000_000).optional(),
  requiresDeposit: z.coerce.boolean().optional(),
  categorySlug: z
    .enum(["cabelo", "estetica", "unhas", "depilacao"])
    .optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const guard = await requireStaff(["admin", "manager"]);
  if ("response" in guard) return guard.response;

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
  if (data.description !== undefined)
    update.description = data.description || null;
  if (data.durationMinutes !== undefined)
    update.duration_minutes = data.durationMinutes;
  if (data.fromPriceCents !== undefined)
    update.from_price_cents = data.fromPriceCents;
  if (data.requiresDeposit !== undefined)
    update.requires_deposit = data.requiresDeposit;
  if (data.isActive !== undefined) update.is_active = data.isActive;

  if (data.categorySlug) {
    const { data: cat } = await supabase
      .from("service_categories")
      .select("id")
      .eq("slug", data.categorySlug)
      .maybeSingle();
    if (cat) update.category_id = cat.id;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  const { error } = await supabase
    .from("services")
    .update(update)
    .eq("slug", slug);

  if (error) {
    console.error("[admin/services] update failed:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar serviço." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const guard = await requireStaff(["admin", "manager"]);
  if ("response" in guard) return guard.response;

  const { slug } = await params;
  const supabase = createAdminClient();

  // Soft delete: marca como inativo + seta deleted_at.
  const { error } = await supabase
    .from("services")
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq("slug", slug);

  if (error) {
    console.error("[admin/services] soft-delete failed:", error);
    return NextResponse.json(
      { error: "Falha ao arquivar serviço." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
