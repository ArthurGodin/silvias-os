export const dynamic = "force-static";

import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/section-header";
import { ImageCard } from "@/components/ui/image-card";
import { GALLERY } from "@/lib/data/gallery";

export const metadata: Metadata = {
  title: "Galeria",
  description:
    "Trabalhos reais da equipe Silvia's Hair. Cada foto é assinada com técnica e profissional responsável.",
};

const aspectRotation = ["4/5", "3/4", "16/10", "4/5", "1/1", "3/4"] as const;

export default function GaleriaPage() {
  return (
    <>
      <section className="container-editorial pt-32 lg:pt-48 pb-16 lg:pb-24">
        <SectionHeader
          index={1}
          eyebrow="Galeria"
          title={
            <>
              O atelier em{" "}
              <span className="text-display-italic">imagens.</span>
            </>
          }
          description="Cada trabalho é assinado pela profissional responsável. Sem retoque, sem filtro."
        />
      </section>

      <section className="container-editorial pb-32">
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {GALLERY.map((g, i) => {
            const aspect = aspectRotation[i % aspectRotation.length] ?? "4/5";
            const span = i % 5 === 0 ? "col-span-12 lg:col-span-7" : "col-span-6 lg:col-span-5";
            return (
              <div key={g.id} className={span}>
                <ImageCard
                  src={g.src}
                  alt={g.alt}
                  eyebrow={g.category}
                  caption={g.caption}
                  aspect={aspect}
                />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
