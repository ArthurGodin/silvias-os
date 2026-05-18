import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/booking/availability";

const querySchema = z.object({
  serviceSlug: z.string().min(1),
  unitSlug: z.string().min(1),
  staffSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.coerce.number().int().positive().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    serviceSlug: searchParams.get("serviceSlug"),
    unitSlug: searchParams.get("unitSlug"),
    staffSlug: searchParams.get("staffSlug"),
    date: searchParams.get("date"),
    duration: searchParams.get("duration") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parâmetros inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // TODO Sprint 3: buscar `busy` do Supabase (bookings + time_off) com Service Role.
  // Por enquanto, slots gerados são todos disponíveis exceto horários passados.
  const slots = getAvailableSlots({
    serviceSlug: parsed.data.serviceSlug,
    unitSlug: parsed.data.unitSlug,
    staffSlug: parsed.data.staffSlug,
    date: parsed.data.date,
    busy: [],
    durationOverride: parsed.data.duration,
  });

  return NextResponse.json({ slots });
}
