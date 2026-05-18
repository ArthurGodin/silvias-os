"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const HIGHLIGHTS = [
  { label: "Hidratação", slug: "hidratacao" },
  { label: "Coloração de raiz", slug: "coloracao-raiz" },
  { label: "Escova modeladora", slug: "escova" },
  { label: "Design de sobrancelha", slug: "design-sobrancelha" },
];

export function AtelierPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateRaw = useTransform(
    scrollYProgress,
    [0.05, 0.55],
    reduce ? [0, 0] : isMobile ? [10, 0] : [18, 0],
  );
  const rotate = useSpring(rotateRaw, { stiffness: 140, damping: 22 });

  const scaleRaw = useTransform(
    scrollYProgress,
    [0.05, 0.55],
    reduce ? [1, 1] : isMobile ? [0.92, 1] : [0.94, 1.02],
  );
  const scale = useSpring(scaleRaw, { stiffness: 140, damping: 22 });

  const headerY = useTransform(
    scrollYProgress,
    [0, 0.6],
    reduce ? [0, 0] : [60, -30],
  );

  const glareX = useMotionTemplate`${useTransform(
    scrollYProgress,
    [0.1, 0.6],
    reduce ? [50, 50] : [-30, 130],
  )}%`;

  return (
    <section
      aria-labelledby="atelier-title"
      ref={ref}
      className="relative bg-paper-100 py-20 lg:py-28 overflow-hidden"
    >
      <div className="container-editorial">
        <div className="relative" style={{ perspective: "1400px" }}>
          <PanelHeader translateY={headerY} />

          <motion.div
            ref={cardRef}
            style={
              reduce
                ? undefined
                : {
                    rotateX: rotate,
                    scale,
                    transformStyle: "preserve-3d",
                  }
            }
            className="relative mx-auto max-w-[68rem] mt-2 lg:-mt-4"
          >
            <div
              className="relative rounded-[28px] border border-[var(--color-gold)]/45 bg-ink-800 p-2 md:p-3 shadow-[0_28px_50px_-26px_rgba(46,45,40,0.4),0_18px_36px_-22px_rgba(191,155,91,0.3)] md:shadow-[0_70px_140px_-40px_rgba(46,45,40,0.55),0_30px_80px_-30px_rgba(191,155,91,0.4)]"
            >
              <div className="relative h-[24rem] sm:h-[28rem] md:h-[34rem] lg:h-[40rem] w-full overflow-hidden rounded-[20px] bg-ink-900">
                <Image
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2400&q=85"
                  alt="O atelier Silvia's Hair por dentro"
                  fill
                  sizes="(min-width: 1024px) 64rem, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/85 via-ink-900/35 to-transparent" />
                <div className="absolute inset-0 grain pointer-events-none" />

                {!reduce && (
                  <motion.div
                    aria-hidden
                    style={{
                      background: useMotionTemplate`linear-gradient(115deg, transparent 30%, rgba(191,155,91,0.18) ${glareX}, transparent 70%)`,
                    }}
                    className="absolute inset-0 pointer-events-none mix-blend-screen"
                  />
                )}

                <div className="absolute inset-x-0 top-0 px-5 sm:px-7 md:px-10 pt-5 md:pt-8 flex items-start justify-between text-paper-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-paper-200/65">
                      O atelier
                    </p>
                    <p
                      className="mt-2 font-[family-name:var(--font-display)] italic text-[1.4rem] leading-none tracking-[-0.02em]"
                      style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1, 'opsz' 144" }}
                    >
                      Silvia&rsquo;s Hair
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex h-9 px-3 items-center gap-2 bg-paper-100/12 backdrop-blur-md border border-paper-100/15 text-paper-100 text-[10.5px] uppercase tracking-[0.22em]">
                    Casa I · Casa II
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 px-5 sm:px-7 md:px-10 pb-5 md:pb-10">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-8">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-gold-200">
                        Atelier desde 2003
                      </p>
                      <p
                        className="mt-3 font-[family-name:var(--font-display)] italic leading-[0.95] text-paper-100 text-[clamp(1.85rem,5vw,3.5rem)] tracking-[-0.025em]"
                        style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1, 'opsz' 144" }}
                      >
                        Vinte e três anos
                        <br />
                        de método.
                      </p>
                    </div>

                    <ul className="hidden md:grid grid-cols-2 gap-1.5 max-w-md">
                      {HIGHLIGHTS.map((h) => (
                        <li key={h.slug}>
                          <Link
                            href={`/agendar?servico=${h.slug}` as never}
                            className="group flex items-center justify-between gap-3 px-3 py-2.5 bg-paper-100/10 hover:bg-paper-100/22 border border-paper-100/15 backdrop-blur-md transition-colors duration-300"
                          >
                            <span className="text-[12.5px] text-paper-100 font-medium">
                              {h.label}
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-gold-200 transition-transform duration-300 group-hover:rotate-45" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <ul className="md:hidden mt-12 grid grid-cols-1 gap-3">
              {HIGHLIGHTS.map((h, i) => (
                <motion.li
                  key={h.slug}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={`/agendar?servico=${h.slug}` as never}
                    className="group relative flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-[var(--color-gold)]/30 bg-gradient-to-br from-paper-50 to-paper-100/70 shadow-[0_10px_24px_-14px_rgba(191,155,91,0.55)] hover:shadow-[0_14px_30px_-10px_rgba(191,155,91,0.7)] hover:border-[var(--color-gold)]/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10.5px] uppercase tracking-[0.22em] text-gold-deep">
                        N° {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15.5px] font-medium text-ink-700 leading-tight">
                        {h.label}
                      </span>
                    </span>
                    <span className="flex-none inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-paper-100 group-hover:bg-[var(--color-gold)] group-hover:text-paper-50 transition-all duration-300 shadow-[0_4px_10px_-2px_rgba(46,45,40,0.3)]">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PanelHeader({ translateY }: { translateY: MotionValue<number> }) {
  return (
    <motion.div
      style={{ y: translateY }}
      className="max-w-3xl mx-auto text-center pb-10 px-4"
    >
      <p className="text-[10.5px] uppercase tracking-[0.24em] text-gold-deep inline-flex items-center gap-3">
        <span className="inline-block h-px w-8 bg-current opacity-60" />
        III · O atelier por dentro
        <span className="inline-block h-px w-8 bg-current opacity-60" />
      </p>
      <h2
        id="atelier-title"
        className="mt-6 text-balance text-[clamp(1.85rem,5vw,3.75rem)] leading-[1.05]"
      >
        Onde cada atendimento começa com{" "}
        <span className="text-display-script text-gold-gradient">escuta.</span>
      </h2>
      <p className="mt-6 max-w-[52ch] mx-auto text-[16px] lg:text-[17.5px] text-ink-500 leading-[1.65]">
        Duas casas em shoppings premium de Teresina. Cabines exclusivas para
        coloração, nail bar com esterilização hospitalar, e profissionais com
        formação internacional.
      </p>
    </motion.div>
  );
}
