export type ComboVariant = {
  label: string;
  priceCents: number;
};

export type Combo = {
  slug: string;
  title: string;
  items: string[];
  serviceSlugs: string[];
  description?: string;
  fineprint?: string;
  priceCents?: number;
  fromCents?: number;
  oldPriceCents?: number;
  variants?: ComboVariant[];
  imageUrl: string;
  imagePosition?: "left" | "right";
  featured?: boolean;
};

export const COMBOS: Combo[] = [
  {
    slug: "sobrancelhas-buco",
    title: "Sobrancelhas + buço",
    items: ["Design de sobrancelha", "Depilação de buço"],
    serviceSlugs: ["design-sobrancelha", "buco"],
    priceCents: 5000,
    oldPriceCents: 6500,
    imageUrl:
      "https://images.unsplash.com/photo-1597225244660-1cd128c64284?auto=format&fit=crop&w=1200&q=80",
    imagePosition: "left",
  },
  {
    slug: "hidratacao-escova",
    title: "Hidratação + escova",
    items: ["Hidratação profunda", "Escova modeladora"],
    serviceSlugs: ["hidratacao", "escova"],
    priceCents: 16990,
    fineprint: "Exceto extra logo ou megahair",
    imageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    imagePosition: "right",
  },
  {
    slug: "coloracao-completa",
    title: "Coloração de raiz + hidratar + escovar",
    items: ["Retoque de raiz", "Hidratação", "Escova"],
    serviceSlugs: ["coloracao-raiz", "hidratacao", "escova"],
    fineprint: "Exceto megahair · Valor varia conforme comprimento",
    fromCents: 25000,
    variants: [
      { label: "Curto", priceCents: 25000 },
      { label: "Médio", priceCents: 28000 },
      { label: "Longo", priceCents: 30000 },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1631730473380-7cabf3253728?auto=format&fit=crop&w=1200&q=80",
    imagePosition: "left",
    featured: true,
  },
  {
    slug: "escova-lavar-pe-mao",
    title: "Escova + lavar + pé e mão",
    items: ["Lavagem", "Escova modeladora", "Manicure e pedicure"],
    serviceSlugs: ["lavagem", "escova", "manicure", "pedicure"],
    priceCents: 16990,
    fineprint: "Exceto extra logo ou megahair",
    imageUrl:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
    imagePosition: "right",
  },
  {
    slug: "depilacao-completa",
    title: "Depilação completa",
    items: ["Pernas", "Axilas", "Buço", "Virilha simples"],
    serviceSlugs: ["depilacao-completa"],
    priceCents: 16990,
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    imagePosition: "left",
  },
];

export function getCombo(slug: string) {
  return COMBOS.find((c) => c.slug === slug);
}

export const COMBOS_VALIDITY = {
  daysLabel: "Segunda a quarta",
  endDate: new Date("2026-11-30T23:59:59"),
  paymentNote: "Pagamento em espécie · Exceto feriados",
};
