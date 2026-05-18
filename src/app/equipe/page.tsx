import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import Link from "next/link";
import Image from "next/image";
import { Clock, Phone, ArrowRight } from "lucide-react";
import { TEAM, getStaffMember } from "@/lib/data/team";
import {
  bookingsForStaff,
  nextBookingForStaff,
} from "@/lib/data/mock-bookings";
import { StatusBadge } from "@/components/admin/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";

export default async function StylistViewPage({
  searchParams,
}: {
  searchParams: Promise<{ staff?: string }>;
}) {
  const { staff: staffParam } = await searchParams;

  if (!staffParam) {
    return (
      <main className="container-editorial pt-16 pb-32">
        <p className="text-eyebrow">Stylist View · Mobile-first</p>
        <h1 className="mt-4 text-[clamp(1.75rem,4vw,2.5rem)]">
          Quem está acessando?
        </h1>
        <p className="mt-4 text-ink-500">
          Selecione seu perfil. Em produção, o login com 2FA cuida disso.
        </p>

        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEAM.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/equipe?staff=${m.slug}`}
                className="flex items-center gap-4 p-4 border border-[var(--color-rule)] bg-paper-50 hover:bg-paper-200/40 transition-colors"
              >
                <div className="relative h-12 w-12 flex-none rounded-full overflow-hidden bg-ink-100">
                  <Image src={m.imageUrl} alt={m.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-[family-name:var(--font-display)] italic text-[1.15rem] leading-tight">
                    {m.name}
                  </p>
                  <p className="text-[12px] text-ink-500">{m.role}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-500" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  const staff = getStaffMember(staffParam);
  if (!staff) {
    return (
      <main className="container-editorial pt-16">
        <p>Perfil não encontrado.</p>
      </main>
    );
  }

  const today = new Date();
  const todayBookings = bookingsForStaff(staff.slug, today).sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime(),
  );
  const next = nextBookingForStaff(staff.slug);

  return (
    <main className="container-editorial pt-10 pb-32">
      <header className="flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-ink-100">
          <Image src={staff.imageUrl} alt={staff.name} fill sizes="64px" className="object-cover" />
        </div>
        <div>
          <p className="text-eyebrow">{format(today, "EEEE, dd MMM", { locale: ptBR })}</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-[1.85rem] leading-none">
            Bom dia, <span className="italic">{staff.name.split(" ")[0]}.</span>
          </h1>
        </div>
      </header>

      {next && (
        <section className="mt-10 border border-ink-700 bg-ink-700 text-paper-100 p-6">
          <p className="text-eyebrow text-paper-200/70">Próximo</p>
          <p className="mt-3 text-[12px] uppercase tracking-[0.22em] text-paper-200/85 tabular-nums">
            {format(next.scheduledAt, "HH:mm")} · {next.durationMinutes} min
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] italic text-[2.25rem] leading-tight">
            {next.clientName}
          </p>
          <p className="mt-1 text-paper-200/85">{next.serviceName}</p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href={`https://wa.me/55${next.clientPhone.replace(/\D/g, "")}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 h-10 bg-paper-100 text-ink-700 text-[12px] uppercase tracking-[0.18em]"
            >
              <Phone className="h-3.5 w-3.5" />
              WhatsApp
            </Link>
            <Link
              href={`/equipe/atendimento/${next.id}?staff=${staff.slug}`}
              className="inline-flex items-center gap-2 px-4 h-10 border border-paper-200/30 text-paper-100 text-[12px] uppercase tracking-[0.18em] hover:bg-paper-100/10"
            >
              Abrir ficha
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      <SectionDivider className="my-10" />

      <section>
        <p className="text-eyebrow mb-4">Agenda · hoje</p>
        {todayBookings.length === 0 ? (
          <p className="py-10 text-center text-ink-500 border border-dashed border-[var(--color-rule)]">
            Nenhum atendimento agendado.
          </p>
        ) : (
          <ul className="space-y-2">
            {todayBookings.map((b) => (
              <li
                key={b.id}
                className="border border-[var(--color-rule)] bg-paper-50 p-4 flex items-center gap-4"
              >
                <div className="text-center flex-none w-16">
                  <p className="font-[family-name:var(--font-display)] italic text-[1.5rem] leading-none tabular-nums">
                    {format(b.scheduledAt, "HH:mm")}
                  </p>
                  <p className="text-[11px] text-muted mt-1 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    {b.durationMinutes}m
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] truncate">{b.clientName}</p>
                  <p className="text-[12.5px] text-ink-500 truncate">
                    {b.serviceName} · {b.unitName}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
