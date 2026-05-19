"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceForm, type ServiceFormValue } from "./service-form";

export type ServiceRow = {
  slug: string;
  name: string;
  categorySlug: "cabelo" | "estetica" | "unhas" | "depilacao";
  categoryTitle: string;
  description: string;
  durationMinutes: number;
  fromPriceReais: number;
  requiresDeposit: boolean;
  isActive: boolean;
};

export function ServicesPageClient({
  groups,
}: {
  groups: { categorySlug: string; title: string; items: ServiceRow[] }[];
}) {
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ServiceFormValue | undefined>(
    undefined,
  );

  function openNew() {
    setEditing(undefined);
    setOpenForm(true);
  }

  function openEdit(row: ServiceRow) {
    setEditing({
      slug: row.slug,
      name: row.name,
      categorySlug: row.categorySlug,
      description: row.description,
      durationMinutes: row.durationMinutes,
      fromPriceReais: row.fromPriceReais,
      requiresDeposit: row.requiresDeposit,
    });
    setOpenForm(true);
  }

  return (
    <>
      <header className="flex items-end justify-between mb-12 gap-4">
        <div>
          <p className="text-eyebrow">Catálogo</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)]">
            <span className="text-display-italic">Serviços</span>
          </h1>
        </div>
        <Button type="button" variant="ink" size="md" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo serviço
        </Button>
      </header>

      <div className="space-y-14">
        {groups.map((group, gi) => (
          <section key={group.categorySlug}>
            <div className="flex items-baseline justify-between mb-6">
              <div className="flex items-baseline gap-4">
                <span className="text-eyebrow text-gold-deep tabular-nums">
                  N° {String(gi + 1).padStart(2, "0")}
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] lg:text-[2rem] leading-none">
                  {group.title}
                </h2>
              </div>
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {group.items.length}{" "}
                {group.items.length === 1 ? "item" : "itens"}
              </span>
            </div>

            <div className="border border-[var(--color-rule)] bg-paper-50 overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-[var(--color-rule)]">
                    <th className="px-6 py-4 text-left text-eyebrow">
                      Serviço
                    </th>
                    <th className="px-6 py-4 text-left text-eyebrow w-28">
                      Duração
                    </th>
                    <th className="px-6 py-4 text-right text-eyebrow w-32">
                      Valor base
                    </th>
                    <th className="px-6 py-4 text-left text-eyebrow w-24">
                      Sinal
                    </th>
                    <th className="px-6 py-4 text-right text-eyebrow w-24">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((row) => (
                    <tr
                      key={row.slug}
                      className="border-b border-[var(--color-rule)] last:border-b-0 hover:bg-paper-100 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <p className="font-[family-name:var(--font-display)] italic text-[1.2rem] leading-tight">
                          {row.name}
                        </p>
                        {row.description && (
                          <p className="mt-1.5 text-[12.5px] text-ink-500 leading-snug max-w-md">
                            {row.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5 text-[14px] tabular-nums">
                        {row.durationMinutes} min
                      </td>
                      <td className="px-6 py-5 text-right tabular-nums text-[14px]">
                        R$ {row.fromPriceReais.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-6 py-5 text-[12px]">
                        {row.requiresDeposit ? (
                          <span className="text-gold-deep">30% Pix</span>
                        ) : (
                          <span className="text-ink-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="text-[11px] uppercase tracking-[0.2em] editorial-link"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {group.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-[13px] text-ink-500"
                      >
                        Nenhum serviço nessa categoria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <ServiceForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        initial={editing}
      />
    </>
  );
}
