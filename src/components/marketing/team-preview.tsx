import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { TEAM } from "@/lib/data/team";

export function TeamPreview() {
  const founder = TEAM.find((m) => m.slug === "silvia-meneses");

  return (
    <section
      aria-labelledby="team-title"
      className="container-editorial py-24 lg:py-32"
    >
      <SectionHeader
        index={6}
        eyebrow="Equipe"
        title={
          <>
            Quem conduz o seu{" "}
            <span className="text-display-italic">atendimento.</span>
          </>
        }
        description="Você escolhe a profissional na hora do agendamento, ou deixa a casa indicar a equipe certa para o seu cabelo."
      />

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {founder && (
          <figure className="lg:col-span-5">
            <div className="relative aspect-[3/4] w-full overflow-hidden hover-zoom-image bg-ink-100">
              <Image
                src={founder.imageUrl}
                alt={founder.name}
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-6">
              <p className="text-eyebrow">{founder.role}</p>
              <p className="mt-3 font-[family-name:var(--font-display)] italic text-[2rem] lg:text-[2.4rem] leading-none">
                {founder.name}
              </p>
            </figcaption>
          </figure>
        )}

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="font-[family-name:var(--font-display)] text-[1.6rem] lg:text-[1.9rem] leading-[1.15] text-balance">
            Há mais de duas décadas, a Silvia conduz o atelier{" "}
            <span className="text-display-italic">com a mesma regra:</span> cada
            cliente é ouvida antes de ser tocada.
          </p>
          <p className="mt-8 text-[16px] lg:text-[17px] leading-[1.65] text-ink-500 max-w-[52ch]">
            Uma equipe completa de profissionais — cabeleireiras, esteticistas,
            nail designers — atende nas duas Casas. A apresentação individual de
            cada uma delas chega em breve.
          </p>

          <div className="mt-10">
            <Button href="/sobre" variant="underline" size="md">
              Conhecer a história do atelier
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
