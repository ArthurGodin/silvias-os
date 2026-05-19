import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Use apenas a-z, 0-9 e hífens"),
  name: z.string().min(2),
  categorySlug: z.enum(["cabelo", "estetica", "unhas", "depilacao"]),
  description: z.string().max(500).optional().default(""),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  fromPriceCents: z.coerce.number().int().min(0).max(10_000_000),
  requiresDeposit: z.coerce.boolean().default(false),
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

  // Resolve category_id pelo slug
  const { data: cat } = await supabase
    .from("service_categories")
    .select("id")
    .eq("slug", data.categorySlug)
    .maybeSingle();
  if (!cat) {
    return NextResponse.json(
      { error: "Categoria não encontrada" },
      { status: 400 },
    );
  }

  const { data: inserted, error } = await supabase
    .from("services")
    .insert({
      slug: data.slug,
      name: data.name,
      category_id: cat.id,
      description: data.description || null,
      duration_minutes: data.durationMinutes,
      from_price_cents: data.fromPriceCents,
      requires_deposit: data.requiresDeposit,
      is_active: true,
    })
    .select("id, slug, name")
    .single();

  if (error) {
    console.error("[admin/services] insert failed:", error);
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "Já existe um serviço com esse slug."
            : "Falha ao criar serviço.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, service: inserted });
}
