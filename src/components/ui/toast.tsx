"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "info" | "warn";

export type ToastProps = {
  open: boolean;
  tone?: Tone;
  title: string;
  description?: string;
  onClose: () => void;
  autoCloseMs?: number;
};

const TONE_STYLES: Record<Tone, { bar: string; icon: React.ElementType }> = {
  success: { bar: "border-[var(--color-gold)] bg-paper-50", icon: Check },
  info: { bar: "border-ink-700 bg-paper-50", icon: AlertCircle },
  warn: { bar: "border-amber-500 bg-paper-50", icon: AlertCircle },
};

export function Toast({
  open,
  tone = "success",
  title,
  description,
  onClose,
  autoCloseMs = 4500,
}: ToastProps) {
  useEffect(() => {
    if (!open || !autoCloseMs) return;
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  const { bar, icon: Icon } = TONE_STYLES[tone];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50"
          role="status"
          aria-live="polite"
        >
          <div
            className={cn(
              "border-l-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] px-5 py-4 flex items-start gap-3",
              bar,
            )}
          >
            <Icon className="h-4 w-4 mt-1 flex-none text-gold-deep" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] uppercase tracking-[0.18em] font-medium text-ink-700">
                {title}
              </p>
              {description && (
                <p className="mt-1.5 text-[13.5px] text-ink-500 leading-[1.5]">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Fechar"
              onClick={onClose}
              className="flex-none text-ink-500 hover:text-ink-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useToast() {
  const [state, setState] = useState<{
    open: boolean;
    tone?: Tone;
    title: string;
    description?: string;
  }>({ open: false, title: "" });

  return {
    state,
    show: (
      title: string,
      options?: { tone?: Tone; description?: string },
    ) => setState({ open: true, title, ...options }),
    close: () => setState((s) => ({ ...s, open: false })),
  };
}
