import { SectionHeader } from "@/components/ui/section-header";
import { ServiceCard } from "@/components/ui/service-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, servicesByCategory } from "@/lib/data/services";

export function ServicesPreview() {
  return (
    <section
      aria-labelledby="services-title"
      className="container-editorial py-24 lg:py-32"
    >
      <SectionHeader
        index={4}
        eyebrow="Catálogo"
        title={
          <>
            Quatro famílias.{" "}
            <span className="text-display-script text-gold-gradient">
              Sem ruído.
            </span>
          </>
        }
        description="Cabelo, estética, unhas e depilação. Sem catálogo inchado — só o que fazemos com excelência."
      />

      <div className="mt-16 lg:mt-24">
        {CATEGORIES.map((cat) => {
          const services = servicesByCategory(cat.slug);
          return (
            <ServiceCard
              key={cat.slug}
              index={cat.index}
              category={cat.shortTitle}
              title={cat.title}
              description={cat.description}
              services={services.map((s) => ({ name: s.name, fromPrice: s.fromPrice }))}
              href={`/servicos/${cat.slug}`}
            />
          );
        })}
      </div>

      <div className="mt-16 flex justify-end">
        <Button href="/servicos" variant="underline" size="md">
          Ver catálogo completo
        </Button>
      </div>
    </section>
  );
}
