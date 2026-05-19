"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Check, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  bookingId: string;
  initialNotes: string | null;
  status: string;
};

export function StylistActions({ bookingId, initialNotes, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [product, setProduct] = useState("");
  const [formula, setFormula] = useState("");
  const [feedback, setFeedback] = useState<
    { tone: "ok" | "error"; text: string } | null
  >(null);

  const isCompleted = status === "completed";
  const isCancelled = status.startsWith("cancelled") || status === "no_show";

  async function call(action: "save_notes" | "check_in" | "complete") {
    setFeedback(null);
    const res = await fetch(`/api/equipe/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        stylistNotes: notes || undefined,
        productUsed: product || undefined,
        formulaUsed: formula || undefined,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      error?: string;
      status?: string;
    };
    if (!res.ok) {
      setFeedback({
        tone: "error",
        text: json.error ?? "Falha na operação. Tente de novo.",
      });
      return;
    }
    setFeedback({
      tone: "ok",
      text:
        action === "save_notes"
          ? "Anotação salva."
          : action === "check_in"
            ? "Check-in registrado."
            : "Atendimento concluído.",
    });
    startTransition(() => router.refresh());
  }

  if (isCancelled) {
    return (
      <p className="mt-8 text-[13px] text-ink-500 border border-dashed border-[var(--color-rule)] p-4">
        Esse agendamento foi cancelado. Sem ações disponíveis.
      </p>
    );
  }

  return (
    <section className="mt-8 space-y-5">
      <div>
        <Label htmlFor="stylist-notes" className="mb-2 block">
          Anotações pós-atendimento
        </Label>
        <Textarea
          id="stylist-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Fórmula usada, produto aplicado, observações sobre o fio…"
          rows={5}
          disabled={pending}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product-used" className="mb-2 block">
            Produto principal
          </Label>
          <Input
            id="product-used"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Ex: Kérastase Chronologiste"
            disabled={pending}
          />
        </div>
        <div>
          <Label htmlFor="formula-used" className="mb-2 block">
            Fórmula
          </Label>
          <Input
            id="formula-used"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Ex: Wella 7N + 6.7 (1:1) · 20 vol"
            disabled={pending}
          />
        </div>
      </div>

      {feedback && (
        <p
          className={
            feedback.tone === "ok"
              ? "text-[12.5px] text-emerald-700"
              : "text-[12.5px] text-red-700"
          }
        >
          {feedback.text}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {!isCompleted && status !== "checked_in" && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => call("check_in")}
            disabled={pending}
          >
            <LogIn className="h-3.5 w-3.5" />
            Check-in
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => call("save_notes")}
          disabled={pending}
        >
          <Save className="h-3.5 w-3.5" />
          Salvar anotações
        </Button>
        {!isCompleted && (
          <Button
            type="button"
            variant="ink"
            size="md"
            className="flex-1"
            onClick={() => call("complete")}
            disabled={pending}
          >
            <Check className="h-3.5 w-3.5" />
            Concluir atendimento
          </Button>
        )}
      </div>
    </section>
  );
}
