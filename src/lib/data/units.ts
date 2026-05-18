export type Unit = {
  slug: string;
  name: string;
  shortName: string;
  shoppingName: string;
  address: string;
  floor: string;
  phone: string;
  whatsapp: string;
  hours: { day: string; open: string; close: string }[];
  mapsUrl: string;
  coordinates: { lat: number; lng: number };
  imageUrl: string;
};

export const UNITS: Unit[] = [
  {
    slug: "casa-i-teresina-shopping",
    name: "Casa I",
    shortName: "Casa I",
    shoppingName: "Teresina Shopping",
    address: "Av. Marechal Castelo Branco, 911",
    floor: "Piso L3, Teresina Shopping",
    phone: "(86) 3122-5226",
    whatsapp: "5586981000001",
    hours: [
      { day: "Seg–Sáb", open: "09h", close: "22h" },
      { day: "Dom", open: "14h", close: "20h" },
    ],
    mapsUrl: "https://maps.google.com/?q=Teresina+Shopping+Av+Marechal+Castelo+Branco",
    coordinates: { lat: -5.0815, lng: -42.7748 },
    imageUrl:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "casa-ii-rio-poty",
    name: "Casa II",
    shortName: "Casa II",
    shoppingName: "Shopping Rio Poty",
    address: "Av. Raul Lopes, 1000 — Loja 267",
    floor: "Piso superior, Shopping Rio Poty",
    phone: "(86) 3230-1293",
    whatsapp: "5586981000002",
    hours: [
      { day: "Seg–Sáb", open: "10h", close: "22h" },
      { day: "Dom", open: "14h", close: "20h" },
    ],
    mapsUrl: "https://maps.google.com/?q=Shopping+Rio+Poty+Teresina",
    coordinates: { lat: -5.0858, lng: -42.7857 },
    imageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80",
  },
];

export function getUnit(slug: string): Unit | undefined {
  return UNITS.find((u) => u.slug === slug);
}
