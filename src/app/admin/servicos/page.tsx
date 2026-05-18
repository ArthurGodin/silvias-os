import { Button } from "@/components/ui/button";
import { CATEGORIES, SERVICES } from "@/lib/data/services";
import { formatBRL } from "@/lib/utils";

export default function AdminServicosPage() {
  return (
    <main className="px-8 lg:px-12 py-10 lg:py-14">
      <header className="flex items-end justify-between mb-12">
        <div>
          <p className="text-eyebrow">Catálogo</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)]">
            <span className="text-display-italic">Serviços</span>
          </h1>
        </div>
        <Button variant="ink" size="md">+ Novo serviço</Button>
      </header>

      <div className="space-y-10">
        {CATEGORIES.map((cat) => {
          const services = SERVICES.filter((s) => s.category === cat.slug);
          return (
            <section key={cat.slug}>
              <header className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-eyebrow">N° {String(cat.index).padStart(2, "0")}</p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-[1.75rem]">
                    {cat.title}
                  </h2>
                </div>
                <span className="text-eyebrow">{services.length} itens</span>
              </header>

              <div className="border border-[var(--color-rule)] bg-paper-50">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)]">
                      <th className="px-6 py-3 text-left text-eyebrow">Serviço</th>
                      <th className="px-6 py-3 text-left text-eyebrow">Duração</th>
                      <th className="px-6 py-3 text-right text-eyebrow">Valor base</th>
                      <th className="px-6 py-3 text-left text-eyebrow">Sinal</th>
                      <th className="px-6 py-3 text-right text-eyebrow">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr
                        key={s.slug}
                        className="border-b border-[var(--color-rule)] last:border-b-0 hover:bg-paper-100 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-[family-name:var(--font-display)] italic text-[1.15rem]">
                            {s.name}
                          </p>
                          <p className="text-[12px] text-ink-500 mt-0.5">{s.description}</p>
                        </td>
                        <td className="px-6 py-4 tabular-nums text-[14px]">{s.duration} min</td>
                        <td className="px-6 py-4 tabular-nums text-right text-[14px]">
                          {formatBRL(s.fromPrice)}
                        </td>
                        <td className="px-6 py-4 text-[12px]">
                          {s.requiresDeposit ? (
                            <span className="inline-flex px-2 py-1 bg-gold-mist text-ink-800 uppercase tracking-[0.18em]">
                              30%
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[12px] uppercase tracking-[0.18em] editorial-link">
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
