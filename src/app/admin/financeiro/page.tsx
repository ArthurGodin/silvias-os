import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BarChart } from "@/components/admin/bar-chart";
import { Sparkline } from "@/components/admin/sparkline";
import { StatusBadge } from "@/components/admin/status-badge";
import { financialSnapshot } from "@/lib/admin/queries";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

function MoneyStat({
  label,
  valueCents,
  caption,
}: {
  label: string;
  valueCents: number;
  caption: string;
}) {
  return (
    <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
      <p className="text-eyebrow">{label}</p>
      <p
        className="mt-3 font-[family-name:var(--font-display)] tabular-nums leading-none text-balance"
        style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
      >
        {formatBRL(valueCents / 100)}
      </p>
      <p className="mt-3 text-[12.5px] text-ink-500 leading-snug">{caption}</p>
    </article>
  );
}

export default async function AdminFinanceiroPage() {
  const snap = await financialSnapshot();

  return (
    <main className="px-6 lg:px-12 py-10 lg:py-14">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-eyebrow mb-8 hover:text-ink-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12">
        <div>
          <p className="text-eyebrow">Painel</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3.5rem)]">
            <span className="text-display-script text-gold-gradient">
              Financeiro
            </span>
          </h1>
          <p className="mt-3 text-[15px] text-ink-500">
            {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })} · ambas as
            casas · últimos 30 dias
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <MoneyStat
          label="Receita · 30 dias"
          valueCents={snap.revenue30dCents}
          caption={`${snap.totalBookings30d} reserva${snap.totalBookings30d === 1 ? "" : "s"} no período`}
        />
        <MoneyStat
          label="Sinal pendente"
          valueCents={snap.pendingDepositCents}
          caption={`${snap.pendingPaymentCount} pagamento${
            snap.pendingPaymentCount === 1 ? "" : "s"
          } aguardando`}
        />
        <MoneyStat
          label="Ticket médio"
          valueCents={snap.ticketAverageCents}
          caption="Por atendimento"
        />
        <MoneyStat
          label="LTV médio"
          valueCents={snap.ltvAverageCents}
          caption="Por cliente ativa"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50 lg:col-span-2">
          <header className="flex items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-eyebrow">Receita diária · últimos 30 dias</p>
              <p
                className="mt-3 font-[family-name:var(--font-display)] tabular-nums leading-none"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}
              >
                {formatBRL(snap.revenue30dCents / 100)}
              </p>
              {snap.revenue30dCents > 0 && (
                <p className="mt-3 text-[12px] text-gold-deep flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" />
                  Agregado das reservas confirmadas e concluídas
                </p>
              )}
            </div>
            {snap.revenue30dCents > 0 && (
              <Sparkline
                data={snap.revenue30dDaily}
                width={180}
                height={56}
                tone="gold"
              />
            )}
          </header>

          {snap.revenueByService.length === 0 ? (
            <p className="py-8 text-[14px] text-ink-500 text-center border border-dashed border-[var(--color-rule)]">
              Sem receita por serviço registrada no período.
            </p>
          ) : (
            <>
              <p className="text-eyebrow mb-4">Receita por serviço</p>
              <BarChart
                data={snap.revenueByService}
                format={(n) => formatBRL(n / 100)}
                highlight={snap.revenueByService[0]?.label}
              />
            </>
          )}
        </article>

        <article className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50">
          <p className="text-eyebrow">Mix de canais</p>
          <p className="mt-2 text-[12px] text-ink-500 mb-6">
            Origem dos agendamentos
          </p>
          <BarChart
            data={snap.channelMix}
            format={(n) => `${n}%`}
            highlight={snap.channelMix[0]?.label}
          />
          <p className="mt-6 text-[12px] text-ink-500 leading-[1.6]">
            Em V1, todas as reservas chegam pela plataforma. Walk-in e
            WhatsApp manual entram nas próximas integrações.
          </p>
        </article>
      </section>

      <section aria-labelledby="pending-title" className="mb-12">
        <header className="flex items-end justify-between mb-6">
          <div>
            <p className="text-eyebrow">Atenção</p>
            <h2
              id="pending-title"
              className="mt-2 text-[1.75rem] lg:text-[2rem]"
            >
              Sinais pendentes
            </h2>
          </div>
        </header>

        {snap.pendingPayments.length === 0 ? (
          <div className="border border-dashed border-[var(--color-rule)] bg-paper-50 p-10 text-center">
            <p className="text-ink-500">Nenhum sinal pendente. Tudo em dia.</p>
          </div>
        ) : (
          <div className="border border-[var(--color-rule)] bg-paper-50 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[var(--color-rule)]">
                  <th className="px-6 py-4 text-left text-eyebrow">Cliente</th>
                  <th className="px-6 py-4 text-left text-eyebrow">Serviço</th>
                  <th className="px-6 py-4 text-left text-eyebrow">Data</th>
                  <th className="px-6 py-4 text-right text-eyebrow">Total</th>
                  <th className="px-6 py-4 text-right text-eyebrow">Sinal</th>
                  <th className="px-6 py-4 text-left text-eyebrow">Status</th>
                </tr>
              </thead>
              <tbody>
                {snap.pendingPayments.map((b) => (
                  <tr
                    key={b.bookingId}
                    className="border-b border-[var(--color-rule)] last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <Link
                        href={`/admin/clientes/${b.clientId}` as never}
                        className="editorial-link"
                      >
                        {b.clientName}
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-[14px]">{b.serviceName}</td>
                    <td className="px-6 py-5 text-[14px] text-ink-500 tabular-nums">
                      {format(b.scheduledAt, "dd/MM HH:mm")}
                    </td>
                    <td className="px-6 py-5 text-right tabular-nums">
                      {formatBRL(b.totalCents / 100)}
                    </td>
                    <td className="px-6 py-5 text-right tabular-nums text-gold-deep">
                      {formatBRL(b.depositCents / 100)}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="top-spenders-title">
        <header className="flex items-end justify-between mb-6">
          <div>
            <p className="text-eyebrow">Top spenders</p>
            <h2
              id="top-spenders-title"
              className="mt-2 text-[1.75rem] lg:text-[2rem]"
            >
              Clientes que mais investiram
            </h2>
          </div>
          {snap.topSpenders.length > 0 && (
            <Link
              href="/admin/clientes?filter=vip"
              className="editorial-link text-[13px] uppercase tracking-[0.18em]"
            >
              Ver todas as VIP
            </Link>
          )}
        </header>

        {snap.topSpenders.length === 0 ? (
          <div className="border border-dashed border-[var(--color-rule)] bg-paper-50 p-10 text-center">
            <p className="text-ink-500 leading-[1.6]">
              Ainda não há clientes com atendimentos concluídos. Marque os
              próximos atendimentos como{" "}
              <strong>concluídos</strong> em{" "}
              <Link
                href="/admin/agendamentos"
                className="editorial-link"
              >
                Agendamentos
              </Link>{" "}
              e o ranking começa a aparecer aqui.
            </p>
          </div>
        ) : (
          <div className="border border-[var(--color-rule)] bg-paper-50 divide-y divide-[var(--color-rule)]">
            {snap.topSpenders.map((c, i) => {
              const yearsAgo = Math.floor(
                (Date.now() - c.firstSeenAt.getTime()) /
                  (1000 * 60 * 60 * 24 * 365),
              );
              return (
                <Link
                  key={c.id}
                  href={`/admin/clientes/${c.id}` as never}
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
                        {c.visitCount} visita{c.visitCount === 1 ? "" : "s"}
                        {yearsAgo > 0
                          ? ` · cliente há ${yearsAgo} ano${yearsAgo === 1 ? "" : "s"}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className="font-[family-name:var(--font-display)] tabular-nums leading-none text-gold-gradient flex-none"
                    style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)" }}
                  >
                    {formatBRL(c.lifetimeValueCents / 100)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
