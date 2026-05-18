import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = {
  title: "Stylist View · Silvia's Hair",
  robots: { index: false, follow: false },
};

export default function StylistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper-100">
      <header className="border-b border-[var(--color-rule)] sticky top-0 bg-paper-100 z-30">
        <div className="container-editorial flex items-center justify-between h-14">
          <Wordmark size="sm" href="/equipe" />
          <Link
            href="/admin/login"
            className="text-[11px] uppercase tracking-[0.22em] text-muted hover:text-ink-700"
          >
            Sair
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
