"use client";

import { cn } from "@/lib/utils";
import type { Slot } from "@/lib/booking/slot-engine";

type TimeSlotPickerProps = {
  slots: Slot[];
  value: string | null;
  onChange: (time: string) => void;
  loading?: boolean;
};

export function TimeSlotPicker({
  slots,
  value,
  onChange,
  loading,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-paper-200/50 animate-pulse border border-[var(--color-rule)]"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-[15px] text-ink-500 py-12 text-center border border-dashed border-[var(--color-rule)]">
        Nenhum horário disponível para esta data. Tente outro dia.
      </p>
    );
  }

  const available = slots.filter((s) => s.available);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {slots.map((s) => {
          const isActive = value === s.time;
          return (
            <button
              key={s.time}
              type="button"
              disabled={!s.available}
              onClick={() => onChange(s.time)}
              className={cn(
                "h-12 text-[14px] tabular-nums border transition-all duration-200",
                "flex items-center justify-center",
                s.available
                  ? isActive
                    ? "bg-ink-700 text-paper-100 border-ink-700"
                    : "bg-transparent text-ink-700 border-[var(--color-rule-strong)] hover:bg-paper-200"
                  : "bg-paper-200/40 text-ink-400 border-[var(--color-rule)] cursor-not-allowed line-through opacity-50",
              )}
              aria-pressed={isActive}
              aria-disabled={!s.available}
            >
              {s.time}
            </button>
          );
        })}
      </div>
      <p className="text-[12px] text-muted">
        {available.length} horários disponíveis · escolha um para continuar.
      </p>
    </div>
  );
}
