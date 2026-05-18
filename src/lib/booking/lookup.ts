import { createAdminClient } from "@/lib/supabase/admin";

export type PublicBookingView = {
  id: string;
  shortCode: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  totalCents: number;
  depositCents: number;
  comboSlug: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string;
  unitName: string;
  unitShoppingName: string;
  unitAddress: string;
  unitPhone: string | null;
  staffName: string | null;
  services: { name: string; durationMinutes: number; priceCents: number }[];
  cancelledAt: Date | null;
};

type Raw = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  total_cents: number;
  deposit_cents: number;
  combo_slug: string | null;
  cancelled_at: string | null;
  clients: { name: string; email: string | null; phone: string } | null;
  staff: { name: string } | null;
  units: {
    name: string;
    shopping_name: string;
    address: string;
    phone: string | null;
  } | null;
  booking_services: {
    duration_minutes: number;
    price_cents: number;
    services: { name: string } | null;
  }[];
};

const PUBLIC_SELECT = `
  id,
  scheduled_at,
  duration_minutes,
  status,
  total_cents,
  deposit_cents,
  combo_slug,
  cancelled_at,
  clients ( name, email, phone ),
  staff ( name ),
  units ( name, shopping_name, address, phone ),
  booking_services ( duration_minutes, price_cents, services ( name ) )
`;

export async function lookupBooking(
  id: string,
): Promise<PublicBookingView | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(PUBLIC_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const r = data as unknown as Raw;

  return {
    id: r.id,
    shortCode: r.id.slice(0, 8).toUpperCase(),
    scheduledAt: new Date(r.scheduled_at),
    durationMinutes: r.duration_minutes,
    status: r.status,
    totalCents: r.total_cents,
    depositCents: r.deposit_cents,
    comboSlug: r.combo_slug,
    cancelledAt: r.cancelled_at ? new Date(r.cancelled_at) : null,
    clientName: r.clients?.name ?? "—",
    clientEmail: r.clients?.email ?? null,
    clientPhone: r.clients?.phone ?? "",
    unitName: r.units?.name ?? "—",
    unitShoppingName: r.units?.shopping_name ?? "",
    unitAddress: r.units?.address ?? "",
    unitPhone: r.units?.phone ?? null,
    staffName: r.staff?.name ?? null,
    services: r.booking_services.map((bs) => ({
      name: bs.services?.name ?? "—",
      durationMinutes: bs.duration_minutes,
      priceCents: bs.price_cents,
    })),
  };
}

export const CANCEL_WINDOW_HOURS = Number(
  process.env.CANCEL_WINDOW_HOURS ?? 24,
);

export function canCancel(
  booking: Pick<PublicBookingView, "status" | "scheduledAt">,
): { allowed: boolean; reason?: string } {
  if (booking.status === "completed") {
    return { allowed: false, reason: "Atendimento já realizado" };
  }
  if (
    booking.status === "cancelled_client" ||
    booking.status === "cancelled_house"
  ) {
    return { allowed: false, reason: "Agendamento já cancelado" };
  }
  if (booking.status === "no_show") {
    return { allowed: false, reason: "Marcado como não compareceu" };
  }

  const hoursUntil =
    (booking.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < CANCEL_WINDOW_HOURS) {
    return {
      allowed: false,
      reason: `Cancelamento online só até ${CANCEL_WINDOW_HOURS}h antes. Fale com a recepção pelo WhatsApp.`,
    };
  }
  return { allowed: true };
}
