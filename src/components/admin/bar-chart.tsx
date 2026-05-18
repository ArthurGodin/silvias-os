import { cn } from "@/lib/utils";

type Bar = {
  label: string;
  value: number;
  caption?: string;
};

type BarChartProps = {
  data: Bar[];
  format?: (n: number) => string;
  highlight?: string;
  className?: string;
};

export function BarChart({
  data,
  format = (n) => String(n),
  highlight,
  className,
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className={cn("space-y-3", className)}>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        const isHighlight = highlight === d.label;
        return (
          <li key={d.label} className="grid grid-cols-12 gap-3 items-center">
            <span className="col-span-3 lg:col-span-3 text-[12px] text-ink-600 truncate">
              {d.label}
            </span>
            <div className="col-span-6 lg:col-span-7 h-2 bg-paper-200/70 overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-[var(--ease-editorial)]",
                  isHighlight
                    ? "bg-[var(--color-gold)]"
                    : "bg-ink-700",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="col-span-3 lg:col-span-2 text-right text-[12px] tabular-nums text-ink-700 font-medium">
              {format(d.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
