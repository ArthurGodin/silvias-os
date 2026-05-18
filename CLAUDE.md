# Silvia's Hair · Documento de Contexto para Claude

> Documento de visão estratégica + arquitetura + direção de design.
> Escrito como base de trabalho para que **Claude (claude.ai / Claude API)** consiga implementar sem retrabalho.
> **Data:** 14 de maio de 2026 · **Autor:** Arthur Godinho com assistência de arquiteto sênior.
> **Status:** Documento vivo, primeira versão.

---

## Como Claude deve ler este documento

**Regra de ouro:** Leia este documento integralmente antes de gerar qualquer código. Não pule seções.

Sete partes, ordem importa:

1. **Quem é a cliente** — sem entender Silvia, qualquer decisão técnica vira chute.
2. **Diagnóstico estratégico** — o que está quebrado e por que tech agora.
3. **Portfólio de produtos possíveis** — dez ideias, pesadas e priorizadas.
4. **MVP recomendado** — qual bundle implementar primeiro.
5. **Arquitetura** — stack, dados, integração, custos.
6. **Direção visual** — sistema de design, referências, anti-padrões. **LEITURA OBRIGATÓRIA antes de qualquer componente visual.**
7. **Implementação** — fases, estrutura, ordem, riscos.

### Como Claude deve operar neste projeto

**Antes de gerar qualquer código de UI/componente:**
→ Leia `/mnt/skills/public/frontend-design/SKILL.md`. Sem exceção.

**Antes de criar qualquer arquivo .docx, .pdf, .pptx, .xlsx:**
→ Leia o SKILL.md correspondente em `/mnt/skills/public/`.

**Ao receber uma tarefa de implementação:**
1. Identifique a qual Sprint pertence (seção 7).
2. Leia os anti-padrões da seção 6 e mentalmente verifique se o que vai gerar viola algum.
3. Gere o código em arquivo(s) com nomes corretos conforme a estrutura de pastas da seção 7.
4. Prefira arquivos completos e funcionais a trechos parciais — Arthur precisa de código pronto para rodar.

**Quando receber uma tarefa ambígua:**
→ Pergunte uma coisa só antes de começar. Não pergunte cinco coisas de uma vez.

**Tom de trabalho:**
→ Direto, técnico, sem floreios. Arthur é desenvolvedor, não precisa de explicações básicas.

---

## 0. Decisões V1.2 — Identidade visual refinada (2026-05-14, segunda iteração)

> **Esta seção sobrescreve qualquer recomendação conflitante no restante do documento, inclusive a V1.1.**

### Decisões V1.2 (em cima do que já foi feito)

1. **Paleta principal mudou de teal (#21B2A6) para dourado champanhe (#BF9B5B).**
   - Razão: a logo real da Silvia's (vista na arte de "Combos especiais") usa dourado champanhe sobre creme, não teal. Teal era do site institucional antigo. Token CSS renomeado de `--color-teal-*` para `--color-gold-*`. Variante de botão `teal` virou `gold`.
   - Acento secundário: `--color-gold-mist` (#efe4c8) para backgrounds delicados.
   - Texto premium em destaque: utilitário `.text-gold-gradient` para nomes/títulos com gradiente metálico.

2. **Wordmark agora tem o símbolo da marca (BrandMark SVG das 3 mechas).**
   - Componente `src/components/brand/brand-mark.tsx` desenha as 3 mechas estilizadas da logo real.
   - Wordmark passa a aceitar prop `withMark`, default `true` em tamanhos `md`/`lg`.

3. **Tipografia editorial mais expressiva.**
   - Acrescentado utilitário `.text-display-script` (Fraunces axes SOFT 100, WONK 1, com tracking negativo agressivo) para os momentos de assinatura cursiva no lugar das ocorrências mais marcantes do `.text-display-italic`.

4. **Reveals com `motion` (lib oficial, sucessora do Framer Motion).**
   - `src/components/ui/reveal.tsx` exporta `Reveal`, `RevealStagger` e `RevealItem`.
   - Aplicados às seções principais da home; respeitam `prefers-reduced-motion` via `useReducedMotion`.

5. **Nova rota `/combos` + seção destacada na home.**
   - 5 combos especiais sincronizados com a arte real da Silvia (sobrancelhas+buço, hidratação+escova, coloração+hidratar+escovar com 3 variantes, escova+lavar+pé/mão, depilação completa).
   - Período de validade configurado em `src/lib/data/combos.ts` (segunda a quarta, até 30/11/2026).
   - Pré-seleção via querystring `?combo=<slug>` no wizard (a implementar nos próximos refinamentos).

6. **Multi-marca apenas visualmente (decisão V1.1 mantida no schema).**
   - `src/lib/data/family.ts` define as 3 marcas (Hair ativa, Barbershop e Estetic "em breve").
   - Componente `FamilyHub` renderiza um hub editorial em fundo ink-700; usado em `/sobre` e referenciado no Footer.
   - Schema continua mono-marca. Migração `ALTER TABLE ADD COLUMN brand_slug` quando as marcas-irmãs entrarem de fato no escopo (decisão de 12+ meses).

7. **Middleware de proteção real para `/admin` e `/equipe`.**
   - `src/middleware.ts` valida sessão Supabase + role na tabela `staff`. Cliente final nunca vê painel. Stylist é redirecionado para `/equipe`. Sem Supabase configurado, deixa passar (modo dev).

### Garantia: zero custo adicional dessa rodada
Nenhuma das mudanças V1.2 adiciona dependência paga ou serviço externo novo. Tudo continua dentro do mapa de custos da V1.1.

---

## 0. Decisões V1.1 — Refinamentos para implementação (2026-05-14)

> **Esta seção sobrescreve qualquer recomendação conflitante no restante do documento.**
> Decisões tomadas após revisão sênior, validadas com Arthur em 14/05/2026.

### Decisões consolidadas

1. **Hospedagem: Cloudflare Pages** (substitui Vercel).
   - Vercel Hobby é "non-commercial use only" — Silvia's Hair tem fim comercial, exigiria Vercel Pro (US$ 20/mês ≈ R$ 110/mês).
   - Cloudflare Pages: gratuito, sem limite de bandwidth, comercial permitido.
   - Next.js 15 roda via `@cloudflare/next-on-pages`. Edge runtime para API routes.

2. **Google Calendar: sincronização one-way (DB → Calendar).**
   - Banco é source of truth absoluto.
   - Backend escreve no Calendar do profissional quando booking é criado/alterado/cancelado.
   - Sem webhook reverso. Se profissional precisa bloquear horário, faz pelo painel da plataforma (não pelo app Calendar).
   - Evita edge cases famosos de sync bidirecional (recorrência, drag-and-drop manual, fuso, exceções).

3. **Stylist View mínima entra na V1.**
   - Justificativa: sem a equipe usando o sistema, ninguém alimenta o CRM, e o produto morre em 60 dias.
   - Escopo mínimo: rota `/equipe` com login do profissional → agenda do dia + ficha do próximo cliente + campo livre de anotação pós-atendimento. PWA via Next.js.
   - Adiciona 2-3 dias ao Sprint 3.

4. **Pagamento de sinal Pix entra na V1 (configurável por serviço).**
   - Integração: Mercado Pago Pix.
   - Sem mensalidade. Fee: 0,99% por transação Pix — **pago pela própria cliente final no checkout, não é custo recorrente do Arthur nem da Silvia.**
   - Silvia escolhe quais serviços exigem sinal (default: coloração, clareamento, alisamentos).
   - Impacto direto na redução de no-show.

5. **Schema mono-marca (não multimarca).**
   - `brand_id` removido das tabelas. Não vamos pagar complexidade hoje pela expansão hipotética de 18 meses.
   - Adicionar via migration quando barbershop/estetic entrarem de fato no escopo. Postgres lida com `ALTER TABLE ADD COLUMN brand_id DEFAULT 1` trivialmente.

6. **Tabela `client_consents` desde a primeira migration (LGPD).**
   - Tipos: `privacy_policy`, `terms_of_use`, `photo_before_after`, `marketing_email`, `marketing_sms`.
   - Cada consent registra: versão do termo aceito, timestamp, IP, user_agent.
   - Política de privacidade e termo de uso publicados em `/privacidade` e `/termos` antes do deploy.

7. **Auth B2C: guest booking primeiro, magic link depois.**
   - Cliente reserva como guest (nome + telefone + email + consent privacidade).
   - Magic link via Supabase Auth só para acessar histórico ("minha conta") em segunda visita.
   - Reduz fricção no momento da conversão noturna (a dor #1 do diagnóstico).

8. **Tipografia: 2 fontes apenas — Fraunces + Manrope.**
   - Italiana cortada. Momentos cursivos resolvidos com Fraunces italic (eixo SOFT).
   - Performance melhor, coerência maior, menos requisições.

9. **WhatsApp Cloud API: roadmap V2 explícito.**
   - V1: link `wa.me/55863122...` como fallback humano em cada ponto de contato.
   - V2 (3-6 meses pós-launch): integração oficial Meta WhatsApp Cloud API com auto-resposta inicial ("Olá! Posso te ajudar a agendar online em silviashair.com.br/agendar"). Free tier: 1000 conversas/mês iniciadas pelo cliente.

10. **Timeline V1: 10-14 semanas de trabalho ativo (solo).**
    - Substitui estimativa anterior de 5-8 semanas. Pitch comercial deve usar **12 semanas** como prazo de entrega.

### ⚠️ Mapa de custos — leitura obrigatória antes de mudar de stack

Arthur exigiu zero custo de operação. Tabela atualizada e auditável:

| Serviço | Status | Limite free | Custo após limite | Quando provavelmente estoura |
|---|---|---|---|---|
| **Cloudflare Pages** | Gratuito | Ilimitado (bandwidth, requests) | — | Nunca |
| **Supabase** | Gratuito | 500MB DB · 1GB storage · 50k MAU | US$ 25/mês (≈R$ 140) | 18-24 meses |
| **Resend** | Gratuito | 3k emails/mês · 100/dia | US$ 20/mês (≈R$ 110) | >1500 bookings/mês |
| **Domínio silviashair.com.br** | Já existe | — | — | (custo da Silvia, não do Arthur) |
| **Google Calendar API** | Gratuito | 1M requests/dia | — | Nunca |
| **PostHog Cloud** | Gratuito | 1M eventos/mês | Pay-as-you-go | Nunca |
| **Sentry** | Gratuito | 5k erros/mês | US$ 26/mês | Apenas se houver bug em loop |
| **Mercado Pago Pix** | Sem mensalidade | — | 0,99% por transação | **Pago pela cliente final, não recorrente** |
| **GitHub** | Gratuito | Repos privados ilimitados | — | Nunca |

**Regra inegociável:** se durante a implementação surgir qualquer custo recorrente não listado aqui, **parar imediatamente e avisar Arthur antes de prosseguir.**

---

## 1. Perfil completo da cliente

### Marca

- **Nome:** Silvia's Hair
- **Fundadora:** Silvia Meneses
- **Desde:** 2003 (23 anos de operação até 2026)
- **Domínio web:** silviashair.com.br (institucional estático, sem agendamento)
- **Instagram:** [@silvias_hair](https://instagram.com/silvias_hair) · 27,5k seguidores
- **Marcas-irmãs:** [@silviasbarbershop](https://instagram.com/silviasbarbershop), [@silviasteticdesign](https://instagram.com/silviasteticdesign)
- **Tagline oficial:** "Estilo e Personalidade"

### Negócio

- **Duas unidades físicas** em Teresina-PI, ambas dentro de shoppings premium:
  - **Casa I** · Teresina Shopping · Av. Marechal Castelo Branco, 911 — Piso L3 · (86) 3122-5226
  - **Casa II** · Shopping Rio Poty · Av. Raul Lopes, 1000 — Loja 267 · (86) 3230-1293
- **Equipe estimada:** ~14 profissionais
- **Catálogo:** 30+ atendimentos em 8 famílias (cortes, tratamentos, mudança de forma, coloração, clareamento, unhas, estética, especiais).
- **Canal de agendamento atual:** 100% manual via WhatsApp.
- **Fluxo operacional atual:** cliente manda mensagem → recepção responde no horário comercial → confirmação manual → agendamento no caderno físico ou Google Calendar pessoal de cada profissional.

### Posicionamento

- **Premium-sofisticado**, mas não inacessível.
- Credenciais internacionais que pesam: Vidal Sassoon (Londres), TONI&GUY (Milão), Pivot Point (Chicago), Llongueras (Barcelona). Master WellaStrate.
- **Público-alvo predominante:** mulheres 25-55 anos, classe média e média-alta de Teresina.
- Público adjacente: barbershop (homens 25-50) e estetic (estética facial/corporal feminina).

### Pontos fortes

1. Marca consolidada — 23 anos de operação em uma capital de ~870k habitantes.
2. Localização em shoppings premium em ambas unidades.
3. Audiência relevante no Instagram (27,5k).
4. Posicionamento técnico forte com credenciais internacionais que outros salões da praça não têm.
5. Três marcas sob a mesma família — oportunidade de cross-sell.

### Pontos cegos (oportunidades)

1. **Invisível para o Google.** Site estático sem SEO local. Quem busca "salão Teresina Shopping" não cai nelas.
2. **Perde lead fora do horário comercial.** WhatsApp manual = dezenas de mensagens não respondidas à noite e fins de semana.
3. **Não conhece o próprio cliente em dados.** Sem CRM, não sabe quem voltou, quem sumiu, qual cliente já gastou R$10k+, quem aniversaria amanhã.
4. **Operação opaca.** Sem dashboard por unidade, decisão sobre horário de pico, profissional mais rentável, serviço mais cancelado é no "feeling".
5. **Marketing reativo.** Posta no Instagram mas não tem nutrição automatizada de base (e-mail/SMS) e nenhum funil de retenção formal.

---

## 2. Diagnóstico estratégico

### Por que tech agora

Silvia é uma operação clássica de "salão tradicional com público novo". O público dela já é digital — Instagram bombando, marca premium — mas a operação ainda é analógica. Esse gap é onde o dinheiro vaza. Três sinais clássicos:

- **Pico de demanda fora do horário comercial.** DM/WhatsApp à noite vira lead frio na manhã seguinte. Salão concorrente que tem agendamento online captura primeiro.
- **Retenção sem método.** Cliente premium que parou de vir não recebe nenhum sinal automático. Vira churn silencioso.
- **Decisão por intuição.** Sem dashboard, Silvia decide horário, promoção, serviço novo no instinto. Funciona até parar de funcionar.

Tech aqui não é "modernização cosmética". É **fechar 3 vazamentos de receita** que devem somar R$ 15-50k/mês entre as duas unidades.

### Dores classificadas por impacto

| # | Dor | Impacto na receita | Esforço para resolver | ROI esperado |
|---|---|---|---|---|
| 1 | Lead noturno perdido em WhatsApp | **Alto** | Médio | **Altíssimo** |
| 2 | Cliente "sumido" sem reativação | Alto | Médio | Alto |
| 3 | Invisibilidade no Google | Médio-Alto | Baixo (SEO local) | Alto |
| 4 | Operação opaca por unidade | Médio | Médio | Médio |
| 5 | Sem cross-sell entre as 3 marcas | Médio | Baixo (com base CRM) | Médio |

---

## 3. Portfólio de produtos possíveis

Catálogo amplo. Nem todos devem ser construídos. Lista existe para enxergar o terreno completo e decidir o bundle inicial.

### 3.1 Site institucional renovado (substitui silviashair.com.br atual)

**O quê:** novo site público, mobile-first, conversion-oriented. Hero, manifesto, catálogo de serviços, galeria, equipe, depoimentos, unidades, blog opcional.

**Resolve:** invisibilidade no Google + presença de marca premium digna do posicionamento dela.

**Esforço:** 1-2 sprints. Stack web standard.

### 3.2 Sistema de agendamento online (público, com login)

**O quê:** wizard de agendamento — serviço → unidade → profissional → data/horário → contato → confirmação. Login passwordless por e-mail (magic link) ou número. Self-service para reagendar/cancelar.

**Resolve:** lead noturno perdido. Captura 24/7.

**Esforço:** 2 sprints. Integração com Google Calendar + Supabase.

### 3.3 CRM (banco de clientes + histórico)

**O quê:** ficha de cada cliente com histórico de atendimentos, preferências, alergias, tipo de fio, fotos antes/depois (consentidas), última visita, valor vitalício gasto, NPS.

**Resolve:** retenção. Detecção de "sumidos" (sem visita há 60+ dias). Listas segmentadas (aniversário, top spenders).

**Esforço:** 2 sprints. Integrado nativamente com 3.2.

### 3.4 Painel operacional / admin (Silvia + gerência)

**O quê:** dashboard com agendamentos do dia/semana, taxa de ocupação por unidade e por profissional, top serviços, taxa de cancelamento, receita projetada vs realizada, CRUD de serviços e equipe.

**Resolve:** opacidade operacional. Decisão com dado.

**Esforço:** 2 sprints.

### 3.5 App da equipe / Stylist View (mobile-first PWA)

**O quê:** visão privada para cada profissional — agenda do dia, perfil do cliente que está chegando (último serviço, preferências, alergias), check-in, anotações pós-atendimento, upload de antes/depois.

**Resolve:** profissional chega no atendimento sabendo o histórico. Sobe a percepção de cuidado.

**Esforço:** 1-2 sprints, depende fortemente de 3.3.

### 3.6 Programa de fidelidade / Loyalty

**O quê:** pontuação por serviço, recompensas (10º corte com 30% off, etc.), tiers (Cliente / VIP / Embaixadora), notificações de status.

**Resolve:** retenção de longo prazo e advocacy.

**Esforço:** 1-2 sprints. Depende de 3.3.

### 3.7 Marketing automation (e-mail + SMS)

**O quê:** régua automática — "faz 60 dias desde sua coloração, hora de retoque", "feliz aniversário, presente da casa", "novidade na Casa II".

**Resolve:** retenção sistemática + reativação automática.

**Esforço:** 1 sprint usando Resend ou similar. Depende de 3.3.

### 3.8 Hub multimarca (silvias_hair + barbershop + estetic)

**O quê:** uma identidade de cliente que atravessa as três marcas. Família que faz cabelo + barba + estética é tratada como um relacionamento, não três.

**Resolve:** cross-sell. Aumenta ticket médio por família atendida.

**Esforço:** atravessa 3.3 e 3.4. Decisão arquitetural desde o dia zero.

### 3.9 Simulador de visual com IA

**O quê:** upload de foto → IA gera previews de cortes/cores possíveis baseado em formato de rosto e características do fio.

**Resolve:** dúvida pré-agendamento sobre mudança radical. Reduz cancelamento de coloração ousada.

**Esforço:** 2-3 sprints. Custo recorrente de inference. Fica para fase tardia.

### 3.10 E-commerce de produtos profissionais

**O quê:** Silvia tem acesso a linha profissional (Kérastase, Wella). Vender online com retirada na unidade ou entrega.

**Resolve:** receita adicional sem aumentar capacidade física.

**Esforço:** 2 sprints, mais logística e estoque. Fica para depois do core.

### Matriz de priorização

| Produto | Impacto | Esforço | Ordem sugerida |
|---|---|---|---|
| 3.1 Site institucional | Alto | Baixo | **1** |
| 3.2 Agendamento online | Altíssimo | Médio | **2** |
| 3.3 CRM | Alto | Médio | **3** |
| 3.4 Admin/Dashboard | Médio | Médio | **4** |
| 3.7 Marketing automation | Alto | Baixo (com 3.3) | 5 |
| 3.5 Stylist view | Médio | Médio | 6 |
| 3.6 Loyalty | Médio | Baixo (com 3.3) | 7 |
| 3.8 Hub multimarca | Alto longo prazo | Alto | 8 (depois da V1) |
| 3.9 Simulador IA | Baixo agora | Alto | 9 |
| 3.10 E-commerce | Baixo agora | Alto | 10 |

---

## 4. MVP recomendado — "Silvia's OS"

### A decisão de produto

**Vender o pacote 3.1 + 3.2 + 3.3 + 3.4 como uma plataforma única** sob o nome **Silvia's OS** (ou "Sistema Operacional do Salão").

Não é "site". Não é "bot". É **o sistema operacional digital de uma casa de salão**. Quatro produtos integrados nascendo da mesma base de dados.

### Por que esse bundle, não outros

- Cobrir as 5 dores principais com **um único produto coeso** vale mais que vender 5 ferramentas soltas.
- A integração nativa (cliente que reserva online vira automaticamente registro no CRM, que aparece no dashboard da Silvia) é o **diferencial competitivo** versus a concorrência fragmentada (cliente do Trinks + planilha Excel + WhatsApp + caderno).
- O ticket é justificável: R$ 8.000-15.000 de setup + R$ 300-600/mês de manutenção.

### Por que NÃO incluir agora

- **Stylist View (3.5):** depende de adoção interna pela equipe. Vender depois que Silvia ver valor no CRM.
- **Loyalty (3.6) e Marketing automation (3.7):** ótimos add-ons na V2. Não construir antes de ter dados rodando no CRM.
- **Hub multimarca (3.8):** decisão arquitetural a respeitar desde o início (schema preparado), mas implementação só após validar uma marca.
- **Simulador IA (3.9) e E-commerce (3.10):** distrações no momento.

### Definição da V1 ("Silvia's OS · V1")

Quatro produtos, uma plataforma:

1. **Frente pública**
   - Site institucional moderno
   - Catálogo de serviços completo
   - Galeria
   - Unidades
   - Sobre / Equipe
   - Wizard de agendamento online (multi-step, mobile-first)
   - Conta de cliente (login passwordless, histórico próprio)

2. **Frente privada (Silvia + gerência)**
   - Dashboard operacional
   - CRM com lista, filtros, busca
   - Ficha do cliente com timeline
   - CRUD de serviços, profissionais, horários
   - Detecção automática de clientes inativos

3. **Integrações nativas**
   - Google Calendar (1 agenda por profissional)
   - Resend (e-mails transacionais e lembretes)
   - WhatsApp Web link (`wa.me`) como fallback de contato humano — sem API

4. **Telemetria mínima**
   - Posthog para eventos de conversão
   - Sentry para erros

---

## 5. Arquitetura técnica

### Decisões macro

Stack opinado, escolhido para custo zero permanente + qualidade de produção + velocidade de desenvolvimento:

| Camada | Decisão | Por quê |
|---|---|---|
| **Framework web** | Next.js 15 (App Router) + TypeScript estrito | RSC + Server Actions para reduzir client bundle; SEO trivial; deploy Vercel é gratuito |
| **Estilo** | Tailwind CSS v4 + shadcn/ui altamente customizado | Velocidade + controle. Customizar shadcn é mandatório — defaults dão cara de SaaS genérico |
| **Banco/Auth/Storage** | Supabase (Postgres + Auth + Storage + Realtime) | Cobre 4 necessidades com uma stack. RLS para segurança real. Free tier basta para começar |
| **Calendário** | Google Calendar API (uma agenda por profissional) | Equipe já usa Google. Sincronização bidirecional facilita adoção interna |
| **E-mail transacional** | Resend | API moderna, 3k/mês grátis, templates em React |
| **Hospedagem** | Vercel | Free tier, deploy Git, CDN global, Edge functions |
| **Analytics** | Posthog (cloud free) | Eventos custom + funis + heatmaps em um produto |
| **Erros** | Sentry (developer free tier) | Stack trace + replay |
| **Pagamentos (futuro)** | Stripe ou Pagar.me | Não na V1. Estrutura no schema para receber depois |

**O que NÃO usar:**

- ❌ React Native ou Flutter (não temos app mobile na V1; PWA basta).
- ❌ Microsserviços (escala não justifica, complexidade injustificada).
- ❌ Headless CMS (Sanity, Strapi). Conteúdo do site é estável; dados ficam no Postgres.
- ❌ Firebase (Supabase é melhor para uso relacional).
- ❌ Auth0 ou Clerk (Supabase Auth resolve por R$ 0).
- ❌ Bot de WhatsApp via Baileys ou similar. Risco de ban com cliente real.

### Modelo de dados (tabelas principais)

Schema preparado para futura expansão multimarca (campo `brand_id` desde o início).

```sql
brands               -- silvias_hair, silviasbarbershop, silviasteticdesign
units                -- 2 lojas por marca; FK brand_id
service_categories   -- 8 famílias
services             -- 30+ itens; FK category_id; duration, base_price
staff                -- profissionais; vinculados a uma unit primária, podem atender em ambas
staff_services       -- N:N (quem faz o quê)
working_hours        -- jornada por profissional e por unidade
clients              -- cliente final; FK auth.users (Supabase Auth)
client_brand_profile -- preferências por marca (cross-brand profile)
bookings             -- agendamento; FK client, staff, unit, service; status, scheduled_at, calendar_event_id
booking_history      -- log de mudanças de status (audit trail)
service_records      -- o que foi feito de fato (pode divergir do booking original)
service_record_photos
products             -- inventário; FK brand_id, unit_id; stock, price
transactions         -- financeiro; FK booking_id opcional; type (service, product, tip)
communications_log   -- e-mail/SMS enviados, status, campanha
loyalty_points       -- saldo + histórico (V2)
campaigns            -- réguas de e-mail (V2)
```

Princípios:
- `created_at`, `updated_at`, `deleted_at` (soft delete) em todas as tabelas.
- UUID como PK (privacidade nas URLs públicas).
- `brand_id` em todas as tabelas que fazem sentido (preparação multimarca).
- Índices em FK e em colunas de busca frequente (`scheduled_at`, `client_id`, `unit_id`).
- RLS habilitado em tudo. Política de RLS é a primeira camada de segurança.

### Autenticação e autorização

Dois mundos com regras distintas:

**Clientes finais (B2C):**
- Magic link por e-mail via Supabase Auth.
- Sessão longa (30 dias).
- Acessa apenas dados próprios (`auth.uid() = client.user_id` via RLS).
- Login não é obrigatório para agendar — pode reservar como guest, depois reivindicar conta.

**Equipe (B2B):**
- E-mail + senha + 2FA opcional.
- Roles: `admin` (Silvia), `manager` (gerente de unidade), `stylist` (profissional), `receptionist` (recepção).
- Permissões diferentes por role:
  - Admin: tudo.
  - Manager: dados da sua unidade + leitura cross-unit.
  - Stylist: agenda própria + perfis dos clientes que atende.
  - Receptionist: criar/editar agendamentos + busca de clientes; sem acesso financeiro.
- Login em rota separada (`/admin`).

### Integração com Google Calendar

Uma conta de serviço (service account) do Google Cloud com permissão delegada em cada Google Calendar dos profissionais.

Fluxo:
1. Cliente confirma agendamento online.
2. Backend cria evento no calendar do profissional (com dados do cliente, serviço, duração, observações).
3. Profissional vê tudo no app Google Calendar dele — não precisa aprender ferramenta nova.
4. Se profissional bloqueia horário no Google Calendar (folga, atendimento manual), o backend respeita ao oferecer slots.

Edge case: profissional move o evento no Google Calendar. Webhook do Google → backend atualiza booking. Resolve via push notifications da API.

### Performance e escala

V1 não terá problema de escala. Dimensionamento:
- ~50 agendamentos/dia entre as duas unidades = ~1.500/mês.
- ~3k clientes ativos no CRM.
- Picos de tráfego em campanhas de Instagram (mil sessões em 2h).

Supabase free tier (500MB de banco, 2GB de transferência) cobre por 2-3 anos sem upgrade.

### Custos projetados

| Item | Custo mensal |
|---|---|
| Vercel | R$ 0 (free tier) |
| Supabase | R$ 0 (free) |
| Resend | R$ 0 (até 3k e-mails) |
| Posthog | R$ 0 (1M eventos) |
| Sentry | R$ 0 (dev tier) |
| Google Calendar API | R$ 0 |
| Domínio (já é deles) | R$ 0 |
| **Total** | **R$ 0** |

Quando estourar o free tier (~12-18 meses), custo sobe para ~R$ 150/mês total.

---

## 6. Direção visual / UI-UX

> **⚠️ Claude: leia `/mnt/skills/public/frontend-design/SKILL.md` antes de implementar qualquer componente desta seção.**

### Audit da marca real

Logo real do Silvia's Hair: símbolo de **3 mechas de cabelo estilizadas** acima da grafia "Silvia's Hair" em **serifa cursiva itálica**, com tagline "Estilo e Personalidade" abaixo, tudo em monocromático preto/grafite.

Site atual (silviashair.com.br): cor primária `#2E3842` (grafite), accents `#21B2A6` (teal vibrante) e `#A6E0DB` (verde-água), tipografia Open Sans.

**Leitura do tom:** premium-sofisticado, técnico-profissional, não-luxo-intimidador. Refinado mas acolhedor. Mais "atelier respeitado" que "salão chique de capital".

### Direção criativa proposta — "Editorial Cinemático"

Não é o mesmo que "Atelier Editorial" tipo Aesop — aquilo fica seco demais para um salão. Salão é negócio VISUAL e SENSORIAL. Precisa **fotografia forte, atmosfera, calor humano**.

Mas também não é "modern SaaS" (cards bento, gradientes pastel, Inter). Isso desbota o premium.

**A síntese:**

- **80% editorial fotográfico** (grandes imagens, tipografia confiante, ritmo de revista)
- **20% modern product** (componentes interativos limpos, microinterações refinadas, prova de produto)
- Linguagem visual **cinemática**: imagens com peso, transições suaves, ritmo deliberado

### Seis referências reais (Claude: estudar antes de decidir qualquer visual)

1. **[Aman Resorts](https://aman.com)** — fotografia em alta resolução cobrindo viewport, tipografia editorial com itálicos calculados, ritmo de scroll que respira. Roubar: tratamento de hero, transições entre seções.
2. **[Sézane](https://sezane.com)** — feminilidade francesa moderna sem cair em rosa-pink. Produtos como personagens. Roubar: ritmo de grade de produto, fotografia editorial casual.
3. **[Drybar](https://thedrybar.com)** — energia + clareza para salão americano. Roubar: estrutura de catálogo de serviços, prova social.
4. **[R+Co](https://randco.com)** — marca de haircare com personalidade visual forte (retro-moderno). Roubar: ousadia tipográfica, paleta limitada usada com convicção.
5. **[Le Labo](https://lelabofragrances.com)** — texturas tipográficas tipo papel timbrado, atmosfera artesanal. Roubar: tratamento de "ficha" de produto/serviço.
6. **[Linear](https://linear.app)** — referência para componentes de produto (admin/CRM). Roubar: clareza de UI, padrão de table/list, microinterações de hover.

**Antirreferências:** Squarespace templates, Wix templates, qualquer "Tailwind landing page" do Twitter, sites de barbearia genéricos.

### Sistema de cor

Paleta limitada, ratio bem distribuído.

```
Primária dominante   · Ink / Grafite        #2E3842 (paleta 50-950)
Secundária dominante · Paper / Cream        #FAF7F2 (com variações soft/deep)
Acento forte         · Teal Vivo            #21B2A6 (uso reservado: CTAs, hover, dados quentes)
Acento suave         · Teal Mist            #A6E0DB (fundos secundários, badges)
Apoio                · Bordas/Divisores     rgba(46, 56, 66, 0.16)
Neutro funcional     · Cinza Texto          #8E8892 (captions, metadata)
```

**Regra de ouro do uso de cor:**
- 70% paper (`#FAF7F2`)
- 20% ink (`#2E3842`) em texto e backgrounds escuros
- 8% acento teal
- 2% imagens com tons quentes (rostos, cabelos)

### Sistema tipográfico

Pareamento opinado, anti-genérico:

**Display:** `Fraunces` (variável, axes `SOFT`, `WONK`, `opsz`) — serifa moderna com itálico expressivo. Não é Playfair Display (overuse). Não é Cormorant Garamond (já comum). Fraunces tem caráter próprio e variável é gentil com performance.

**Body:** `Manrope` — grotesque clean, **não é Inter**, **não é Geist**. Personalidade sutil sem ser estranho.

**Acento opcional:** `Italiana` (single italic Google Font) para momentos pontuais de assinatura editorial (ex: tagline "Estilo & Personalidade").

**Escala tipográfica:**
```
12px  · micro / caps / metadata
14px  · captions / helper text
16px  · body (BASE, nunca menos no mobile)
18px  · body confortável
20-24px · subtítulos
32-48px · h3 / pull quotes
clamp(2rem, 5vw, 4.5rem)    · h2 de seção
clamp(2.5rem, 7.5vw, 7rem)  · h1 hero
```

Line-height: 1.5-1.75 para body. 0.95-1.05 para display.

Use letter-spacing negativo (`-0.02em`) em headlines display. Use letter-spacing positivo (`0.18-0.24em`) em caps/eyebrows.

### Princípios de layout

1. **Grid de 12 colunas com assimetria proposital.** Headlines em col-span-10, marcadores numerais em col-span-2. Texto em col-span-7, eyebrow em col-span-2.
2. **Numerais romanos** (I., II., III.) como marcadores de seção.
3. **Eyebrows em caps minúsculos** acima de cada h2.
4. **Section dividers tipográficos** (· · ·) entre seções, não SVGs decorativos.
5. **Negative space gera valor.** No mobile a tela respira; no desktop o conteúdo nunca cresce edge-to-edge.
6. **Imagens com proporção 4:5, 3:4 ou 16:10**, nunca 1:1.

### Microinterações

- Underlines de link que **desenham na entrada** (background-size 0 → 100%).
- Hover em imagem com **scale 1.03 em 1200ms ease-out** (lento, cinematográfico).
- Reveal por linha em scroll usando Framer Motion ou CSS puro com `animation-delay` escalonado.
- Botões com transição de cor em **300ms**, sem flash.
- Foco visível sempre: `focus-visible:outline-2 outline-offset-4`.
- **`prefers-reduced-motion` respeitado** — desabilita scale e movimento.

### Anti-padrões — lista negra para Claude

> **Claude: nunca gere código que viole qualquer item abaixo.**

- ❌ Fontes Inter, Roboto, Geist, Space Grotesk (overuse).
- ❌ Gradient radial roxo/teal em hero (clichê de IA).
- ❌ Cards com `rounded-2xl` em tudo (resultado de template).
- ❌ Bento grid genérico de "features".
- ❌ "Get Started" / "Learn More" / "Saiba Mais" como CTA (lazy copy).
- ❌ Emojis como ícones.
- ❌ Stock photo com pessoa rindo apontando para laptop.
- ❌ Hero com texto + radial gradient + zero imagem.
- ❌ Ícones Material Symbols (consistência ruim em escala).
- ❌ `text-gray-500 dark:text-gray-400` em vez de tokens semânticos.
- ❌ Qualquer layout que pareça saído de um template do Tailwind UI, Shadcn, ou Vercel showcase.

### Componentes-chave a construir

Lista prioritária para o design system (construir nesta ordem):

1. **Wordmark** (puro tipográfico, Fraunces italic, sem ornamento; 3 tamanhos)
2. **Button** (variantes: primary ink, ghost outline, minimal underline; tamanhos sm/md/lg; uppercase tracking-wide)
3. **Editorial Link** (com underline animado, dois modos: passive e active)
4. **Section Header** (numeral romano + eyebrow + h2 grande + descrição)
5. **Section Divider** (rule + ornamento tipográfico · · ·)
6. **Image Card** (aspect-ratio fixo, overlay editorial, caption tipográfico no rodapé)
7. **Service Card** (versão visual com imagem + categoria + lista de serviços)
8. **Booking Wizard Step** (header de progresso + conteúdo + footer com next/back)
9. **Time Slot Picker** (grid de horários com estados available/active/taken)
10. **Calendar Day Picker** (faixa horizontal com 7 dias, scroll mobile)
11. **Client Card** (CRM — avatar + nome + último atendimento + LTV + badge de status)
12. **Empty State** (ilustração tipográfica + copy + CTA)
13. **Toast** (success/error/info, posicionamento canto inferior direito, auto-dismiss 4s)
14. **Modal/Sheet** (mobile = bottom sheet com gesto de fechar; desktop = modal centralizado)

### Acessibilidade

Obrigatório, não opcional:

- Contraste 4.5:1 em todo body text. 3:1 em large text.
- Foco visível e claro em todo elemento interativo.
- Tab order respeita ordem visual.
- Cada ícone-only button tem `aria-label`.
- Heading hierarchy sequencial (h1 → h2 → h3 sem pular).
- Cor nunca é a única indicação de informação.
- `prefers-reduced-motion` cancela animações grandes.
- Touch targets ≥ 44×44px no mobile.

### Mobile-first

A clientela é 70%+ mobile. Toda decisão visual começa em viewport 375px.

```
sm   640px   tablet portrait
md   768px   tablet landscape
lg  1024px   laptop pequeno
xl  1280px   desktop
2xl 1536px   desktop grande
```

Container max-width: 1280px (`max-w-7xl`). Padding lateral: `px-6 lg:px-12`.

---

## 7. Implementação

### Stack final consolidado

```
Framework:      Next.js 15 (App Router) + TypeScript estrito
Estilo:         Tailwind CSS v4 (tema custom via @theme em globals.css)
UI primitivos:  shadcn/ui CUSTOMIZADO (não usar defaults)
Animações:      Framer Motion + CSS animation
Ícones:         Lucide React
Fontes:         next/font/google — Fraunces, Manrope, Italiana
Banco:          Supabase Postgres + RLS
Auth:           Supabase Auth (magic link cliente; senha + 2FA equipe)
Storage:        Supabase Storage (galeria, antes/depois)
Calendar:       googleapis (Google Calendar API)
Email:          Resend + React Email
Telemetria:     PostHog + Sentry
Hospedagem:     Vercel
Validação:      Zod
Forms:          React Hook Form
Datas:          date-fns + date-fns/locale/pt-BR
Tabelas admin:  @tanstack/react-table
Testes:         Vitest (unit) + Playwright (e2e crítico)
```

### Estrutura de pastas

> **Claude: ao gerar arquivos, respeitar esta estrutura de pastas. Nunca inventar localização.**

```
silvias-os/
├── src/
│   ├── app/
│   │   ├── (marketing)/                 # rotas públicas (site)
│   │   │   ├── page.tsx                 # home
│   │   │   ├── servicos/page.tsx
│   │   │   ├── servicos/[categoria]/page.tsx
│   │   │   ├── galeria/page.tsx
│   │   │   ├── unidades/page.tsx
│   │   │   ├── sobre/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (booking)/                   # wizard de agendamento
│   │   │   ├── agendar/page.tsx
│   │   │   ├── agendar/sucesso/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (account)/                   # área do cliente logado
│   │   │   ├── conta/page.tsx
│   │   │   ├── conta/agendamentos/page.tsx
│   │   │   └── layout.tsx
│   │   ├── admin/                       # painel privado
│   │   │   ├── page.tsx                 # dashboard
│   │   │   ├── agendamentos/page.tsx
│   │   │   ├── clientes/page.tsx
│   │   │   ├── clientes/[id]/page.tsx
│   │   │   ├── servicos/page.tsx
│   │   │   ├── equipe/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── bookings/route.ts
│   │   │   ├── slots/route.ts
│   │   │   ├── webhooks/calendar/route.ts
│   │   │   └── cron/reminders/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── manifest.ts
│   ├── components/
│   │   ├── brand/
│   │   ├── marketing/
│   │   ├── booking/
│   │   ├── account/
│   │   ├── admin/
│   │   └── ui/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── calendar/
│   │   ├── email/
│   │   ├── analytics/
│   │   ├── data/
│   │   ├── auth/
│   │   ├── validation/
│   │   └── utils.ts
│   └── middleware.ts
├── public/
│   ├── images/
│   └── og/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── functions/
├── tests/
│   ├── e2e/
│   └── unit/
├── .env.example
├── next.config.ts
└── package.json
```

### Ordem de implementação por Sprint

**Sprint 0 · Setup (1-2 dias)**
- Scaffold Next.js + TypeScript + Tailwind v4
- Configurar fontes via next/font (Fraunces + Manrope + Italiana)
- Configurar tema via `@theme` em globals.css (sistema de cor + tipografia)
- Setup Supabase local com Docker + migrations iniciais
- Setup Resend, Posthog, Sentry com chaves de dev
- Componente Button + Wordmark + globals utilities

**Sprint 1 · Site público (3-5 dias)**
- Layout marketing + Header + Footer
- Home com 8-9 seções: hero, manifesto, serviços, galeria, prova de produto, equipe, depoimentos, unidades, CTA final
- Página de serviços com todas as 8 categorias
- Página de galeria · Página de unidades · Página sobre
- SEO meta tags + sitemap + schema.org LocalBusiness

**Sprint 2 · Agendamento online (5-7 dias)**
- Schema de banco completo (migrations Supabase)
- Wizard multi-step (serviço → unidade → profissional → data → hora → contato → confirmar)
- Integração Google Calendar (listar slots + criar evento)
- Confirmação por e-mail (Resend + React Email)
- Cron de lembrete 24h antes (Vercel cron)
- Área do cliente com login passwordless
- Self-service de cancelar/reagendar

**Sprint 3 · CRM e admin (5-7 dias)**
- Auth de equipe + roles
- Dashboard: agendamentos do dia, taxa de ocupação por unidade, top serviços
- Lista de clientes com busca, filtros, segmentação
- Ficha de cliente com timeline de atendimentos
- Detecção de clientes inativos (60+ dias sem visita)
- CRUD de serviços, profissionais, horários de trabalho

**Sprint 4 · Polish e deploy (3-4 dias)**
- Performance audit (Lighthouse 95+)
- Acessibilidade audit
- Deploy Vercel com domínio custom
- Migração do silviashair.com.br atual
- Documentação para Silvia

**Total estimado:** 17-25 dias de trabalho ativo. Realistas 5-8 semanas com revisões.

---

## 8. Estratégia comercial

### Pricing recomendado

**Pacote V1 — Silvia's OS Completo**
- Setup: **R$ 12.000-18.000** (à vista R$ 10.000-15.000)
- Mensalidade: **R$ 400-700/mês**
- Domínio: usa o silviashair.com.br atual

**Add-ons V2:**
- Marketing automation (3.7): R$ 3.000 setup + R$ 100/mês adicional
- Loyalty (3.6): R$ 4.000 setup
- Stylist View (3.5): R$ 5.000 setup
- Hub multimarca (3.8): R$ 8.000 setup

### Pitch — três ângulos

**Ângulo A · Receita perdida**
> "Silvia, todo mês você está perdendo entre R$ 15k e R$ 50k em agendamentos que chegam fora do horário comercial e não são respondidos a tempo."

**Ângulo B · Diferenciação**
> "Você é o salão mais premium de Teresina. Mas seu cliente reserva pelo WhatsApp como se fosse barbearia de bairro."

**Ângulo C · Conhecimento de cliente**
> "Hoje você não sabe quem foi sua cliente que voltou 12 vezes em 2025. Não sabe quem aniversariou semana passada."

### Demo strategy

Loom de 90 segundos mostrando o sistema rodando com nome dela:
1. Hero do silviashair.com.br renovado (3s)
2. Cliente reservando coloração em 30 segundos no celular (30s)
3. Aparece no dashboard da Silvia em tempo real (15s)
4. Ficha da cliente já existente recebendo nova entrada (15s)

**Canal de abordagem:** DM no Instagram, não e-mail.

---

## 9. Riscos e questões abertas

### Riscos técnicos

| Risco | Mitigação |
|---|---|
| Sincronização Google Calendar em edge cases | Webhook robusto + reconciliação periódica + fallback manual |
| Performance da galeria com muitas imagens | Supabase Storage + next/image + lazy loading |
| Free tier Supabase estourar | Monitorar; upgrade custa $25/mês quando precisar |
| RLS mal configurado expõe dados | Testes de RLS antes do deploy |

### Questões abertas (precisam de resposta antes de codar)

1. Os profissionais já usam Google Calendar?
2. Estoque de produtos é controlado?
3. Há sistema financeiro/contábil atual?
4. LGPD compliance pensada? (Termo de uso e política de privacidade são obrigatórios)

---

## 10. Skills disponíveis no ambiente do Claude

> **Claude: estas são as skills que você tem acesso neste projeto. Ler o SKILL.md correspondente antes de qualquer tarefa que se enquadre na descrição.**

| Skill | Caminho | Quando usar |
|---|---|---|
| `frontend-design` | `/mnt/skills/public/frontend-design/SKILL.md` | **OBRIGATÓRIO** antes de qualquer componente, página, ou arquivo CSS/JSX visual. Define o sistema de design anti-genérico. |
| `docx` | `/mnt/skills/public/docx/SKILL.md` | Antes de criar/editar qualquer arquivo `.docx` (manuais, propostas, documentos Word). |
| `pdf` | `/mnt/skills/public/pdf/SKILL.md` | Antes de criar, preencher, mesclar ou manipular qualquer arquivo `.pdf`. |
| `pdf-reading` | `/mnt/skills/public/pdf-reading/SKILL.md` | Antes de ler ou extrair conteúdo de PDFs enviados por Arthur. |
| `pptx` | `/mnt/skills/public/pptx/SKILL.md` | Antes de criar ou editar qualquer apresentação `.pptx` (pitches, decks). |
| `xlsx` | `/mnt/skills/public/xlsx/SKILL.md` | Antes de criar ou manipular planilhas `.xlsx` (relatórios, modelos financeiros). |
| `file-reading` | `/mnt/skills/public/file-reading/SKILL.md` | Quando Arthur enviar qualquer arquivo cujo conteúdo ainda não esteja no contexto. |

### Como invocar uma skill no Claude

Não há CLI. Basta Claude **ler o arquivo** com `view` antes de iniciar a tarefa:

```
→ Tarefa: "Crie o componente HeroSection"
→ Claude deve primeiro: view /mnt/skills/public/frontend-design/SKILL.md
→ Depois: gerar o componente respeitando as diretrizes do SKILL.md
```

```
→ Tarefa: "Gera um PDF de proposta comercial para a Silvia"
→ Claude deve primeiro: view /mnt/skills/public/pdf/SKILL.md
→ Depois: criar o arquivo com o método correto descrito na skill
```

---

## 11. Próximos passos imediatos

Para Claude ao receber este documento:

1. **Ler integralmente** antes de qualquer output.
2. **Identificar o Sprint atual** na conversa com Arthur.
3. **Verificar o anti-padrão** mais provável para a tarefa pedida (seção 6).
4. **Ler a skill relevante** antes de começar a gerar.
5. **Perguntar uma coisa só** se houver ambiguidade real antes de começar.
6. **Gerar arquivos completos** com caminhos corretos conforme a estrutura da seção 7 — não trechos parciais.
7. **Design system antes de páginas** — componentes consistentes > páginas vistosas-mas-inconsistentes.

---

## Anexos

### Catálogo real de serviços (seed do banco)

- **Cortes:** Tesouraterapia · Bordado · Masculino · Feminino · Infantil · Visagismo
- **Tratamentos intensivos:** Nanoqueratinização · Rituais Kérastase · Restaurações
- **Mudança de forma:** Photon Hair · Texturização · Relaxamento · Selagem · Botox capilar · Taninoplastia
- **Coloração:** Total · Retoque de raiz · Tonalização
- **Clareamento:** Mechas · Luzes
- **Unhas:** Manicure · Pedicure · Acrigel · Francesinha · Fibra de vidro · Plástica dos pés · Tratamento de calos
- **Estética:** Limpeza de pele · Design de sobrancelha · Sobrancelha definitiva · Micropigmentação labial · Delineador · Massagem
- **Depilação:** Perna · Coxa · Axila · Buço · Braço · Peito · Costas · Barba
- **Especiais:** Maquiagem digital · Penteados (debutante, madrinha, formanda) · Megahair · Prótese capilar masculina

### Credenciais da equipe (usar como prova social)

- Vidal Sassoon · Londres
- TONI&GUY · Milão
- Pivot Point · Chicago
- Llongueras · Barcelona
- Master WellaStrate

---

*Documento iniciado em 14 de maio de 2026. Adaptado para Claude como agente implementador.*