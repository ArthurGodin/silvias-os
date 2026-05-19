import { createAdminClient } from "@/lib/supabase/admin";

export type Granularity = "7d" | "30d" | "90d" | "ytd";

type Range = { start: Date; end: Date; days: number; label: string };

export function rangeFor(g: Granularity): Range {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  let days = 7;
  let label = "Últimos 7 dias";
  if (g === "7d") {
    start.setDate(start.getDate() - 6);
    days = 7;
    label = "Últimos 7 dias";
  } else if (g === "30d") {
    start.setDate(start.getDate() - 29);
    days = 30;
    label = "Últimos 30 dias";
  } else if (g === "90d") {
    start.setDate(start.getDate() - 89);
    days = 90;
    label = "Últimos 90 dias";
  } else if (g === "ytd") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    days =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
      1;
    label = `YTD · ${end.getFullYear()}`;
  }
  return { start, end, days, label };
}

export type AnalyticsSnapshot = {
  granularity: Granularity;
  rangeLabel: string;
  // KPIs
  revenueCents: number;
  revenuePrevPeriodCents: number; // mesmo intervalo anterior
  bookingsCount: number;
  bookingsCountPrev: number;
  uniqueClients: number;
  avgTicketCents: number;
  cancelRate: number; // 0..1
  noShowRate: number; // 0..1
  occupancyRate: number; // 0..1 sobre horas-staff disponíveis
  newClients: number;
  returningClients: number;
  // Séries
  dailyRevenue: { date: string; cents: number }[];
  weekdayRevenue: { label: string; value: number }[];
  hourlyHeatmap: { hour: number; count: number }[]; // 0..23
  topServices: { label: string; bookings: number; revenue: number }[];
  unitsCompare: { label: string; bookings: number; revenue: number }[];
  statusBreakdown: { label: string; value: number }[];
  topClients: {
    clientId: string;
    name: string;
    visits: number;
    ltvCents: number;
  }[];
  inactiveClients: { id: string; name: string; lastSeen: Date | null }[];
};

type RawBooking = {
  id: string;
  scheduled_at: string;
  total_cents: number;
  status: string;
  client_id: string;
  unit_id: string;
  units: { name: string } | null;
  booking_services: { services: { name: string } | null }[];
};

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Aguardando Pix",
  confirmed: "Confirmado",
  checked_in: "Em atendimento",
  completed: "Concluído",
  cancelled_client: "Cancelado · cliente",
  cancelled_house: "Cancelado · casa",
  no_show: "Não compareceu",
};

export async function analyticsSnapshot(
  granularity: Granularity = "30d",
): Promise<AnalyticsSnapshot> {
  const r = rangeFor(granularity);
  const supabase = createAdminClient();

  // 1) Período atual
  const { data: currRaw } = await supabase
    .from("bookings")
    .select(
      "id, scheduled_at, total_cents, status, client_id, unit_id, units(name), booking_services(services(name))",
    )
    .gte("scheduled_at", r.start.toISOString())
    .lt("scheduled_at", r.end.toISOString());

  // 2) Período anterior (pra cálculo de variação)
  const prevStart = new Date(r.start);
  prevStart.setDate(prevStart.getDate() - r.days);
  const prevEnd = new Date(r.start);
  const { data: prevRaw } = await supabase
    .from("bookings")
    .select("total_cents, status")
    .gte("scheduled_at", prevStart.toISOString())
    .lt("scheduled_at", prevEnd.toISOString());

  const curr = (currRaw as unknown as RawBooking[] | null) ?? [];
  const prev =
    (prevRaw as { total_cents: number; status: string }[] | null) ?? [];

  // KPIs
  const isRealized = (s: string) =>
    s === "confirmed" || s === "checked_in" || s === "completed";
  const completedOrFuture = (s: string) =>
    isRealized(s) || s === "pending_payment";

  let revenueCents = 0;
  let bookingsCount = 0;
  let cancelledCount = 0;
  let noShowCount = 0;
  const dailyMap = new Map<string, number>();
  const weekdayMap = new Map<number, number>();
  const hourlyMap = new Map<number, number>();
  const svcStats = new Map<string, { bookings: number; revenue: number }>();
  const unitStats = new Map<string, { bookings: number; revenue: number }>();
  const statusMap = new Map<string, number>();
  const clientSet = new Set<string>();

  // Buckets diários (chave: yyyy-mm-dd)
  for (let i = 0; i < r.days; i++) {
    const d = new Date(r.start);
    d.setDate(d.getDate() + i);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }

  for (const b of curr) {
    const dt = new Date(b.scheduled_at);
    bookingsCount += 1;
    statusMap.set(b.status, (statusMap.get(b.status) ?? 0) + 1);
    clientSet.add(b.client_id);

    if (completedOrFuture(b.status)) {
      revenueCents += b.total_cents;
      const day = dt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + b.total_cents);
      const wd = dt.getDay();
      weekdayMap.set(wd, (weekdayMap.get(wd) ?? 0) + b.total_cents);
      const hr = dt.getHours();
      hourlyMap.set(hr, (hourlyMap.get(hr) ?? 0) + 1);

      const unitName = b.units?.name ?? "—";
      const u = unitStats.get(unitName) ?? { bookings: 0, revenue: 0 };
      u.bookings += 1;
      u.revenue += b.total_cents;
      unitStats.set(unitName, u);

      const svcs = b.booking_services
        .map((bs) => bs.services?.name)
        .filter(Boolean) as string[];
      if (svcs.length > 0) {
        const perSvc = Math.round(b.total_cents / svcs.length);
        for (const name of svcs) {
          const s = svcStats.get(name) ?? { bookings: 0, revenue: 0 };
          s.bookings += 1;
          s.revenue += perSvc;
          svcStats.set(name, s);
        }
      }
    }
    if (b.status === "cancelled_client" || b.status === "cancelled_house")
      cancelledCount += 1;
    if (b.status === "no_show") noShowCount += 1;
  }

  const revenuePrevPeriodCents = prev
    .filter((b) => completedOrFuture(b.status))
    .reduce((s, b) => s + b.total_cents, 0);
  const bookingsCountPrev = prev.length;

  const avgTicketCents =
    bookingsCount > 0 ? Math.round(revenueCents / bookingsCount) : 0;
  const cancelRate = bookingsCount > 0 ? cancelledCount / bookingsCount : 0;
  const noShowRate = bookingsCount > 0 ? noShowCount / bookingsCount : 0;

  // Daily series ordenado
  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, cents]) => ({ date, cents }));

  // Weekday em ordem Dom..Sáb
  const weekdayRevenue = WEEKDAY_LABELS.map((label, i) => ({
    label,
    value: weekdayMap.get(i) ?? 0,
  }));

  // Hourly heatmap: 9..21 (horário de funcionamento típico do salão)
  const hourlyHeatmap: { hour: number; count: number }[] = [];
  for (let h = 9; h <= 21; h++) {
    hourlyHeatmap.push({ hour: h, count: hourlyMap.get(h) ?? 0 });
  }

  const topServices = Array.from(svcStats.entries())
    .map(([label, { bookings, revenue }]) => ({ label, bookings, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const unitsCompare = Array.from(unitStats.entries()).map(
    ([label, { bookings, revenue }]) => ({ label, bookings, revenue }),
  );

  const statusBreakdown = Array.from(statusMap.entries())
    .map(([key, value]) => ({ label: STATUS_LABELS[key] ?? key, value }))
    .sort((a, b) => b.value - a.value);

  // Top spenders (LTV all-time, não restrito ao range)
  const { data: clientsRaw } = await supabase
    .from("clients")
    .select("id, name, visit_count, lifetime_value_cents")
    .is("deleted_at", null)
    .gt("lifetime_value_cents", 0)
    .order("lifetime_value_cents", { ascending: false })
    .limit(8);

  const topClients = (
    (clientsRaw as {
      id: string;
      name: string;
      visit_count: number;
      lifetime_value_cents: number;
    }[] | null) ?? []
  ).map((c) => ({
    clientId: c.id,
    name: c.name,
    visits: c.visit_count,
    ltvCents: c.lifetime_value_cents,
  }));

  // Clientes inativas (60+ dias sem visita)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const { data: inactRaw } = await supabase
    .from("clients")
    .select("id, name, last_seen_at")
    .is("deleted_at", null)
    .lt("last_seen_at", sixtyDaysAgo.toISOString())
    .order("last_seen_at", { ascending: true })
    .limit(10);

  const inactiveClients = (
    (inactRaw as {
      id: string;
      name: string;
      last_seen_at: string | null;
    }[] | null) ?? []
  ).map((c) => ({
    id: c.id,
    name: c.name,
    lastSeen: c.last_seen_at ? new Date(c.last_seen_at) : null,
  }));

  // New vs returning clients no período
  // Cliente "novo" = primeira visita está dentro do range
  const { data: clientsRangeRaw } = await supabase
    .from("clients")
    .select("id, first_seen_at")
    .in("id", Array.from(clientSet));

  type ClientFs = { id: string; first_seen_at: string };
  const clientsRange =
    (clientsRangeRaw as ClientFs[] | null) ?? [];

  let newClients = 0;
  for (const c of clientsRange) {
    const fs = new Date(c.first_seen_at);
    if (fs >= r.start && fs <= r.end) newClients += 1;
  }
  const returningClients = clientSet.size - newClients;

  // Occupancy: simplificação V1 — bookings/dia / (capacidade_diária_estimada)
  // Capacidade = (staff ativos × 8 atendimentos/dia) — heurística para MVP
  const { count: activeStaffCount } = await supabase
    .from("staff")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .is("deleted_at", null);
  const dailyCapacity = (activeStaffCount ?? 1) * 8;
  const totalCapacity = dailyCapacity * r.days;
  const occupancyRate =
    totalCapacity > 0
      ? Math.min(1, curr.filter((b) => completedOrFuture(b.status)).length / totalCapacity)
      : 0;

  return {
    granularity,
    rangeLabel: r.label,
    revenueCents,
    revenuePrevPeriodCents,
    bookingsCount,
    bookingsCountPrev,
    uniqueClients: clientSet.size,
    avgTicketCents,
    cancelRate,
    noShowRate,
    occupancyRate,
    newClients,
    returningClients,
    dailyRevenue,
    weekdayRevenue,
    hourlyHeatmap,
    topServices,
    unitsCompare,
    statusBreakdown,
    topClients,
    inactiveClients,
  };
}
