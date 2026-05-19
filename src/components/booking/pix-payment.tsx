"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils";

type Props = {
  bookingId: string;
  amountCents: number;
  qrBase64: string;
  copyPaste: string;
  expiresAt: string | null;
};

export function PixPayment({
  bookingId,
  amountCents,
  qrBase64,
  copyPaste,
  expiresAt,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState<string>("");

  useEffect(() => {
    if (!expiresAt) return;
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setRemaining("Expirado");
        return;
      }
      const m = Math.floor(diff / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setRemaining(
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback: seleciona o texto via prompt
      window.prompt("Copie o código Pix:", copyPaste);
    }
  }

  // qrBase64 vem do Mercado Pago já pronto pra usar como data URI
  const qrSrc = qrBase64.startsWith("data:")
    ? qrBase64
    : `data:image/png;base64,${qrBase64}`;

  return (
    <section
      aria-labelledby="pix-title"
      className="mt-10 border border-[var(--color-gold)] bg-paper-50 max-w-2xl"
    >
      <header className="border-b border-[var(--color-rule)] px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-eyebrow text-gold-deep">Sinal Pix · 30%</p>
            <p className="mt-2 font-[family-name:var(--font-display)] italic text-[1.85rem] leading-tight text-gold-gradient tabular-nums">
              {formatBRL(amountCents / 100)}
            </p>
          </div>
          {expiresAt && (
            <div className="flex items-center gap-2 text-[12.5px] text-ink-500">
              <Clock className="h-3.5 w-3.5" />
              Expira em <strong className="tabular-nums">{remaining}</strong>
            </div>
          )}
        </div>
        <p
          id="pix-title"
          className="mt-3 text-[14px] text-ink-500 leading-[1.55]"
        >
          Pra garantir seu horário, pague o sinal pelo Pix abaixo. Assim que
          o pagamento for confirmado pelo Mercado Pago, seu agendamento muda
          de <strong>Aguardando Pix</strong> pra{" "}
          <strong>Confirmado</strong> automaticamente.
        </p>
      </header>

      <div className="p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 items-start">
        <div className="bg-paper-100 border border-[var(--color-rule)] p-3 mx-auto sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt={`QR Code Pix de ${formatBRL(amountCents / 100)}`}
            width={196}
            height={196}
            className="block"
          />
        </div>

        <div>
          <p className="text-eyebrow">Ou copia e cola</p>
          <p className="mt-2 text-[12px] text-ink-500 leading-[1.5]">
            Abra o app do seu banco → Pix → Copia e cola e use o código abaixo:
          </p>
          <div className="mt-3 border border-[var(--color-rule-strong)] bg-paper-100 p-3 font-mono text-[10.5px] break-all leading-relaxed text-ink-700 max-h-28 overflow-auto">
            {copyPaste}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant={copied ? "ghost" : "ink"}
              size="sm"
              onClick={copy}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar código Pix
                </>
              )}
            </Button>
            <p className="text-[11.5px] text-ink-500">
              Código · {bookingId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
