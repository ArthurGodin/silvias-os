import { cn } from "@/lib/utils";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled_client"
  | "cancelled_house"
  | "no_show"
  | string;

const LABELS: Record<string, string> = {
  pending_payment: "Aguardando Pix",
  confirmed: "Confirmado",
  checked_in: "Em atendimento",
  completed: "Concluído",
  cancelled_client: "Cancelado · cliente",
  cancelled_house: "Cancelado · casa",
  no_show: "Não compareceu",
};

const TONES: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-900 border border-amber-300",
  confirmed: "bg-ink-700 text-paper-100",
  checked_in: "bg-gold-mist text-ink-800",
  completed: "bg-paper-200 text-ink-500",
  cancelled_client: "bg-red-50 text-red-800 border border-red-200",
  cancelled_house: "bg-red-50 text-red-800 border border-red-200",
  no_show: "bg-red-50 text-red-800 border border-red-200",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const label = LABELS[status] ?? status;
  const tone = TONES[status] ?? "bg-paper-200 text-ink-500";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[10.5px] uppercase tracking-[0.16em] font-medium leading-tight",
        tone,
      )}
    >
      {label}
    </span>
  );
}
