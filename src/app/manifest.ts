import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Silvia's Hair",
    short_name: "Silvia's Hair",
    description: "Atelier de cabelo em Teresina desde 2003.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F4E9",
    theme_color: "#2E2D28",
    orientation: "portrait-primary",
    icons: [
      { src: "/og/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/og/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
