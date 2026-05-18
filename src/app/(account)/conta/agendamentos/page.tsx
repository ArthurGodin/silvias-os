import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  clientBookings,
  currentClientProfile,
} from "@/lib/account/queries";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Histórico de agendamentos",
};

export default async function HistoricoPage() {
  const profile = await currentClientProfile();
  if (!profile) redirect("/conta/entrar?next=/conta/agendamentos");

  const bookings = await clientBookings(profile.clientId);

  return (
    <>
      <section className="container-editorial pt-32 lg:pt-48 pb-12">
        <SectionHeader
          index={1}
          eyebrow="Conta"
          title={
            <>
              Seu{" "}
              <span className="text-display-italic">histórico.</span>
            </>
          }
          description="Todos os atendimentos realizados e agendados."
        />
      </section>

      <section className="container-editorial pb-32">
        {bookings.length === 0 ? (
          <p className="text-center text-ink-500 py-16">
            Sem atendimentos registrados.
          </p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="border border-[var(--color-rule)] bg-paper-50 p-5 lg:p-6 grid grid-cols-12 gap-4 items-center"
              >
                <div className="col-span-12 lg:col-span-3">
                  <p className="text-eyebrow">
                    {format(b.scheduledAt, "EEEE", { locale: ptBR })}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] italic text-[1.35rem] leading-tight tabular-nums">
                    {format(b.scheduledAt, "dd 'de' MMM yyyy · HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <p className="font-[family-name:var(--font-display)] italic text-[1.15rem] leading-tight">
                    {b.serviceName}
                  </p>
                  <p className="text-[12px] text-ink-500 mt-1">
                    com {b.staffName} · {b.unitName}
                  </p>
                </div>
                <div className="col-span-6 lg:col-span-2 lg:text-right tabular-nums text-[14px]">
                  {formatBRL(b.totalCents / 100)}
                </div>
                <div className="col-span-6 lg:col-span-2 lg:text-right">
                  <StatusBadge status={b.status} />
                </div>
                <div className="col-span-12 lg:col-span-1 lg:text-right">
                  <Link
                    href={`/agendamento/${b.id}` as never}
                    aria-label="Ver detalhes"
                    className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] editorial-link"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
