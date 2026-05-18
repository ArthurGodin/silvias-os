import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "ink" | "ghost" | "underline" | "gold";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type LinkProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-[0.18em] transition-all duration-300 ease-out " +
  "disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)] " +
  "select-none whitespace-nowrap";

const sizes: Record<Size, string> = {
  sm: "text-[10.5px] px-4 h-9",
  md: "text-[11.5px] px-6 h-11",
  lg: "text-[12.5px] px-8 h-14",
};

const variants: Record<Variant, string> = {
  ink:
    "bg-[var(--color-ink-700)] text-paper-100 hover:bg-[var(--color-ink-900)] " +
    "border border-[var(--color-ink-700)]",
  ghost:
    "bg-transparent text-ink-700 border border-[var(--color-ink-700)] " +
    "hover:bg-[var(--color-ink-700)] hover:text-paper-100",
  gold:
    "bg-[var(--color-gold)] text-paper-50 hover:bg-[var(--color-gold-deep)] " +
    "border border-[var(--color-gold)] shadow-[var(--shadow-gold)] hover:shadow-none",
  underline:
    "bg-transparent text-ink-700 px-0 h-auto py-1 border-0 " +
    "[background-image:linear-gradient(currentColor,currentColor)] " +
    "[background-position:0_100%] [background-repeat:no-repeat] " +
    "[background-size:100%_1px] hover:[background-size:0_1px] " +
    "[transition:background-size_600ms_cubic-bezier(0.16,1,0.3,1)]",
};

function classesFor(variant: Variant = "ink", size: Size = "md") {
  return cn(base, sizes[size], variants[variant]);
}

export function Button(props: ButtonProps | LinkProps) {
  if ("href" in props && props.href) {
    const { href, target, rel, variant, size, className, children, ...rest } =
      props as LinkProps;
    const external = target === "_blank";
    return (
      <Link
        href={href as never}
        target={target}
        rel={rel ?? (external ? "noopener noreferrer" : undefined)}
        className={cn(classesFor(variant, size), className)}
        {...rest}
      >
        {children}
      </Link>
    );
  }
  const { variant, size, className, children, ...rest } = props as ButtonProps;
  return (
    <button className={cn(classesFor(variant, size), className)} {...rest}>
      {children}
    </button>
  );
}
