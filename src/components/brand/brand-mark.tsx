import { cn } from "@/lib/utils";

type BrandMarkProps = {
  size?: number;
  className?: string;
  tone?: "ink" | "gold" | "paper";
};

const toneColor = {
  ink: "var(--color-ink-700)",
  gold: "var(--color-gold)",
  paper: "var(--color-paper-100)",
};

export function BrandMark({ size = 36, className, tone = "ink" }: BrandMarkProps) {
  const color = toneColor[tone];
  return (
    <svg
      width={size}
      height={size * 1.05}
      viewBox="0 0 60 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
      aria-hidden
    >
      <path
        d="M14 8 C 6 22, 14 38, 8 58"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 8 C 24 22, 36 38, 30 58"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M46 8 C 54 22, 46 38, 52 58"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="14" cy="8" r="2.4" fill={color} />
      <circle cx="30" cy="8" r="2.4" fill={color} />
      <circle cx="46" cy="8" r="2.4" fill={color} />
    </svg>
  );
}
