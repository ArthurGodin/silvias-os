"use client";

import { useMemo, useReducer, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { StepProgress } from "@/components/booking/step-progress";
import { CalendarDayPicker } from "@/components/booking/calendar-day-picker";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { CATEGORIES, SERVICES, type Service } from "@/lib/data/services";
import { UNITS, type Unit } from "@/lib/data/units";
import { staffForService, type StaffMember } from "@/lib/data/team";
import { getCombo, type Combo } from "@/lib/data/combos";
import type { Slot } from "@/lib/booking/slot-engine";
import { contactSchema, type ContactPayload } from "@/lib/booking/schema";
import { cn, formatBRL } from "@/lib/utils";

const STEPS = [
  { key: "service", label: "Serviços" },
  { key: "unit", label: "Casa" },
  { key: "staff", label: "Profissional" },
  { key: "datetime", label: "Quando" },
  { key: "contact", label: "Contato" },
  { key: "review", label: "Conferir" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const MAX_SERVICES = 4;

type State = {
  step: number;
  serviceSlugs: string[];
  unitSlug: string | null;
  staffSlug: string | null;
  date: string | null;
  time: string | null;
  contact: ContactPayload | null;
};

type Action =
  | { type: "GOTO"; step: number }
  | { type: "SET"; payload: Partial<State> }
  | { type: "TOGGLE_SERVICE"; slug: string }
  | { type: "RESET" };

const initial: State = {
  step: 0,
  serviceSlugs: [],
  unitSlug: null,
  staffSlug: null,
  date: null,
  time: null,
  contact: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "GOTO":
      return { ...state, step: action.step };
    case "SET":
      return { ...state, ...action.payload };
    case "TOGGLE_SERVICE": {
      const has = state.serviceSlugs.includes(action.slug);
      if (has) {
        return {
          ...state,
          serviceSlugs: state.serviceSlugs.filter((s) => s !== action.slug),
          staffSlug: null,
        };
      }
      if (state.serviceSlugs.length >= MAX_SERVICES) return state;
      return {
        ...state,
        serviceSlugs: [...state.serviceSlugs, action.slug],
        staffSlug: null,
      };
    }
    case "RESET":
      return initial;
  }
}

export function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const preService = params.get("servico");
  const preComboSlug = params.get("combo");
  const preCombo = preComboSlug ? getCombo(preComboSlug) ?? null : null;

  const preselectedSlugs = (() => {
    if (preCombo) {
      const valid = preCombo.serviceSlugs.filter((slug) =>
        SERVICES.some((s) => s.slug === slug),
      );
      return valid.slice(0, MAX_SERVICES);
    }
    if (preService && SERVICES.some((s) => s.slug === preService)) {
      return [preService];
    }
    return [];
  })();

  const initialStep = (() => {
    if (preCombo && preselectedSlugs.length > 0) return 0;
    if (preService && preselectedSlugs.length > 0) return 1;
    return 0;
  })();

  const [state, dispatch] = useReducer(reducer, {
    ...initial,
    serviceSlugs: preselectedSlugs,
    step: initialStep,
  });

  const services = useMemo(
    () =>
      state.serviceSlugs
        .map((slug) => SERVICES.find((s) => s.slug === slug))
        .filter((s): s is Service => !!s),
    [state.serviceSlugs],
  );

  const totalDuration = useMemo(
    () => services.reduce((acc, s) => acc + s.duration, 0),
    [services],
  );
  const sumIndividualPrice = useMemo(
    () => services.reduce((acc, s) => acc + s.fromPrice, 0),
    [services],
  );
  const needsDeposit = services.some((s) => s.requiresDeposit);

  const isComboMatch = useMemo(() => {
    if (!preCombo) return false;
    if (state.serviceSlugs.length !== preCombo.serviceSlugs.length) return false;
    return preCombo.serviceSlugs.every((s) => state.serviceSlugs.includes(s));
  }, [preCombo, state.serviceSlugs]);

  const comboPriceCents = useMemo(() => {
    if (!preCombo) return null;
    if (preCombo.priceCents) return preCombo.priceCents;
    if (preCombo.fromCents) return preCombo.fromCents;
    if (preCombo.variants?.[0]) return preCombo.variants[0].priceCents;
    return null;
  }, [preCombo]);

  const displayPrice =
    isComboMatch && comboPriceCents !== null
      ? comboPriceCents / 100
      : sumIndividualPrice;
  const displayPriceLabel =
    isComboMatch && comboPriceCents !== null ? "preço combo" : "a partir de";

  const unit = useMemo(
    () => UNITS.find((u) => u.slug === state.unitSlug) ?? null,
    [state.unitSlug],
  );

  const availableStaff: StaffMember[] = useMemo(() => {
    if (!state.unitSlug || services.length === 0) return [];
    if (services.length === 1) {
      const firstService = services[0];
      if (!firstService) return [];
      return staffForService(firstService.slug, state.unitSlug);
    }
    return [];
  }, [services, state.unitSlug]);

  const staff = useMemo(
    () => availableStaff.find((s) => s.slug === state.staffSlug) ?? null,
    [availableStaff, state.staffSlug],
  );

  const isMultiService = services.length > 1;

  const canGoNext = useMemo(() => {
    const s = STEPS[state.step]?.key as StepKey;
    if (s === "service") return state.serviceSlugs.length > 0;
    if (s === "unit") return !!state.unitSlug;
    if (s === "staff") return !!state.staffSlug || isMultiService;
    if (s === "datetime") return !!state.date && !!state.time;
    if (s === "contact") return !!state.contact;
    return true;
  }, [state, isMultiService]);

  function goNext() {
    if (currentStepKey === "unit" && isMultiService) {
      dispatch({ type: "SET", payload: { staffSlug: "__any__", step: 3 } });
      return;
    }
    dispatch({
      type: "GOTO",
      step: Math.min(STEPS.length - 1, state.step + 1),
    });
  }
  function goBack() {
    if (currentStepKey === "datetime" && isMultiService) {
      dispatch({ type: "GOTO", step: 1 });
      return;
    }
    dispatch({ type: "GOTO", step: Math.max(0, state.step - 1) });
  }

  const currentStepKey = STEPS[state.step]?.key;

  return (
    <div className="container-editorial pt-32 lg:pt-40 pb-32">
      <StepProgress
        steps={[...STEPS]}
        currentIndex={state.step}
        onStepClick={(i) => dispatch({ type: "GOTO", step: i })}
      />

      <div className="mt-12 lg:mt-20 min-h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentStepKey === "service" && (
              <ServiceStep
                selected={state.serviceSlugs}
                onToggle={(slug) =>
                  dispatch({ type: "TOGGLE_SERVICE", slug })
                }
                totalDuration={totalDuration}
                displayPrice={displayPrice}
                displayPriceLabel={displayPriceLabel}
                combo={preCombo}
              />
            )}
            {currentStepKey === "unit" && (
              <UnitStep
                value={state.unitSlug}
                onPick={(slug) =>
                  dispatch({
                    type: "SET",
                    payload: { unitSlug: slug, staffSlug: null },
                  })
                }
              />
            )}
            {currentStepKey === "staff" && (
              <StaffStep
                value={state.staffSlug}
                staff={availableStaff}
                isMultiService={isMultiService}
                onPick={(slug) =>
                  dispatch({ type: "SET", payload: { staffSlug: slug } })
                }
              />
            )}
            {currentStepKey === "datetime" &&
              services[0] &&
              state.staffSlug &&
              state.unitSlug && (
                <DateTimeStep
                  services={services}
                  totalDuration={totalDuration}
                  unitSlug={state.unitSlug}
                  staffSlug={state.staffSlug}
                  date={state.date}
                  time={state.time}
                  onChange={(payload) => dispatch({ type: "SET", payload })}
                />
              )}
            {currentStepKey === "contact" && (
              <ContactStep
                value={state.contact}
                onSubmit={(payload) =>
                  dispatch({
                    type: "SET",
                    payload: { contact: payload, step: state.step + 1 },
                  })
                }
              />
            )}
            {currentStepKey === "review" &&
              services.length > 0 &&
              unit &&
              state.contact &&
              state.date &&
              state.time && (
                <ReviewStep
                  state={state}
                  services={services}
                  unit={unit}
                  staff={staff}
                  totalDuration={totalDuration}
                  displayPrice={displayPrice}
                  displayPriceLabel={displayPriceLabel}
                  needsDeposit={needsDeposit}
                  combo={preCombo}
                  isComboMatch={isComboMatch}
                  onConfirmed={(id, cancelToken) => {
                    const qs = new URLSearchParams({ id });
                    if (cancelToken) qs.set("cancel", cancelToken);
                    router.push(`/agendar/sucesso?${qs}` as never);
                  }}
                />
              )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 lg:mt-16 pt-8 border-t border-[var(--color-rule)] flex items-center justify-between">
        <Button
          variant="underline"
          size="md"
          onClick={goBack}
          disabled={state.step === 0}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        {currentStepKey !== "review" && currentStepKey !== "contact" && (
          <Button
            variant="ink"
            size="md"
            onClick={goNext}
            disabled={!canGoNext}
          >
            Avançar
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// =============== STEPS ===============

function ServiceStep({
  selected,
  onToggle,
  totalDuration,
  displayPrice,
  displayPriceLabel,
  combo,
}: {
  selected: string[];
  onToggle: (slug: string) => void;
  totalDuration: number;
  displayPrice: number;
  displayPriceLabel: string;
  combo: Combo | null;
}) {
  return (
    <div className="pb-32 lg:pb-24">
      <StepHeader
        number={1}
        eyebrow={`Serviços · selecione até ${MAX_SERVICES}`}
        title={
          combo ? (
            <>
              Combo{" "}
              <span className="text-display-script text-gold-gradient">
                pré-selecionado
              </span>
            </>
          ) : (
            <>
              O que você quer{" "}
              <span className="text-display-script text-gold-gradient">
                fazer hoje?
              </span>
            </>
          )
        }
        description={
          combo
            ? `Os serviços do combo "${combo.title}" já estão marcados abaixo. Você pode revisar, remover ou adicionar outros.`
            : `Pode combinar até ${MAX_SERVICES} serviços no mesmo agendamento — o sistema soma duração e valor.`
        }
      />

      {combo && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 flex items-center gap-4 px-5 py-4 border border-[var(--color-gold)]/40 bg-gold-mist/30"
        >
          <span
            aria-hidden
            className="flex-none inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-gold)] text-paper-50"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <div className="min-w-0">
            <p className="text-eyebrow text-gold-deep">Combo carregado</p>
            <p className="mt-1 font-[family-name:var(--font-display)] italic text-[1.1rem] lg:text-[1.25rem] leading-tight truncate">
              {combo.title}
            </p>
          </div>
        </motion.div>
      )}

      <div className="mt-12 space-y-14 lg:space-y-20">
        {CATEGORIES.map((cat) => {
          const list = SERVICES.filter((s) => s.category === cat.slug);
          return (
            <div key={cat.slug}>
              <div className="flex items-baseline gap-5 pb-4 border-b border-[var(--color-rule-strong)]">
                <span className="text-eyebrow text-gold-deep tabular-nums">
                  {String(cat.index).padStart(2, "0")}
                </span>
                <h3
                  className="font-[family-name:var(--font-display)] text-[1.65rem] lg:text-[2rem] leading-none"
                  style={{
                    fontVariationSettings: "'SOFT' 50, 'WONK' 1, 'opsz' 144",
                  }}
                >
                  {cat.title}
                </h3>
              </div>
              <ul className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {list.map((s) => {
                  const isActive = selected.includes(s.slug);
                  const limitReached =
                    selected.length >= MAX_SERVICES && !isActive;
                  return (
                    <li key={s.slug}>
                      <motion.button
                        type="button"
                        onClick={() => onToggle(s.slug)}
                        disabled={limitReached}
                        whileTap={{ scale: 0.985 }}
                        animate={{
                          borderColor: isActive
                            ? "var(--color-ink-700)"
                            : "var(--color-rule)",
                          backgroundColor: isActive
                            ? "rgba(191, 155, 91, 0.08)"
                            : "rgba(0,0,0,0)",
                        }}
                        transition={{ duration: 0.25 }}
                        className={cn(
                          "w-full text-left p-5 border min-h-[120px]",
                          "relative transition-all duration-200",
                          limitReached && "opacity-40 cursor-not-allowed",
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <span className="font-[family-name:var(--font-display)] text-[1.2rem] lg:text-[1.3rem] leading-tight">
                              {s.name}
                            </span>
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-500">
                              <span className="tabular-nums">
                                {s.duration} min
                              </span>
                              <span aria-hidden>·</span>
                              <span>a partir de {formatBRL(s.fromPrice)}</span>
                              {s.requiresDeposit && (
                                <>
                                  <span aria-hidden>·</span>
                                  <span className="text-gold-deep">sinal Pix</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span
                            aria-hidden
                            className={cn(
                              "mt-0.5 flex-none inline-flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200",
                              isActive
                                ? "bg-ink-700 border-ink-700 text-paper-100"
                                : "border-[var(--color-rule-strong)] text-transparent",
                            )}
                          >
                            <AnimatePresence>
                              {isActive && (
                                <motion.span
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 22,
                                  }}
                                >
                                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                        </div>
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-30 bg-paper-50/95 backdrop-blur-md border-t border-[var(--color-rule-strong)] shadow-[0_-12px_30px_-12px_rgba(46,45,40,0.12)]"
          >
            <div className="container-editorial py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-muted">
                  {selected.length} de {MAX_SERVICES} · {totalDuration} min
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] italic text-[1.35rem] leading-none tabular-nums">
                  {formatBRL(displayPrice)}{" "}
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted not-italic">
                    {displayPriceLabel}
                  </span>
                </p>
              </div>
              <Plus className="h-5 w-5 text-gold-deep flex-none hidden sm:inline-block" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnitStep({
  value,
  onPick,
}: {
  value: string | null;
  onPick: (slug: string) => void;
}) {
  return (
    <div>
      <StepHeader
        number={2}
        eyebrow="Casa"
        title={
          <>
            Em qual{" "}
            <span className="text-display-script text-gold-gradient">
              unidade?
            </span>
          </>
        }
      />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        {UNITS.map((u) => {
          const isActive = value === u.slug;
          return (
            <motion.button
              key={u.slug}
              type="button"
              onClick={() => onPick(u.slug)}
              aria-pressed={isActive}
              whileTap={{ scale: 0.98 }}
              animate={{
                borderColor: isActive
                  ? "var(--color-gold)"
                  : "var(--color-rule)",
                boxShadow: isActive
                  ? "0 24px 60px -32px rgba(191,155,91,0.55)"
                  : "0 0 0 rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden border text-left",
                "transition-colors",
              )}
            >
              <Image
                src={u.imageUrl}
                alt={u.shoppingName}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover opacity-90 transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-105"
              />
              <motion.div
                aria-hidden
                animate={{
                  background: isActive
                    ? "linear-gradient(to top, rgba(8,8,7,0.92), rgba(191,155,91,0.25))"
                    : "linear-gradient(to top, rgba(8,8,7,0.9), rgba(8,8,7,0.1))",
                }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              />
              <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-between text-paper-100">
                <span className="text-eyebrow text-paper-200/70">
                  Casa {u.name.replace(/^Casa /, "")}
                </span>
                <div>
                  <motion.p
                    animate={{ y: isActive ? -4 : 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="font-[family-name:var(--font-display)] italic text-[2.25rem] lg:text-[2.5rem] leading-none"
                    style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1, 'opsz' 144" }}
                  >
                    {u.name}
                  </motion.p>
                  <p className="mt-2 text-[14px] text-paper-200/85">
                    {u.shoppingName}
                  </p>
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-gold-200"
                      >
                        <Check className="h-3 w-3" /> Selecionada
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StaffStep({
  value,
  staff,
  isMultiService,
  onPick,
}: {
  value: string | null;
  staff: StaffMember[];
  isMultiService: boolean;
  onPick: (slug: string) => void;
}) {
  if (staff.length === 0) {
    return (
      <div>
        <StepHeader
          number={3}
          eyebrow="Profissional"
          title={
            <>
              A casa{" "}
              <span className="text-display-script text-gold-gradient">
                escolhe por você
              </span>
            </>
          }
          description={
            isMultiService
              ? "Quando você combina serviços diferentes, a recepção monta a equipe certa para tudo acontecer em um único atendimento."
              : "Para esse serviço, nossa recepção selecionará a profissional ideal no momento da reserva."
          }
        />
        <div className="mt-12">
          <Button variant="ink" size="md" onClick={() => onPick("__any__")}>
            Continuar
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepHeader
        number={3}
        eyebrow="Profissional"
        title={
          <>
            Com{" "}
            <span className="text-display-script text-gold-gradient">
              quem?
            </span>
          </>
        }
        description="Você pode escolher uma profissional específica ou deixar que a casa indique."
      />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        <motion.button
          type="button"
          onClick={() => onPick("__any__")}
          whileTap={{ scale: 0.98 }}
          aria-pressed={value === "__any__"}
          animate={{
            borderColor:
              value === "__any__"
                ? "var(--color-gold)"
                : "var(--color-rule)",
            backgroundColor:
              value === "__any__"
                ? "rgba(191, 155, 91, 0.08)"
                : "rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.3 }}
          className="p-6 lg:p-8 border min-h-[260px] flex flex-col justify-between text-left"
        >
          <span className="text-eyebrow">Recomendação</span>
          <div>
            <p className="font-[family-name:var(--font-display)] italic text-[1.85rem] leading-none">
              A casa escolhe
            </p>
            <p className="mt-3 text-[14px] text-ink-500">
              Indicamos a profissional certa para o seu cabelo e seu horário.
            </p>
          </div>
        </motion.button>

        {staff.map((m) => {
          const isActive = value === m.slug;
          return (
            <motion.button
              key={m.slug}
              type="button"
              onClick={() => onPick(m.slug)}
              whileTap={{ scale: 0.98 }}
              aria-pressed={isActive}
              animate={{
                borderColor: isActive
                  ? "var(--color-gold)"
                  : "var(--color-rule)",
                boxShadow: isActive
                  ? "0 22px 50px -28px rgba(191,155,91,0.55)"
                  : "0 0 0 rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.35 }}
              className="group flex flex-col text-left border"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-ink-100">
                <Image
                  src={m.imageUrl}
                  alt={m.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-eyebrow">{m.role}</p>
                <p className="mt-2 font-[family-name:var(--font-display)] italic text-[1.45rem] leading-none">
                  {m.name}
                </p>
                {m.credentials[0] && (
                  <p className="mt-3 text-[12px] text-ink-500">{m.credentials[0]}</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function DateTimeStep({
  services,
  totalDuration,
  unitSlug,
  staffSlug,
  date,
  time,
  onChange,
}: {
  services: Service[];
  totalDuration: number;
  unitSlug: string;
  staffSlug: string;
  date: string | null;
  time: string | null;
  onChange: (payload: { date?: string | null; time?: string | null }) => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const firstService = services[0];

  useEffect(() => {
    if (!date || !firstService) return;
    const ctl = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({
      serviceSlug: firstService.slug,
      unitSlug,
      staffSlug,
      date,
      duration: String(totalDuration),
    });
    fetch(`/api/slots?${params}`, { signal: ctl.signal })
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
    return () => ctl.abort();
  }, [date, firstService, unitSlug, staffSlug, totalDuration]);

  return (
    <div>
      <StepHeader
        number={4}
        eyebrow="Quando"
        title={
          <>
            Escolha o{" "}
            <span className="text-display-script text-gold-gradient">
              dia e hora.
            </span>
          </>
        }
        description={`Duração estimada total: ${totalDuration} minutos.`}
      />

      <div className="mt-12">
        <Label className="mb-4 block">Dia</Label>
        <CalendarDayPicker
          value={date}
          onChange={(d) => onChange({ date: d, time: null })}
        />
      </div>

      {date && (
        <div className="mt-12">
          <Label className="mb-4 block">Horário</Label>
          <TimeSlotPicker
            slots={slots}
            value={time}
            onChange={(t) => onChange({ time: t })}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

function ContactStep({
  value,
  onSubmit,
}: {
  value: ContactPayload | null;
  onSubmit: (payload: ContactPayload) => void;
}) {
  const [name, setName] = useState(value?.name ?? "");
  const [email, setEmail] = useState(value?.email ?? "");
  const [phone, setPhone] = useState(value?.phone ?? "");
  const [notes, setNotes] = useState(value?.notes ?? "");
  const [acceptPrivacy, setAcceptPrivacy] = useState(
    value?.consents.privacy_policy ?? false,
  );
  const [acceptTerms, setAcceptTerms] = useState(
    value?.consents.terms_of_use ?? false,
  );
  const [marketing, setMarketing] = useState(
    value?.consents.marketing_email ?? false,
  );
  const [createAccount, setCreateAccount] = useState(
    value?.consents.create_account ?? false,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = contactSchema.safeParse({
      name,
      email,
      phone,
      notes,
      consents: {
        privacy_policy: acceptPrivacy,
        terms_of_use: acceptTerms,
        marketing_email: marketing,
        create_account: createAccount,
      },
    });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errs[issue.path.join(".")] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <StepHeader
        number={5}
        eyebrow="Contato"
        title={
          <>
            Como podemos{" "}
            <span className="text-display-script text-gold-gradient">
              te chamar?
            </span>
          </>
        }
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como aparece no documento"
            invalid={!!errors.name}
            autoComplete="name"
          />
          {errors.name && (
            <p className="mt-2 text-[12px] text-red-700">{errors.name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(86) 9XXXX-XXXX"
            invalid={!!errors.phone}
            autoComplete="tel"
            inputMode="tel"
          />
          {errors.phone && (
            <p className="mt-2 text-[12px] text-red-700">{errors.phone}</p>
          )}
        </div>
        <div className="lg:col-span-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="para confirmação e histórico"
            invalid={!!errors.email}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-2 text-[12px] text-red-700">{errors.email}</p>
          )}
        </div>
        <div className="lg:col-span-2">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alergias, preferências, primeira vez no salão..."
            rows={3}
          />
        </div>
      </div>

      <div className="mt-14 pt-10 border-t border-[var(--color-rule)] space-y-5 max-w-2xl">
        <p className="text-eyebrow mb-2">Consentimento LGPD</p>
        <Checkbox checked={acceptPrivacy} onChange={setAcceptPrivacy}>
          Li e aceito a{" "}
          <a
            href="/privacidade"
            target="_blank"
            className="editorial-link font-medium"
          >
            política de privacidade
          </a>
          .
        </Checkbox>
        {errors["consents.privacy_policy"] && (
          <p className="text-[12px] text-red-700">
            {errors["consents.privacy_policy"]}
          </p>
        )}
        <Checkbox checked={acceptTerms} onChange={setAcceptTerms}>
          Li e aceito os{" "}
          <a
            href="/termos"
            target="_blank"
            className="editorial-link font-medium"
          >
            termos de uso
          </a>{" "}
          (cancelamento, sinal, pontualidade).
        </Checkbox>
        {errors["consents.terms_of_use"] && (
          <p className="text-[12px] text-red-700">
            {errors["consents.terms_of_use"]}
          </p>
        )}
        <Checkbox checked={marketing} onChange={setMarketing}>
          Quero receber novidades, dicas e ofertas exclusivas por e-mail. (Opcional)
        </Checkbox>
      </div>

      <div className="mt-10 pt-10 border-t border-[var(--color-rule)] max-w-2xl">
        <p className="text-eyebrow mb-3">Conta (opcional)</p>
        <Checkbox checked={createAccount} onChange={setCreateAccount}>
          <strong className="text-ink-700">Criar uma conta para acompanhar meus agendamentos.</strong>
          <span className="block mt-1 text-[13px] text-ink-500">
            Sem senha — você entra com link mágico no e-mail. Pode reagendar e
            ver histórico depois. Se preferir, agende como visitante.
          </span>
        </Checkbox>
      </div>

      <div className="mt-12">
        <Button type="submit" variant="ink" size="lg">
          Continuar para revisão
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function ReviewStep({
  state,
  services,
  unit,
  staff,
  totalDuration,
  displayPrice,
  displayPriceLabel,
  needsDeposit,
  combo,
  isComboMatch,
  onConfirmed,
}: {
  state: State;
  services: Service[];
  unit: Unit;
  staff: StaffMember | null;
  totalDuration: number;
  displayPrice: number;
  displayPriceLabel: string;
  needsDeposit: boolean;
  combo: Combo | null;
  isComboMatch: boolean;
  onConfirmed: (id: string, cancelToken?: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!state.contact || !state.date || !state.time) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceSlugs: state.serviceSlugs,
          unitSlug: unit.slug,
          staffSlug: staff?.slug ?? "__any__",
          date: state.date,
          time: state.time,
          comboSlug: isComboMatch && combo ? combo.slug : undefined,
          ...state.contact,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(
          body?.error ??
            "Não foi possível confirmar agora. Tente novamente em instantes.",
        );
        return;
      }
      const data = (await res.json()) as {
        id: string;
        cancelToken?: string | null;
      };
      onConfirmed(data.id, data.cancelToken ?? undefined);
    } catch {
      setError("Falha de rede. Verifique sua conexão.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <StepHeader
        number={6}
        eyebrow="Conferir"
        title={
          <>
            Confira e{" "}
            <span className="text-display-script text-gold-gradient">
              confirme.
            </span>
          </>
        }
      />

      {isComboMatch && combo && (
        <div className="mt-10 flex items-center gap-4 px-5 py-4 border border-[var(--color-gold)]/40 bg-gold-mist/30 max-w-3xl">
          <span
            aria-hidden
            className="flex-none inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-gold)] text-paper-50"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <div className="min-w-0">
            <p className="text-eyebrow text-gold-deep">Combo aplicado</p>
            <p className="mt-1 font-[family-name:var(--font-display)] italic text-[1.05rem] leading-tight">
              {combo.title}
            </p>
          </div>
        </div>
      )}

      <dl className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 max-w-3xl">
        <Field
          label={`Serviços · ${services.length}`}
          value={services.map((s) => s.name).join(" · ")}
          caption={`${totalDuration} min · ${displayPriceLabel} ${formatBRL(displayPrice)}`}
          className="lg:col-span-2"
        />
        <Field label="Casa" value={unit.name} caption={unit.shoppingName} />
        <Field
          label="Profissional"
          value={
            staff && staff.slug !== "__any__" ? staff.name : "A casa escolhe"
          }
          caption={staff?.role ?? "Recomendação interna"}
        />
        <Field
          label="Data e horário"
          value={state.date ?? ""}
          caption={state.time ?? ""}
        />
        <Field
          label="Em nome de"
          value={state.contact?.name ?? ""}
          caption={state.contact?.email ?? ""}
        />
        <Field label="Telefone" value={state.contact?.phone ?? ""} />
        {state.contact?.notes && (
          <Field
            label="Observações"
            value={state.contact.notes}
            className="lg:col-span-2"
          />
        )}
      </dl>

      {needsDeposit && (
        <div className="mt-10 p-6 border border-[var(--color-gold)]/40 bg-gold-mist/30 max-w-3xl">
          <p className="text-eyebrow text-gold-deep">Sinal Pix · 30%</p>
          <p className="mt-3 text-[15px] text-ink-600 leading-[1.65]">
            Um ou mais serviços selecionados requerem sinal de{" "}
            <strong className="tabular-nums">
              {formatBRL(displayPrice * 0.3)}
            </strong>{" "}
            no momento do agendamento. O valor é descontado do total no dia do
            atendimento. Reembolso integral para cancelamentos com mais de 24h.
          </p>
        </div>
      )}

      {state.contact?.consents.create_account && (
        <div className="mt-6 p-5 border border-[var(--color-rule-strong)] max-w-3xl bg-paper-50">
          <p className="text-[14px] text-ink-600 leading-[1.6]">
            ✦ Vamos enviar um link mágico para{" "}
            <strong>{state.contact.email}</strong> logo após a confirmação para
            você acessar sua conta.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-8 text-[14px] text-red-700">{error}</p>
      )}

      <div className="mt-12">
        <Button
          type="button"
          variant="ink"
          size="lg"
          onClick={confirm}
          disabled={submitting}
        >
          {submitting ? "Confirmando..." : "Confirmar agendamento"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function StepHeader({
  number,
  eyebrow,
  title,
  description,
}: {
  number: number;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <header className="max-w-3xl">
      <span className="text-eyebrow">
        {String(number).padStart(2, "0")} · {eyebrow}
      </span>
      <h2 className="mt-4 text-balance">{title}</h2>
      {description && (
        <p className="mt-6 text-[16px] lg:text-[17px] text-ink-500 leading-[1.65] max-w-[52ch]">
          {description}
        </p>
      )}
    </header>
  );
}

function Field({
  label,
  value,
  caption,
  className,
}: {
  label: string;
  value: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-[var(--color-rule)] pt-4", className)}>
      <dt className="text-eyebrow">{label}</dt>
      <dd className="mt-2 font-[family-name:var(--font-display)] italic text-[1.35rem] leading-tight">
        {value}
      </dd>
      {caption && <dd className="mt-1 text-[13px] text-ink-500">{caption}</dd>}
    </div>
  );
}
