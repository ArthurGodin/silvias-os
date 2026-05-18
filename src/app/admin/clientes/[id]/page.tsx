import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Mail, Phone, ArrowLeft, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { bookingsForClientId, getClient } from "@/lib/admin/queries";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  const bookings = await bookingsForClientId(client.id);

  return (
    <main className="px-8 lg:px-12 py-10 lg:py-14 max-w-5xl">
      <Link
        href="/admin/clientes"
        className="inline-flex items-center gap-2 text-eyebrow mb-8 hover:text-ink-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Clientes
      </Link>

      <header className="grid-editorial">
        <div className="col-span-12 lg:col-span-3">
          <Avatar name={client.name} size="xl" />
        </div>
        <div className="col-span-12 lg:col-span-9 mt-8 lg:mt-0">
          <p className="text-eyebrow">
            Cliente desde {format(client.firstSeenAt, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3.5rem)]">
            {client.name}
          </h1>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-500">
            {client.email && (
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {client.email}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {client.phone}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              href={`https://wa.me/55${client.phone.replace(/\D/g, "")}`}
              target="_blank"
              variant="ink"
              size="sm"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
            {client.email && (
              <Button href={`mailto:${client.email}`} variant="ghost" size="sm">
                E-mail
              </Button>
            )}
          </div>
        </div>
      </header>

      <SectionDivider className="my-12" />

      <section aria-labelledby="indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <p className="text-eyebrow">LTV</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-none tabular-nums">
            {formatBRL(client.lifetimeValueCents / 100)}
          </p>
        </article>
        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <p className="text-eyebrow">Visitas</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-none tabular-nums">
            {client.visitCount}
          </p>
        </article>
        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <p className="text-eyebrow">Última visita</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-none">
            {client.lastSeenAt ? format(client.lastSeenAt, "dd MMM", { locale: ptBR }) : "—"}
          </p>
        </article>
        <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
          <p className="text-eyebrow">Status</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[1.75rem] leading-none">
            {client.isInactive ? "Inativa" : "Ativa"}
          </p>
        </article>
      </section>

      {(client.hairType || client.notes) && (
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {client.hairType && (
            <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
              <p className="text-eyebrow">Perfil técnico</p>
              <p className="mt-3 text-[15px] text-ink-700">{client.hairType}</p>
            </article>
          )}
          {client.notes && (
            <article className="border border-[var(--color-rule)] p-6 bg-paper-50">
              <p className="text-eyebrow">Observações</p>
              <p className="mt-3 text-[15px] text-ink-700">{client.notes}</p>
            </article>
          )}
        </section>
      )}

      <section aria-labelledby="timeline" className="mt-16">
        <h2 id="timeline" className="font-[family-name:var(--font-display)] text-[2rem] mb-6">
          Timeline
        </h2>
        {bookings.length === 0 ? (
          <p className="text-ink-500 py-8 border border-dashed border-[var(--color-rule)] text-center">
            Nenhum atendimento registrado.
          </p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="border border-[var(--color-rule)] p-5 bg-paper-50 grid grid-cols-12 gap-4 items-center"
              >
                <div className="col-span-3 lg:col-span-2 tabular-nums text-[13px] text-ink-500">
                  {format(b.scheduledAt, "dd MMM yyyy · HH:mm", { locale: ptBR })}
                </div>
                <div className="col-span-9 lg:col-span-4">
                  <p className="font-[family-name:var(--font-display)] italic text-[1.15rem] leading-tight">
                    {b.serviceName}
                  </p>
                  <p className="text-[12px] text-ink-500 mt-1">com {b.staffName}</p>
                </div>
                <div className="col-span-6 lg:col-span-3 text-[13px] text-ink-500">
                  {b.unitName}
                </div>
                <div className="col-span-3 lg:col-span-2 text-right tabular-nums text-[14px]">
                  {formatBRL(b.totalCents / 100)}
                </div>
                <div className="col-span-3 lg:col-span-1 text-right">
                  <StatusBadge status={b.status as never} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
