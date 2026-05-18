import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/section-header";
import { ServiceCard } from "@/components/ui/service-card";
import { CATEGORIES, servicesByCategory } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Cabelo, estética facial, unhas e depilação. O catálogo enxuto do atelier Silvia's Hair em Teresina.",
};

export default function ServicosPage() {
  return (
    <>
      <section className="container-editorial pt-32 lg:pt-48 pb-12 lg:pb-16">
        <SectionHeader
          index={1}
          eyebrow="Catálogo"
          title={
            <>
              Quatro famílias.{" "}
              <span className="text-display-script text-gold-gradient">
                Sem ruído.
              </span>
            </>
          }
          description="Cabelo, estética facial, unhas e depilação. Cada serviço é conduzido por uma profissional especializada na família correspondente."
        />
      </section>

      <section className="container-editorial pb-32">
        {CATEGORIES.map((cat) => {
          const services = servicesByCategory(cat.slug);
          return (
            <ServiceCard
              key={cat.slug}
              index={cat.index}
              category={cat.shortTitle}
              title={cat.title}
              description={cat.description}
              services={services.map((s) => ({
                name: s.name,
                fromPrice: s.fromPrice,
              }))}
              href={`/servicos/${cat.slug}`}
            />
          );
        })}
      </section>
    </>
  );
}
