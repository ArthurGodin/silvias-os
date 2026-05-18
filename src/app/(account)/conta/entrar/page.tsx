import { Suspense } from "react";
import { EntrarForm } from "./entrar-form";

export const dynamic = "force-dynamic";

export default function EntrarPage() {
  return (
    <Suspense
      fallback={
        <section className="container-editorial pt-40 lg:pt-56 pb-32">
          <p className="text-eyebrow">Carregando…</p>
        </section>
      }
    >
      <EntrarForm />
    </Suspense>
  );
}
