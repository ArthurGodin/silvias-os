import { toRoman } from "@/lib/utils";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  index: number;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  tone?: "ink" | "paper";
  className?: string;
};

export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  tone = "ink",
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "grid-editorial",
        align === "center" && "text-center",
        className,
      )}
    >
      <div
        className={cn(
          "col-span-12 lg:col-span-2",
          align === "center" && "lg:col-span-12",
        )}
      >
        <span
          className={cn(
            "text-eyebrow inline-flex items-center gap-2",
            tone === "paper" && "text-paper-200/80",
          )}
        >
          <span>{toRoman(index)}.</span>
          <span>{eyebrow}</span>
        </span>
      </div>
      <div
        className={cn(
          "col-span-12 lg:col-span-10",
          align === "center" && "lg:col-span-12",
        )}
      >
        <h2
          className={cn(
            "text-balance mt-3",
            tone === "paper" && "text-paper-100",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-6 max-w-[58ch] text-[17px] leading-[1.65] text-pretty",
              align === "center" && "mx-auto",
              tone === "ink" ? "text-ink-500" : "text-paper-200/85",
            )}
          >
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
