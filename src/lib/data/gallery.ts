export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  category: string;
  caption: string;
  featured?: boolean;
};

export const GALLERY: GalleryItem[] = [
  {
    id: "g1",
    src: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1600&q=80",
    alt: "Cabelo loiro com mechas claras e movimento",
    category: "Clareamento",
    caption: "Loiro pérola, técnica de mapeamento",
    featured: true,
  },
  {
    id: "g2",
    src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80",
    alt: "Cabelo escuro com brilho intenso",
    category: "Tratamentos",
    caption: "Ritual Kérastase Chronologiste",
  },
  {
    id: "g3",
    src: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1600&q=80",
    alt: "Corte bordado com pontas texturizadas",
    category: "Cortes",
    caption: "Corte bordado, textura francesa",
    featured: true,
  },
  {
    id: "g4",
    src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80",
    alt: "Unhas com design contemporâneo",
    category: "Unhas",
    caption: "Acrigel com nail art autoral",
  },
  {
    id: "g5",
    src: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1600&q=80",
    alt: "Cabelo ruivo cobre com brilho",
    category: "Coloração",
    caption: "Ruivo cobre · fórmula Wella Master",
    featured: true,
  },
  {
    id: "g6",
    src: "https://images.unsplash.com/photo-1521510892504-1aaa6580c33d?auto=format&fit=crop&w=1600&q=80",
    alt: "Penteado de noiva com tranças laterais",
    category: "Especiais",
    caption: "Penteado de cerimônia",
  },
  {
    id: "g7",
    src: "https://images.unsplash.com/photo-1631730473380-7cabf3253728?auto=format&fit=crop&w=1600&q=80",
    alt: "Coloração com transição de tons",
    category: "Coloração",
    caption: "Balayage caramelo",
  },
  {
    id: "g8",
    src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=80",
    alt: "Interior do salão Casa I",
    category: "Atelier",
    caption: "Casa I · Teresina Shopping",
  },
  {
    id: "g9",
    src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80",
    alt: "Tratamento estético facial",
    category: "Estética",
    caption: "Limpeza de pele profunda",
  },
];

export const FEATURED_GALLERY = GALLERY.filter((g) => g.featured);
