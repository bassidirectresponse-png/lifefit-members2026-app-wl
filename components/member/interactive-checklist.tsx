"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ChecklistItem {
  texto: string;
}

interface InteractiveChecklistProps {
  aulaId: string;
  items: ChecklistItem[];
  initialChecked: boolean[];
  userId: string;
}

function ConfettiParticle({ delay }: { delay: number }) {
  const x = (Math.random() - 0.5) * 60;
  const y = -(Math.random() * 40 + 20);

  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full"
      style={{
        backgroundColor:
          Math.random() > 0.5 ? "#EC4899" : "#FCE7F3",
      }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        x,
        y,
        scale: 0,
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export function InteractiveChecklist({
  aulaId,
  items,
  initialChecked,
  userId,
}: InteractiveChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(initialChecked);
  const [confettiIndex, setConfettiIndex] = useState<number | null>(null);
  const supabase = createClient();

  const totalChecked = checked.filter(Boolean).length;
  const progress = items.length > 0 ? (totalChecked / items.length) * 100 : 0;

  const toggleItem = useCallback(
    async (index: number) => {
      const newChecked = [...checked];
      newChecked[index] = !newChecked[index];
      setChecked(newChecked);

      if (newChecked[index]) {
        setConfettiIndex(index);
        setTimeout(() => setConfettiIndex(null), 700);
      }

      await supabase.from("checklist_progress").upsert(
        {
          user_id: userId,
          aula_id: aulaId,
          item_index: index,
          marcado: newChecked[index],
        },
        { onConflict: "user_id,aula_id,item_index" }
      );
    },
    [checked, supabase, userId, aulaId]
  );

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-body-sm">
          <span className="text-text-secondary">
            {totalChecked} de {items.length} concluídos
          </span>
          <span className="text-pink-primary font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pink-primary to-pink-vibrant"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => toggleItem(index)}
            className={cn(
              "relative w-full flex items-start gap-4 p-4 rounded-card border text-left transition-all duration-300",
              checked[index]
                ? "bg-pink-primary/5 border-pink-border"
                : "bg-bg-secondary border-border hover:border-pink-border hover:bg-bg-tertiary"
            )}
            aria-label={`${checked[index] ? "Desmarcar" : "Marcar"}: ${item.texto}`}
          >
            {/* Checkbox */}
            <div
              className={cn(
                "relative shrink-0 w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
                checked[index]
                  ? "bg-pink-primary border-pink-primary"
                  : "border-text-tertiary hover:border-pink-primary"
              )}
            >
              <AnimatePresence>
                {checked[index] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="w-4 h-4 text-bg-primary" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confetti */}
              {confettiIndex === index && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[0, 1, 2, 3].map((i) => (
                    <ConfettiParticle key={i} delay={i * 0.05} />
                  ))}
                </div>
              )}
            </div>

            {/* Text */}
            <span
              className={cn(
                "text-body transition-colors duration-200 pt-0.5",
                checked[index]
                  ? "text-text-secondary line-through decoration-pink-primary/40"
                  : "text-text-primary"
              )}
            >
              {item.texto}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
