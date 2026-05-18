import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/wordmark";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper-100 px-6">
      <div className="text-center max-w-xl">
        <Wordmark size="md" />
        <p className="mt-12 text-eyebrow">404 · Página não encontrada</p>
        <h1 className="mt-6 text-balance">
          Essa{" "}
          <span className="text-display-italic">página</span>{" "}
          não existe.
        </h1>
        <p className="mt-6 text-[17px] text-ink-500">
          Talvez você tenha digitado o endereço errado, ou esta página foi
          movida. Você pode voltar à home ou ir direto agendar.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/" variant="ink" size="md">
            Voltar à home
          </Button>
          <Button href="/agendar" variant="underline" size="md">
            Agendar atendimento
          </Button>
        </div>
      </div>
    </main>
  );
}
