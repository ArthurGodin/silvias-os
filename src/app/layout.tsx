import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://silviashair.com.br"),
  title: {
    default: "Silvia's Hair · Estilo e Personalidade · Salão em Teresina",
    template: "%s · Silvia's Hair",
  },
  description:
    "Há 23 anos, o atelier de cabelo mais técnico de Teresina. Cortes de assinatura, coloração avançada e tratamentos premiados. Duas casas em shoppings premium. Agende em segundos.",
  keywords: [
    "salão Teresina",
    "salão de beleza Teresina",
    "coloração Teresina",
    "cabeleireiro premium Teresina",
    "Silvia's Hair",
    "Teresina Shopping",
    "Shopping Rio Poty",
  ],
  authors: [{ name: "Silvia's Hair" }],
  creator: "Silvia's Hair",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://silviashair.com.br",
    siteName: "Silvia's Hair",
    title: "Silvia's Hair · Estilo e Personalidade",
    description:
      "O atelier de cabelo mais técnico de Teresina. Cortes, coloração e tratamentos premiados desde 2003.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silvia's Hair · Estilo e Personalidade",
    description: "O atelier de cabelo mais técnico de Teresina desde 2003.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://silviashair.com.br" },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
