import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { canCancel, lookupBooking } from "@/lib/booking/lookup";

const bodySchema = z.object({
  reason: z.string().max(280).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const booking = await lookupBooking(id);
  if (!booking) {
    return NextResponse.json(
      { error: "Agendamento não encontrado" },
      { status: 404 },
    );
  }

  const check = canCancel(booking);
  if (!check.allowed) {
    return NextResponse.json(
      { error: check.reason ?? "Cancelamento não permitido" },
      { status: 409 },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  const reason = parsed.success ? parsed.data.reason : undefined;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled_client",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason ?? null,
    })
    .eq("id", id);

  if (error) {
    console.error("[bookings/cancel] update failed:", error);
    return NextResponse.json(
      { error: "Falha ao cancelar" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
