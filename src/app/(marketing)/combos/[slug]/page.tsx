export const dynamic = "force-static";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/ui/section-divider";
import { CombosSpecial } from "@/components/marketing/combos-special";
import { CtaFinal } from "@/components/marketing/cta-final";
import { COMBOS, COMBOS_VALIDITY, getCombo } from "@/lib/data/combos";
import { formatBRL } from "@/lib/utils";

export async function generateStaticParams() {
  return COMBOS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const combo = getCombo(slug);
  if (!combo) return { title: "Combo não encontrado" };
  return {
    title: combo.title,
    description: `${combo.items.join(" + ")} · combo especial Silvia's Hair.`,
  };
}

export default async function ComboDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const combo = getCombo(slug);
  if (!combo) notFound();

  const hasVariants = !!combo.variants;
  const displayPrice =
    combo.priceCents ??
    combo.fromCents ??
    combo.variants?.[0]?.priceCents ??
    0;

  return (
    <>
      <section className="relative bg-ink-700 text-paper-100 grain">
        <div className="absolute inset-0">
          <Image
            src={combo.imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/60 to-ink-900/40" />
        </div>

        <div className="relative container-editorial pt-32 lg:pt-44 pb-20 lg:pb-28">
          <Link
            href="/combos"
            className="inline-flex items-center gap-2 text-eyebrow text-paper-200/65 hover:text-paper-100 transition-colors mb-12"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Todos os combos
          </Link>

          <div className="grid-editorial">
            <div className="col-span-12 lg:col-span-2">
              <span className="text-eyebrow text-gold-200">
                Combo especial
              </span>
            </div>
            <div className="col-span-12 lg:col-span-10">
              <h1 className="text-balance text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.05]">
                {combo.title}
              </h1>
              <p className="mt-6 max-w-[52ch] text-[17px] lg:text-[19px] text-paper-200/85 leading-[1.6]">
                {combo.items.join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-editorial py-20 lg:py-28">
        <div className="grid-editorial gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden hover-zoom-image">
              <Image
                src={combo.imageUrl}
                alt={combo.title}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <p className="text-eyebrow text-gold-deep">O que está incluso</p>

            <ul className="mt-8 space-y-4">
              {combo.items.map((item, i) => (
                <li
                  key={item}
                  className="flex items-start gap-4 pb-4 border-b border-[var(--color-rule)] last:border-b-0"
                >
                  <span className="flex-none inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold-mist text-ink-800 text-[12px] font-medium tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="font-[family-name:var(--font-display)] italic text-[1.35rem] leading-tight">
                      {item}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {combo.fineprint && (
              <p className="mt-8 flex items-start gap-2 text-[13px] italic text-muted">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-none text-gold-deep" />
                {combo.fineprint}
              </p>
            )}

            <SectionDivider className="my-12" />

            <p className="text-eyebrow text-gold-deep">Investimento</p>
            <div className="mt-6">
              {hasVariants && combo.variants ? (
                <ul className="space-y-2">
                  {combo.variants.map((v) => (
                    <li
                      key={v.label}
                      className="flex items-baseline justify-between gap-4 py-3 border-b border-[var(--color-rule)]"
                    >
                      <span className="text-[12px] uppercase tracking-[0.22em] text-muted">
                        Cabelo {v.label.toLowerCase()}
                      </span>
                      <span className="font-[family-name:var(--font-display)] text-[2.25rem] leading-none text-gold-gradient tabular-nums">
                        {formatBRL(v.priceCents / 100)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-baseline gap-4">
                  {combo.oldPriceCents && (
                    <span className="text-[18px] text-muted line-through tabular-nums">
                      {formatBRL(combo.oldPriceCents / 100)}
                    </span>
                  )}
                  <span className="font-[family-name:var(--font-display)] text-[3rem] lg:text-[3.5rem] leading-none text-gold-gradient tabular-nums tracking-tight">
                    {formatBRL(displayPrice / 100)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-3 text-[13.5px] text-ink-500">
              <p className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gold-deep" />
                Válido {COMBOS_VALIDITY.daysLabel.toLowerCase()} até{" "}
                {COMBOS_VALIDITY.endDate.toLocaleDateString("pt-BR")}
              </p>
              <p className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gold-deep" />
                {COMBOS_VALIDITY.paymentNote}
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                href={`/agendar?combo=${combo.slug}`}
                variant="gold"
                size="lg"
                className="w-full sm:w-auto justify-center"
              >
                Agendar este combo
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                href="https://wa.me/5586981000001"
                target="_blank"
                variant="underline"
                size="lg"
              >
                Dúvidas no WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper-200/40 py-20 lg:py-24">
        <div className="container-editorial">
          <header className="mb-12">
            <p className="text-eyebrow">Outros combos</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] lg:text-[2.5rem]">
              Veja também
            </h2>
          </header>
        </div>
        <CombosSpecial />
      </section>

      <CtaFinal />
    </>
  );
}
