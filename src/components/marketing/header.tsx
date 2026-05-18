"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { EditorialLink } from "@/components/ui/editorial-link";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/servicos", label: "Serviços" },
  { href: "/combos", label: "Combos" },
  { href: "/galeria", label: "Galeria" },
  { href: "/sobre", label: "Sobre" },
  { href: "/unidades", label: "Unidades" },
];

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const accountHref = isAuthenticated ? "/conta" : "/agendamento";
  const accountLabel = isAuthenticated ? "Minha conta" : "Meu agendamento";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          scrolled
            ? "bg-paper-100/95 backdrop-blur-md border-b border-[var(--color-rule)]"
            : "bg-transparent",
        )}
      >
        <div className="container-editorial flex items-center justify-between h-16 lg:h-20">
          <Link
            href="/"
            aria-label="Silvia's Hair"
            className="inline-flex items-center transition-opacity hover:opacity-80"
          >
            <span
              className="font-[family-name:var(--font-display)] italic text-[1.4rem] lg:text-[1.55rem] leading-none tracking-[-0.025em] text-ink-700"
              style={{
                fontVariationSettings: "'SOFT' 100, 'WONK' 1, 'opsz' 144",
              }}
            >
              Silvia&rsquo;s Hair
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {NAV.map((item) => (
              <EditorialLink
                key={item.href}
                href={item.href}
                active={pathname?.startsWith(item.href) ?? false}
                className="text-[12.5px] uppercase tracking-[0.18em] text-ink-700"
              >
                {item.label}
              </EditorialLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-5">
            {status !== "loading" && (
              <EditorialLink
                href={accountHref}
                className="text-[12.5px] uppercase tracking-[0.18em] text-ink-500"
              >
                {accountLabel}
              </EditorialLink>
            )}
            <Button href="/agendar" variant="ink" size="sm">
              Agendar
            </Button>
          </div>

          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-rule-strong)] text-ink-700 transition-colors hover:bg-ink-700 hover:text-paper-100"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Menu className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-ink-900/55 backdrop-blur-[3px] z-40 lg:hidden"
              aria-hidden
            />

            <motion.aside
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[88%] max-w-[360px] bg-paper-100 z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--color-rule)]">
                <span
                  className="font-[family-name:var(--font-display)] italic text-[1.25rem] tracking-[-0.025em] text-ink-700"
                  style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1, 'opsz' 144" }}
                >
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:text-ink-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex-1 px-6 py-8 overflow-y-auto">
                <motion.ul
                  initial="hidden"
                  animate="show"
                  variants={{
                    show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
                  }}
                  className="space-y-3"
                >
                  {NAV.map((item) => (
                    <motion.li
                      key={item.href}
                      variants={{
                        hidden: { opacity: 0, x: 24 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                      }}
                    >
                      <Link
                        href={item.href as never}
                        className={cn(
                          "block py-2 font-[family-name:var(--font-display)] italic text-[1.65rem] leading-tight tracking-[-0.02em] transition-colors",
                          pathname?.startsWith(item.href)
                            ? "text-gold-deep"
                            : "text-ink-700 hover:text-gold-deep",
                        )}
                        style={{
                          fontVariationSettings: "'SOFT' 100, 'WONK' 1, 'opsz' 144",
                        }}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  className="mt-10 pt-6 border-t border-[var(--color-rule)]"
                >
                  {status !== "loading" && (
                    <Link
                      href={accountHref as never}
                      className="block text-[11px] uppercase tracking-[0.22em] text-ink-500 hover:text-ink-700 transition-colors"
                    >
                      {accountLabel}
                    </Link>
                  )}
                  {isAuthenticated && (
                    <form action="/conta/sair" method="post" className="mt-4">
                      <button
                        type="submit"
                        className="text-[11px] uppercase tracking-[0.22em] text-ink-500/70 hover:text-ink-700 transition-colors"
                      >
                        Sair
                      </button>
                    </form>
                  )}
                </motion.div>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="px-6 py-6 border-t border-[var(--color-rule)]"
              >
                <Link
                  href="/agendar"
                  className="group inline-flex w-full h-12 items-center justify-center gap-2 bg-ink-700 hover:bg-ink-900 text-paper-100 text-[12px] uppercase tracking-[0.18em] font-medium transition-colors"
                >
                  Agendar atendimento
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
