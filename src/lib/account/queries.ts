import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AccountBooking = {
  id: string;
  shortCode: string;
  scheduledAt: Date;
  status: string;
  totalCents: number;
  comboSlug: string | null;
  serviceName: string;
  staffName: string;
  unitName: string;
};

export type AccountProfile = {
  clientId: string;
  name: string;
  email: string | null;
  phone: string;
  firstSeenAt: Date;
  lastSeenAt: Date | null;
  visitCount: number;
  lifetimeValueCents: number;
};

type RawBooking = {
  id: string;
  scheduled_at: string;
  status: string;
  total_cents: number;
  combo_slug: string | null;
  staff: { name: string } | null;
  units: { name: string } | null;
  booking_services: { services: { name: string } | null }[];
};

export async function currentClientProfile(): Promise<AccountProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select(
      "id, name, email, phone, first_seen_at, last_seen_at, visit_count, lifetime_value_cents",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!client) return null;

  return {
    clientId: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    firstSeenAt: new Date(client.first_seen_at),
    lastSeenAt: client.last_seen_at ? new Date(client.last_seen_at) : null,
    visitCount: client.visit_count,
    lifetimeValueCents: client.lifetime_value_cents,
  };
}

export async function clientBookings(
  clientId: string,
): Promise<AccountBooking[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bookings")
    .select(
      `
      id,
      scheduled_at,
      status,
      total_cents,
      combo_slug,
      staff ( name ),
      units ( name ),
      booking_services ( services ( name ) )
    `,
    )
    .eq("client_id", clientId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("[account] clientBookings error:", error);
    return [];
  }

  const rows = data as unknown as RawBooking[];
  return rows.map((r) => ({
    id: r.id,
    shortCode: r.id.slice(0, 8).toUpperCase(),
    scheduledAt: new Date(r.scheduled_at),
    status: r.status,
    totalCents: r.total_cents,
    comboSlug: r.combo_slug,
    serviceName: r.booking_services
      .map((bs) => bs.services?.name)
      .filter(Boolean)
      .join(" + "),
    staffName: r.staff?.name ?? "A casa escolhe",
    unitName: r.units?.name ?? "",
  }));
}
