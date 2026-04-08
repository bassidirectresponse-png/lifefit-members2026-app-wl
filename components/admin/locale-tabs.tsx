"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input, Textarea } from "./form-field";
import type { I18nField, Locale } from "@/types/database";

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

interface LocaleTabsFieldProps {
  label: string;
  field: "titulo_i18n" | "subtitulo_i18n" | "descricao_i18n";
  value: I18nField;
  onChange: (field: string, value: I18nField) => void;
  multiline?: boolean;
  placeholder?: string;
}

export function LocaleTabsField({
  label,
  field,
  value,
  onChange,
  multiline = false,
  placeholder,
}: LocaleTabsFieldProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>("fr");

  const handleChange = (text: string) => {
    onChange(field, { ...value, [activeLocale]: text });
  };

  return (
    <div>
      <label className="block text-[14px] text-text-secondary mb-2 font-medium">
        {label}
      </label>

      {/* Locale tabs */}
      <div className="flex gap-1 mb-2">
        {LOCALES.map((loc) => {
          const hasContent = !!value[loc.code]?.trim();
          return (
            <button
              key={loc.code}
              type="button"
              onClick={() => setActiveLocale(loc.code)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all",
                activeLocale === loc.code
                  ? "bg-pink-primary/10 text-pink-primary"
                  : hasContent
                  ? "bg-bg-tertiary text-text-secondary hover:text-text-primary"
                  : "bg-bg-tertiary text-text-tertiary hover:text-text-secondary"
              )}
            >
              <span>{loc.flag}</span>
              <span className="uppercase">{loc.code}</span>
              {hasContent && activeLocale !== loc.code && (
                <span className="w-1.5 h-1.5 rounded-full bg-pink-success" />
              )}
            </button>
          );
        })}
      </div>

      {/* Input */}
      {multiline ? (
        <Textarea
          value={value[activeLocale] || ""}
          onChange={(e) => handleChange(e.target.value)}
          rows={4}
          placeholder={placeholder || `${label} en ${LOCALES.find((l) => l.code === activeLocale)?.label}...`}
        />
      ) : (
        <Input
          value={value[activeLocale] || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder || `${label} en ${LOCALES.find((l) => l.code === activeLocale)?.label}...`}
        />
      )}

      <p className="text-[11px] text-text-tertiary mt-1">
        Le français est la langue par défaut. Les autres sont optionnelles.
      </p>
    </div>
  );
}
