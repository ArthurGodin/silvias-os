import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  caption?: string;
  trend?: { direction: "up" | "down" | "flat"; value: string };
  className?: string;
};

export function StatCard({ label, value, caption, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "border border-[var(--color-rule)] p-6 lg:p-8 bg-paper-50",
        className,
      )}
    >
      <p className="text-eyebrow">{label}</p>
      <p className="mt-4 font-[family-name:var(--font-display)] text-[2.5rem] lg:text-[3rem] leading-none tracking-[-0.022em]">
        {value}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 text-[12px]">
        {caption && <span className="text-ink-500">{caption}</span>}
        {trend && (
          <span
            className={cn(
              "tabular-nums",
              trend.direction === "up" && "text-gold-deep",
              trend.direction === "down" && "text-red-700",
              trend.direction === "flat" && "text-muted",
            )}
          >
            {trend.direction === "up" ? "↗" : trend.direction === "down" ? "↘" : "·"}{" "}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
