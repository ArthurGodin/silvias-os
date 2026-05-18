import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-[11px] uppercase tracking-[0.22em] text-muted font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
