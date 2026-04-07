"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  ChevronLeft,
  ExternalLink,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageTransition } from "@/components/ui/page-transition";
import { FadeIn } from "@/components/ui/fade-in";
import { GlowButton } from "@/components/ui/glow-button";
import { MediaPlayer } from "@/components/member/media-player";
import { InteractiveChecklist } from "@/components/member/interactive-checklist";
import { Skeleton } from "@/components/ui/skeleton";
import type { Aula, Modulo } from "@/types/database";

interface AulaNav {
  id: string;
  titulo: string;
}

export default function AulaPage() {
  const params = useParams();
  const router = useRouter();
  const aulaId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [aula, setAula] = useState<Aula | null>(null);
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [concluida, setConcluida] = useState(false);
  const [prevAula, setPrevAula] = useState<AulaNav | null>(null);
  const [nextAula, setNextAula] = useState<AulaNav | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [checklistProgress, setChecklistProgress] = useState<boolean[]>([]);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Aula
      const { data: aulaData } = await supabase
        .from("aulas")
        .select("*")
        .eq("id", aulaId)
        .single();

      if (!aulaData) {
        router.push("/");
        return;
      }

      const aulaTyped = aulaData as Aula;
      setAula(aulaTyped);

      // Módulo
      const { data: moduloData } = await supabase
        .from("modulos")
        .select("*")
        .eq("id", aulaTyped.modulo_id)
        .single();
      setModulo(moduloData as Modulo | null);

      // Progresso
      const { data: progressoData } = await supabase
        .from("progresso")
        .select("concluida")
        .eq("user_id", user.id)
        .eq("aula_id", aulaId)
        .single();
      setConcluida(progressoData?.concluida || false);

      // Nav anterior/próxima
      const { data: aulasDoModulo } = await supabase
        .from("aulas")
        .select("id, titulo, ordem")
        .eq("modulo_id", aulaTyped.modulo_id)
        .order("ordem");

      if (aulasDoModulo) {
        const index = aulasDoModulo.findIndex(
          (a: { id: string }) => a.id === aulaId
        );
        if (index > 0) {
          setPrevAula({
            id: aulasDoModulo[index - 1].id,
            titulo: aulasDoModulo[index - 1].titulo,
          });
        }
        if (index < aulasDoModulo.length - 1) {
          setNextAula({
            id: aulasDoModulo[index + 1].id,
            titulo: aulasDoModulo[index + 1].titulo,
          });
        }
      }

      // Checklist progress
      if (aulaTyped.tipo === "checklist" && aulaTyped.conteudo_extra) {
        const extra = aulaTyped.conteudo_extra as {
          items?: { texto: string }[];
        };
        const totalItems = extra.items?.length || 0;

        const { data: checkData } = await supabase
          .from("checklist_progress")
          .select("item_index, marcado")
          .eq("user_id", user.id)
          .eq("aula_id", aulaId);

        const checkedArr = Array(totalItems).fill(false);
        (checkData || []).forEach(
          (c: { item_index: number; marcado: boolean }) => {
            if (c.item_index < totalItems) {
              checkedArr[c.item_index] = c.marcado;
            }
          }
        );
        setChecklistProgress(checkedArr);
      }

      setLoading(false);
    }

    fetchData();
  }, [aulaId, supabase, router]);

  const marcarConcluida = useCallback(async () => {
    if (!userId || !aulaId) return;

    const novoConcluida = !concluida;
    setConcluida(novoConcluida);

    await supabase.from("progresso").upsert(
      {
        user_id: userId,
        aula_id: aulaId,
        concluida: novoConcluida,
        concluida_em: novoConcluida ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,aula_id" }
    );
  }, [userId, aulaId, concluida, supabase]);

  if (loading) {
    return (
      <div className="container-app py-8 max-w-prose mx-auto">
        <Skeleton className="w-full h-8 mb-4" />
        <Skeleton className="w-3/4 h-12 mb-6" />
        <Skeleton className="w-full h-[400px]" />
      </div>
    );
  }

  if (!aula || !modulo) return null;

  return (
    <PageTransition>
      <div className="container-app py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-body-sm text-text-tertiary mb-6 flex-wrap">
          <Link
            href="/"
            className="hover:text-text-secondary transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/semana/${modulo.numero_semana}`}
            className="hover:text-text-secondary transition-colors"
          >
            Semana {modulo.numero_semana}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-text-secondary truncate max-w-[200px]">
            {aula.titulo}
          </span>
        </nav>

        <FadeIn>
          <div className="max-w-prose mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-h2 text-text-primary mb-2">
                {aula.titulo}
              </h1>
              <p className="text-body text-text-secondary">{aula.descricao}</p>
            </div>

            {/* Content — varia por tipo */}
            <div className="mb-10">
              {(aula.tipo === "video" ||
                aula.tipo === "audio" ||
                aula.tipo === "pdf") && (
                <MediaPlayer
                  tipo={aula.tipo}
                  url={aula.conteudo_url}
                  titulo={aula.titulo}
                />
              )}

              {aula.tipo === "texto" && (
                <article className="prose-custom">
                  <div className="drop-cap text-body text-text-secondary leading-relaxed space-y-4">
                    <p>
                      {(
                        (aula.conteudo_extra as { texto?: string })?.texto ||
                        aula.descricao
                      )}
                    </p>
                  </div>
                </article>
              )}

              {aula.tipo === "checklist" && aula.conteudo_extra && (
                <InteractiveChecklist
                  aulaId={aulaId}
                  items={
                    (
                      aula.conteudo_extra as {
                        items: { texto: string }[];
                      }
                    ).items
                  }
                  initialChecked={checklistProgress}
                  userId={userId}
                />
              )}

              {aula.tipo === "link" && (
                <a
                  href={aula.conteudo_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-6 rounded-card border border-border bg-bg-secondary hover:border-pink-primary/40 hover:shadow-glow-soft transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-button bg-pink-primary/10 flex items-center justify-center shrink-0 group-hover:bg-pink-primary/20 transition-colors">
                    <ExternalLink className="w-6 h-6 text-pink-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] font-medium text-text-primary group-hover:text-pink-primary transition-colors">
                      Abrir {aula.titulo}
                    </h3>
                    <p className="text-body-sm text-text-secondary mt-0.5">
                      {aula.descricao}
                    </p>
                  </div>
                </a>
              )}
            </div>

            {/* Marcar como concluída */}
            <div className="mb-10">
              <GlowButton
                onClick={marcarConcluida}
                variant={concluida ? "secondary" : "primary"}
                size="lg"
                className="w-full md:w-auto"
              >
                {concluida ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Concluída
                  </>
                ) : (
                  "Marcar como concluída"
                )}
              </GlowButton>
            </div>

            {/* Navigation anterior/próxima */}
            <div className="flex items-center justify-between gap-4 pt-8 border-t border-border">
              {prevAula ? (
                <Link
                  href={`/aula/${prevAula.id}`}
                  className="group flex items-center gap-2 text-text-secondary hover:text-pink-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-right">
                    <span className="block text-[12px] text-text-tertiary">
                      Anterior
                    </span>
                    <span className="text-body-sm font-medium truncate max-w-[180px] block">
                      {prevAula.titulo}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextAula ? (
                <Link
                  href={`/aula/${nextAula.id}`}
                  className="group flex items-center gap-2 text-text-secondary hover:text-pink-primary transition-colors"
                >
                  <div className="text-left">
                    <span className="block text-[12px] text-text-tertiary">
                      Próxima
                    </span>
                    <span className="text-body-sm font-medium truncate max-w-[180px] block">
                      {nextAula.titulo}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  href={`/semana/${modulo.numero_semana}`}
                  className="group flex items-center gap-2 text-text-secondary hover:text-pink-primary transition-colors"
                >
                  <div className="text-left">
                    <span className="block text-[12px] text-text-tertiary">
                      Voltar para
                    </span>
                    <span className="text-body-sm font-medium">
                      Semana {modulo.numero_semana}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
