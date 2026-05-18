import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";
import { FAMILY } from "@/lib/data/family";
import { cn } from "@/lib/utils";

type FamilyHubProps = {
  variant?: "default" | "compact";
  index?: number;
};

export function FamilyHub({ variant = "default", index = 3 }: FamilyHubProps) {
  return (
    <section
      aria-labelledby="family-title"
      className={cn(
        variant === "default"
          ? "bg-ink-700 text-paper-100 py-24 lg:py-32 grain"
          : "py-20 bg-paper-50",
      )}
    >
      <div className="container-editorial">
        <Reveal>
          <SectionHeader
            index={index}
            eyebrow="Família Silvia's"
            tone={variant === "default" ? "paper" : "ink"}
            title={
              <>
                Três marcas.{" "}
                <span className="text-display-script">Uma assinatura.</span>
              </>
            }
            description="Hair atende mulheres há 23 anos. Barbershop e Estetic ganharão suas próprias plataformas em breve — abaixo, conheça onde elas vivem hoje."
          />
        </Reveal>

        <RevealStagger
          as="ul"
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6"
          delayStep={0.1}
        >
          {FAMILY.map((brand, i) => (
            <RevealItem key={brand.slug}>
              <BrandCard brand={brand} index={i + 1} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function BrandCard({
  brand,
  index,
}: {
  brand: (typeof FAMILY)[number];
  index: number;
}) {
  const isActive = brand.status === "active";

  return (
    <Link
      href={brand.href as never}
      className="group relative block overflow-hidden aspect-[4/5] transition-all duration-700 ease-[var(--ease-editorial)]"
    >
      <Image
        src={brand.imageUrl}
        alt={brand.name}
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className={cn(
          "object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)]",
          "group-hover:scale-[1.04]",
          !isActive && "grayscale-[0.5] brightness-[0.85]",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/40 to-ink-900/20" />

      <div className="absolute inset-0 p-6 lg:p-10 flex flex-col justify-between text-paper-100">
        <div className="flex items-start justify-between">
          <span className="text-eyebrow text-paper-200/70">
            N° {String(index).padStart(2, "0")} · Marca
          </span>
          {isActive ? (
            <ArrowUpRight
              className="h-5 w-5 text-paper-100 transition-transform duration-500 group-hover:rotate-45"
              aria-hidden
            />
          ) : (
            <span className="text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 bg-paper-100/15 backdrop-blur-sm border border-paper-100/20 text-gold-200">
              Em breve
            </span>
          )}
        </div>

        <div>
          <p className="text-eyebrow text-gold-200">{brand.tagline}</p>
          <p
            className="mt-3 font-[family-name:var(--font-display)] italic leading-[0.95] text-[clamp(2rem,3vw,3.25rem)]"
            style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1, 'opsz' 144" }}
          >
            {brand.name}
          </p>
          <p className="mt-4 text-[14px] leading-[1.6] text-paper-200/80 max-w-[36ch]">
            {brand.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
