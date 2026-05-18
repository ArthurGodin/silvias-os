import { cn, toRoman } from "@/lib/utils";

type Step = { key: string; label: string };

type StepProgressProps = {
  steps: Step[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
};

export function StepProgress({ steps, currentIndex, onStepClick }: StepProgressProps) {
  const total = steps.length;
  const remaining = total - currentIndex - 1;
  const remainingLabel =
    remaining === 0
      ? "Última etapa"
      : remaining === 1
        ? "Falta 1 etapa"
        : `Faltam ${remaining} etapas`;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-eyebrow">
        <span>
          Etapa {toRoman(currentIndex + 1)} de {toRoman(total)}
          <span className="sm:hidden ml-2 text-gold-deep">· {remainingLabel}</span>
        </span>
        <span className="hidden sm:inline">
          {steps[currentIndex]?.label}{" "}
          <span className="text-gold-deep ml-2">· {remainingLabel}</span>
        </span>
      </div>
      <div className="relative h-px bg-[var(--color-rule)]">
        <div
          className="absolute left-0 top-0 h-px bg-[var(--color-gold)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>
      <ol className="hidden lg:flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
        {steps.map((s, i) => {
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;
          return (
            <li key={s.key}>
              <button
                type="button"
                disabled={!onStepClick || i > currentIndex}
                onClick={() => onStepClick?.(i)}
                className={cn(
                  "transition-colors duration-300",
                  isActive && "text-ink-700",
                  isPast && "text-ink-500 hover:text-ink-700 cursor-pointer",
                  i > currentIndex && "cursor-not-allowed",
                )}
              >
                {String(i + 1).padStart(2, "0")} · {s.label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
