"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { Sparkles } from "lucide-react";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/conta", label: t("nav.account") },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-smooth",
        "glass-header",
        scrolled
          ? "border-b border-pink-border shadow-sm"
          : "border-b border-transparent"
      )}
    >
      <div className="container-app flex items-center justify-between h-16 md:h-[72px]">
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-pink-primary transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-display text-xl text-text-primary">
            Life Fit{" "}
            <span className="italic text-pink-primary">Members</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <nav className="flex items-center gap-1" aria-label="Navigation principale">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-button text-[15px] font-medium transition-colors duration-200",
                  pathname === item.href
                    ? "text-pink-primary bg-pink-primary/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="w-px h-6 bg-border mx-2" />
          <LocaleSwitcher />
        </div>

        {/* Mobile: only locale switcher */}
        <div className="md:hidden">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
