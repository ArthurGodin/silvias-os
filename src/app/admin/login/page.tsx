"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // TODO: integrar Supabase Auth (signInWithPassword) com role check em staff
    setTimeout(() => {
      window.location.href = "/admin";
    }, 400);
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
            Sua agenda, suas clientes, sua receita projetada — em um só lugar. Acesso restrito à equipe.
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-paper-200/40">
          Silvia&rsquo;s OS · v1.0
        </p>
      </section>

      <section className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <div className="lg:hidden mb-12">
            <Wordmark size="md" />
          </div>

          <p className="text-eyebrow">Acesso restrito</p>
          <h1 className="mt-3 text-[clamp(1.75rem,3vw,2.5rem)]">
            Entrar no <span className="text-display-italic">painel</span>
          </h1>

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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" variant="ink" size="lg" className="mt-12 w-full">
            {submitting ? "Entrando..." : "Entrar"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="mt-8 text-[12px] text-muted">
            Esqueceu a senha? Fale com a gerência ou com o administrador do sistema.
          </p>
        </form>
      </section>
    </main>
  );
}
