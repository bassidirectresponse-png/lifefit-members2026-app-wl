"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeft,
  Sparkles,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/admin/toast";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/modulos", label: "Modules", icon: BookOpen },
  { href: "/admin/usuarios", label: "Utilisatrices", icon: Users },
];

function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside className={cn("flex flex-col h-full", className)}>
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <Sparkles className="w-5 h-5 text-pink-primary" />
          <span className="font-display text-lg text-text-primary">
            Life Fit <span className="italic text-pink-primary">Admin</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-all",
                active
                  ? "bg-pink-primary/10 text-pink-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="p-3 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-tertiary hover:text-pink-primary transition-colors rounded-[10px] hover:bg-bg-tertiary"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au site
        </Link>
      </div>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg-primary flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-[240px] bg-bg-secondary border-r border-border shrink-0 sticky top-0 h-screen">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm" />
            <div
              className="absolute left-0 top-0 bottom-0 w-[260px] bg-bg-secondary border-r border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile topbar */}
          <header className="md:hidden sticky top-0 z-40 h-14 bg-bg-secondary/95 backdrop-blur-md border-b border-border flex items-center px-4 gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-text-secondary hover:text-text-primary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display text-[16px] text-text-primary">
              Admin
            </span>
          </header>

          <main className="p-5 md:p-8 max-w-[1100px]">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
