import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Sparkles,
  Users,
  Clock,
  Calendar,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BarChart } from "@/components/admin/bar-chart";
import { LineChart } from "@/components/admin/line-chart";
import { HourlyHeatmap } from "@/components/admin/hourly-heatmap";
import {
  analyticsSnapshot,
  type Granularity,
} from "@/lib/admin/analytics";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RANGES: { value: Granularity; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "ytd", label: "Ano" },
];

function variation(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 1 : 0;
  return (curr - prev) / prev;
}

function VariationBadge({ delta }: { delta: number }) {
  const pct = (delta * 100).toFixed(0);
  if (Math.abs(delta) < 0.005) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-500">
        <Minus className="h-3 w-3" />
        estável
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11.5px] ${
        up ? "text-gold-deep" : "text-red-700"
      }`}
    >
      {up ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {up ? "+" : ""}
      {pct}% vs período anterior
    </span>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = (sp.range as Granularity) ?? "30d";
  const snap = await analyticsSnapshot(
    ["7d", "30d", "90d", "ytd"].includes(range) ? range : "30d",
  );

  const revenueVar = variation(snap.revenueCents, snap.revenuePrevPeriodCents);
  const bookingsVar = variation(snap.bookingsCount, snap.bookingsCountPrev);

  const linePoints = snap.dailyRevenue.map((d) => ({
    x: format(new Date(d.date + "T12:00:00"), "dd/MM"),
    y: d.cents / 100,
  }));

  return (
    <main className="px-6 lg:px-12 py-10 lg:py-14">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
        <div>
          <p className="text-eyebrow">Inteligência operacional</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3.5rem)]">
            <span className="text-display-script text-gold-gradient">
              Analytics
            </span>
          </h1>
          <p className="mt-3 text-[15px] text-ink-500">
            {snap.rangeLabel} ·{" "}
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>

        <nav
          aria-label="Período"
          className="flex items-center gap-1 border border-[var(--color-rule)] bg-paper-50 self-start"
        >
          {RANGES.map((r) => {
            const active = r.value === snap.granularity;
            return (
              <Link
                key={r.value}
                href={`/admin/analytics?range=${r.value}` as never}
                className={`text-[12px] uppercase tracking-[0.18em] px-4 h-10 inline-flex items-center transition-colors ${
                  active
                    ? "bg-ink-700 text-paper-100"
                    : "text-ink-500 hover:text-ink-700"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* KPIs */}
      <section
        aria-label="KPIs"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
      >
        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <p className="text-eyebrow">Receita</p>
          <p
            className="mt-3 font-[family-name:var(--font-display)] tabular-nums leading-none"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            {formatBRL(snap.revenueCents / 100)}
          </p>
          <div className="mt-3">
            <VariationBadge delta={revenueVar} />
          </div>
        </article>

        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <p className="text-eyebrow">Agendamentos</p>
          <p
            className="mt-3 font-[family-name:var(--font-display)] tabular-nums leading-none"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            {snap.bookingsCount}
          </p>
          <div className="mt-3">
            <VariationBadge delta={bookingsVar} />
          </div>
        </article>

        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <p className="text-eyebrow">Ticket médio</p>
          <p
            className="mt-3 font-[family-name:var(--font-display)] tabular-nums leading-none"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            {formatBRL(snap.avgTicketCents / 100)}
          </p>
          <p className="mt-3 text-[12.5px] text-ink-500 leading-snug">
            Por atendimento no período
          </p>
        </article>

        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <p className="text-eyebrow">Ocupação</p>
          <p
            className="mt-3 font-[family-name:var(--font-display)] tabular-nums leading-none"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            {(snap.occupancyRate * 100).toFixed(0)}%
          </p>
          <p className="mt-3 text-[12.5px] text-ink-500 leading-snug">
            Sobre capacidade estimada da equipe
          </p>
        </article>
      </section>

      {/* Linha temporal de receita */}
      <section className="border border-[var(--color-rule)] bg-paper-50 p-6 lg:p-8 mb-12">
        <header className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-eyebrow">Receita diária</p>
            <p className="mt-2 text-[14px] text-ink-500">
              Evolução ao longo do período selecionado
            </p>
          </div>
        </header>
        {snap.dailyRevenue.every((d) => d.cents === 0) ? (
          <p className="py-12 text-center text-[13px] text-ink-500 border border-dashed border-[var(--color-rule)]">
            Sem receita registrada no período.
          </p>
        ) : (
          <LineChart
            data={linePoints}
            height={220}
            format={(n) => `R$ ${n.toFixed(0)}`}
          />
        )}
      </section>

      {/* Grid 2x */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
        {/* Receita por dia da semana */}
        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50">
          <p className="text-eyebrow">Receita por dia da semana</p>
          <p className="mt-2 text-[12.5px] text-ink-500 mb-6">
            Identifique o dia mais lucrativo
          </p>
          {snap.weekdayRevenue.every((d) => d.value === 0) ? (
            <p className="py-8 text-center text-[13px] text-ink-500 border border-dashed border-[var(--color-rule)]">
              Sem dados
            </p>
          ) : (
            <BarChart
              data={snap.weekdayRevenue}
              format={(n) => formatBRL(n / 100)}
              highlight={
                snap.weekdayRevenue.reduce((max, d) =>
                  d.value > max.value ? d : max,
                ).label
              }
            />
          )}
        </article>

        {/* Heatmap horário */}
        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50">
          <p className="text-eyebrow">Horários de pico</p>
          <p className="mt-2 text-[12.5px] text-ink-500 mb-6">
            Atendimentos por hora do dia (9h–21h)
          </p>
          {snap.hourlyHeatmap.every((d) => d.count === 0) ? (
            <p className="py-8 text-center text-[13px] text-ink-500 border border-dashed border-[var(--color-rule)]">
              Sem dados
            </p>
          ) : (
            <HourlyHeatmap data={snap.hourlyHeatmap} />
          )}
        </article>

        {/* Top serviços por receita */}
        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50">
          <p className="text-eyebrow">Serviços que mais faturam</p>
          <p className="mt-2 text-[12.5px] text-ink-500 mb-6">
            Top 8 por receita no período
          </p>
          {snap.topServices.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-500 border border-dashed border-[var(--color-rule)]">
              Sem dados
            </p>
          ) : (
            <BarChart
              data={snap.topServices.map((s) => ({
                label: s.label,
                value: s.revenue,
              }))}
              format={(n) => formatBRL(n / 100)}
              highlight={snap.topServices[0]?.label}
            />
          )}
        </article>

        {/* Comparativo casas */}
        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50">
          <p className="text-eyebrow">Comparativo entre casas</p>
          <p className="mt-2 text-[12.5px] text-ink-500 mb-6">
            Receita realizada por unidade no período
          </p>
          {snap.unitsCompare.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-500 border border-dashed border-[var(--color-rule)]">
              Sem dados
            </p>
          ) : (
            <BarChart
              data={snap.unitsCompare.map((u) => ({
                label: u.label,
                value: u.revenue,
              }))}
              format={(n) => formatBRL(n / 100)}
            />
          )}
        </article>
      </section>

      {/* Clientes — perfil */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-4 w-4 text-gold-deep" />
            <p className="text-eyebrow">Clientes únicas</p>
          </div>
          <p
            className="mt-2 font-[family-name:var(--font-display)] tabular-nums leading-none"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            {snap.uniqueClients}
          </p>
          <p className="mt-3 text-[12.5px] text-ink-500 leading-snug">
            {snap.newClients} novas · {snap.returningClients} retorno
          </p>
        </article>

        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-4 w-4 text-gold-deep" />
            <p className="text-eyebrow">Taxa de cancelamento</p>
          </div>
          <p
            className="mt-2 font-[family-name:var(--font-display)] tabular-nums leading-none"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            {(snap.cancelRate * 100).toFixed(1)}%
          </p>
          <p className="mt-3 text-[12.5px] text-ink-500 leading-snug">
            Da total de reservas
          </p>
        </article>

        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-4 w-4 text-gold-deep" />
            <p className="text-eyebrow">Não compareceu</p>
          </div>
          <p
            className="mt-2 font-[family-name:var(--font-display)] tabular-nums leading-none"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            {(snap.noShowRate * 100).toFixed(1)}%
          </p>
          <p className="mt-3 text-[12.5px] text-ink-500 leading-snug">
            Pode justificar exigir sinal Pix
          </p>
        </article>
      </section>

      {/* Status breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50 lg:col-span-2">
          <p className="text-eyebrow">Distribuição de status</p>
          <p className="mt-2 text-[12.5px] text-ink-500 mb-6">
            Como suas reservas terminaram no período
          </p>
          {snap.statusBreakdown.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-500 border border-dashed border-[var(--color-rule)]">
              Sem dados
            </p>
          ) : (
            <BarChart
              data={snap.statusBreakdown}
              format={(n) => String(n)}
              highlight={snap.statusBreakdown[0]?.label}
            />
          )}
        </article>

        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50">
          <p className="text-eyebrow">Reativação</p>
          <p className="mt-2 text-[12.5px] text-ink-500 mb-6">
            Clientes sem visita há 60+ dias
          </p>
          {snap.inactiveClients.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-500 border border-dashed border-[var(--color-rule)]">
              Nenhuma inativa
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-rule)]">
              {snap.inactiveClients.slice(0, 5).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 py-3 text-[13.5px]"
                >
                  <Avatar name={c.name} size="sm" className="flex-none" />
                  <Link
                    href={`/admin/clientes/${c.id}` as never}
                    className="flex-1 truncate editorial-link"
                  >
                    {c.name}
                  </Link>
                  <span className="text-[11.5px] text-ink-500 tabular-nums flex-none">
                    {c.lastSeen
                      ? format(c.lastSeen, "dd/MM")
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {snap.inactiveClients.length > 5 && (
            <Link
              href="/admin/clientes?filter=inactive"
              className="mt-4 inline-block text-[11px] uppercase tracking-[0.2em] editorial-link"
            >
              Ver todas →
            </Link>
          )}
        </article>
      </section>

      {/* Top clientes */}
      <section aria-labelledby="top-clients">
        <header className="mb-6">
          <p className="text-eyebrow">Maiores ativos</p>
          <h2
            id="top-clients"
            className="mt-2 text-[1.75rem] lg:text-[2rem]"
          >
            Clientes que mais investiram
          </h2>
          <p className="mt-2 text-[13px] text-ink-500">
            All-time · valores acumulados desde o cadastro
          </p>
        </header>

        {snap.topClients.length === 0 ? (
          <div className="border border-dashed border-[var(--color-rule)] bg-paper-50 p-10 text-center">
            <p className="text-[14px] text-ink-500">
              Marque atendimentos como{" "}
              <strong>Concluído</strong> em Agendamentos para o ranking
              aparecer aqui.
            </p>
          </div>
        ) : (
          <div className="border border-[var(--color-rule)] bg-paper-50 divide-y divide-[var(--color-rule)]">
            {snap.topClients.map((c, i) => (
              <Link
                key={c.clientId}
                href={`/admin/clientes/${c.clientId}` as never}
                className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-paper-100 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold-mist text-ink-800 text-[12px] font-medium tabular-nums flex-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Avatar name={c.name} size="sm" className="flex-none" />
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-display)] italic text-[1.2rem] leading-tight truncate">
                      {c.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-500">
                      {c.visits} visita{c.visits === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <span
                  className="font-[family-name:var(--font-display)] tabular-nums leading-none text-gold-gradient flex-none"
                  style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)" }}
                >
                  {formatBRL(c.ltvCents / 100)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
