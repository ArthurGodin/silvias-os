"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Home,
  Users,
  Scissors,
  UserCircle,
  LogOut,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/financeiro", label: "Financeiro", icon: TrendingUp },
  { href: "/admin/servicos", label: "Serviços", icon: Scissors },
  { href: "/admin/equipe", label: "Equipe", icon: UserCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-[var(--color-rule)] bg-paper-50 min-h-screen sticky top-0">
      <div className="px-8 py-8 border-b border-[var(--color-rule)]">
        <Wordmark size="sm" href="/admin" />
        <p className="text-eyebrow mt-2">Painel · Operação</p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href as never}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-[13px] uppercase tracking-[0.18em] transition-colors duration-200",
                    isActive
                      ? "bg-ink-700 text-paper-100"
                      : "text-ink-600 hover:bg-paper-200",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-8 py-6 border-t border-[var(--color-rule)]">
        <Link
          href="/admin/login"
          className="flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-muted hover:text-ink-700 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </Link>
      </div>
    </aside>
  );
}
