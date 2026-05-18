import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MOCK_BOOKINGS,
  clientById,
  bookingsForClient,
} from "@/lib/data/mock-bookings";
import { formatBRL } from "@/lib/utils";

export default async function AtendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = MOCK_BOOKINGS.find((b) => b.id === id);
  if (!booking) notFound();
  const client = clientById(booking.clientId);
  const history = bookingsForClient(booking.clientId)
    .filter((b) => b.id !== booking.id)
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
    .slice(0, 3);

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
          {client && (
            <div className="relative h-16 w-16 flex-none rounded-full overflow-hidden bg-paper-200">
              <Image
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(client.name)}&backgroundColor=faf7f2`}
                alt={client.name}
                fill
                sizes="64px"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-eyebrow">
              {format(booking.scheduledAt, "HH:mm")} · {booking.durationMinutes} min
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] italic text-[1.85rem] leading-tight">
              {booking.clientName}
            </p>
            <p className="mt-1 text-[13px] text-ink-500">{booking.serviceName}</p>
          </div>
        </div>
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
              <p className="mt-1.5 text-[14.5px]">{client.notes}</p>
            </div>
          )}
        </section>
      )}

      <section className="mt-6">
        <p className="text-eyebrow mb-3">Últimas visitas</p>
        {history.length === 0 ? (
          <p className="text-ink-500 text-[14px]">Primeira visita.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((b) => (
              <li
                key={b.id}
                className="border border-[var(--color-rule)] bg-paper-50 p-3 flex items-center gap-3 text-[13px]"
              >
                <span className="tabular-nums text-ink-500 w-24">
                  {format(b.scheduledAt, "dd MMM yy", { locale: ptBR })}
                </span>
                <span className="flex-1">{b.serviceName}</span>
                <span className="tabular-nums">{formatBRL(b.totalCents / 100)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <Label htmlFor="stylist-notes" className="mb-2 block">
          Anotações pós-atendimento
        </Label>
        <Textarea
          id="stylist-notes"
          placeholder="Fórmula usada, produto aplicado, observações sobre o fio…"
          rows={6}
        />
      </section>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button variant="ink" size="md" className="flex-1">
          <Save className="h-3.5 w-3.5" />
          Salvar e marcar como concluído
        </Button>
        <Button variant="ghost" size="md">
          <Camera className="h-3.5 w-3.5" />
          Foto antes/depois
        </Button>
      </div>
    </main>
  );
}
