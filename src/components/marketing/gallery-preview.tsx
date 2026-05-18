import { SectionHeader } from "@/components/ui/section-header";
import { ImageCard } from "@/components/ui/image-card";
import { Button } from "@/components/ui/button";
import { GALLERY } from "@/lib/data/gallery";

export function GalleryPreview() {
  const items = GALLERY.slice(0, 6);

  return (
    <section
      aria-labelledby="gallery-title"
      className="bg-paper-200/50 py-24 lg:py-32"
    >
      <div className="container-editorial">
        <SectionHeader
          index={4}
          eyebrow="Galeria"
          title={
            <>
              Antes &amp; depois.{" "}
              <span className="text-display-italic">Sem filtro.</span>
            </>
          }
          description="Trabalhos reais conduzidos pela equipe. Cada foto carrega o nome da técnica usada e da profissional responsável."
        />

        <div className="mt-16 grid grid-cols-12 gap-6 lg:gap-8">
          <div className="col-span-12 lg:col-span-5">
            {items[0] && (
              <ImageCard
                src={items[0].src}
                alt={items[0].alt}
                eyebrow={items[0].category}
                caption={items[0].caption}
                aspect="3/4"
                sizes="(min-width: 1024px) 41vw, 100vw"
              />
            )}
          </div>
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-6 lg:gap-8">
            {items.slice(1, 5).map((g, i) => (
              <ImageCard
                key={g.id}
                src={g.src}
                alt={g.alt}
                eyebrow={g.category}
                caption={g.caption}
                aspect={i % 2 === 0 ? "4/5" : "1/1"}
                sizes="(min-width: 1024px) 28vw, 50vw"
              />
            ))}
          </div>
        </div>

        <div className="mt-16 flex justify-end">
          <Button href="/galeria" variant="underline" size="md">
            Ver galeria completa
          </Button>
        </div>
      </div>
    </section>
  );
}
