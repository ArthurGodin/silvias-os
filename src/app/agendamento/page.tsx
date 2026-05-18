"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useSession } from "@/lib/auth/use-session";

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export default function BuscarAgendamentoPage() {
  const router = useRouter();
  const { isAuthenticated, status } = useSession();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/conta" as never);
    }
  }, [isAuthenticated, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = value.trim();
    const match = trimmed.match(UUID_REGEX);
    if (!match) {
      setError(
        "Não encontrei um código válido. Cole o link completo do seu agendamento ou o código que termina em 12 caracteres.",
      );
      return;
    }
    router.push(`/agendamento/${match[0].toLowerCase()}` as never);
  }

  if (status === "loading" || isAuthenticated) {
    return (
      <>
        <Header />
        <main id="main" className="min-h-screen pt-40 pb-32">
          <p className="container-editorial text-eyebrow">Carregando…</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main" className="min-h-screen pt-32 lg:pt-40 pb-24">
        <section className="container-editorial">
          <div className="grid-editorial">
            <div className="col-span-12 lg:col-span-2">
              <span className="text-eyebrow">Acompanhar</span>
            </div>
            <div className="col-span-12 lg:col-span-10">
              <h1 className="text-[clamp(2rem,5vw,4rem)] leading-[1.05]">
                Encontre o seu{" "}
                <span className="text-display-italic">agendamento.</span>
              </h1>
              <p className="mt-8 max-w-[52ch] text-[17px] text-ink-500 leading-[1.6]">
                Cole o link de acompanhamento que enviamos no seu e-mail ou no
                fim do agendamento. Você consegue ver detalhes, conferir
                horário, e cancelar até 24h antes — tudo sem precisar criar
                conta.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-12 max-w-2xl"
              >
                <Label htmlFor="code">Código ou link do agendamento</Label>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <Input
                    id="code"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="silviashair.com.br/agendamento/..."
                    invalid={!!error}
                    autoComplete="off"
                    autoFocus
                  />
                  <Button type="submit" variant="ink" size="md">
                    <Search className="h-4 w-4" />
                    Buscar
                  </Button>
                </div>
                {error && (
                  <p className="mt-3 text-[13px] text-red-700">{error}</p>
                )}
                <p className="mt-4 text-[12.5px] text-ink-500 leading-[1.6]">
                  Não tem o código?{" "}
                  <a
                    href="https://wa.me/5586981000001"
                    target="_blank"
                    rel="noreferrer"
                    className="editorial-link"
                  >
                    Fale com a recepção no WhatsApp
                  </a>{" "}
                  que ela encontra para você.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
