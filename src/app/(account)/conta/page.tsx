import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowRight, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  clientBookings,
  currentClientProfile,
} from "@/lib/account/queries";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Minha conta",
  description:
    "Acesse seus agendamentos, histórico de atendimentos e preferências.",
};

export default async function MinhaContaPage() {
  const profile = await currentClientProfile();
  if (!profile) {
    redirect("/conta/entrar");
  }

  const bookings = await clientBookings(profile.clientId);
  const now = new Date();
  const upcoming = bookings.filter(
    (b) =>
      b.scheduledAt > now &&
      b.status !== "cancelled_client" &&
      b.status !== "cancelled_house" &&
      b.status !== "completed",
  );
  const past = bookings.filter((b) => !upcoming.includes(b));
  const firstName = profile.name.split(" ")[0] ?? profile.name;

  return (
    <>
      <section className="container-editorial pt-32 lg:pt-48 pb-12">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            index={1}
            eyebrow={`Olá, ${firstName}`}
            title={
              <>
                Sua{" "}
                <span className="text-display-italic">conta.</span>
              </>
            }
          />
          <form action="/conta/sair" method="post" className="mt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink-500 hover:text-ink-700 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </form>
        </div>
      </section>

      <section className="container-editorial pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
            <p className="text-eyebrow">Visitas</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-[2.5rem] leading-none tabular-nums">
              {profile.visitCount}
            </p>
            <p className="mt-2 text-[13px] text-ink-500">
              Você é cliente desde{" "}
              {format(profile.firstSeenAt, "MMM yyyy", { locale: ptBR })}.
            </p>
          </article>
          <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
            <p className="text-eyebrow">Última visita</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-none">
              {profile.lastSeenAt
                ? format(profile.lastSeenAt, "dd MMM yyyy", { locale: ptBR })
                : "—"}
            </p>
            <p className="mt-2 text-[13px] text-ink-500">
              Investimento acumulado:{" "}
              <strong className="tabular-nums">
                {formatBRL(profile.lifetimeValueCents / 100)}
              </strong>
            </p>
          </article>
          <article className="border border-[var(--color-gold)]/50 bg-gold-mist/40 p-6 flex flex-col justify-between">
            <div>
              <p className="text-eyebrow text-gold-deep">Próximo passo</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-[1.5rem] leading-tight">
                {upcoming.length > 0
                  ? `${upcoming.length} agendamento${upcoming.length > 1 ? "s" : ""} marcado${upcoming.length > 1 ? "s" : ""}`
                  : "Hora de marcar?"}
              </p>
              <p className="mt-2 text-[13px] text-ink-600">
                {upcoming.length > 0
                  ? "Veja detalhes abaixo."
                  : "Que tal um cuidado novo?"}
              </p>
            </div>
            <Button href="/agendar" variant="ink" size="sm" className="mt-4">
              <Sparkles className="h-3 w-3" />
              Agendar
            </Button>
          </article>
        </div>

        <section aria-labelledby="upcoming" className="mt-16">
          <header className="flex items-end justify-between mb-6">
            <h2
              id="upcoming"
              className="font-[family-name:var(--font-display)] text-[2rem]"
            >
              Próximos agendamentos
            </h2>
            {past.length > 0 && (
              <Link
                href="/conta/agendamentos"
                className="editorial-link text-[13px] uppercase tracking-[0.18em]"
              >
                Ver histórico
              </Link>
            )}
          </header>

          {upcoming.length === 0 ? (
            <div className="border border-dashed border-[var(--color-rule)] p-12 text-center">
              <p className="text-ink-500">
                Você não tem agendamentos futuros.
              </p>
              <Button
                href="/agendar"
                variant="ink"
                size="md"
                className="mt-6"
              >
                Agendar atendimento
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((b) => (
                <li
                  key={b.id}
                  className="border border-[var(--color-rule)] bg-paper-50 p-5 lg:p-6 grid grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-4 lg:col-span-3">
                    <p className="text-eyebrow">
                      {format(b.scheduledAt, "EEEE", { locale: ptBR })}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] italic text-[1.5rem] leading-tight tabular-nums">
                      {format(b.scheduledAt, "dd 'de' MMM · HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div className="col-span-8 lg:col-span-5">
                    <p className="font-[family-name:var(--font-display)] italic text-[1.15rem] leading-tight">
                      {b.serviceName}
                    </p>
                    <p className="text-[12px] text-ink-500 mt-1">
                      com {b.staffName} · {b.unitName}
                    </p>
                  </div>
                  <div className="col-span-6 lg:col-span-2 text-right tabular-nums text-[14px]">
                    {formatBRL(b.totalCents / 100)}
                  </div>
                  <div className="col-span-6 lg:col-span-2 lg:text-right flex gap-2 lg:justify-end">
                    <Link
                      href={`/agendamento/${b.id}` as never}
                      className="inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.18em] editorial-link"
                    >
                      Detalhes
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </>
  );
}
