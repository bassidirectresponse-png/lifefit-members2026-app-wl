"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { localeNames, type Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-button text-[13px] text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        aria-label="Changer la langue"
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 py-1 bg-bg-secondary border border-border rounded-button shadow-card-hover min-w-[140px] z-50">
          {(Object.entries(localeNames) as [Locale, string][]).map(
            ([code, name]) => (
              <button
                key={code}
                onClick={() => {
                  setLocale(code);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-[14px] transition-colors",
                  code === locale
                    ? "text-pink-primary bg-pink-primary/5"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                )}
              >
                {name}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
