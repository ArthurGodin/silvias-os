import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { UNITS } from "@/lib/data/units";

export function UnitsSection() {
  return (
    <section
      aria-labelledby="units-title"
      className="container-editorial py-24 lg:py-32"
    >
      <SectionHeader
        index={8}
        eyebrow="Casas"
        title={
          <>
            Duas casas.{" "}
            <span className="text-display-italic">Mesma assinatura.</span>
          </>
        }
        description="Ambas dentro de shoppings premium, com cabines exclusivas para coloração e clareamento, e nail bar com esterilização hospitalar."
      />

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {UNITS.map((u, i) => (
          <Link
            key={u.slug}
            href={`/unidades#${u.slug}`}
            className="group relative block overflow-hidden bg-ink-700"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={u.imageUrl}
                alt={`Atelier ${u.name}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover opacity-90 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent" />
            </div>

            <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between text-paper-100">
              <div className="flex items-start justify-between">
                <span className="text-eyebrow text-paper-200/70">
                  N° {String(i + 1).padStart(2, "0")} · Casa
                </span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
              </div>

              <div>
                <p className="font-[family-name:var(--font-display)] italic text-[3rem] lg:text-[4rem] leading-none">
                  {u.name}
                </p>
                <p className="mt-4 text-[16px] text-paper-200/90">
                  {u.shoppingName}
                </p>
                <div className="mt-6 space-y-1.5 text-[13px] text-paper-200/80">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 mt-1" />
                    <span>{u.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{u.phone}</span>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
