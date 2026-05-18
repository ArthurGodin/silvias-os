import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { StatusActions } from "@/components/admin/status-actions";
import { Button } from "@/components/ui/button";
import { listBookings, type AdminBookingRow } from "@/lib/admin/queries";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await listBookings({ limit: 200 });

  const grouped = bookings.reduce<Record<string, AdminBookingRow[]>>(
    (acc, b) => {
      const key = format(b.scheduledAt, "yyyy-MM-dd");
      (acc[key] ??= []).push(b);
      return acc;
    },
    {},
  );

  return (
    <main className="px-8 lg:px-12 py-10 lg:py-14">
      <header className="flex items-end justify-between mb-12">
        <div>
          <p className="text-eyebrow">Operação</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)]">
            <span className="text-display-italic">Agendamentos</span>
          </h1>
        </div>
        <Button href="/agendar" target="_blank" variant="ghost" size="sm">
          Agendar manualmente
        </Button>
      </header>

      {bookings.length === 0 ? (
        <div className="border border-dashed border-[var(--color-rule)] bg-paper-50 px-8 py-16 text-center">
          <p className="text-eyebrow text-gold-deep">Aguardando primeiro agendamento</p>
          <p className="mt-3 text-[15px] text-ink-500 max-w-md mx-auto leading-[1.6]">
            Ainda não há agendamentos no banco. Reserve um pelo site público em{" "}
            <Link href="/agendar" className="editorial-link" target="_blank">
              /agendar
            </Link>{" "}
            e ele aparecerá aqui em tempo real.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([dateStr, list]) => (
            <section key={dateStr}>
              <p className="text-eyebrow mb-4">
                {format(new Date(dateStr + "T00:00:00"), "EEEE, dd 'de' MMMM", {
                  locale: ptBR,
                })}
              </p>

              <div className="border border-[var(--color-rule)] bg-paper-50 overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)]">
                      <th className="px-6 py-4 text-left text-eyebrow w-24">Hora</th>
                      <th className="px-6 py-4 text-left text-eyebrow">Cliente</th>
                      <th className="px-6 py-4 text-left text-eyebrow">Serviço</th>
                      <th className="px-6 py-4 text-left text-eyebrow">Profissional</th>
                      <th className="px-6 py-4 text-left text-eyebrow">Casa</th>
                      <th className="px-6 py-4 text-right text-eyebrow">Total</th>
                      <th className="px-6 py-4 text-left text-eyebrow">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-[var(--color-rule)] last:border-b-0 hover:bg-paper-100 transition-colors"
                      >
                        <td className="px-6 py-5 tabular-nums font-[family-name:var(--font-display)] italic text-[1.1rem]">
                          {format(b.scheduledAt, "HH:mm")}
                        </td>
                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/clientes/${b.clientId}`}
                            className="editorial-link"
                          >
                            {b.clientName}
                          </Link>
                          <p className="text-[12px] text-ink-500 mt-0.5">
                            {b.clientPhone}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-[14px]">
                          {b.serviceName}
                          {b.comboSlug && (
                            <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-gold-deep">
                              · combo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-[14px] text-ink-500">
                          {b.staffName}
                        </td>
                        <td className="px-6 py-5 text-[14px] text-ink-500">
                          {b.unitName}
                        </td>
                        <td className="px-6 py-5 text-right tabular-nums text-[14px]">
                          {formatBRL(b.totalCents / 100)}
                          {b.depositCents > 0 && (
                            <p className="text-[11px] text-gold-deep">
                              sinal {formatBRL(b.depositCents / 100)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <StatusActions
                            bookingId={b.id}
                            current={b.status as never}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
