import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative min-h-[100svh] flex items-end overflow-hidden bg-ink-700 grain"
    >
      <Image
        src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2400&q=85"
        alt="Atelier Silvia's Hair em atendimento"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-75"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/55 to-ink-900/55" />

      <div className="relative container-editorial pt-28 pb-16 lg:pt-32 lg:pb-24 w-full">
        <div className="grid-editorial">
          <div className="col-span-12 lg:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-gold-200">
              Atelier · desde 2003
            </span>
          </div>
          <div className="col-span-12 lg:col-span-10">
            <h1
              className="reveal-up text-paper-100 text-balance mt-5 lg:mt-0 text-[clamp(2.5rem,7vw,6rem)] leading-[1.03]"
              style={{
                fontVariationSettings: "'SOFT' 50, 'WONK' 1, 'opsz' 144",
              }}
            >
              Estilo &amp;{" "}
              <span className="text-display-script text-gold-gradient">
                personalidade
              </span>
              <br className="hidden md:block" />
              traduzidos em técnica.
            </h1>

            <p
              className="reveal-up mt-8 max-w-[52ch] text-[17px] lg:text-[20px] leading-[1.6] text-paper-200/90"
              style={{ animationDelay: "120ms" }}
            >
              Há 23 anos, o atelier mais técnico de Teresina. Cabelo, estética,
              unhas e depilação conduzidos por uma equipe com formação
              internacional.
            </p>

            <p
              className="reveal-up mt-5 text-[12px] uppercase tracking-[0.22em] text-gold-200"
              style={{ animationDelay: "200ms" }}
            >
              <span className="inline-block h-px w-6 align-middle bg-current opacity-60 mr-2" />
              Primeira vez? Agende e a casa cuida do resto.
            </p>

            <div
              className="reveal-up mt-12 flex flex-col sm:flex-row gap-5 sm:gap-6 sm:items-center"
              style={{ animationDelay: "260ms" }}
            >
              <Button
                href="/agendar"
                variant="gold"
                size="lg"
                className="w-full sm:w-auto justify-center"
              >
                Agendar atendimento
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                href="/servicos"
                variant="underline"
                size="lg"
                className="text-paper-100 sm:ml-2"
              >
                Conhecer serviços
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 lg:bottom-10 lg:right-12 hidden md:flex flex-col items-end gap-2 text-paper-200/70">
        <span className="text-[10px] uppercase tracking-[0.24em] text-paper-200/65">
          Casas em
        </span>
        <p className="font-[family-name:var(--font-display)] italic text-[1rem] lg:text-[1.1rem] leading-tight text-right text-paper-100/90">
          Teresina Shopping
          <br />
          Shopping Rio Poty
        </p>
      </div>
    </section>
  );
}
