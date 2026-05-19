import { createAdminClient } from "@/lib/supabase/admin";

export type StylistBookingRow = {
  id: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  totalCents: number;
  depositCents: number;
  clientId: string;
  clientName: string;
  clientPhone: string;
  unitName: string;
  serviceName: string;
};

type RawBooking = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  total_cents: number;
  deposit_cents: number;
  client_id: string;
  clients: { id: string; name: string; phone: string } | null;
  units: { name: string } | null;
  booking_services: { services: { name: string } | null }[];
};

const BOOKING_SELECT = `
  id,
  scheduled_at,
  duration_minutes,
  status,
  total_cents,
  deposit_cents,
  client_id,
  clients ( id, name, phone ),
  units ( name ),
  booking_services ( services ( name ) )
`;

function mapBooking(r: RawBooking): StylistBookingRow {
  const services = r.booking_services
    .map((bs) => bs.services?.name)
    .filter(Boolean) as string[];
  return {
    id: r.id,
    scheduledAt: new Date(r.scheduled_at),
    durationMinutes: r.duration_minutes,
    status: r.status,
    totalCents: r.total_cents,
    depositCents: r.deposit_cents,
    clientId: r.client_id,
    clientName: r.clients?.name ?? "—",
    clientPhone: r.clients?.phone ?? "",
    unitName: r.units?.name ?? "",
    serviceName: services.join(" + ") || "—",
  };
}

export type StaffMeta = {
  id: string;
  slug: string;
  name: string;
  role: string;
  imageUrl: string | null;
};

export async function staffByUserId(userId: string): Promise<StaffMeta | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("staff")
    .select("id, slug, name, role, image_url, is_active, deleted_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data || !data.is_active || data.deleted_at) return null;
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    role: data.role,
    imageUrl: data.image_url,
  };
}

export async function staffBySlug(slug: string): Promise<StaffMeta | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("staff")
    .select("id, slug, name, role, image_url, is_active, deleted_at")
    .eq("slug", slug)
    .maybeSingle();
  if (!data || !data.is_active || data.deleted_at) return null;
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    role: data.role,
    imageUrl: data.image_url,
  };
}

export async function bookingsForStaffOnDate(
  staffId: string,
  date: Date,
): Promise<StylistBookingRow[]> {
  const supabase = createAdminClient();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("staff_id", staffId)
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error("[equipe] bookingsForStaffOnDate error:", error);
    return [];
  }
  return (data as unknown as RawBooking[]).map(mapBooking);
}

export async function nextBookingForStaff(
  staffId: string,
): Promise<StylistBookingRow | null> {
  const supabase = createAdminClient();
  const now = new Date();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("staff_id", staffId)
    .gte("scheduled_at", now.toISOString())
    .in("status", ["confirmed", "checked_in", "pending_payment"])
    .order("scheduled_at", { ascending: true })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return mapBooking(data[0] as unknown as RawBooking);
}

export async function getBookingForStaff(
  bookingId: string,
  staffId: string,
): Promise<StylistBookingRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", bookingId)
    .eq("staff_id", staffId)
    .maybeSingle();
  if (error || !data) return null;
  return mapBooking(data as unknown as RawBooking);
}

export async function getBookingById(
  bookingId: string,
): Promise<StylistBookingRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", bookingId)
    .maybeSingle();
  if (error || !data) return null;
  return mapBooking(data as unknown as RawBooking);
}

export type StylistClientDetail = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  notes: string | null;
  hairType: string | null;
  visitCount: number;
  lifetimeValueCents: number;
  firstSeenAt: Date;
  lastSeenAt: Date | null;
};

export async function clientDetail(
  id: string,
): Promise<StylistClientDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, name, email, phone, notes, hair_type, visit_count, lifetime_value_cents, first_seen_at, last_seen_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    notes: data.notes,
    hairType: data.hair_type,
    visitCount: data.visit_count,
    lifetimeValueCents: data.lifetime_value_cents,
    firstSeenAt: new Date(data.first_seen_at),
    lastSeenAt: data.last_seen_at ? new Date(data.last_seen_at) : null,
  };
}

export type PastVisit = {
  id: string;
  performedAt: Date;
  serviceName: string;
  totalCents: number;
  stylistNotes: string | null;
};

export async function pastVisitsForClient(
  clientId: string,
  excludeBookingId?: string,
): Promise<PastVisit[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, scheduled_at, total_cents, booking_services(services(name)), service_records(stylist_notes)",
    )
    .eq("client_id", clientId)
    .eq("status", "completed")
    .order("scheduled_at", { ascending: false })
    .limit(5);
  if (error || !data) return [];

  type Row = {
    id: string;
    scheduled_at: string;
    total_cents: number;
    booking_services: { services: { name: string } | null }[];
    service_records: { stylist_notes: string | null }[];
  };
  return (data as unknown as Row[])
    .filter((r) => r.id !== excludeBookingId)
    .map((r) => {
      const svcs = r.booking_services
        .map((bs) => bs.services?.name)
        .filter(Boolean) as string[];
      const notes = r.service_records?.[0]?.stylist_notes ?? null;
      return {
        id: r.id,
        performedAt: new Date(r.scheduled_at),
        serviceName: svcs.join(" + ") || "—",
        totalCents: r.total_cents,
        stylistNotes: notes,
      };
    })
    .slice(0, 3);
}

export async function existingStylistNotes(
  bookingId: string,
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("service_records")
    .select("stylist_notes")
    .eq("booking_id", bookingId)
    .maybeSingle();
  return data?.stylist_notes ?? null;
}
