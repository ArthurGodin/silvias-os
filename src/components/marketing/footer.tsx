import Link from "next/link";
import { Instagram, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { EditorialLink } from "@/components/ui/editorial-link";
import { UNITS } from "@/lib/data/units";
import { CATEGORIES } from "@/lib/data/services";
import { FAMILY } from "@/lib/data/family";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink-700 text-paper-100 mt-32">
      <div className="container-editorial py-20 lg:py-28">
        <div className="grid-editorial gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <Wordmark size="lg" href="/" tone="paper" />
            <p className="mt-6 max-w-[36ch] text-[15px] leading-[1.65] text-paper-200/80">
              Estilo &amp; personalidade. Atelier de cabelo em duas casas
              premium de Teresina desde 2003.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="https://instagram.com/silvias_hair"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @silvias_hair"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper-200/30 transition-colors hover:bg-paper-100 hover:text-ink-700"
              >
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <nav className="col-span-6 lg:col-span-2 lg:col-start-6">
            <h4 className="text-eyebrow text-paper-200/70 mb-6">Atelier</h4>
            <ul className="space-y-3">
              <li><EditorialLink href="/servicos" className="text-[14px] text-paper-100">Serviços</EditorialLink></li>
              <li><EditorialLink href="/combos" className="text-[14px] text-paper-100">Combos especiais</EditorialLink></li>
              <li><EditorialLink href="/galeria" className="text-[14px] text-paper-100">Galeria</EditorialLink></li>
              <li><EditorialLink href="/sobre" className="text-[14px] text-paper-100">Sobre</EditorialLink></li>
              <li><EditorialLink href="/unidades" className="text-[14px] text-paper-100">Unidades</EditorialLink></li>
              <li><EditorialLink href="/agendar" className="text-[14px] text-paper-100">Agendar</EditorialLink></li>
            </ul>
          </nav>

          <nav className="col-span-6 lg:col-span-2">
            <h4 className="text-eyebrow text-paper-200/70 mb-6">Serviços</h4>
            <ul className="space-y-3">
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <EditorialLink
                    href={`/servicos/${c.slug}`}
                    className="text-[14px] text-paper-100"
                  >
                    {c.shortTitle}
                  </EditorialLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-12 lg:col-span-4">
            <h4 className="text-eyebrow text-paper-200/70 mb-6">Casas</h4>
            <ul className="space-y-8">
              {UNITS.map((u) => (
                <li key={u.slug}>
                  <p className="font-[family-name:var(--font-display)] italic text-[1.35rem] leading-none">
                    {u.name}
                  </p>
                  <p className="mt-2 text-[13px] text-paper-200/85">
                    {u.shoppingName}
                  </p>
                  <p className="mt-1 text-[13px] text-paper-200/65 flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 mt-1 flex-none" />
                    <span>{u.address}</span>
                  </p>
                  <p className="mt-1 text-[13px] text-paper-200/65 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${u.phone.replace(/\D/g, "")}`} className="hover:text-paper-100">
                      {u.phone}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-paper-200/15">
          <p className="text-eyebrow text-paper-200/55 mb-6">Família Silvia&rsquo;s</p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FAMILY.map((b) => {
              const active = b.status === "active";
              return (
                <li key={b.slug}>
                  <Link
                    href={(active && b.href ? b.href : b.instagram) as never}
                    target={!active ? "_blank" : undefined}
                    rel={!active ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-3 p-4 border border-paper-200/15 hover:border-paper-200/40 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-[family-name:var(--font-display)] italic text-[1.15rem] leading-tight">
                        {b.name}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-paper-200/55 mt-1">
                        {active ? b.tagline : "Em breve"}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-paper-200/40 transition-all duration-500 group-hover:rotate-45 group-hover:text-paper-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 pt-8 border-t border-paper-200/15 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <p className="text-[12px] uppercase tracking-[0.22em] text-paper-200/60">
            © {year} Silvia&rsquo;s Hair · Teresina, Piauí
          </p>
          <div className="flex items-center gap-6 text-[12px] uppercase tracking-[0.22em] text-paper-200/60">
            <Link href="/privacidade" className="hover:text-paper-100">Política de privacidade</Link>
            <Link href="/termos" className="hover:text-paper-100">Termos de uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
