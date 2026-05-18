export type ServiceCategorySlug =
  | "cabelo"
  | "estetica"
  | "unhas"
  | "depilacao";

export type Service = {
  slug: string;
  name: string;
  category: ServiceCategorySlug;
  duration: number;
  fromPrice: number;
  description: string;
  requiresDeposit: boolean;
};

export type ServiceCategory = {
  slug: ServiceCategorySlug;
  index: number;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  imageUrl: string;
};

export const CATEGORIES: ServiceCategory[] = [
  {
    slug: "cabelo",
    index: 1,
    title: "Cabelo",
    shortTitle: "Cabelo",
    description:
      "Hidratação profunda, escova modeladora, lavagem e coloração de raiz conduzidas pela equipe técnica do atelier.",
    longDescription:
      "Nossos rituais de cabelo combinam diagnóstico de fio, prescrição personalizada de produtos profissionais Wella e Kérastase, e finalização que dura. Cada cliente é ouvida antes de ser tocada.",
    imageUrl:
      "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "estetica",
    index: 2,
    title: "Estética facial",
    shortTitle: "Estética",
    description:
      "Design de sobrancelha e depilação delicada de buço com técnica e produtos premium.",
    longDescription:
      "Trabalho fino de design facial. Sobrancelha por visagismo — não tendência, geometria do seu rosto. Depilação com produtos suaves para áreas sensíveis.",
    imageUrl:
      "https://images.unsplash.com/photo-1597225244660-1cd128c64284?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "unhas",
    index: 3,
    title: "Unhas",
    shortTitle: "Unhas",
    description:
      "Manicure e pedicure clássicas com esterilização hospitalar e cuidado com cutícula.",
    longDescription:
      "Nail bar com autoclave hospitalar. Manicure e pedicure executadas com técnica, sem pressa, com hidratação inclusa.",
    imageUrl:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "depilacao",
    index: 4,
    title: "Depilação",
    shortTitle: "Depilação",
    description:
      "Cera quente premium importada. Pernas, axilas, buço, virilha — depilação completa ou por partes.",
    longDescription:
      "Cera quente de baixa temperatura de fusão. Aplicação técnica que minimiza ardência e foliculite. Pós-depilação calmante incluso.",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=80",
  },
];

// ⚠️ PREÇOS PROVISÓRIOS — aguardando confirmação da Silvia.
// Não tratar nenhum dos valores abaixo como definitivo. Atualizar com a
// tabela real assim que ela mandar o material.
export const SERVICES: Service[] = [
  // Cabelo
  {
    slug: "hidratacao",
    name: "Hidratação profunda",
    category: "cabelo",
    duration: 60,
    fromPrice: 120,
    description: "Hidratação intensa com diagnóstico do fio e produto profissional.",
    requiresDeposit: false,
  },
  {
    slug: "escova",
    name: "Escova modeladora",
    category: "cabelo",
    duration: 60,
    fromPrice: 90,
    description: "Escova com técnica de modelagem e finalização anti-frizz.",
    requiresDeposit: false,
  },
  {
    slug: "lavagem",
    name: "Lavagem",
    category: "cabelo",
    duration: 30,
    fromPrice: 45,
    description: "Lavagem técnica com massagem capilar relaxante.",
    requiresDeposit: false,
  },
  {
    slug: "coloracao-raiz",
    name: "Coloração de raiz",
    category: "cabelo",
    duration: 90,
    fromPrice: 180,
    description: "Manutenção de coloração existente — retoque preciso na raiz.",
    requiresDeposit: true,
  },

  // Estética
  {
    slug: "design-sobrancelha",
    name: "Design de sobrancelha",
    category: "estetica",
    duration: 30,
    fromPrice: 45,
    description: "Design com leitura de visagismo facial. Resultado para o seu rosto.",
    requiresDeposit: false,
  },
  {
    slug: "buco",
    name: "Buço",
    category: "estetica",
    duration: 10,
    fromPrice: 25,
    description: "Depilação delicada com produto suave para a área sensível.",
    requiresDeposit: false,
  },

  // Unhas
  {
    slug: "manicure",
    name: "Manicure",
    category: "unhas",
    duration: 45,
    fromPrice: 55,
    description: "Manicure clássica com lixamento, cutícula e esmalte da sua cor.",
    requiresDeposit: false,
  },
  {
    slug: "pedicure",
    name: "Pedicure",
    category: "unhas",
    duration: 60,
    fromPrice: 70,
    description: "Pedicure completa com hidratação e esfoliação dos pés.",
    requiresDeposit: false,
  },

  // Depilação
  {
    slug: "depilacao-completa",
    name: "Depilação completa",
    category: "depilacao",
    duration: 90,
    fromPrice: 169.9,
    description: "Pernas, axilas, buço e virilha em um único atendimento.",
    requiresDeposit: false,
  },
  {
    slug: "perna",
    name: "Perna completa",
    category: "depilacao",
    duration: 45,
    fromPrice: 75,
    description: "Cera quente em perna completa.",
    requiresDeposit: false,
  },
  {
    slug: "axila",
    name: "Axila",
    category: "depilacao",
    duration: 15,
    fromPrice: 30,
    description: "Depilação rápida de axilas com cera de baixa temperatura.",
    requiresDeposit: false,
  },
  {
    slug: "virilha",
    name: "Virilha",
    category: "depilacao",
    duration: 20,
    fromPrice: 50,
    description: "Depilação de virilha simples com pós-depilação calmante.",
    requiresDeposit: false,
  },
];

export function servicesByCategory(slug: ServiceCategorySlug): Service[] {
  return SERVICES.filter((s) => s.category === slug);
}

export function getCategory(slug: string): ServiceCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
