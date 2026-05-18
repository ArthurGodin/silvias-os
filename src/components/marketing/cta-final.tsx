import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaFinal() {
  return (
    <section
      aria-labelledby="cta-title"
      className="bg-ink-700 text-paper-100 grain"
    >
      <div className="container-editorial py-32 lg:py-48 text-center">
        <span className="text-eyebrow text-paper-200/60">IX. Próximo passo</span>
        <h2
          id="cta-title"
          className="mt-6 text-balance max-w-[20ch] mx-auto"
        >
          O atelier{" "}
          <span className="text-display-italic">te espera.</span>
        </h2>
        <p className="mt-8 max-w-[44ch] mx-auto text-[18px] leading-[1.6] text-paper-200/85">
          Trinta segundos no celular. Seu serviço, sua casa, sua profissional.
          Confirmação imediata.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/agendar" variant="gold" size="lg">
            Agendar atendimento
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            href="https://wa.me/5586981000001"
            variant="underline"
            size="lg"
            target="_blank"
            className="text-paper-100"
          >
            Falar pelo WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
