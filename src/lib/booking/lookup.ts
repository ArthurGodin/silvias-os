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
  /** Não exposto na resposta pública. Use lookupBookingWithToken se precisar. */
  _cancelToken?: string | null;
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
  cancel_token?: string | null;
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

const SELECT_WITH_TOKEN = PUBLIC_SELECT + ", cancel_token";

async function fetchBooking(
  id: string,
  withToken: boolean,
): Promise<(PublicBookingView & { _cancelToken?: string | null }) | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }

  const supabase = createAdminClient();
  // Tenta primeiro com cancel_token (post-migration). Se a coluna ainda nao
  // existir no banco, faz fallback pro select original. Permite que o codigo
  // suba antes da migration.
  let raw: Raw | null = null;
  if (withToken) {
    const { data, error } = await supabase
      .from("bookings")
      .select(SELECT_WITH_TOKEN)
      .eq("id", id)
      .maybeSingle();
    if (!error && data) raw = data as unknown as Raw;
    else if (error && !error.message?.includes("cancel_token")) {
      console.error("[lookupBooking] error:", error);
      return null;
    }
  }
  if (!raw) {
    const { data, error } = await supabase
      .from("bookings")
      .select(PUBLIC_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    raw = data as unknown as Raw;
  }

  return {
    id: raw.id,
    shortCode: raw.id.slice(0, 8).toUpperCase(),
    scheduledAt: new Date(raw.scheduled_at),
    durationMinutes: raw.duration_minutes,
    status: raw.status,
    totalCents: raw.total_cents,
    depositCents: raw.deposit_cents,
    comboSlug: raw.combo_slug,
    cancelledAt: raw.cancelled_at ? new Date(raw.cancelled_at) : null,
    clientName: raw.clients?.name ?? "—",
    clientEmail: raw.clients?.email ?? null,
    clientPhone: raw.clients?.phone ?? "",
    unitName: raw.units?.name ?? "—",
    unitShoppingName: raw.units?.shopping_name ?? "",
    unitAddress: raw.units?.address ?? "",
    unitPhone: raw.units?.phone ?? null,
    staffName: raw.staff?.name ?? null,
    services: raw.booking_services.map((bs) => ({
      name: bs.services?.name ?? "—",
      durationMinutes: bs.duration_minutes,
      priceCents: bs.price_cents,
    })),
    _cancelToken: withToken ? raw.cancel_token ?? null : undefined,
  };
}

export async function lookupBooking(
  id: string,
): Promise<PublicBookingView | null> {
  return fetchBooking(id, false);
}

/**
 * Como lookupBooking, mas retorna tambem o cancel_token no campo _cancelToken.
 * Usado server-side em /agendamento/[id] pra comparar com o ?cancel= da URL
 * sem precisar de round-trip extra. Nunca exponha _cancelToken pro client
 * sem antes ter verificado.
 */
export async function lookupBookingWithToken(
  id: string,
): Promise<PublicBookingView | null> {
  return fetchBooking(id, true);
}

/**
 * Valida que o token recebido bate com o cancel_token do booking. Usado pelo
 * endpoint de cancelamento. Se a migration ainda nao foi aplicada (coluna
 * cancel_token ausente), libera por padrao - mantem compatibilidade durante
 * o periodo de rollout. Depois da migration, qualquer token errado nega.
 */
export async function verifyCancelToken(
  bookingId: string,
  providedToken: string | null | undefined,
): Promise<{ ok: boolean; reason?: string }> {
  const booking = await fetchBooking(bookingId, true);
  if (!booking) return { ok: false, reason: "Agendamento nao encontrado" };

  // Migration nao aplicada: aceita sem checar (modo de transicao).
  if (booking._cancelToken === undefined || booking._cancelToken === null) {
    return { ok: true };
  }

  if (!providedToken || providedToken !== booking._cancelToken) {
    return { ok: false, reason: "Link de cancelamento invalido" };
  }
  return { ok: true };
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
