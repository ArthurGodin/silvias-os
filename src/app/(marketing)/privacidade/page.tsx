export const dynamic = "force-static";

import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Política de privacidade do Silvia's Hair em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD).",
};

export default function PrivacidadePage() {
  return (
    <>
      <section className="container-editorial pt-32 lg:pt-48 pb-16">
        <SectionHeader
          index={1}
          eyebrow="LGPD · Versão 1.0"
          title="Política de privacidade"
          description="Última atualização: 14 de maio de 2026."
        />
      </section>

      <section className="container-editorial pb-32">
        <div className="grid-editorial">
          <article className="col-span-12 lg:col-span-8 lg:col-start-3 space-y-10 text-[16px] leading-[1.7] text-ink-600">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                1. Quem somos
              </h2>
              <p>
                Silvia&rsquo;s Hair é nome fantasia operado pela razão social
                inscrita sob o CNPJ a ser informado neste local. Sediada em
                Teresina, Piauí. Para fins de proteção de dados pessoais
                (&ldquo;LGPD&rdquo; — Lei 13.709/2018), atuamos como{" "}
                <strong>controlador</strong> dos dados de nossos clientes.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                2. Dados que coletamos
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nome completo, telefone celular e e-mail.</li>
                <li>Histórico de atendimentos realizados (serviços, datas, profissionais).</li>
                <li>Preferências e observações que você compartilhe conosco.</li>
                <li>Fotos antes/depois — apenas mediante consentimento expresso.</li>
                <li>Dados de navegação anônimos no site (cookies essenciais e analíticos).</li>
              </ul>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                3. Para que usamos
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Confirmar e lembrar você de agendamentos (e-mail, SMS, WhatsApp).</li>
                <li>Manter o histórico técnico do seu fio para melhor atendimento.</li>
                <li>Comunicar novidades e promoções — apenas se você consentir.</li>
                <li>Cumprir obrigações legais, contábeis e fiscais.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                4. Seus direitos
              </h2>
              <p className="mb-4">
                Pela LGPD você pode, a qualquer tempo:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Confirmar a existência de tratamento dos seus dados.</li>
                <li>Acessar, corrigir ou pedir a anonimização/exclusão dos dados.</li>
                <li>Retirar consentimento previamente fornecido.</li>
                <li>Pedir portabilidade para outro fornecedor.</li>
                <li>Opor-se a tratamento feito sem o seu consentimento.</li>
              </ul>
              <p className="mt-4">
                Para exercer qualquer destes direitos, escreva para{" "}
                <a href="mailto:privacidade@silviashair.com.br" className="editorial-link">
                  privacidade@silviashair.com.br
                </a>{" "}
                ou fale com a recepção de qualquer casa.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                5. Compartilhamento
              </h2>
              <p>
                Não vendemos nem cedemos seus dados a terceiros para fins
                comerciais. Compartilhamos apenas com prestadores estritamente
                operacionais (e-mail transacional, gateway de pagamento,
                infraestrutura de hospedagem) sob contratos de confidencialidade.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                6. Retenção
              </h2>
              <p>
                Mantemos seus dados de atendimento pelo prazo necessário para
                cumprir as finalidades acima, respeitando prazos legais (até 5
                anos para registros fiscais). Fotos antes/depois são apagadas
                imediatamente a pedido do titular.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                7. Cookies
              </h2>
              <p>
                Usamos cookies essenciais para fazer o site funcionar e cookies
                analíticos anonimizados para entender como melhorar a
                experiência. Você pode bloquear cookies não-essenciais nas
                configurações do navegador.
              </p>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] mb-4">
                8. Encarregado (DPO)
              </h2>
              <p>
                Nosso encarregado de proteção de dados pode ser contatado em{" "}
                <a href="mailto:privacidade@silviashair.com.br" className="editorial-link">
                  privacidade@silviashair.com.br
                </a>
                .
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
