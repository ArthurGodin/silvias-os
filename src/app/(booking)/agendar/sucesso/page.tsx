import type { Metadata } from "next";
import { Check, Mail, MessageSquare, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/ui/section-divider";
import { PixPayment } from "@/components/booking/pix-payment";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type PixData = {
  amountCents: number;
  qrBase64: string;
  copyPaste: string;
  expiresAt: string | null;
};

async function pendingPixForBooking(
  bookingId: string,
): Promise<PixData | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("payments")
      .select("amount_cents, pix_qr_base64, pix_copy_paste, expires_at, status")
      .eq("booking_id", bookingId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);
    const row = data?.[0];
    if (!row || !row.pix_qr_base64 || !row.pix_copy_paste) return null;
    return {
      amountCents: row.amount_cents,
      qrBase64: row.pix_qr_base64,
      copyPaste: row.pix_copy_paste,
      expiresAt: row.expires_at,
    };
  } catch (err) {
    console.error("[sucesso] pendingPix lookup failed:", err);
    return null;
  }
}

export const metadata: Metadata = {
  title: "Agendamento confirmado",
  description: "Seu horário foi reservado.",
};

async function bookingHasAccountConsent(
  bookingId: string,
): Promise<{ createdAccount: boolean; email: string | null }> {
  try {
    const admin = createAdminClient();
    const { data: booking } = await admin
      .from("bookings")
      .select("client_id, clients(email)")
      .eq("id", bookingId)
      .maybeSingle();
    if (!booking) return { createdAccount: false, email: null };

    const { data: consents } = await admin
      .from("client_consents")
      .select("consent_type, granted")
      .eq("client_id", booking.client_id);

    const createdAccount =
      consents?.some(
        (c) => c.consent_type === "create_account" && c.granted,
      ) ?? false;

    const email =
      (booking.clients as unknown as { email: string | null } | null)?.email ??
      null;
    return { createdAccount, email };
  } catch {
    return { createdAccount: false, email: null };
  }
}

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; cancel?: string }>;
}) {
  const { id, cancel } = await searchParams;
  const shortId = (id ?? "").slice(0, 8).toUpperCase();
  const trackingUrl = id
    ? `/agendamento/${id}${cancel ? `?cancel=${cancel}` : ""}`
    : null;
  const [{ createdAccount, email }, pix] = await Promise.all([
    id ? bookingHasAccountConsent(id) : Promise.resolve({ createdAccount: false, email: null }),
    id ? pendingPixForBooking(id) : Promise.resolve(null),
  ]);

  return (
    <section className="container-editorial pt-40 lg:pt-56 pb-32">
      <div className="grid-editorial">
        <div className="col-span-12 lg:col-span-2">
          <span className="text-eyebrow">Confirmação</span>
        </div>
        <div className="col-span-12 lg:col-span-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold text-paper-100">
            <Check className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <h1 className="mt-8 text-balance">
            Está{" "}
            <span className="text-display-italic">reservado.</span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-[18px] text-ink-500 leading-[1.6]">
            {createdAccount
              ? "Enviamos um link no seu e-mail para você acessar sua conta e ver todos os agendamentos em um só lugar."
              : "Anotamos seu horário. Use o link abaixo sempre que quiser conferir ou cancelar."}
          </p>
          {shortId && (
            <p className="mt-8 text-eyebrow">Código · {shortId}</p>
          )}

          {pix && id && (
            <PixPayment
              bookingId={id}
              amountCents={pix.amountCents}
              qrBase64={pix.qrBase64}
              copyPaste={pix.copyPaste}
              expiresAt={pix.expiresAt}
            />
          )}

          {createdAccount && email && (
            <div className="mt-10 p-6 lg:p-7 border border-[var(--color-gold)] bg-gold-mist/40 max-w-2xl">
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-gold-deep flex-none mt-0.5" />
                <div>
                  <p className="text-eyebrow text-gold-deep">
                    Confira seu e-mail
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.65] text-ink-700">
                    Enviamos um link mágico para{" "}
                    <strong className="break-all">{email}</strong>. Clique nele
                    e você entra direto na sua conta — sem senha. O link vale
                    por 1 hora.
                  </p>
                  <p className="mt-3 text-[12.5px] text-ink-500">
                    Não chegou? Confira a pasta de spam ou{" "}
                    <a href="/conta/entrar" className="editorial-link">
                      peça outro link aqui
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {!createdAccount && trackingUrl && (
            <div className="mt-10 p-6 lg:p-7 border border-[var(--color-gold)]/40 bg-gold-mist/30 max-w-2xl">
              <p className="text-eyebrow text-gold-deep">Guarde este link</p>
              <p className="mt-3 text-[15px] leading-[1.65] text-ink-700">
                Use o link abaixo sempre que quiser conferir ou{" "}
                <strong>cancelar</strong> seu agendamento (até 24h antes).
                Salve nos favoritos:
              </p>
              <a
                href={trackingUrl}
                className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium editorial-link break-all"
              >
                silviashair.com.br{trackingUrl}
                <ArrowRight className="h-3.5 w-3.5 flex-none" />
              </a>
            </div>
          )}

          <SectionDivider className="my-12" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <article className="border border-[var(--color-rule)] p-6 lg:p-8">
              <Mail className="h-5 w-5 text-ink-500" />
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-[1.5rem] leading-tight">
                Confirmação por e-mail
              </h3>
              <p className="mt-3 text-[14.5px] text-ink-500 leading-[1.65]">
                {createdAccount
                  ? "Seu link de acesso à conta chega em até 5 minutos. Cheque também o spam."
                  : "Sua confirmação está a caminho. Se não chegar em 5 minutos, cheque a pasta de spam ou nos chame no WhatsApp."}
              </p>
            </article>

            <article className="border border-[var(--color-rule)] p-6 lg:p-8">
              <MessageSquare className="h-5 w-5 text-ink-500" />
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-[1.5rem] leading-tight">
                Precisa cancelar ou reagendar?
              </h3>
              <p className="mt-3 text-[14.5px] text-ink-500 leading-[1.65]">
                {createdAccount
                  ? "Acesse sua conta e cancele em 1 clique até 24h antes. Ou fale com a recepção pelo WhatsApp."
                  : "Use o link de acompanhamento acima até 24h antes do horário, ou fale com a recepção pelo WhatsApp."}
              </p>
            </article>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-3">
            {createdAccount ? (
              <Button href="/conta" variant="ink" size="md">
                Ir para minha conta
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              trackingUrl && (
                <Button href={trackingUrl as never} variant="ink" size="md">
                  Ver meu agendamento
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )
            )}
            <Button href="/" variant="underline" size="md">
              Voltar à home
            </Button>
            <Button
              href="https://wa.me/5586981000001"
              target="_blank"
              variant="underline"
              size="md"
            >
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
