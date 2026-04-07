"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EstadoSemana, Modulo } from "@/types/database";
import { staggerChild } from "@/components/ui/fade-in";

interface WeekCardProps {
  modulo: Modulo;
  estado: EstadoSemana;
  aulasTotal: number;
  aulasConcluidas: number;
  diasRestantes?: number;
}

export function WeekCard({
  modulo,
  estado,
  aulasTotal,
  aulasConcluidas,
  diasRestantes,
}: WeekCardProps) {
  const isBlocked = estado === "bloqueada";
  const isCompleted = estado === "concluida";
  const isCurrent = estado === "atual";
  const progressPercent =
    aulasTotal > 0 ? (aulasConcluidas / aulasTotal) * 100 : 0;

  const content = (
    <motion.div
      variants={staggerChild}
      className={cn(
        "group relative overflow-hidden rounded-card border transition-all duration-500",
        "bg-bg-secondary",
        isBlocked && "opacity-50 cursor-not-allowed border-border",
        isCurrent &&
          "border-pink-primary/40 shadow-glow-soft hover:shadow-card-hover hover:-translate-y-1",
        isCompleted &&
          "border-border hover:border-pink-border hover:shadow-card-hover hover:-translate-y-1"
      )}
    >
      {/* Banner */}
      <div className="relative h-40 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br transition-transform duration-500",
            isBlocked
              ? "from-bg-tertiary to-bg-secondary"
              : "group-hover:scale-[1.04]"
          )}
          style={
            !isBlocked
              ? {
                  backgroundImage: modulo.banner_url
                    ? `url(${modulo.banner_url})`
                    : undefined,
                  backgroundColor: modulo.cor_destaque || "#1C1C1F",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/90 via-bg-secondary/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {isBlocked && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-tag bg-bg-primary/80 text-text-tertiary text-[13px] font-medium backdrop-blur-sm">
              <Lock className="w-3.5 h-3.5" />
              {diasRestantes}d
            </span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-tag bg-pink-primary/20 text-pink-primary text-[13px] font-medium backdrop-blur-sm">
              <Check className="w-3.5 h-3.5" />
              Concluída
            </span>
          )}
          {isCurrent && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-tag bg-pink-primary text-bg-primary text-[13px] font-semibold animate-glow-pulse">
              Semana atual
            </span>
          )}
        </div>

        {/* Week number */}
        <div className="absolute bottom-3 left-4">
          <span className="text-body-sm text-text-secondary font-medium">
            Semana {modulo.numero_semana}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-card-padding pt-4">
        <h3 className="font-display text-h4 text-text-primary mb-1 line-clamp-2">
          {modulo.titulo}
        </h3>
        <p className="text-body-sm text-text-secondary mb-4 line-clamp-2">
          {modulo.subtitulo}
        </p>

        {/* Progress bar */}
        {!isBlocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-text-tertiary">
                {aulasConcluidas}/{aulasTotal} aulas
              </span>
              <span className="text-pink-primary font-medium">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pink-primary to-pink-vibrant"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )}

        {isBlocked && (
          <p className="text-body-sm text-text-tertiary">
            Disponível em {diasRestantes} {diasRestantes === 1 ? "dia" : "dias"}
          </p>
        )}

        {isCurrent && (
          <div className="mt-4 flex items-center gap-2 text-pink-primary font-medium text-[15px] group-hover:gap-3 transition-all duration-300">
            Continuar <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );

  if (isBlocked) return content;

  return (
    <Link href={`/semana/${modulo.numero_semana}`} className="block">
      {content}
    </Link>
  );
}
