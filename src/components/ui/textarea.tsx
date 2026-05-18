import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full min-h-[88px] px-0 py-3 bg-transparent",
          "border-0 border-b border-[var(--color-rule-strong)]",
          "text-[16px] text-ink-700 font-[family-name:var(--font-body)]",
          "placeholder:text-ink-400/70 resize-none",
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
Textarea.displayName = "Textarea";
