import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/conta/"],
      },
    ],
    sitemap: "https://silviashair.com.br/sitemap.xml",
  };
}
