"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type StaffFormValue = {
  slug?: string;
  name: string;
  role: "admin" | "manager" | "stylist" | "receptionist";
  bio: string;
  imageUrl: string;
  credentialsCsv: string;
  primaryUnitSlug: string;
};

export type UnitOption = { slug: string; name: string };

const ROLES = [
  { value: "admin", label: "Admin (acesso total)" },
  { value: "manager", label: "Gerente" },
  { value: "stylist", label: "Profissional / Stylist" },
  { value: "receptionist", label: "Recepcionista" },
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

export function StaffForm({
  open,
  onClose,
  initial,
  units,
}: {
  open: boolean;
  onClose: () => void;
  initial?: StaffFormValue;
  units: UnitOption[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const isEditing = !!initial?.slug;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [role, setRole] = useState<StaffFormValue["role"]>("stylist");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [credentialsCsv, setCredentialsCsv] = useState("");
  const [primaryUnitSlug, setPrimaryUnitSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setSlug(initial.slug ?? "");
      setRole(initial.role);
      setBio(initial.bio);
      setImageUrl(initial.imageUrl);
      setCredentialsCsv(initial.credentialsCsv);
      setPrimaryUnitSlug(initial.primaryUnitSlug);
    } else {
      setName("");
      setSlug("");
      setRole("stylist");
      setBio("");
      setImageUrl("");
      setCredentialsCsv("");
      setPrimaryUnitSlug(units[0]?.slug ?? "");
    }
    setError(null);
  }, [open, initial, units]);

  useEffect(() => {
    if (isEditing) return;
    setSlug(slugify(name));
  }, [name, isEditing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const credentials = credentialsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      slug: slug.trim(),
      name: name.trim(),
      role,
      bio: bio.trim(),
      imageUrl: imageUrl.trim() || undefined,
      credentials,
      primaryUnitSlug: primaryUnitSlug || undefined,
    };

    try {
      const res = isEditing
        ? await fetch(`/api/admin/staff/${initial?.slug}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/staff`, {
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
        `Arquivar "${name}"? O profissional não aparecerá mais na lista. Reservas existentes não são afetadas.`,
      )
    )
      return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/staff/${initial.slug}`, {
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
              <p className="text-eyebrow text-gold-deep">Equipe</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[1.75rem] leading-tight">
                {isEditing ? "Editar profissional" : "Novo profissional"}
              </h2>

              <div className="mt-8 space-y-6">
                <div>
                  <Label htmlFor="staff-name">Nome completo</Label>
                  <Input
                    id="staff-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    placeholder="Ex: Silvia Meneses"
                  />
                </div>

                {!isEditing && (
                  <div>
                    <Label htmlFor="staff-slug">Slug (identificador)</Label>
                    <Input
                      id="staff-slug"
                      value={slug}
                      onChange={(e) =>
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        )
                      }
                      required
                      placeholder="silvia-meneses"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="staff-role">Função</Label>
                    <select
                      id="staff-role"
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as StaffFormValue["role"])
                      }
                      className={cn(
                        "w-full h-11 bg-transparent border-b border-[var(--color-rule-strong)] focus:border-ink-700 outline-none text-[15px] font-[family-name:var(--font-display)] italic",
                      )}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="staff-unit">Casa principal</Label>
                    <select
                      id="staff-unit"
                      value={primaryUnitSlug}
                      onChange={(e) => setPrimaryUnitSlug(e.target.value)}
                      className={cn(
                        "w-full h-11 bg-transparent border-b border-[var(--color-rule-strong)] focus:border-ink-700 outline-none text-[15px] font-[family-name:var(--font-display)] italic",
                      )}
                    >
                      <option value="">— Sem casa fixa —</option>
                      {units.map((u) => (
                        <option key={u.slug} value={u.slug}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="staff-bio">Bio curta (opcional)</Label>
                  <Textarea
                    id="staff-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Aparece na página Sobre. Ex: Cabeleireira sênior com 15 anos de experiência em coloração."
                  />
                </div>

                <div>
                  <Label htmlFor="staff-credentials">
                    Credenciais (separadas por vírgula)
                  </Label>
                  <Input
                    id="staff-credentials"
                    value={credentialsCsv}
                    onChange={(e) => setCredentialsCsv(e.target.value)}
                    placeholder="Wella Master, Pivot Point Chicago"
                  />
                  <p className="mt-1.5 text-[11.5px] text-ink-500">
                    Cursos, certificações e formações reais. Não inclua nada
                    que ela não possa comprovar.
                  </p>
                </div>

                <div>
                  <Label htmlFor="staff-image">URL da foto (opcional)</Label>
                  <Input
                    id="staff-image"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <p className="mt-1.5 text-[11.5px] text-ink-500">
                    Sem foto, mostraremos as iniciais editoriais.
                  </p>
                </div>
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
                        ? "Salvar"
                        : "Cadastrar"}
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
