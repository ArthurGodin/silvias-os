import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn, formatBRL } from "@/lib/utils";

type ServiceLite = {
  name: string;
  fromPrice?: number;
};

type ServiceCardProps = {
  index: number;
  category: string;
  title: string;
  description: string;
  services: ServiceLite[];
  href: string;
  className?: string;
};

export function ServiceCard({
  index,
  category,
  title,
  description,
  services,
  href,
  className,
}: ServiceCardProps) {
  return (
    <Link
      href={href as never}
      className={cn(
        "group block border-t border-[var(--color-rule)] py-10 lg:py-14",
        "transition-colors duration-500",
        "hover:bg-paper-200/40",
        className,
      )}
    >
      <div className="grid-editorial">
        <div className="col-span-12 lg:col-span-1">
          <span className="text-eyebrow">{String(index).padStart(2, "0")}</span>
        </div>
        <div className="col-span-12 lg:col-span-2">
          <span className="text-eyebrow">{category}</span>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <h3 className="font-[family-name:var(--font-display)] text-[2rem] leading-[1.05] lg:text-[2.75rem] tracking-[-0.022em] mt-3 lg:mt-0">
            {title}
          </h3>
          <p className="mt-4 max-w-[42ch] text-[15.5px] leading-[1.6] text-ink-500">
            {description}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-3 lg:col-start-9 mt-6 lg:mt-2">
          <ul className="space-y-2 text-[14px] text-ink-600">
            {services.slice(0, 5).map((s) => (
              <li key={s.name} className="flex items-baseline justify-between gap-4">
                <span>{s.name}</span>
                {s.fromPrice && (
                  <span className="text-ink-400 text-[12px] tabular-nums whitespace-nowrap">
                    a partir de {formatBRL(s.fromPrice)}
                  </span>
                )}
              </li>
            ))}
            {services.length > 5 && (
              <li className="text-eyebrow pt-2">+ {services.length - 5} outros atendimentos</li>
            )}
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-1 lg:col-start-12 mt-6 lg:mt-2 flex lg:justify-end">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-rule-strong)] text-ink-700 transition-all duration-500 group-hover:bg-ink-700 group-hover:text-paper-100 group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
