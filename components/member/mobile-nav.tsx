"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/#semanas", label: t("nav.weeks"), icon: CalendarDays },
    { href: "/#bonus", label: t("nav.bonus"), icon: Gift },
    { href: "/conta", label: t("nav.account"), icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-bg-primary/95 backdrop-blur-xl"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href.replace("/#", "/"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-lg transition-colors duration-200",
                isActive
                  ? "text-pink-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -inset-2 bg-pink-primary/10 rounded-full blur-sm" />
                )}
              </div>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
