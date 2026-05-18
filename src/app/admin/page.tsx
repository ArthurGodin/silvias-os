import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Sparkline } from "@/components/admin/sparkline";
import { BarChart } from "@/components/admin/bar-chart";
import { Button } from "@/components/ui/button";
import { dashboardSnapshot } from "@/lib/admin/queries";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const snap = await dashboardSnapshot();
  const today6 = snap.todayList.slice(0, 6);
  const totalRevenue7d = snap.revenue7d.reduce((a, b) => a + b, 0);

  return (
    <main className="px-6 lg:px-12 py-10 lg:py-14">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12">
        <div>
          <p className="text-eyebrow">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3.5rem)]">
            Bom dia, <span className="text-display-script text-gold-gradient">Silvia.</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/financeiro" variant="ghost" size="sm">
            <TrendingUp className="h-3.5 w-3.5" />
            Financeiro
          </Button>
          <Button href="/admin/agendamentos" variant="ink" size="sm">
            Agenda completa
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <section
        aria-label="Indicadores"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="Agendamentos · hoje"
          value={snap.todayCount}
          caption={
            snap.todayCount === 0
              ? "Nada agendado para hoje"
              : `Receita projetada · ${formatBRL(snap.todayRevenueCents / 100)}`
          }
        />
        <StatCard
          label="Ativos"
          value={snap.activeCount}
          caption="Confirmados e em atendimento"
        />
        <StatCard
          label="Sinal pendente"
          value={snap.pendingPaymentCount}
          caption="Pix aguardando confirmação"
        />
        <StatCard
          label="Clientes inativas"
          value={snap.inactiveClientCount}
          caption="Sem visita há 60+ dias"
        />
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50 lg:col-span-2">
          <header className="flex items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-eyebrow">Receita · últimos 7 dias</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-none tabular-nums">
                {formatBRL(totalRevenue7d / 100)}
              </p>
              <p className="mt-2 text-[12px] text-ink-500">
                Soma das reservas confirmadas e em atendimento
              </p>
            </div>
            {totalRevenue7d > 0 && (
              <Sparkline data={snap.revenue7d} width={140} height={48} tone="gold" />
            )}
          </header>

          <p className="text-eyebrow mb-4">Agendamentos por dia da semana · últimos 30 dias</p>
          {snap.occupancyByWeekday.every((d) => d.value === 0) ? (
            <p className="py-8 text-[14px] text-ink-500 text-center border border-dashed border-[var(--color-rule)]">
              Sem dados suficientes ainda. Os primeiros agendamentos vão alimentar essa visualização.
            </p>
          ) : (
            <BarChart data={snap.occupancyByWeekday} />
          )}
        </article>

        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50">
          <p className="text-eyebrow">Top serviços · 30 dias</p>
          <p className="mt-2 text-[12px] text-ink-500 mb-6">
            Volume de atendimentos por serviço
          </p>
          {snap.topServices.length === 0 ? (
            <p className="py-8 text-[14px] text-ink-500 text-center border border-dashed border-[var(--color-rule)]">
              Sem atendimentos ainda
            </p>
          ) : (
            <BarChart
              data={snap.topServices}
              highlight={snap.topServices[0]?.label}
            />
          )}
        </article>

        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50 lg:col-span-3">
          <p className="text-eyebrow">Comparativo · receita por casa (30 dias)</p>
          <div className="mt-6">
            {snap.unitsRevenue.length === 0 ? (
              <p className="py-8 text-[14px] text-ink-500 text-center border border-dashed border-[var(--color-rule)]">
                Sem reservas registradas ainda
              </p>
            ) : (
              <BarChart
                data={snap.unitsRevenue}
                format={(n) => formatBRL(n / 100)}
              />
            )}
          </div>
        </article>
      </section>

      <section aria-labelledby="today-title" className="mt-16">
        <header className="flex items-end justify-between mb-6">
          <div>
            <p className="text-eyebrow">I · Agenda de hoje</p>
            <h2 id="today-title" className="mt-2 text-[1.75rem] lg:text-[2.25rem]">
              Próximos atendimentos
            </h2>
          </div>
          <Link
            href="/admin/agendamentos"
            className="editorial-link text-[13px] uppercase tracking-[0.18em]"
          >
            Ver todos
          </Link>
        </header>

        <div className="border border-[var(--color-rule)] bg-paper-50 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="hidden lg:table-header-group">
              <tr className="border-b border-[var(--color-rule)]">
                <th className="px-6 py-4 text-left text-eyebrow">Horário</th>
                <th className="px-6 py-4 text-left text-eyebrow">Cliente</th>
                <th className="px-6 py-4 text-left text-eyebrow">Serviço</th>
                <th className="px-6 py-4 text-left text-eyebrow">Profissional</th>
                <th className="px-6 py-4 text-left text-eyebrow">Casa</th>
                <th className="px-6 py-4 text-left text-eyebrow">Status</th>
              </tr>
            </thead>
            <tbody>
              {today6.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-ink-500">
                    Nada agendado para hoje.
                  </td>
                </tr>
              )}
              {today6.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-[var(--color-rule)] last:border-b-0 hover:bg-paper-100 transition-colors"
                >
                  <td className="px-6 py-5 tabular-nums">
                    {format(b.scheduledAt, "HH:mm")}
                  </td>
                  <td className="px-6 py-5">
                    <Link
                      href={`/admin/clientes/${b.clientId}` as never}
                      className="font-[family-name:var(--font-display)] italic text-[1.1rem]"
                    >
                      {b.clientName}
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-[14px]">{b.serviceName}</td>
                  <td className="px-6 py-5 text-[14px] text-ink-500">
                    {b.staffName}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-ink-500">
                    {b.unitName}
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {snap.inactiveClientCount > 0 && (
        <section aria-labelledby="reactivation-title" className="mt-16">
          <header className="flex items-end justify-between mb-6">
            <div>
              <p className="text-eyebrow">II · Oportunidades</p>
              <h2
                id="reactivation-title"
                className="mt-2 text-[1.75rem] lg:text-[2.25rem]"
              >
                Reativação automática
              </h2>
            </div>
          </header>

          <div className="border border-[var(--color-rule)] p-6 lg:p-10 bg-paper-50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-mist text-ink-800">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="font-[family-name:var(--font-display)] text-[1.5rem] leading-tight">
                  {snap.inactiveClientCount} clientes podem voltar
                </p>
                <p className="mt-2 text-[14px] text-ink-500 max-w-[52ch]">
                  Sem visita há 60+ dias. Alvo natural para uma régua de
                  reativação.
                </p>
              </div>
            </div>
            <Button
              href="/admin/clientes?filter=inactive"
              variant="ink"
              size="md"
            >
              Ver lista
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}
