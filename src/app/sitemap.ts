import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/data/services";

const SITE = "https://silviashair.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/servicos",
    "/combos",
    "/galeria",
    "/unidades",
    "/sobre",
    "/agendar",
    "/conta",
    "/privacidade",
    "/termos",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const categoryRoutes = CATEGORIES.map((c) => ({
    url: `${SITE}/servicos/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...routes, ...categoryRoutes];
}
