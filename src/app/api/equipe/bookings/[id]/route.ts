import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const patchSchema = z.object({
  action: z.enum(["save_notes", "check_in", "complete"]),
  stylistNotes: z.string().max(4000).optional(),
  productUsed: z.string().max(280).optional(),
  formulaUsed: z.string().max(280).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookingId } = await params;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload inválido", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabaseSsr = await createClient();
  const {
    data: { user },
  } = await supabaseSsr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id, role, is_active, deleted_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (
    !staffRow ||
    !staffRow.is_active ||
    staffRow.deleted_at ||
    !["admin", "manager", "stylist", "receptionist"].includes(staffRow.role)
  ) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { data: booking, error: fetchErr } = await supabase
    .from("bookings")
    .select("id, staff_id, client_id, unit_id, total_cents, status, scheduled_at, booking_services(service_id)")
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchErr || !booking) {
    return NextResponse.json(
      { error: "Agendamento não encontrado" },
      { status: 404 },
    );
  }

  // Stylist só pode mexer no que é dele. Admin/manager passam.
  if (
    staffRow.role === "stylist" &&
    booking.staff_id !== staffRow.id
  ) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const action = parsed.data.action;

  if (action === "check_in") {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "checked_in" })
      .eq("id", bookingId);
    if (error) {
      console.error("[equipe] check_in failed:", error);
      return NextResponse.json(
        { error: "Falha ao registrar check-in" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, status: "checked_in" });
  }

  // save_notes e complete fazem upsert no service_records antes (se houver notas).
  const notes = parsed.data.stylistNotes?.trim();
  const product = parsed.data.productUsed?.trim();
  const formula = parsed.data.formulaUsed?.trim();
  const hasContent = !!(notes || product || formula);

  if (hasContent && booking.staff_id) {
    type BookingService = { service_id: string };
    const bookingServices =
      (booking.booking_services as BookingService[] | null) ?? [];
    const firstServiceId = bookingServices[0]?.service_id ?? null;

    const { data: existing } = await supabase
      .from("service_records")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle();

    const payload: Record<string, unknown> = {
      booking_id: bookingId,
      client_id: booking.client_id,
      staff_id: booking.staff_id,
      unit_id: booking.unit_id,
      stylist_notes: notes ?? null,
      product_used: product ?? null,
      formula_used: formula ?? null,
      total_charged_cents: booking.total_cents,
    };
    if (firstServiceId) payload.service_id = firstServiceId;

    if (existing?.id) {
      const { error } = await supabase
        .from("service_records")
        .update(payload)
        .eq("id", existing.id);
      if (error) {
        console.error("[equipe] update service_records failed:", error);
        return NextResponse.json(
          { error: "Falha ao salvar anotação" },
          { status: 500 },
        );
      }
    } else {
      payload.performed_at = booking.scheduled_at ?? new Date().toISOString();
      const { error } = await supabase
        .from("service_records")
        .insert(payload);
      if (error) {
        console.error("[equipe] insert service_records failed:", error);
        return NextResponse.json(
          { error: "Falha ao salvar anotação" },
          { status: 500 },
        );
      }
    }
  }

  if (action === "complete") {
    // Idempotência: só dispara o trigger de LTV se status anterior != completed
    if (booking.status !== "completed") {
      const { error: upd } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);
      if (upd) {
        console.error("[equipe] complete failed:", upd);
        return NextResponse.json(
          { error: "Falha ao concluir" },
          { status: 500 },
        );
      }
      // Atualiza contadores no cliente
      const { data: client } = await supabase
        .from("clients")
        .select("visit_count, lifetime_value_cents")
        .eq("id", booking.client_id)
        .single();
      if (client) {
        await supabase
          .from("clients")
          .update({
            visit_count: (client.visit_count ?? 0) + 1,
            lifetime_value_cents:
              (client.lifetime_value_cents ?? 0) + booking.total_cents,
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", booking.client_id);
      }
    }
    return NextResponse.json({ ok: true, status: "completed" });
  }

  return NextResponse.json({ ok: true });
}
