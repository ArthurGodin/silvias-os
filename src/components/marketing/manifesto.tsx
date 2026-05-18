import { SectionDivider } from "@/components/ui/section-divider";

export function Manifesto() {
  return (
    <section
      aria-labelledby="manifesto-title"
      className="container-editorial py-20 lg:py-32"
    >
      <div className="grid-editorial">
        <div className="col-span-12 lg:col-span-2">
          <span className="text-eyebrow">II · Manifesto</span>
        </div>
        <div className="col-span-12 lg:col-span-10">
          <h2 id="manifesto-title" className="text-balance">
            Cuidar é{" "}
            <span className="text-display-script text-gold-gradient">
              método.
            </span>{" "}
            É escutar antes de tocar. É escolher o produto certo. É finalizar
            como se cada cliente fosse a única do dia.
          </h2>

          <SectionDivider className="my-10 lg:my-12" />

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mt-10">
            <p className="text-[17px] lg:text-[18px] leading-[1.7] text-ink-500 text-pretty">
              Há vinte e três anos, Silvia Meneses fundou o atelier com uma
              convicção simples: técnica internacional não cabe só em capital
              grande. Trouxe escola de Londres, Milão, Barcelona e Chicago — e
              adaptou para o fio piauiense.
            </p>
            <p className="text-[17px] lg:text-[18px] leading-[1.7] text-ink-500 text-pretty">
              Hoje somos duas casas, mais de quatorze profissionais, e uma
              regra inegociável: ninguém sai daqui sem ter sido lida, ouvida e
              respeitada. Estilo não é o que está nas redes — é o que combina
              com você na segunda-feira de manhã.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
