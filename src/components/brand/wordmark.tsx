import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  size?: "sm" | "md" | "lg";
  href?: string;
  withTagline?: boolean;
  withMark?: boolean;
  tone?: "ink" | "paper";
  className?: string;
};

const sizeMap = {
  sm: { text: "text-[1.45rem]", mark: 24, tagline: "text-[8px]" },
  md: { text: "text-[2rem]", mark: 32, tagline: "text-[9px]" },
  lg: { text: "text-[clamp(2.75rem,5.5vw,4.5rem)]", mark: 56, tagline: "text-[11px]" },
};

export function Wordmark({
  size = "md",
  href = "/",
  withTagline = false,
  withMark = true,
  tone = "ink",
  className,
}: WordmarkProps) {
  const s = sizeMap[size];
  const textTone = tone === "ink" ? "text-ink-700" : "text-paper-100";
  const muteTone = tone === "ink" ? "text-muted" : "text-paper-200/70";

  const content = (
    <span className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      {withMark && (
        <BrandMark
          size={s.mark}
          tone={tone === "ink" ? "ink" : "paper"}
          className="opacity-90"
        />
      )}
      <span
        className={cn(
          "font-[family-name:var(--font-display)] italic leading-[0.92]",
          "[font-variation-settings:'SOFT'_100,'WONK'_1,'opsz'_144]",
          "tracking-[-0.025em]",
          textTone,
          s.text,
        )}
        style={{ fontWeight: 400 }}
      >
        Silvia&rsquo;s Hair
      </span>
      {withTagline && (
        <span
          className={cn(
            "uppercase tracking-[var(--tracking-eyebrow)] mt-1",
            muteTone,
            s.tagline,
          )}
        >
          Estilo &amp; Personalidade
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href as never}
        aria-label="Silvia's Hair — voltar para a home"
        className="inline-block transition-opacity hover:opacity-80"
      >
        {content}
      </Link>
    );
  }
  return content;
}
