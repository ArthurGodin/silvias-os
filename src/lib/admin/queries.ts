import { createAdminClient } from "@/lib/supabase/admin";

export type AdminBookingRow = {
  id: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  totalCents: number;
  depositCents: number;
  comboSlug: string | null;
  clientId: string;
  clientName: string;
  clientPhone: string;
  staffName: string;
  unitName: string;
  serviceName: string;
};

export type AdminClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  firstSeenAt: Date;
  lastSeenAt: Date | null;
  visitCount: number;
  lifetimeValueCents: number;
  notes: string | null;
  hairType: string | null;
  isInactive: boolean;
};

type RawBooking = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  total_cents: number;
  deposit_cents: number;
  combo_slug: string | null;
  client_id: string;
  clients: { id: string; name: string; phone: string } | null;
  staff: { name: string } | null;
  units: { name: string } | null;
  booking_services: { services: { name: string } | null }[];
};

type RawClient = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  first_seen_at: string;
  last_seen_at: string | null;
  visit_count: number;
  lifetime_value_cents: number;
  notes: string | null;
  hair_type: string | null;
};

function mapBooking(r: RawBooking): AdminBookingRow {
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
    comboSlug: r.combo_slug,
    clientId: r.client_id,
    clientName: r.clients?.name ?? "—",
    clientPhone: r.clients?.phone ?? "",
    staffName: r.staff?.name ?? "A casa escolhe",
    unitName: r.units?.name ?? "",
    serviceName: services.join(" + ") || "—",
  };
}

const BOOKING_SELECT = `
  id,
  scheduled_at,
  duration_minutes,
  status,
  total_cents,
  deposit_cents,
  combo_slug,
  client_id,
  clients ( id, name, phone ),
  staff ( name ),
  units ( name ),
  booking_services ( services ( name ) )
`;

export async function listBookings(opts?: {
  fromIso?: string;
  toIso?: string;
  limit?: number;
}): Promise<AdminBookingRow[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("scheduled_at", { ascending: true })
    .limit(opts?.limit ?? 200);

  if (opts?.fromIso) query = query.gte("scheduled_at", opts.fromIso);
  if (opts?.toIso) query = query.lte("scheduled_at", opts.toIso);

  const { data, error } = await query;
  if (error) {
    console.error("[admin] listBookings error:", error);
    return [];
  }
  return (data as unknown as RawBooking[]).map(mapBooking);
}

export async function bookingsForClientId(
  clientId: string,
): Promise<AdminBookingRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("client_id", clientId)
    .order("scheduled_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[admin] bookingsForClientId error:", error);
    return [];
  }
  return (data as unknown as RawBooking[]).map(mapBooking);
}

export async function listClients(opts?: {
  limit?: number;
}): Promise<AdminClientRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, name, email, phone, first_seen_at, last_seen_at, visit_count, lifetime_value_cents, notes, hair_type",
    )
    .is("deleted_at", null)
    .order("last_seen_at", { ascending: false, nullsFirst: false })
    .limit(opts?.limit ?? 200);

  if (error) {
    console.error("[admin] listClients error:", error);
    return [];
  }

  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
  return (data as RawClient[]).map((c) => {
    const last = c.last_seen_at ? new Date(c.last_seen_at) : null;
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      firstSeenAt: new Date(c.first_seen_at),
      lastSeenAt: last,
      visitCount: c.visit_count,
      lifetimeValueCents: c.lifetime_value_cents,
      notes: c.notes,
      hairType: c.hair_type,
      isInactive: !last || last.getTime() < sixtyDaysAgo,
    };
  });
}

export type DashboardSnapshot = {
  todayCount: number;
  todayRevenueCents: number;
  activeCount: number;
  pendingPaymentCount: number;
  inactiveClientCount: number;
  revenue7d: number[];
  occupancyByWeekday: { label: string; value: number }[];
  topServices: { label: string; value: number }[];
  unitsRevenue: { label: string; value: number }[];
  todayList: AdminBookingRow[];
};

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export async function dashboardSnapshot(): Promise<DashboardSnapshot> {
  const supabase = createAdminClient();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const { data: todayBookingsRaw } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .gte("scheduled_at", startOfToday.toISOString())
    .lt("scheduled_at", endOfToday.toISOString())
    .order("scheduled_at", { ascending: true });

  const todayList = (todayBookingsRaw as unknown as RawBooking[] | null)?.map(
    mapBooking,
  ) ?? [];

  const todayCount = todayList.length;
  const todayRevenueCents = todayList.reduce((s, b) => s + b.totalCents, 0);

  const { data: recentBookings } = await supabase
    .from("bookings")
    .select("scheduled_at, total_cents, status, unit_id, units(name)")
    .gte("scheduled_at", thirtyDaysAgo.toISOString())
    .lt("scheduled_at", endOfToday.toISOString());

  type RecentRow = {
    scheduled_at: string;
    total_cents: number;
    status: string;
    unit_id: string;
    units: { name: string } | null;
  };
  const recent = (recentBookings as unknown as RecentRow[] | null) ?? [];

  const dayBuckets: number[] = Array.from({ length: 7 }, () => 0);
  const weekdayCounts: number[] = Array.from({ length: 7 }, () => 0);
  const unitTotals = new Map<string, number>();

  for (const b of recent) {
    const dt = new Date(b.scheduled_at);
    if (dt >= sevenDaysAgo) {
      const dayDiff = Math.floor(
        (dt.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (dayDiff >= 0 && dayDiff < 7) {
        dayBuckets[dayDiff] = (dayBuckets[dayDiff] ?? 0) + b.total_cents;
      }
    }
    const wd = dt.getDay();
    weekdayCounts[wd] = (weekdayCounts[wd] ?? 0) + 1;
    const unitName = b.units?.name ?? "—";
    unitTotals.set(unitName, (unitTotals.get(unitName) ?? 0) + b.total_cents);
  }

  const occupancyByWeekday = WEEKDAY_LABELS.map((label, i) => ({
    label,
    value: weekdayCounts[i] ?? 0,
  }));

  const unitsRevenue = Array.from(unitTotals.entries()).map(([label, value]) => ({
    label,
    value,
  }));

  const { data: serviceCountsRaw } = await supabase
    .from("booking_services")
    .select("service_id, services(name), bookings!inner(scheduled_at)")
    .gte("bookings.scheduled_at", thirtyDaysAgo.toISOString());

  type SvcRow = {
    services: { name: string } | null;
  };
  const svcs = (serviceCountsRaw as unknown as SvcRow[] | null) ?? [];
  const svcMap = new Map<string, number>();
  for (const s of svcs) {
    const n = s.services?.name ?? "—";
    svcMap.set(n, (svcMap.get(n) ?? 0) + 1);
  }
  const topServices = Array.from(svcMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const { count: activeCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .in("status", ["confirmed", "checked_in"]);

  const { count: pendingPaymentCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_payment");

  const { count: inactiveClientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null)
    .lt("last_seen_at", sixtyDaysAgo.toISOString());

  return {
    todayCount,
    todayRevenueCents,
    activeCount: activeCount ?? 0,
    pendingPaymentCount: pendingPaymentCount ?? 0,
    inactiveClientCount: inactiveClientCount ?? 0,
    revenue7d: dayBuckets,
    occupancyByWeekday,
    topServices,
    unitsRevenue,
    todayList,
  };
}

export type FinancialSnapshot = {
  revenue30dCents: number;
  ticketAverageCents: number;
  totalBookings30d: number;
  pendingDepositCents: number;
  pendingPaymentCount: number;
  ltvAverageCents: number;
  revenue30dDaily: number[];
  revenueByService: { label: string; value: number }[];
  channelMix: { label: string; value: number }[];
  pendingPayments: {
    bookingId: string;
    clientId: string;
    clientName: string;
    serviceName: string;
    scheduledAt: Date;
    totalCents: number;
    depositCents: number;
    status: string;
  }[];
  topSpenders: {
    id: string;
    name: string;
    visitCount: number;
    firstSeenAt: Date;
    lifetimeValueCents: number;
  }[];
};

export async function financialSnapshot(): Promise<FinancialSnapshot> {
  const supabase = createAdminClient();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1) Bookings dos últimos 30 dias
  const { data: bookingsRaw } = await supabase
    .from("bookings")
    .select(
      "id, scheduled_at, total_cents, deposit_cents, status, client_id, " +
        "clients(name), booking_services(services(name))",
    )
    .gte("scheduled_at", thirtyDaysAgo.toISOString())
    .lt("scheduled_at", endOfToday.toISOString());

  type BookingRow = {
    id: string;
    scheduled_at: string;
    total_cents: number;
    deposit_cents: number;
    status: string;
    client_id: string;
    clients: { name: string } | null;
    booking_services: { services: { name: string } | null }[];
  };

  const bookings = (bookingsRaw as unknown as BookingRow[] | null) ?? [];

  let revenue30dCents = 0;
  const dailyBuckets: number[] = Array.from({ length: 30 }, () => 0);
  const svcRevenue = new Map<string, number>();
  let pendingDepositCents = 0;
  let pendingPaymentCount = 0;
  const pendingPayments: FinancialSnapshot["pendingPayments"] = [];

  for (const b of bookings) {
    const dt = new Date(b.scheduled_at);
    revenue30dCents += b.total_cents;
    const dayDiff = Math.floor(
      (dt.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (dayDiff >= 0 && dayDiff < 30) {
      dailyBuckets[dayDiff] = (dailyBuckets[dayDiff] ?? 0) + b.total_cents;
    }
    // Receita por serviço: distribui proporcional entre os serviços do booking.
    const svcs = b.booking_services
      .map((bs) => bs.services?.name)
      .filter(Boolean) as string[];
    if (svcs.length > 0) {
      const perSvc = Math.round(b.total_cents / svcs.length);
      for (const name of svcs) {
        svcRevenue.set(name, (svcRevenue.get(name) ?? 0) + perSvc);
      }
    }

    if (b.status === "pending_payment") {
      pendingPaymentCount += 1;
      pendingDepositCents += b.deposit_cents;
      pendingPayments.push({
        bookingId: b.id,
        clientId: b.client_id,
        clientName: b.clients?.name ?? "—",
        serviceName: svcs.join(" + ") || "—",
        scheduledAt: dt,
        totalCents: b.total_cents,
        depositCents: b.deposit_cents,
        status: b.status,
      });
    }
  }

  const ticketAverageCents =
    bookings.length > 0 ? Math.round(revenue30dCents / bookings.length) : 0;

  const revenueByService = Array.from(svcRevenue.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // 2) Top spenders (LTV calculado nos clientes via trigger no PATCH de status)
  const { data: clientsRaw } = await supabase
    .from("clients")
    .select(
      "id, name, visit_count, first_seen_at, lifetime_value_cents",
    )
    .is("deleted_at", null)
    .gt("lifetime_value_cents", 0)
    .order("lifetime_value_cents", { ascending: false })
    .limit(5);

  type ClientRow = {
    id: string;
    name: string;
    visit_count: number;
    first_seen_at: string;
    lifetime_value_cents: number;
  };
  const topSpenders = ((clientsRaw as unknown as ClientRow[] | null) ?? []).map(
    (c) => ({
      id: c.id,
      name: c.name,
      visitCount: c.visit_count,
      firstSeenAt: new Date(c.first_seen_at),
      lifetimeValueCents: c.lifetime_value_cents,
    }),
  );

  // 3) LTV médio (todos os clientes com pelo menos 1 visita completada)
  const { data: ltvRaw } = await supabase
    .from("clients")
    .select("lifetime_value_cents")
    .is("deleted_at", null)
    .gt("visit_count", 0);

  type LtvRow = { lifetime_value_cents: number };
  const ltvRows = (ltvRaw as unknown as LtvRow[] | null) ?? [];
  const ltvAverageCents =
    ltvRows.length > 0
      ? Math.round(
          ltvRows.reduce((s, r) => s + r.lifetime_value_cents, 0) /
            ltvRows.length,
        )
      : 0;

  // 4) Channel mix — V1 não distingue canais, todas as reservas via web.
  // Quando integrar WhatsApp Cloud API + walk-in manual, isso fica real.
  const channelMix = [{ label: "Agendamento online", value: 100 }];

  return {
    revenue30dCents,
    ticketAverageCents,
    totalBookings30d: bookings.length,
    pendingDepositCents,
    pendingPaymentCount,
    ltvAverageCents,
    revenue30dDaily: dailyBuckets,
    revenueByService,
    channelMix,
    pendingPayments,
    topSpenders,
  };
}

export async function getClient(id: string): Promise<AdminClientRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, name, email, phone, first_seen_at, last_seen_at, visit_count, lifetime_value_cents, notes, hair_type",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const c = data as RawClient;
  const last = c.last_seen_at ? new Date(c.last_seen_at) : null;
  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    firstSeenAt: new Date(c.first_seen_at),
    lastSeenAt: last,
    visitCount: c.visit_count,
    lifetimeValueCents: c.lifetime_value_cents,
    notes: c.notes,
    hairType: c.hair_type,
    isInactive: !last || last.getTime() < sixtyDaysAgo,
  };
}
