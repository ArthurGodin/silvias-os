import { Hero } from "@/components/marketing/hero";
import { Manifesto } from "@/components/marketing/manifesto";
import { AtelierPanel } from "@/components/marketing/atelier-panel";
import { ServicesPreview } from "@/components/marketing/services-preview";
import { CombosSpecial } from "@/components/marketing/combos-special";
import { GalleryPreview } from "@/components/marketing/gallery-preview";
import { TeamPreview } from "@/components/marketing/team-preview";
import { UnitsSection } from "@/components/marketing/units-section";
import { CtaFinal } from "@/components/marketing/cta-final";
import { Reveal } from "@/components/ui/reveal";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Reveal><Manifesto /></Reveal>
      <AtelierPanel />
      <CombosSpecial />
      <Reveal><ServicesPreview /></Reveal>
      <Reveal><GalleryPreview /></Reveal>
      <Reveal><TeamPreview /></Reveal>
      <Reveal><UnitsSection /></Reveal>
      <CtaFinal />
    </>
  );
}
