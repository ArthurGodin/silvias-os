import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowLeft, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  staffByUserId,
  getBookingForStaff,
  getBookingById,
  clientDetail,
  pastVisitsForClient,
  existingStylistNotes,
} from "@/lib/equipe/queries";
import { StatusBadge } from "@/components/admin/status-badge";
import { StylistActions } from "@/components/equipe/stylist-actions";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AtendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/admin/login?next=/equipe/atendimento/${id}`);

  const staff = await staffByUserId(user.id);
  if (!staff) redirect("/equipe");

  // Stylist só vê o que é dele; admin/manager/receptionist veem qualquer um.
  const booking =
    staff.role === "stylist"
      ? await getBookingForStaff(id, staff.id)
      : await getBookingById(id);

  if (!booking) notFound();

  const [client, past, notes] = await Promise.all([
    clientDetail(booking.clientId),
    pastVisitsForClient(booking.clientId, booking.id),
    existingStylistNotes(booking.id),
  ]);

  return (
    <main className="container-editorial pt-8 pb-24">
      <Link
        href="/equipe"
        className="inline-flex items-center gap-2 text-eyebrow mb-6 hover:text-ink-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </Link>

      <header className="border border-[var(--color-rule)] bg-paper-50 p-5">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 flex-none rounded-full overflow-hidden bg-paper-200">
            <Image
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(booking.clientName)}&backgroundColor=faf7f2`}
              alt={booking.clientName}
              fill
              sizes="64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-eyebrow">
              {format(booking.scheduledAt, "dd MMM · HH:mm", { locale: ptBR })}{" "}
              · {booking.durationMinutes} min
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] italic text-[1.85rem] leading-tight">
              {booking.clientName}
            </p>
            <p className="mt-1 text-[13px] text-ink-500">
              {booking.serviceName} · {booking.unitName}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        {booking.clientPhone && (
          <div className="mt-5 flex items-center gap-3">
            <Link
              href={`https://wa.me/55${booking.clientPhone.replace(/\D/g, "")}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3 h-9 border border-[var(--color-rule)] text-[11.5px] uppercase tracking-[0.18em] hover:bg-paper-200/40"
            >
              <Phone className="h-3 w-3" />
              WhatsApp
            </Link>
            <span className="text-[12.5px] text-ink-500 tabular-nums">
              {booking.clientPhone}
            </span>
          </div>
        )}
      </header>

      {client && (client.hairType || client.notes) && (
        <section className="mt-6 border border-[var(--color-rule)] bg-paper-50 p-5 space-y-4">
          {client.hairType && (
            <div>
              <p className="text-eyebrow">Perfil técnico</p>
              <p className="mt-1.5 text-[14.5px]">{client.hairType}</p>
            </div>
          )}
          {client.notes && (
            <div>
              <p className="text-eyebrow">Observações</p>
              <p className="mt-1.5 text-[14.5px] whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          )}
        </section>
      )}

      {client && (
        <section className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="border border-[var(--color-rule)] bg-paper-50 p-4">
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500">
              Visitas
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-[1.5rem] italic tabular-nums">
              {client.visitCount}
            </p>
          </div>
          <div className="border border-[var(--color-rule)] bg-paper-50 p-4">
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500">
              LTV
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-[1.5rem] italic tabular-nums">
              {formatBRL(client.lifetimeValueCents / 100)}
            </p>
          </div>
          <div className="border border-[var(--color-rule)] bg-paper-50 p-4">
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500">
              Cliente desde
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-[1.5rem] italic tabular-nums">
              {format(client.firstSeenAt, "MMM/yy", { locale: ptBR })}
            </p>
          </div>
        </section>
      )}

      <section className="mt-6">
        <p className="text-eyebrow mb-3">Últimas visitas concluídas</p>
        {past.length === 0 ? (
          <p className="text-ink-500 text-[14px]">Primeira visita.</p>
        ) : (
          <ul className="space-y-2">
            {past.map((p) => (
              <li
                key={p.id}
                className="border border-[var(--color-rule)] bg-paper-50 p-3 text-[13px]"
              >
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-ink-500 w-24">
                    {format(p.performedAt, "dd MMM yy", { locale: ptBR })}
                  </span>
                  <span className="flex-1">{p.serviceName}</span>
                  <span className="tabular-nums">
                    {formatBRL(p.totalCents / 100)}
                  </span>
                </div>
                {p.stylistNotes && (
                  <p className="mt-2 text-[12.5px] text-ink-500 whitespace-pre-wrap pl-[6.75rem]">
                    {p.stylistNotes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <StylistActions
        bookingId={booking.id}
        initialNotes={notes}
        status={booking.status}
      />
    </main>
  );
}

