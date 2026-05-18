export type StaffMember = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  credentials: string[];
  unitSlugs: string[];
  serviceSlugs: string[];
  imageUrl: string;
};

// Equipe mínima — apenas o que é publicamente verificável até a Silvia
// nos passar a lista completa com fotos e formações reais.
// NÃO adicionar credenciais ou profissionais sem confirmação direta.
export const TEAM: StaffMember[] = [
  {
    slug: "silvia-meneses",
    name: "Silvia Meneses",
    role: "Fundadora & cabeleireira",
    bio: "Fundadora do atelier. Há 23 anos conduzindo cabelos em Teresina.",
    credentials: [],
    unitSlugs: ["casa-i-teresina-shopping", "casa-ii-rio-poty"],
    serviceSlugs: ["hidratacao", "escova", "lavagem", "coloracao-raiz"],
    imageUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=80",
  },
];

export function getStaffMember(slug: string): StaffMember | undefined {
  return TEAM.find((m) => m.slug === slug);
}

export function staffForService(serviceSlug: string, unitSlug?: string): StaffMember[] {
  return TEAM.filter((m) => {
    const doesService = m.serviceSlugs.includes(serviceSlug);
    const inUnit = unitSlug ? m.unitSlugs.includes(unitSlug) : true;
    return doesService && inUnit;
  });
}
