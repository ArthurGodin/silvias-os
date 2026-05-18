import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Avatar } from "@/components/ui/avatar";
import { listClients } from "@/lib/admin/queries";
import { formatBRL } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter, q } = await searchParams;
  let clients = await listClients({ limit: 200 });

  if (filter === "inactive") clients = clients.filter((c) => c.isInactive);
  if (filter === "vip") clients = [...clients].sort((a, b) => b.lifetimeValueCents - a.lifetimeValueCents);
  if (q) {
    const needle = q.toLowerCase();
    clients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        (c.email ?? "").toLowerCase().includes(needle) ||
        c.phone.includes(needle),
    );
  }

  return (
    <main className="px-8 lg:px-12 py-10 lg:py-14">
      <header className="flex items-end justify-between mb-12">
        <div>
          <p className="text-eyebrow">CRM</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)]">
            <span className="text-display-italic">Clientes</span>
          </h1>
        </div>
        <form className="flex items-center gap-3" action="/admin/clientes">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nome, telefone ou e-mail"
            className="w-72 h-10 px-4 bg-transparent border-b border-[var(--color-rule-strong)] text-[14px] focus:outline-none focus:border-ink-700"
          />
          <button
            type="submit"
            className="h-10 px-4 text-[12px] uppercase tracking-[0.18em] bg-ink-700 text-paper-100"
          >
            Buscar
          </button>
        </form>
      </header>

      <nav className="flex items-center gap-2 mb-8" aria-label="Filtros">
        {[
          { href: "/admin/clientes", label: "Todas", active: !filter },
          { href: "/admin/clientes?filter=inactive", label: "Inativas", active: filter === "inactive" },
          { href: "/admin/clientes?filter=vip", label: "Top spenders", active: filter === "vip" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href as never}
            className={cn(
              "inline-flex items-center px-4 h-9 text-[11px] uppercase tracking-[0.2em] border transition-colors",
              tab.active
                ? "bg-ink-700 text-paper-100 border-ink-700"
                : "bg-transparent border-[var(--color-rule)] hover:border-[var(--color-rule-strong)]",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/admin/clientes/${c.id}`}
            className="group border border-[var(--color-rule)] bg-paper-50 p-6 hover:bg-paper-200/40 transition-colors block"
          >
            <div className="flex items-start gap-4">
              <Avatar name={c.name} size="md" className="flex-none" />
              <div className="flex-1 min-w-0">
                <p className="font-[family-name:var(--font-display)] italic text-[1.35rem] leading-tight truncate">
                  {c.name}
                </p>
                <p className="text-[12.5px] text-ink-500 truncate mt-1">{c.email ?? "—"}</p>
                <p className="text-[12.5px] text-ink-500">{c.phone}</p>
              </div>
              {c.isInactive && (
                <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-amber-100 text-amber-900">
                  Inativa
                </span>
              )}
            </div>
            <dl className="mt-5 pt-4 border-t border-[var(--color-rule)] grid grid-cols-3 gap-2 text-[12px]">
              <div>
                <dt className="text-eyebrow">LTV</dt>
                <dd className="mt-1 tabular-nums">{formatBRL(c.lifetimeValueCents / 100)}</dd>
              </div>
              <div>
                <dt className="text-eyebrow">Visitas</dt>
                <dd className="mt-1 tabular-nums">{c.visitCount}</dd>
              </div>
              <div>
                <dt className="text-eyebrow">Última</dt>
                <dd className="mt-1">
                  {c.lastSeenAt ? format(c.lastSeenAt, "dd MMM", { locale: ptBR }) : "—"}
                </dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="border border-dashed border-[var(--color-rule)] bg-paper-50 px-8 py-16 text-center mt-8">
          <p className="text-eyebrow text-gold-deep">Sem clientes ainda</p>
          <p className="mt-3 text-[15px] text-ink-500 max-w-md mx-auto leading-[1.6]">
            {q || filter
              ? "Nenhuma cliente bate com os filtros atuais. Limpa pra ver todas."
              : "Os primeiros agendamentos pelo site criam o cadastro automaticamente aqui."}
          </p>
        </div>
      )}
    </main>
  );
}
