import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, AlertCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";
import { COMBOS, COMBOS_VALIDITY } from "@/lib/data/combos";
import { formatBRL, cn } from "@/lib/utils";

export function CombosSpecial() {
  return (
    <section
      aria-labelledby="combos-title"
      className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-paper-100 via-paper-50 to-paper-100"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-60"
      />

      <div className="container-editorial">
        <Reveal>
          <div className="text-center">
            <p className="text-eyebrow text-gold-deep">
              <span className="ornament-line">Promoção · Tempo limitado</span>
            </p>
            <h2
              id="combos-title"
              className="mt-6 text-balance"
            >
              Combos{" "}
              <span className="text-display-script text-gold-gradient">
                especiais
              </span>
            </h2>
            <p className="mt-6 max-w-[44ch] mx-auto text-[16px] lg:text-[17px] text-ink-500 leading-[1.65]">
              Cinco montagens fechadas com preço acima do desconto.
              Válidos {COMBOS_VALIDITY.daysLabel.toLowerCase()} até{" "}
              {COMBOS_VALIDITY.endDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              .
            </p>
          </div>
        </Reveal>

        <RevealStagger className="mt-20 space-y-6 lg:space-y-8" as="ul" delayStep={0.06}>
          {COMBOS.map((combo, i) => {
            const isLeft = combo.imagePosition === "left";
            return (
              <RevealItem key={combo.slug}>
                <article
                  className={cn(
                    "group relative grid grid-cols-12 items-center gap-0 overflow-hidden",
                    "rounded-[42px] border border-[var(--color-gold)]/35 bg-paper-50/90 backdrop-blur",
                    "transition-all duration-700 ease-[var(--ease-editorial)]",
                    "hover:border-[var(--color-gold)]/70 hover:shadow-[var(--shadow-gold)]",
                  )}
                >
                  <div
                    className={cn(
                      "relative col-span-12 md:col-span-4 aspect-[5/3] md:aspect-square overflow-hidden",
                      isLeft ? "md:col-start-1 md:rounded-l-[42px]" : "md:col-start-9 md:rounded-r-[42px] md:order-2",
                    )}
                  >
                    <Image
                      src={combo.imageUrl}
                      alt={combo.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-paper-50/30" />
                  </div>

                  <div
                    className={cn(
                      "col-span-12 md:col-span-8 px-6 sm:px-8 lg:px-12 py-8 lg:py-12 min-w-0",
                      isLeft ? "md:order-2" : "md:order-1",
                    )}
                  >
                    <p className="text-eyebrow text-gold-deep">
                      Combo {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3
                      className={cn(
                        "mt-4 font-[family-name:var(--font-display)] leading-[1.08] tracking-[-0.02em] text-balance break-words",
                        "text-[clamp(1.35rem,4.2vw,2.5rem)]",
                      )}
                    >
                      {combo.title}
                    </h3>

                    <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-ink-500">
                      {combo.items.map((item) => (
                        <li key={item} className="inline-flex items-center">
                          {item}
                          {combo.items.indexOf(item) < combo.items.length - 1 && (
                            <span className="mx-2 text-gold-deep" aria-hidden>
                              ·
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {combo.fineprint && (
                      <p className="mt-3 text-[12px] italic text-muted">
                        {combo.fineprint}
                      </p>
                    )}

                    <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-3">
                      {combo.priceCents && (
                        <PriceTag
                          oldCents={combo.oldPriceCents}
                          newCents={combo.priceCents}
                        />
                      )}
                      {combo.variants && (
                        <ul className="flex flex-wrap gap-x-6 gap-y-2">
                          {combo.variants.map((v) => (
                            <li key={v.label} className="flex items-baseline gap-2">
                              <span className="font-[family-name:var(--font-display)] text-[1.75rem] leading-none text-gold-gradient tabular-nums tracking-tight">
                                {formatBRL(v.priceCents / 100)}
                              </span>
                              <span className="text-[12px] uppercase tracking-[0.2em] text-muted">
                                {v.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                      <Button
                        href={`/agendar?combo=${combo.slug}`}
                        variant="ink"
                        size="sm"
                      >
                        Agendar este combo
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                      <Link
                        href={`/combos/${combo.slug}` as never}
                        className="editorial-link text-[12px] uppercase tracking-[0.18em] text-ink-500"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealStagger>

        <Reveal delay={0.15} className="mt-16">
          <div className="flex items-start gap-3 text-[12.5px] text-muted max-w-2xl mx-auto justify-center">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-none" />
            <p>
              Ofertas válidas {COMBOS_VALIDITY.daysLabel.toLowerCase()} até{" "}
              {COMBOS_VALIDITY.endDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              · {COMBOS_VALIDITY.paymentNote}.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PriceTag({
  oldCents,
  newCents,
}: {
  oldCents?: number;
  newCents: number;
}) {
  return (
    <div className="flex items-baseline gap-3">
      {oldCents && (
        <span className="text-[14px] text-muted line-through tabular-nums">
          {formatBRL(oldCents / 100)}
        </span>
      )}
      <span className="font-[family-name:var(--font-display)] text-[2.5rem] leading-none text-gold-gradient tabular-nums tracking-tight">
        {formatBRL(newCents / 100)}
      </span>
    </div>
  );
}
