import { cn } from "@/lib/utils";

export function HourlyHeatmap({
  data,
  className,
}: {
  data: { hour: number; count: number }[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className={cn("flex items-end gap-2", className)}>
      {data.map((d) => {
        const intensity = d.count / max;
        const opacity = 0.18 + intensity * 0.82;
        return (
          <div key={d.hour} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-[2px] transition-colors"
              style={{
                height: `${Math.max(8, intensity * 56)}px`,
                backgroundColor: `rgba(191, 155, 91, ${opacity})`,
              }}
              title={`${d.hour}h · ${d.count} atendimentos`}
            />
            <span className="text-[10px] text-ink-500 tabular-nums">
              {String(d.hour).padStart(2, "0")}h
            </span>
            <span className="text-[10px] text-ink-700 tabular-nums font-medium">
              {d.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
