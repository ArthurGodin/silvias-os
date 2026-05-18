"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  id?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Checkbox({
  checked,
  onChange,
  id,
  required,
  children,
  className,
}: CheckboxProps) {
  const reactId = React.useId();
  const inputId = id ?? `cb-${reactId}`;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-start gap-3 cursor-pointer group select-none",
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span
        aria-hidden
        className={cn(
          "mt-[3px] inline-flex h-5 w-5 flex-none items-center justify-center border transition-colors duration-200",
          checked
            ? "bg-ink-700 border-ink-700 text-paper-100"
            : "bg-transparent border-[var(--color-rule-strong)]",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-gold)]",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="text-[14px] leading-[1.55] text-ink-600 pt-px">
        {children}
      </span>
    </label>
  );
}
