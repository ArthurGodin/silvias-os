"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge, type BookingStatus } from "@/components/admin/status-badge";

const TRANSITIONS: Record<string, { label: string; next: BookingStatus }[]> = {
  pending_payment: [
    { label: "Confirmar (Pix recebido)", next: "confirmed" },
    { label: "Cancelar (casa)", next: "cancelled_house" },
  ],
  confirmed: [
    { label: "Cliente chegou", next: "checked_in" },
    { label: "Concluir atendimento", next: "completed" },
    { label: "Marcar como não compareceu", next: "no_show" },
    { label: "Cancelar (casa)", next: "cancelled_house" },
  ],
  checked_in: [
    { label: "Concluir atendimento", next: "completed" },
  ],
  completed: [],
  cancelled_client: [],
  cancelled_house: [],
  no_show: [],
};

export function StatusActions({
  bookingId,
  current,
}: {
  bookingId: string;
  current: BookingStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const options = TRANSITIONS[current] ?? [];
  const isTerminal = options.length === 0;

  async function changeStatus(next: BookingStatus) {
    setError(null);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Falha ao atualizar");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Falha de rede");
    }
  }

  if (isTerminal) {
    return <StatusBadge status={current} />;
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 transition-opacity",
          pending && "opacity-50 cursor-wait",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <StatusBadge status={current} />
        <ChevronDown className="h-3 w-3 text-ink-500" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 z-20 w-64 bg-paper-50 border border-[var(--color-rule-strong)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]"
          >
            <ul className="py-2">
              {options.map((opt) => (
                <li key={opt.next}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => changeStatus(opt.next)}
                    className="w-full text-left px-4 py-3 text-[13.5px] hover:bg-paper-200 transition-colors flex items-center gap-2"
                  >
                    <Check className="h-3.5 w-3.5 text-gold-deep flex-none" />
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {error && (
        <p className="absolute right-0 top-full mt-1 text-[11px] text-red-700 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}
