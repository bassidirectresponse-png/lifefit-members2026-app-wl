"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlayCircle,
  FileText,
  Headphones,
  ExternalLink,
  CheckSquare,
  BookOpen,
  Check,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AulaComProgresso, TipoAula } from "@/types/database";
import { staggerChild } from "@/components/ui/fade-in";

const tipoConfig: Record<
  TipoAula,
  { icon: typeof PlayCircle; label: string }
> = {
  video: { icon: PlayCircle, label: "Vídeo" },
  pdf: { icon: FileText, label: "PDF" },
  audio: { icon: Headphones, label: "Áudio" },
  link: { icon: ExternalLink, label: "Link" },
  checklist: { icon: CheckSquare, label: "Checklist" },
  texto: { icon: BookOpen, label: "Leitura" },
};

interface LessonCardProps {
  aula: AulaComProgresso;
  index: number;
}

export function LessonCard({ aula }: LessonCardProps) {
  const config = tipoConfig[aula.tipo];
  const Icon = config.icon;

  return (
    <motion.div variants={staggerChild}>
      <Link
        href={`/aula/${aula.id}`}
        className={cn(
          "group flex items-center gap-4 p-5 rounded-card border transition-all duration-300",
          "bg-bg-secondary border-border",
          "hover:border-pink-border hover:bg-bg-tertiary hover:-translate-y-0.5 hover:shadow-card-hover"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-11 h-11 rounded-button shrink-0 transition-colors duration-300",
            aula.concluida
              ? "bg-pink-primary/20 text-pink-primary"
              : "bg-bg-tertiary text-text-secondary group-hover:text-pink-primary group-hover:bg-pink-primary/10"
          )}
        >
          {aula.concluida ? (
            <Check className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-medium text-[15px] mb-0.5 truncate transition-colors duration-200",
              aula.concluida
                ? "text-text-secondary line-through decoration-pink-primary/30"
                : "text-text-primary group-hover:text-pink-primary"
            )}
          >
            {aula.titulo}
          </h4>
          <div className="flex items-center gap-3 text-[13px] text-text-tertiary">
            <span>{config.label}</span>
            {aula.duracao_min && (
              <>
                <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {aula.duracao_min} min
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status indicator */}
        {aula.concluida && (
          <div className="shrink-0 w-6 h-6 rounded-full bg-pink-primary/20 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-pink-primary" />
          </div>
        )}
      </Link>
    </motion.div>
  );
}
