import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  Phone,
  User,
  Check,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/ui/section-divider";
import { StatusBadge } from "@/components/admin/status-badge";
import { CancelAction } from "@/components/booking/cancel-action";
import {
  canCancel,
  lookupBookingWithToken,
  CANCEL_WINDOW_HOURS,
} from "@/lib/booking/lookup";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AgendamentoView({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cancel?: string }>;
}) {
  const { id } = await params;
  const { cancel: providedToken } = await searchParams;
  const booking = await lookupBookingWithToken(id);
  if (!booking) notFound();

  // Token de cancelamento bate? Se sim, o botao de cancelar aparece.
  // Se nao bate, view e permitido mas cancel fica indisponivel - usuario
  // precisa abrir o link do email/sucesso pra ter o token.
  // Compatibilidade: se o banco ainda nao tem cancel_token, libera por padrao.
  const cancelTokenMatches =
    booking._cancelToken == null ||
    (typeof providedToken === "string" && providedToken === booking._cancelToken);

  const cancelCheck = canCancel(booking);
  const isCancelled =
    booking.status === "cancelled_client" ||
    booking.status === "cancelled_house";

  const dateLabel = format(
    booking.scheduledAt,
    "EEEE, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  );
  const timeLabel = format(booking.scheduledAt, "HH:mm");

  return (
    <>
      <Header />
      <main id="main" className="min-h-screen pt-32 lg:pt-40 pb-24">
        <section className="container-editorial">
          <div className="grid-editorial">
            <div className="col-span-12 lg:col-span-2">
              <span className="text-eyebrow">Meu agendamento</span>
            </div>
            <div className="col-span-12 lg:col-span-10">
              <p className="text-eyebrow text-gold-deep mb-3">
                Código · {booking.shortCode}
              </p>
              <h1 className="text-[clamp(2rem,5vw,4rem)] leading-[1.05]">
                {isCancelled ? (
                  <>
                    Agendamento{" "}
                    <span className="text-display-italic">cancelado.</span>
                  </>
                ) : booking.status === "completed" ? (
                  <>
                    Atendimento{" "}
                    <span className="text-display-italic">concluído.</span>
                  </>
                ) : (
                  <>
                    Está{" "}
                    <span className="text-display-italic">reservado.</span>
                  </>
                )}
              </h1>

              <div className="mt-6 flex items-center gap-3">
                <StatusBadge status={booking.status} />
                {booking.comboSlug && (
                  <span className="text-[11px] uppercase tracking-[0.18em] text-gold-deep">
                    · combo
                  </span>
                )}
              </div>
            </div>
          </div>

          <SectionDivider className="my-12 lg:my-16" />

          <div className="grid-editorial gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <p className="text-eyebrow mb-6">Detalhes</p>

              <dl className="space-y-6">
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-gold-deep flex-none mt-0.5" />
                  <div>
                    <dt className="text-eyebrow text-ink-500">Quando</dt>
                    <dd className="mt-1.5 font-[family-name:var(--font-display)] italic text-[1.35rem] capitalize">
                      {dateLabel}
                    </dd>
                    <dd className="text-[14px] text-ink-500 tabular-nums mt-1">
                      às {timeLabel} · {booking.durationMinutes} min
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-gold-deep flex-none mt-0.5" />
                  <div>
                    <dt className="text-eyebrow text-ink-500">Serviços</dt>
                    <ul className="mt-2 space-y-1.5">
                      {booking.services.map((s, i) => (
                        <li
                          key={i}
                          className="font-[family-name:var(--font-display)] italic text-[1.15rem]"
                        >
                          {s.name}
                          <span className="ml-2 text-[12px] uppercase tracking-[0.18em] text-ink-500 not-italic">
                            {s.durationMinutes} min
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-gold-deep flex-none mt-0.5" />
                  <div>
                    <dt className="text-eyebrow text-ink-500">Casa</dt>
                    <dd className="mt-1.5 font-[family-name:var(--font-display)] italic text-[1.35rem]">
                      {booking.unitName}
                    </dd>
                    <dd className="text-[14px] text-ink-500 mt-1">
                      {booking.unitShoppingName} · {booking.unitAddress}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <User className="h-5 w-5 text-gold-deep flex-none mt-0.5" />
                  <div>
                    <dt className="text-eyebrow text-ink-500">Profissional</dt>
                    <dd className="mt-1.5 font-[family-name:var(--font-display)] italic text-[1.35rem]">
                      {booking.staffName ?? "A casa escolhe"}
                    </dd>
                  </div>
                </div>

                {booking.unitPhone && (
                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-gold-deep flex-none mt-0.5" />
                    <div>
                      <dt className="text-eyebrow text-ink-500">
                        Falar com a casa
                      </dt>
                      <dd className="mt-1.5 text-[16px]">
                        {booking.unitPhone}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50">
                <p className="text-eyebrow">Investimento</p>
                <p className="mt-4 font-[family-name:var(--font-display)] text-[2.25rem] leading-none tabular-nums text-gold-gradient">
                  {formatBRL(booking.totalCents / 100)}
                </p>
                {booking.depositCents > 0 && (
                  <p className="mt-3 text-[13px] text-ink-500">
                    Sinal Pix ·{" "}
                    <strong className="tabular-nums">
                      {formatBRL(booking.depositCents / 100)}
                    </strong>
                  </p>
                )}

                <SectionDivider className="my-6" />

                <p className="text-eyebrow mb-3">Em nome de</p>
                <p className="font-[family-name:var(--font-display)] italic text-[1.2rem] leading-tight">
                  {booking.clientName}
                </p>
                {booking.clientEmail && (
                  <p className="mt-1 text-[12.5px] text-ink-500 break-all">
                    {booking.clientEmail}
                  </p>
                )}
                <p className="text-[12.5px] text-ink-500">
                  {booking.clientPhone}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {cancelCheck.allowed && cancelTokenMatches ? (
                  <>
                    <p className="text-[13px] text-ink-500 leading-[1.6]">
                      Cancelamento online disponível até{" "}
                      <strong>{CANCEL_WINDOW_HOURS}h</strong> antes do horário.
                      Depois disso, fale com a recepção.
                    </p>
                    <CancelAction
                      bookingId={booking.id}
                      cancelToken={providedToken}
                    />
                  </>
                ) : cancelCheck.allowed && !cancelTokenMatches ? (
                  <div className="border border-[var(--color-gold)]/40 bg-gold-mist/30 p-4">
                    <p className="text-[13px] text-ink-700 leading-[1.55]">
                      Pra cancelar, abra o <strong>link de cancelamento</strong>{" "}
                      que você recebeu no e-mail de confirmação. Ele tem um
                      código de segurança que só você tem.
                    </p>
                    {booking.unitPhone && (
                      <a
                        href={`https://wa.me/55${booking.unitPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-[12px] uppercase tracking-[0.2em] editorial-link font-medium"
                      >
                        Ou falar pelo WhatsApp →
                      </a>
                    )}
                  </div>
                ) : isCancelled ? (
                  <div className="flex items-start gap-2 text-[13px] text-ink-500">
                    <XCircle className="h-4 w-4 mt-0.5 flex-none" />
                    {booking.cancelledAt && (
                      <span>
                        Cancelado em{" "}
                        {format(booking.cancelledAt, "dd/MM/yyyy 'às' HH:mm")}
                      </span>
                    )}
                  </div>
                ) : booking.status === "completed" ? (
                  <div className="flex items-start gap-2 text-[13px] text-ink-500">
                    <Check className="h-4 w-4 mt-0.5 flex-none text-gold-deep" />
                    <span>Atendimento finalizado. Obrigado pela visita.</span>
                  </div>
                ) : (
                  <div className="border border-[var(--color-gold)]/40 bg-gold-mist/30 p-4">
                    <div className="flex items-start gap-2 text-[13px] text-ink-700 leading-[1.55]">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-none text-gold-deep" />
                      <p>{cancelCheck.reason}</p>
                    </div>
                    {booking.unitPhone && (
                      <a
                        href={`https://wa.me/55${booking.unitPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-[12px] uppercase tracking-[0.2em] editorial-link font-medium"
                      >
                        Falar pelo WhatsApp →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>

          <SectionDivider className="my-16" />

          <div className="flex flex-col sm:flex-row gap-3">
            {!isCancelled && booking.status !== "completed" && (
              <Button
                href={`/api/bookings/${booking.id}/ics`}
                variant="ghost"
                size="md"
              >
                <CalendarPlus className="h-4 w-4" />
                Adicionar à minha agenda
              </Button>
            )}
            <Button href="/" variant="underline" size="md">
              Voltar à home
            </Button>
            <Button
              href={`https://wa.me/55${booking.unitPhone?.replace(/\D/g, "") ?? "5586981000001"}`}
              target="_blank"
              variant="underline"
              size="md"
            >
              Falar no WhatsApp
            </Button>
          </div>

          <p className="mt-12 text-[12px] text-ink-500 max-w-prose">
            Esta página é privada — só quem tem o link consegue acessar. Guarde
            o código <strong>{booking.shortCode}</strong> caso precise consultar
            depois.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Meu agendamento",
    robots: { index: false, follow: false },
  };
}
