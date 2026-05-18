"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, AlertCircle, Check, Mail } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const errorParam = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentMagic, setSentMagic] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "unauthorized"
      ? "Esse e-mail não está cadastrado como equipe. Fale com o administrador."
      : errorParam === "auth_failed"
        ? "Falha de autenticação. Tente novamente."
        : null,
  );

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : err.message);
        setSubmitting(false);
        return;
      }
      window.location.href = next;
    } catch {
      setError("Falha de rede. Tente novamente.");
      setSubmitting(false);
    }
  }

  async function onMagicLink() {
    if (!email) {
      setError("Informe seu e-mail antes de pedir o link.");
      return;
    }
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
      setSentMagic(true);
    } catch {
      setError("Falha de rede.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex">
      <section className="hidden lg:flex flex-col justify-between bg-ink-700 text-paper-100 w-1/2 p-16 grain">
        <Wordmark size="md" className="text-paper-100" />
        <div>
          <p className="text-eyebrow text-paper-200/60">Painel · Operação</p>
          <h2 className="mt-4 text-[clamp(2rem,3.5vw,3.5rem)] text-balance">
            Estilo &amp;{" "}
            <span className="text-display-italic">personalidade.</span>{" "}
            Agora com dados.
          </h2>
          <p className="mt-6 max-w-md text-paper-200/80">
            Sua agenda, suas clientes, sua receita projetada — em um só lugar.
            Acesso restrito à equipe.
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-paper-200/40">
          Silvia&rsquo;s OS · v1.0
        </p>
      </section>

      <section className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12">
            <Wordmark size="md" />
          </div>

          <p className="text-eyebrow">Acesso restrito</p>
          <h1 className="mt-3 text-[clamp(1.75rem,3vw,2.5rem)]">
            Entrar no <span className="text-display-italic">painel</span>
          </h1>

          {sentMagic ? (
            <div className="mt-12 border border-[var(--color-gold)]/50 bg-gold-mist/40 p-8">
              <Check className="h-6 w-6 text-gold-deep" />
              <p className="mt-4 font-[family-name:var(--font-display)] italic text-[1.4rem]">
                Link enviado para {email}.
              </p>
              <p className="mt-3 text-[14px] text-ink-600 leading-[1.6]">
                Cheque a caixa de entrada (e o spam). O link expira em 1 hora.
                Quando clicar, você cai direto no painel.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSentMagic(false);
                  setError(null);
                }}
                className="mt-6 text-[12px] uppercase tracking-[0.2em] editorial-link"
              >
                Tentar com outro e-mail
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmitPassword}>
              <div className="mt-12 space-y-8">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 flex items-start gap-2 text-[13px] text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-none" />
                  <p>{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="ink"
                size="lg"
                className="mt-10 w-full"
                disabled={submitting || !email || !password}
              >
                {submitting ? "Entrando..." : "Entrar"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </Button>

              <div className="mt-8 pt-8 border-t border-[var(--color-rule)]">
                <p className="text-eyebrow text-gold-deep">
                  Sem senha cadastrada?
                </p>
                <p className="mt-3 text-[13.5px] text-ink-500 leading-[1.55]">
                  Envia um link mágico pro seu e-mail. Você clica e entra direto
                  no painel, sem precisar lembrar de senha.
                </p>
                <button
                  type="button"
                  onClick={onMagicLink}
                  disabled={submitting || !email}
                  className="mt-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] editorial-link font-medium disabled:opacity-50"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Receber link mágico →
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <LoginInner />
    </Suspense>
  );
}
