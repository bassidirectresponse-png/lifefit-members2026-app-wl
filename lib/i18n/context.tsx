"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import translations, {
  DEFAULT_LOCALE,
  type Locale,
  type TranslationKey,
} from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "lfm-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with default locale to match server render
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // After hydration, read saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in translations && saved !== DEFAULT_LOCALE) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = translations[locale] as Record<string, string>;
      let text = dict[key] || key;

      // Handle plural: "singular | plural"
      if (text.includes(" | ") && params) {
        const parts = text.split(" | ");
        const countVal =
          params.n ?? params.days ?? params.count ?? params.done ?? 1;
        const num = typeof countVal === "number" ? countVal : Number(countVal);
        text = num === 1 ? parts[0] : parts[1];
      }

      // Replace {key} placeholders
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }

      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
