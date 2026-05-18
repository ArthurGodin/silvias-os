export type Brand = {
  slug: "silvias-hair" | "silvias-barbershop" | "silvias-estetic";
  name: string;
  shortLabel: string;
  tagline: string;
  description: string;
  status: "active" | "coming-soon";
  instagram: string;
  href: string;
  imageUrl: string;
  accent: "gold" | "ink" | "rose";
};

export const FAMILY: Brand[] = [
  {
    slug: "silvias-hair",
    name: "Silvia's Hair",
    shortLabel: "Hair",
    tagline: "Estilo & Personalidade",
    description: "O atelier de cabelo. Cortes, coloração, tratamentos e estética facial.",
    status: "active",
    instagram: "https://instagram.com/silvias_hair",
    href: "/",
    imageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80",
    accent: "gold",
  },
  {
    slug: "silvias-barbershop",
    name: "Silvia's Barbershop",
    shortLabel: "Barbershop",
    tagline: "Em desenvolvimento",
    description:
      "A casa masculina. Cortes, barba, tratamentos e estética para homens.",
    status: "coming-soon",
    instagram: "https://instagram.com/silviasbarbershop",
    href: "/barbershop",
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80",
    accent: "ink",
  },
  {
    slug: "silvias-estetic",
    name: "Silvia's Estetic",
    shortLabel: "Estetic",
    tagline: "Em desenvolvimento",
    description:
      "Estética facial e corporal avançada. Protocolos dermatológicos premium.",
    status: "coming-soon",
    instagram: "https://instagram.com/silviasteticdesign",
    href: "/estetic",
    imageUrl:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80",
    accent: "rose",
  },
];
