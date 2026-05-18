"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { cn } from "@/lib/utils";
import { nextSevenDays } from "@/lib/booking/availability";

type CalendarDayPickerProps = {
  value: string | null;
  onChange: (date: string) => void;
};

export function CalendarDayPicker({ value, onChange }: CalendarDayPickerProps) {
  const days = nextSevenDays();

  return (
    <div className="overflow-x-auto -mx-6 lg:mx-0">
      <div className="flex gap-2 px-6 lg:px-0 lg:grid lg:grid-cols-7 lg:gap-3">
        {days.slice(0, 14).map((d) => {
          const date = parseISO(d.date);
          const isActive = value === d.date;
          const isClosed = d.weekday === 0 && false; // domingo aberto também
          const weekdayLabel = format(date, "EEE", { locale: ptBR }).replace(".", "");
          const dayNum = format(date, "dd");
          const month = format(date, "MMM", { locale: ptBR }).replace(".", "");
          return (
            <button
              key={d.date}
              type="button"
              disabled={isClosed}
              onClick={() => onChange(d.date)}
              className={cn(
                "flex flex-col items-center justify-center px-4 py-4 lg:py-5 border min-w-[88px] flex-none",
                "transition-all duration-200",
                isActive
                  ? "bg-ink-700 text-paper-100 border-ink-700"
                  : "bg-transparent text-ink-700 border-[var(--color-rule-strong)] hover:bg-paper-200",
                isClosed && "opacity-40 cursor-not-allowed",
              )}
              aria-pressed={isActive}
            >
              <span
                className={cn(
                  "text-[10px] uppercase tracking-[0.22em]",
                  isActive ? "text-paper-200/80" : "text-muted",
                )}
              >
                {weekdayLabel}
              </span>
              <span className="font-[family-name:var(--font-display)] text-[2rem] leading-none mt-1.5">
                {dayNum}
              </span>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-[0.22em] mt-1",
                  isActive ? "text-paper-200/80" : "text-muted",
                )}
              >
                {month}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
