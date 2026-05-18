"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast, useToast } from "@/components/ui/toast";

export function CancelAction({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Falha ao cancelar");
        setSubmitting(false);
        return;
      }
      setOpen(false);
      setSubmitting(false);
      toast.show("Agendamento cancelado", {
        tone: "success",
        description: "Seu horário foi liberado. Se houver sinal pago, o reembolso é integral.",
      });
      startTransition(() => router.refresh());
    } catch {
      setError("Falha de rede");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Toast
        open={toast.state.open}
        tone={toast.state.tone}
        title={toast.state.title}
        description={toast.state.description}
        onClose={toast.close}
      />
      <Button
        type="button"
        variant="underline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Cancelar agendamento
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink-900/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-paper-50 border border-[var(--color-rule-strong)] p-6 lg:p-8">
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-ink-500 hover:text-ink-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-gold-deep flex-none mt-1" />
              <div>
                <p className="text-eyebrow text-gold-deep">Cancelamento</p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-[1.5rem] leading-tight">
                  Confirma o cancelamento?
                </h3>
              </div>
            </div>

            <p className="text-[14.5px] text-ink-500 leading-[1.65]">
              Seu horário será liberado para outra cliente. Se você pagou sinal
              via Pix, o reembolso é integral por já estar dentro do prazo de
              24h.
            </p>

            <label className="mt-6 block">
              <span className="text-eyebrow mb-2 block">
                Motivo (opcional)
              </span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder="Ex: imprevisto, doença, mudança de planos..."
                className="w-full bg-transparent border border-[var(--color-rule-strong)] focus:border-ink-700 outline-none px-3 py-2.5 text-[14px] resize-none"
              />
            </label>

            {error && (
              <p className="mt-4 text-[13px] text-red-700">{error}</p>
            )}

            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-5">
              <Button
                type="button"
                variant="underline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={submitting || pending}
              >
                Manter agendamento
              </Button>
              <Button
                type="button"
                variant="ink"
                size="md"
                onClick={confirm}
                disabled={submitting || pending}
              >
                {submitting ? "Cancelando..." : "Confirmar cancelamento"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
