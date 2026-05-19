export const dynamic = "force-static";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/ui/section-divider";
import {
  CATEGORIES,
  getCategory,
  servicesByCategory,
} from "@/lib/data/services";
import { formatBRL, toRoman } from "@/lib/utils";

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  if (!cat) return { title: "Categoria não encontrada" };
  return {
    title: cat.title,
    description: cat.description,
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  if (!cat) notFound();
  const services = servicesByCategory(cat.slug);

  return (
    <>
      <section className="relative bg-ink-700 text-paper-100 grain">
        <div className="absolute inset-0">
          <Image
            src={cat.imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/60 to-ink-900/40" />
        </div>

        <div className="relative container-editorial pt-40 lg:pt-56 pb-24 lg:pb-32">
          <div className="grid-editorial">
            <div className="col-span-12 lg:col-span-2">
              <Link
                href="/servicos"
                className="text-eyebrow text-paper-200/80 inline-flex items-center gap-2"
              >
                ← Catálogo
              </Link>
            </div>
            <div className="col-span-12 lg:col-span-10">
              <span className="text-eyebrow text-paper-200/60">
                {toRoman(cat.index)}. Família
              </span>
              <h1 className="mt-4 text-balance">{cat.title}</h1>
              <p className="mt-8 max-w-[56ch] text-[18px] lg:text-[20px] leading-[1.6] text-paper-200/85">
                {cat.longDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-editorial py-24 lg:py-32">
        <div className="grid-editorial">
          <div className="col-span-12 lg:col-span-2">
            <span className="text-eyebrow">Atendimentos</span>
          </div>
          <div className="col-span-12 lg:col-span-10">
            <ul className="divide-y divide-[var(--color-rule)]">
              {services.map((s) => (
                <li key={s.slug} className="py-6 lg:py-8">
                  <div className="grid grid-cols-12 gap-4 items-baseline">
                    <div className="col-span-12 lg:col-span-5">
                      <p className="font-[family-name:var(--font-display)] text-[1.5rem] lg:text-[1.85rem] leading-tight tracking-[-0.02em]">
                        {s.name}
                      </p>
                      <p className="mt-2 text-[14.5px] text-ink-500 max-w-[44ch]">
                        {s.description}
                      </p>
                    </div>
                    <div className="col-span-6 lg:col-span-2 lg:text-center">
                      <span className="text-eyebrow">Duração</span>
                      <p className="mt-1 text-[15px] tabular-nums">
                        ≈ {s.duration} min
                      </p>
                    </div>
                    <div className="col-span-6 lg:col-span-2 lg:text-center">
                      <span className="text-eyebrow">A partir</span>
                      <p className="mt-1 text-[15px] tabular-nums">
                        {formatBRL(s.fromPrice)}
                      </p>
                    </div>
                    <div className="col-span-12 lg:col-span-3 lg:text-right">
                      {s.requiresDeposit && (
                        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep mb-3">
                          Sinal de 30% no agendamento
                        </p>
                      )}
                      <Button
                        href={`/agendar?servico=${s.slug}`}
                        variant="ghost"
                        size="sm"
                      >
                        Agendar
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SectionDivider className="mt-24" />

        <div className="mt-16 grid-editorial">
          <div className="col-span-12 lg:col-span-2">
            <span className="text-eyebrow">Outras famílias</span>
          </div>
          <div className="col-span-12 lg:col-span-10">
            <ul className="flex flex-wrap gap-3">
              {CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/servicos/${c.slug}`}
                    className="inline-flex items-center px-4 h-10 border border-[var(--color-rule-strong)] text-[12px] uppercase tracking-[0.18em] hover:bg-ink-700 hover:text-paper-100 transition-colors"
                  >
                    {c.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
