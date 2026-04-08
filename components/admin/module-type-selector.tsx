"use client";

import { BookOpen, Gift, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TipoModulo } from "@/types/database";

const MODULE_TYPES: { value: TipoModulo; label: string; desc: string; icon: typeof BookOpen }[] = [
  { value: "main", label: "Principal", desc: "Contenu standard du parcours", icon: BookOpen },
  { value: "bonus", label: "Bonus", desc: "Contenu bonus séparé", icon: Gift },
  { value: "locked", label: "Premium (Upsell)", desc: "Bloqué jusqu'à l'achat", icon: Lock },
];

interface ModuleTypeSelectorProps {
  value: TipoModulo;
  onChange: (tipo: TipoModulo) => void;
}

export function ModuleTypeSelector({ value, onChange }: ModuleTypeSelectorProps) {
  return (
    <div>
      <label className="block text-[14px] text-text-secondary mb-2 font-medium">
        Type de module
      </label>
      <div className="grid grid-cols-3 gap-2">
        {MODULE_TYPES.map((t) => {
          const Icon = t.icon;
          const sel = value === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={cn(
                "flex flex-col items-start gap-1 p-3 rounded-[10px] border text-left transition-all",
                sel
                  ? "border-pink-primary bg-pink-primary/10"
                  : "border-border bg-bg-tertiary hover:border-pink-border"
              )}
            >
              <Icon className={cn("w-4 h-4", sel ? "text-pink-primary" : "text-text-tertiary")} />
              <span className={cn("text-[13px] font-semibold", sel ? "text-pink-primary" : "text-text-secondary")}>
                {t.label}
              </span>
              <span className="text-[11px] text-text-tertiary">{t.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
