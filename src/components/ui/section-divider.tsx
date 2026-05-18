import { cn } from "@/lib/utils";

export function SectionDivider({
  className,
  tone = "ink",
  variant = "dots",
}: {
  className?: string;
  tone?: "ink" | "paper";
  variant?: "dots" | "rule";
}) {
  if (variant === "rule") {
    return (
      <hr
        className={cn(
          "border-0 h-px w-full",
          tone === "ink"
            ? "bg-[var(--color-rule)]"
            : "bg-paper-200/20",
          className,
        )}
      />
    );
  }
  return (
    <div
      role="separator"
      aria-hidden
      className={cn(
        "flex items-center justify-center gap-3 select-none",
        tone === "ink" ? "text-ink-400" : "text-paper-200/60",
        className,
      )}
    >
      <span className="h-px w-12 bg-current opacity-40" />
      <span className="text-[10px] tracking-[0.4em] uppercase">· · ·</span>
      <span className="h-px w-12 bg-current opacity-40" />
    </div>
  );
}
