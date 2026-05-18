import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TEAM } from "@/lib/data/team";

export default function AdminEquipePage() {
  return (
    <main className="px-8 lg:px-12 py-10 lg:py-14">
      <header className="flex items-end justify-between mb-12">
        <div>
          <p className="text-eyebrow">Operação</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)]">
            <span className="text-display-italic">Equipe</span>
          </h1>
        </div>
        <Button variant="ink" size="md">+ Cadastrar profissional</Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {TEAM.map((m) => (
          <article
            key={m.slug}
            className="border border-[var(--color-rule)] bg-paper-50 p-6 flex gap-6"
          >
            <div className="relative h-32 w-24 flex-none overflow-hidden bg-ink-100">
              <Image
                src={m.imageUrl}
                alt={m.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-eyebrow">{m.role}</p>
              <p className="font-[family-name:var(--font-display)] italic text-[1.5rem] leading-tight mt-1">
                {m.name}
              </p>
              <p className="mt-3 text-[13px] text-ink-500 line-clamp-2">{m.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {m.credentials.slice(0, 2).map((c) => (
                  <span
                    key={c}
                    className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 border border-[var(--color-rule)] text-ink-600"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-[12px] text-muted">
                <span>{m.unitSlugs.length} {m.unitSlugs.length === 1 ? "casa" : "casas"}</span>
                <span>·</span>
                <span>{m.serviceSlugs.length} serviços</span>
                <button className="ml-auto editorial-link uppercase tracking-[0.18em]">
                  Editar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
