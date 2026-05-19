"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type ServiceFormValue = {
  slug?: string;
  name: string;
  categorySlug: "cabelo" | "estetica" | "unhas" | "depilacao";
  description: string;
  durationMinutes: number;
  fromPriceReais: number;
  requiresDeposit: boolean;
};

const CATEGORIES = [
  { value: "cabelo", label: "Cabelo" },
  { value: "estetica", label: "Estética" },
  { value: "unhas", label: "Unhas" },
  { value: "depilacao", label: "Depilação" },
] as const;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function ServiceForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: ServiceFormValue;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const isEditing = !!initial?.slug;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categorySlug, setCategorySlug] =
    useState<ServiceFormValue["categorySlug"]>("cabelo");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [fromPriceReais, setFromPriceReais] = useState("0");
  const [requiresDeposit, setRequiresDeposit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quando o modal abre, popula com os dados (se for edit) ou reseta (se novo)
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setSlug(initial.slug ?? "");
      setCategorySlug(initial.categorySlug);
      setDescription(initial.description);
      setDurationMinutes(String(initial.durationMinutes));
      setFromPriceReais(String(initial.fromPriceReais));
      setRequiresDeposit(initial.requiresDeposit);
    } else {
      setName("");
      setSlug("");
      setCategorySlug("cabelo");
      setDescription("");
      setDurationMinutes("60");
      setFromPriceReais("0");
      setRequiresDeposit(false);
    }
    setError(null);
  }, [open, initial]);

  // Auto-gera slug quando o nome muda (só no modo "novo")
  useEffect(() => {
    if (isEditing) return;
    setSlug(slugify(name));
  }, [name, isEditing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      slug: slug.trim(),
      name: name.trim(),
      categorySlug,
      description: description.trim(),
      durationMinutes: Number(durationMinutes),
      fromPriceCents: Math.round(Number(fromPriceReais) * 100),
      requiresDeposit,
    };

    try {
      const res = isEditing
        ? await fetch(`/api/admin/services/${initial?.slug}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/services`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Falha ao salvar.");
        setSubmitting(false);
        return;
      }

      onClose();
      startTransition(() => router.refresh());
    } catch {
      setError("Falha de rede.");
      setSubmitting(false);
    }
  }

  async function handleArchive() {
    if (!initial?.slug) return;
    if (
      !confirm(
        `Arquivar "${name}"? O serviço não aparecerá mais na lista pública. Reservas existentes não são afetadas.`,
      )
    )
      return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${initial.slug}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Falha ao arquivar.");
        setSubmitting(false);
        return;
      }
      onClose();
      startTransition(() => router.refresh());
    } catch {
      setError("Falha de rede.");
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-ink-900/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-paper-50 border border-[var(--color-rule-strong)] max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              aria-label="Fechar"
              onClick={onClose}
              className="absolute top-4 right-4 text-ink-500 hover:text-ink-700 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleSubmit} className="p-6 lg:p-8">
              <p className="text-eyebrow text-gold-deep">Catálogo</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[1.75rem] leading-tight">
                {isEditing ? "Editar serviço" : "Novo serviço"}
              </h2>

              <div className="mt-8 space-y-6">
                <div>
                  <Label htmlFor="svc-name">Nome do serviço</Label>
                  <Input
                    id="svc-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    placeholder="Ex: Hidratação profunda"
                  />
                </div>

                {!isEditing && (
                  <div>
                    <Label htmlFor="svc-slug">Slug (identificador)</Label>
                    <Input
                      id="svc-slug"
                      value={slug}
                      onChange={(e) =>
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        )
                      }
                      required
                      pattern="^[a-z0-9-]+$"
                      placeholder="hidratacao-profunda"
                    />
                    <p className="mt-1.5 text-[11.5px] text-ink-500">
                      Letras minúsculas, números e hífens. Auto-gerado a partir
                      do nome.
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="svc-cat">Categoria</Label>
                  <select
                    id="svc-cat"
                    value={categorySlug}
                    onChange={(e) =>
                      setCategorySlug(
                        e.target
                          .value as ServiceFormValue["categorySlug"],
                      )
                    }
                    className={cn(
                      "w-full h-11 bg-transparent border-b border-[var(--color-rule-strong)] focus:border-ink-700 outline-none text-[15px] font-[family-name:var(--font-display)] italic",
                    )}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="svc-duration">Duração (min)</Label>
                    <Input
                      id="svc-duration"
                      type="number"
                      min={5}
                      max={480}
                      step={5}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="svc-price">Preço a partir de (R$)</Label>
                    <Input
                      id="svc-price"
                      type="number"
                      min={0}
                      step={0.5}
                      value={fromPriceReais}
                      onChange={(e) => setFromPriceReais(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="svc-desc">Descrição (opcional)</Label>
                  <Textarea
                    id="svc-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Como você descreveria esse atendimento? Aparece na página do catálogo."
                  />
                </div>

                <Checkbox
                  checked={requiresDeposit}
                  onChange={setRequiresDeposit}
                >
                  <strong>Exige sinal Pix de 30%</strong>
                  <span className="block mt-1 text-[12.5px] text-ink-500">
                    Use para serviços longos/caros (coloração, alisamento).
                    Cliente paga 30% no momento do agendamento.
                  </span>
                </Checkbox>
              </div>

              {error && (
                <div className="mt-6 flex items-start gap-2 text-[13px] text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-none" />
                  <p>{error}</p>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-3">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleArchive}
                    disabled={submitting}
                    className="text-[12px] uppercase tracking-[0.2em] text-red-700 hover:text-red-900 transition-colors editorial-link"
                  >
                    Arquivar
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="underline"
                    size="sm"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="ink"
                    size="md"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Salvando..."
                      : isEditing
                        ? "Salvar mudanças"
                        : "Criar serviço"}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
