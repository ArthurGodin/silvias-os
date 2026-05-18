import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionDivider } from "@/components/ui/section-divider";
import { FamilyHub } from "@/components/marketing/family-hub";
import { TEAM } from "@/lib/data/team";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "23 anos de atelier em Teresina. Duas Casas, uma fundadora — Silvia Meneses. Estilo e personalidade traduzidos em técnica.",
};

export default function SobrePage() {
  return (
    <>
      <section className="container-editorial pt-32 lg:pt-48 pb-16">
        <SectionHeader
          index={1}
          eyebrow="A história"
          title={
            <>
              Vinte e três anos de{" "}
              <span className="text-display-script text-gold-gradient">atelier.</span>
            </>
          }
        />
      </section>

      <section className="container-editorial pb-24 lg:pb-32">
        <div className="grid-editorial">
          <div className="col-span-12 lg:col-span-5">
            <div className="relative aspect-[3/4] w-full overflow-hidden hover-zoom-image">
              <Image
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1600&q=85"
                alt="Silvia Meneses — fundadora"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="mt-6 text-eyebrow">Silvia Meneses · Fundadora</p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 mt-12 lg:mt-0">
            <h3 className="font-[family-name:var(--font-display)] text-[2rem] lg:text-[2.5rem] leading-[1.05] tracking-[-0.022em] text-balance">
              Em 2003, Silvia abriu a{" "}
              <span className="text-display-script">primeira casa</span>{" "}
              do atelier em Teresina.
            </h3>
            <div className="mt-10 space-y-6 text-[17px] leading-[1.65] text-ink-500 text-pretty">
              <p>
                Vinte e três anos depois, são duas Casas — no Teresina Shopping
                e no Shopping Rio Poty — conduzidas pela mesma ideia da primeira
                sala: cada cliente é ouvida antes de ser tocada.
              </p>
              <p>
                A equipe é a casa: cabeleireiras, esteticistas e nail designers
                atendendo nas duas unidades, cada profissional com a sua
                especialidade.
              </p>
              <p>
                A regra continua a mesma: estilo e personalidade traduzidos em
                técnica.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider className="my-12" />

      <section className="container-editorial py-24 lg:py-32">
        <SectionHeader
          index={2}
          eyebrow="A equipe"
          title={
            <>
              Quem está com você na{" "}
              <span className="text-display-script">cadeira.</span>
            </>
          }
          description="A apresentação individual de cada profissional chega em breve. Por enquanto, a casa indica a equipe certa para o seu cabelo no momento do agendamento."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {TEAM.map((m) => (
            <figure key={m.slug} className="group">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-100">
                <Image
                  src={m.imageUrl}
                  alt={m.name}
                  fill
                  sizes="(min-width: 1024px) 30vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="mt-6">
                <p className="text-eyebrow">{m.role}</p>
                <p className="mt-2 font-[family-name:var(--font-display)] italic text-[1.85rem] leading-none">
                  {m.name}
                </p>
                <p className="mt-3 text-[14.5px] leading-[1.6] text-ink-500 max-w-[36ch]">
                  {m.bio}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <FamilyHub variant="default" index={3} />
    </>
  );
}
