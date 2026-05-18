import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/wordmark";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Silvia's Estetic · Em desenvolvimento",
  description:
    "Estética facial e corporal avançada. Plataforma online em construção. Por enquanto, agendamento pelo Instagram.",
};

export default function EsteticPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-ink-700 text-paper-100 grain pt-20">
        <div className="container-editorial py-24 lg:py-32">
          <div className="grid-editorial">
            <div className="col-span-12 lg:col-span-10 lg:col-start-2 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-eyebrow text-paper-200/60 hover:text-paper-100 transition-colors mb-12"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Silvia&rsquo;s Hair
              </Link>

              <Wordmark size="lg" tone="paper" href="" withMark />

              <p className="mt-8 text-eyebrow text-gold-200">
                Página em desenvolvimento
              </p>

              <h1 className="mt-6 text-balance">
                <span className="text-display-script text-gold-gradient">Estetic</span>{" "}
                em breve.
              </h1>

              <p className="mt-8 max-w-[48ch] mx-auto text-[16px] lg:text-[18px] text-paper-200/80 leading-[1.65]">
                A casa de estética facial e corporal da família Silvia&rsquo;s
                ganhará sua própria plataforma em breve. Por enquanto,
                agendamentos pelo Instagram.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  href="https://instagram.com/silviasteticdesign"
                  target="_blank"
                  variant="gold"
                  size="md"
                >
                  <Instagram className="h-4 w-4" />
                  @silviasteticdesign
                </Button>
                <Button
                  href="https://wa.me/5586981000001"
                  target="_blank"
                  variant="underline"
                  size="md"
                  className="text-paper-100"
                >
                  Falar no WhatsApp
                </Button>
              </div>

              <p className="mt-16 text-[11px] uppercase tracking-[0.22em] text-paper-200/40">
                Família Silvia&rsquo;s · Hair · Barbershop · Estetic
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
