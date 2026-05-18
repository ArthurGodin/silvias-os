import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

// Habilita acesso a bindings/env do Cloudflare em desenvolvimento local
// via `npm run dev`. No build de produção, não faz nada.
initOpenNextCloudflareForDev();

export default nextConfig;
