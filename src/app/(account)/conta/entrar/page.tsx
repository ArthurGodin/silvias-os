"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EntrarPage() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/conta";
  const errorParam = params.get("error");

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "expired"
      ? "Link expirado. Peça um novo."
      : errorParam === "invalid"
        ? "Link inválido. Solicite outro abaixo."
        : null,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, redirectTo: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Falha ao enviar link.");
        setSubmitting(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Falha de rede. Verifique sua conexão.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container-editorial pt-40 lg:pt-56 pb-32">
      <div className="grid-editorial">
        <div className="col-span-12 lg:col-span-8 lg:col-start-3">
          <p className="text-eyebrow">Minha conta</p>
          <h1 className="mt-4 text-balance">
            Entre com seu{" "}
            <span className="text-display-italic">e-mail.</span>
          </h1>
          <p className="mt-6 text-[17px] text-ink-500 max-w-[52ch]">
            Sem senha. Enviamos um link mágico para o seu e-mail. Você clica e
            acessa direto — seus agendamentos, histórico e preferências.
          </p>

          {sent ? (
            <div className="mt-16 border border-[var(--color-gold)]/50 bg-gold-mist/40 p-8">
              <Check className="h-6 w-6 text-gold-deep" />
              <p className="mt-4 font-[family-name:var(--font-display)] italic text-[1.5rem]">
                Link enviado para {email}.
              </p>
              <p className="mt-3 text-[14px] text-ink-600 leading-[1.6]">
                Verifique sua caixa de entrada (e também o spam). O link expira em
                1 hora.
              </p>
              <p className="mt-6 text-[12px] text-ink-500">
                Não chegou em 5 min?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setError(null);
                  }}
                  className="editorial-link"
                >
                  Tentar com outro e-mail
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-16 max-w-md">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                required
                autoComplete="email"
                autoFocus
              />
              {error && (
                <div className="mt-4 flex items-start gap-2 text-[13px] text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-none" />
                  <p>{error}</p>
                </div>
              )}
              <Button
                type="submit"
                variant="ink"
                size="lg"
                className="mt-10 w-full"
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Receber link mágico"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="mt-6 text-[12px] text-muted">
                Ao continuar, você aceita nossa{" "}
                <a href="/privacidade" className="editorial-link">política de privacidade</a>
                {" "}e nossos{" "}
                <a href="/termos" className="editorial-link">termos de uso</a>.
              </p>
            </form>
          )}

          {!sent && (
            <div className="mt-12 pt-10 border-t border-[var(--color-rule)] max-w-md">
              <p className="text-eyebrow text-gold-deep">Primeira vez?</p>
              <p className="mt-3 text-[14px] text-ink-500 leading-[1.6]">
                Não precisa criar conta para reservar. Você pode agendar como
                visitante e receber um link único para acompanhar o seu
                horário.
              </p>
              <a
                href="/agendar"
                className="mt-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] editorial-link font-medium"
              >
                Agendar como visitante →
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
