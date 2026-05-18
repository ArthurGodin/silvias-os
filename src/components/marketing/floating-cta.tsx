"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Calendar } from "lucide-react";

const HIDE_ON = ["/agendar", "/admin", "/equipe", "/conta/entrar"];

export function FloatingCTA() {
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const shouldHideOnRoute = HIDE_ON.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (shouldHideOnRoute) {
      setVisible(false);
      return;
    }
    const onScroll = () => {
      const threshold = window.innerHeight * 0.6;
      setVisible(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldHideOnRoute]);

  if (shouldHideOnRoute) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="lg:hidden fixed bottom-5 inset-x-4 z-30"
        >
          <Link
            href="/agendar"
            className="group relative flex items-center justify-center gap-3 h-14 rounded-full bg-[var(--color-gold)] text-paper-50 shadow-[0_18px_40px_-12px_rgba(191,155,91,0.65)] hover:shadow-[0_22px_50px_-12px_rgba(191,155,91,0.8)] hover:bg-[var(--color-gold-deep)] transition-all duration-300 active:scale-[0.98]"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-[12.5px] uppercase tracking-[0.22em] font-medium">
              Agendar agora
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
