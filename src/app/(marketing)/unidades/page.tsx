import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { UNITS } from "@/lib/data/units";

export const metadata: Metadata = {
  title: "Unidades",
  description:
    "Duas casas em shoppings premium de Teresina: Casa I no Teresina Shopping e Casa II no Shopping Rio Poty.",
};

export default function UnidadesPage() {
  return (
    <>
      <section className="container-editorial pt-32 lg:pt-48 pb-16 lg:pb-24">
        <SectionHeader
          index={1}
          eyebrow="Casas"
          title={
            <>
              Duas casas em{" "}
              <span className="text-display-italic">Teresina.</span>
            </>
          }
          description="Ambas dentro de shoppings premium, com estrutura completa para cortes, coloração, tratamentos, unhas e estética."
        />
      </section>

      <section className="pb-32">
        {UNITS.map((u, i) => (
          <article
            key={u.slug}
            id={u.slug}
            className={`scroll-mt-24 ${i % 2 === 1 ? "bg-paper-200/40" : ""}`}
          >
            <div className="container-editorial py-20 lg:py-28">
              <div className={`grid-editorial items-center ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}>
                <div className={`col-span-12 lg:col-span-6 ${i % 2 === 1 ? "lg:[direction:ltr]" : ""}`}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden hover-zoom-image">
                    <Image
                      src={u.imageUrl}
                      alt={`Casa ${u.name} — ${u.shoppingName}`}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className={`col-span-12 lg:col-span-5 lg:col-start-8 ${i % 2 === 1 ? "lg:[direction:ltr] lg:col-start-2" : ""}`}>
                  <span className="text-eyebrow">
                    N° {String(i + 1).padStart(2, "0")} · Casa
                  </span>
                  <h2 className="mt-4">{u.name}</h2>
                  <p className="mt-3 font-[family-name:var(--font-display)] italic text-[1.5rem] text-ink-500">
                    {u.shoppingName}
                  </p>

                  <dl className="mt-10 space-y-6">
                    <div>
                      <dt className="text-eyebrow mb-2">Endereço</dt>
                      <dd className="flex items-start gap-3 text-[15px]">
                        <MapPin className="h-4 w-4 mt-1 text-ink-500" />
                        <span>
                          {u.address}
                          <br />
                          <span className="text-ink-500">{u.floor}</span>
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-eyebrow mb-2">Contato</dt>
                      <dd className="flex items-center gap-3 text-[15px]">
                        <Phone className="h-4 w-4 text-ink-500" />
                        <a
                          href={`tel:${u.phone.replace(/\D/g, "")}`}
                          className="editorial-link"
                        >
                          {u.phone}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-eyebrow mb-2">Horários</dt>
                      <dd className="space-y-1 text-[15px]">
                        {u.hours.map((h) => (
                          <p
                            key={h.day}
                            className="flex items-center gap-3"
                          >
                            <Clock className="h-4 w-4 text-ink-500" />
                            <span className="font-medium w-16">{h.day}</span>
                            <span className="text-ink-500">
                              {h.open}–{h.close}
                            </span>
                          </p>
                        ))}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-12 flex flex-col sm:flex-row gap-3">
                    <Button href="/agendar" variant="ink" size="md">
                      Agendar nesta casa
                    </Button>
                    <Button
                      href={u.mapsUrl}
                      target="_blank"
                      variant="underline"
                      size="md"
                    >
                      Ver no mapa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
