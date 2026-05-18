import { cn } from "@/lib/utils";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, string> = {
  sm: "h-9 w-9 text-[12px]",
  md: "h-14 w-14 text-[15px]",
  lg: "h-20 w-20 text-[20px]",
  xl: "h-32 w-32 lg:h-44 lg:w-44 text-[28px] lg:text-[36px]",
};

// Tons editoriais consistentes com a paleta da marca. A escolha é
// determinística pelo hash do nome, então cada cliente sempre cai no
// mesmo tom.
const TONES = [
  "bg-gold-mist text-ink-800",
  "bg-ink-700 text-paper-50",
  "bg-paper-200 text-ink-700",
  "bg-[var(--color-gold)] text-paper-50",
  "bg-ink-100 text-ink-700",
] as const;

function hashTone(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return TONES[Math.abs(h) % TONES.length] ?? TONES[0];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: AvatarSize;
  className?: string;
}) {
  const tone = hashTone(name);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-full font-[family-name:var(--font-display)] italic font-medium leading-none select-none",
        SIZES[size],
        tone,
        className,
      )}
      style={{
        fontVariationSettings: "'SOFT' 50, 'WONK' 1, 'opsz' 144",
      }}
    >
      {initials(name)}
    </span>
  );
}
