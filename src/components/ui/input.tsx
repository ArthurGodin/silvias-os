import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-12 px-0 bg-transparent",
          "border-0 border-b border-[var(--color-rule-strong)]",
          "text-[16px] text-ink-700 font-[family-name:var(--font-body)]",
          "placeholder:text-ink-400/70",
          "focus:outline-none focus:border-ink-700",
          "transition-colors duration-200",
          invalid && "border-red-600 focus:border-red-700",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
