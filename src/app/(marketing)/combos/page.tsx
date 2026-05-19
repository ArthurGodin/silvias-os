export const dynamic = "force-static";

import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/section-header";
import { CombosSpecial } from "@/components/marketing/combos-special";
import { CtaFinal } from "@/components/marketing/cta-final";

export const metadata: Metadata = {
  title: "Combos especiais",
  description:
    "Cinco combos fechados com desconto · Válidos de segunda a quarta. Sobrancelhas, hidratação, coloração, escova e depilação.",
};

export default function CombosPage() {
  return (
    <>
      <section className="container-editorial pt-32 lg:pt-48 pb-4">
        <SectionHeader
          index={1}
          eyebrow="Promoção · 2026"
          title={
            <>
              Pacotes pensados para{" "}
              <span className="text-display-script text-gold-gradient">você.</span>
            </>
          }
          description="Combinações que nossas clientes mais pedem, montadas com preço promocional. Válidas de segunda a quarta-feira, exceto feriados."
        />
      </section>
      <CombosSpecial />
      <CtaFinal />
    </>
  );
}
