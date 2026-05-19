export const dynamic = "force-static";

import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "Termos e condições para uso do serviço de agendamento online do Silvia's Hair.",
};

export default function TermosPage() {
  return (
    <>
      <section className="container-editorial pt-32 lg:pt-48 pb-16">
        <SectionHeader
          index={1}
          eyebrow="Acordo de uso · Versão 1.0"
          title="Termos de uso"
          description="Última atualização: 14 de maio de 2026."
        />
      </section>

      <section className="container-editorial pb-32">
        <div className="grid-editorial">
          <article className="col-span-12 lg:col-span-8 lg:col-start-3 space-y-10 text-[16px] leading-[1.7] text-ink-600">
            <p>
              Ao utilizar o site silviashair.com.br e suas funcionalidades de
              agendamento, você concorda com os termos abaixo. Leia com atenção.
            </p>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                1. Agendamento e cancelamento
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Você pode agendar como visitante ou criar uma conta.</li>
                <li>
                  O cancelamento gratuito é permitido até 24 horas antes do
                  horário marcado.
                </li>
                <li>
                  Cancelamentos com menos de 24 horas podem resultar em
                  cobrança de uma taxa de até 30% do valor do serviço, a
                  critério do estabelecimento.
                </li>
                <li>
                  Reagendamento sem custo é permitido até 12 horas antes do
                  horário.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                2. Sinal de agendamento
              </h2>
              <p>
                Alguns serviços (coloração, clareamento, mudança de forma,
                penteados de cerimônia e maquiagem) exigem o pagamento de um
                sinal de 30% no momento do agendamento, via Pix. O valor é
                descontado do total da fatura no dia do atendimento.
              </p>
              <p className="mt-2">
                O sinal não é reembolsável em caso de não comparecimento sem
                aviso prévio. Em caso de cancelamento com mais de 24 horas, o
                sinal é integralmente devolvido.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                3. Pontualidade
              </h2>
              <p>
                Pedimos a chegada com 10 minutos de antecedência. Atrasos
                superiores a 20 minutos podem implicar reagendamento, conforme
                disponibilidade.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                4. Conteúdo do site
              </h2>
              <p>
                Imagens, marca, nome &ldquo;Silvia&rsquo;s Hair&rdquo; e toda
                propriedade intelectual são protegidos por lei. Uso não
                autorizado é proibido.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                5. Limitação de responsabilidade
              </h2>
              <p>
                O estabelecimento se compromete com técnica e cuidado. Resultados
                de coloração, alisamento e tratamentos podem variar conforme as
                condições prévias do fio. Diagnóstico técnico é feito antes de
                qualquer procedimento.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                6. Alterações
              </h2>
              <p>
                Reservamo-nos o direito de atualizar estes termos. Em caso de
                mudança material, comunicaremos por e-mail aos usuários com
                conta ativa.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                7. Foro
              </h2>
              <p>
                Fica eleito o foro de Teresina, Piauí, para dirimir quaisquer
                questões oriundas destes termos.
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
