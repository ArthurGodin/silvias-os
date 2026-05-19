import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth/require-staff";

const patchSchema = z.object({
  status: z.enum([
    "pending_payment",
    "confirmed",
    "checked_in",
    "completed",
    "cancelled_client",
    "cancelled_house",
    "no_show",
  ]),
  reason: z.string().max(280).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireStaff([
    "admin",
    "manager",
    "stylist",
    "receptionist",
  ]);
  if ("response" in guard) return guard.response;

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload inválido", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const newStatus = parsed.data.status;
  const isCancelled =
    newStatus === "cancelled_client" || newStatus === "cancelled_house";

  const update: Record<string, unknown> = { status: newStatus };
  if (isCancelled) {
    update.cancelled_at = new Date().toISOString();
    if (parsed.data.reason) update.cancellation_reason = parsed.data.reason;
  }

  const { data: bookingBefore, error: fetchErr } = await supabase
    .from("bookings")
    .select("client_id, total_cents, status")
    .eq("id", id)
    .single();

  if (fetchErr || !bookingBefore) {
    return NextResponse.json(
      { error: "Agendamento não encontrado" },
      { status: 404 },
    );
  }

  const { error: updateErr } = await supabase
    .from("bookings")
    .update(update)
    .eq("id", id);

  if (updateErr) {
    console.error("[admin/bookings] update failed:", updateErr);
    return NextResponse.json(
      { error: "Falha ao atualizar status" },
      { status: 500 },
    );
  }

  // Quando booking vira "completed", incrementa contadores do cliente.
  // Idempotência: só roda se o status anterior não era completed.
  if (newStatus === "completed" && bookingBefore.status !== "completed") {
    const { data: client } = await supabase
      .from("clients")
      .select("visit_count, lifetime_value_cents")
      .eq("id", bookingBefore.client_id)
      .single();

    if (client) {
      await supabase
        .from("clients")
        .update({
          visit_count: (client.visit_count ?? 0) + 1,
          lifetime_value_cents:
            (client.lifetime_value_cents ?? 0) + bookingBefore.total_cents,
          last_seen_at: new Date().toISOString(),
        })
        .eq("id", bookingBefore.client_id);
    }
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
