"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  StaffForm,
  type StaffFormValue,
  type UnitOption,
} from "./staff-form";

export type StaffRow = {
  slug: string;
  name: string;
  role: "admin" | "manager" | "stylist" | "receptionist";
  roleLabel: string;
  bio: string;
  imageUrl: string;
  credentials: string[];
  primaryUnitSlug: string;
  primaryUnitName: string;
  serviceCount: number;
  unitCount: number;
};

export function StaffPageClient({
  rows,
  units,
}: {
  rows: StaffRow[];
  units: UnitOption[];
}) {
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<StaffFormValue | undefined>(
    undefined,
  );

  function openNew() {
    setEditing(undefined);
    setOpenForm(true);
  }

  function openEdit(row: StaffRow) {
    setEditing({
      slug: row.slug,
      name: row.name,
      role: row.role,
      bio: row.bio,
      imageUrl: row.imageUrl,
      credentialsCsv: row.credentials.join(", "),
      primaryUnitSlug: row.primaryUnitSlug,
    });
    setOpenForm(true);
  }

  return (
    <>
      <header className="flex items-end justify-between mb-12 gap-4">
        <div>
          <p className="text-eyebrow">Operação</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)]">
            <span className="text-display-italic">Equipe</span>
          </h1>
        </div>
        <Button type="button" variant="ink" size="md" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Cadastrar profissional
        </Button>
      </header>

      {rows.length === 0 ? (
        <div className="border border-dashed border-[var(--color-rule)] bg-paper-50 p-12 text-center">
          <p className="text-[15px] text-ink-500 max-w-md mx-auto leading-[1.6]">
            Ainda não há profissionais cadastradas. Cadastre a primeira para
            que ela apareça no site público e possa receber agendamentos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((row) => (
            <article
              key={row.slug}
              className="border border-[var(--color-rule)] bg-paper-50 p-6 lg:p-7"
            >
              <div className="flex items-start gap-5">
                {row.imageUrl ? (
                  <div className="relative h-20 w-20 lg:h-24 lg:w-24 flex-none rounded-full overflow-hidden bg-paper-200">
                    <Image
                      src={row.imageUrl}
                      alt={row.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <Avatar name={row.name} size="lg" className="flex-none" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-eyebrow text-gold-deep uppercase">
                    {row.roleLabel}
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] italic text-[1.4rem] leading-tight">
                    {row.name}
                  </p>
                  {row.bio && (
                    <p className="mt-2 text-[13px] text-ink-500 leading-[1.55] max-w-prose">
                      {row.bio}
                    </p>
                  )}
                </div>
              </div>

              {row.credentials.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {row.credentials.map((c) => (
                    <li
                      key={c}
                      className="text-[10.5px] uppercase tracking-[0.16em] px-2.5 py-1 border border-[var(--color-rule)] text-ink-600"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 pt-5 border-t border-[var(--color-rule)] flex items-center justify-between gap-2 text-[12px] text-ink-500">
                <span>
                  {row.primaryUnitName || "Sem casa fixa"} · {row.unitCount}{" "}
                  {row.unitCount === 1 ? "casa" : "casas"} · {row.serviceCount}{" "}
                  {row.serviceCount === 1 ? "serviço" : "serviços"}
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="text-[11px] uppercase tracking-[0.2em] editorial-link"
                >
                  Editar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <StaffForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        initial={editing}
        units={units}
      />
    </>
  );
}
