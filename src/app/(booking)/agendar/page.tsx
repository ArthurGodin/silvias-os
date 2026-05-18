import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/wizard";

export const metadata: Metadata = {
  title: "Agendar atendimento",
  description:
    "Reserve seu atendimento em menos de 30 segundos. Escolha serviço, casa, profissional, data e horário. Confirmação imediata.",
};

export default function AgendarPage() {
  return (
    <Suspense
      fallback={
        <div className="container-editorial pt-40 pb-32">
          <p className="text-eyebrow">Carregando…</p>
        </div>
      }
    >
      <BookingWizard />
    </Suspense>
  );
}
