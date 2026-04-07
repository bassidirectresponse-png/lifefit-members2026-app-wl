"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Lock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calcularSemanasLiberadas } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";
import { FadeIn, StaggerContainer } from "@/components/ui/fade-in";
import { ProgressRing } from "@/components/ui/progress-ring";
import { GlowButton } from "@/components/ui/glow-button";
import { LessonCard } from "@/components/member/lesson-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import type {
  Profile,
  Modulo,
  AulaComProgresso,
  Progresso,
  Aula,
} from "@/types/database";

export default function SemanaPage() {
  const params = useParams();
  const router = useRouter();
  const numero = Number(params.numero);
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [aulas, setAulas] = useState<AulaComProgresso[]>([]);
  const [, setProfile] = useState<Profile | null>(null);
  const [bloqueada, setBloqueada] = useState(false);
  const [proximaSemana, setProximaSemana] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, moduloRes, allModulosRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("modulos")
          .select("*")
          .eq("numero_semana", numero)
          .single(),
        supabase.from("modulos").select("numero_semana").order("numero_semana"),
      ]);

      const profileData = profileRes.data as Profile | null;
      setProfile(profileData);

      if (!moduloRes.data) {
        router.push("/");
        return;
      }

      const moduloData = moduloRes.data as Modulo;
      setModulo(moduloData);

      // Check se está bloqueada
      if (profileData) {
        const liberadas = calcularSemanasLiberadas(
          profileData.data_inicio_jornada
        );
        if (numero > liberadas) {
          setBloqueada(true);
          setLoading(false);
          return;
        }
      }

      // Próxima semana
      const semanas = (allModulosRes.data || []).map(
        (m: { numero_semana: number }) => m.numero_semana
      );
      const currentIndex = semanas.indexOf(numero);
      if (currentIndex < semanas.length - 1) {
        setProximaSemana(semanas[currentIndex + 1]);
      }

      // Aulas + progresso
      const [aulasRes, progressoRes] = await Promise.all([
        supabase
          .from("aulas")
          .select("*")
          .eq("modulo_id", moduloData.id)
          .order("ordem"),
        supabase.from("progresso").select("*").eq("user_id", user.id),
      ]);

      const aulasData = (aulasRes.data || []) as Aula[];
      const progressoData = (progressoRes.data || []) as Progresso[];
      const progressoMap = new Map<string, boolean>();
      progressoData.forEach((p) => {
        if (p.concluida) progressoMap.set(p.aula_id, true);
      });

      const aulasComProgresso: AulaComProgresso[] = aulasData.map((a) => ({
        ...a,
        concluida: progressoMap.get(a.id) || false,
      }));

      setAulas(aulasComProgresso);
      setLoading(false);
    }

    fetchData();
  }, [numero, supabase, router]);

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (bloqueada || !modulo) {
    return (
      <PageTransition>
        <div className="container-app py-16 text-center">
          <Lock className="w-16 h-16 text-pink-primary/40 mx-auto mb-6" />
          <h1 className="font-display text-h2 text-text-primary mb-3">
            Semana {numero} ainda não está disponível
          </h1>
          <p className="text-body text-text-secondary mb-8 max-w-md mx-auto">
            Continue completando seus rituais semanais. Este conteúdo será
            desbloqueado automaticamente no seu ritmo.
          </p>
          <Link href="/">
            <GlowButton>Voltar ao início</GlowButton>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const totalConcluidas = aulas.filter((a) => a.concluida).length;
  const progressPercent =
    aulas.length > 0 ? (totalConcluidas / aulas.length) * 100 : 0;

  const marcarTodas = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const promises = aulas
      .filter((a) => !a.concluida)
      .map((a) =>
        supabase.from("progresso").upsert(
          {
            user_id: user.id,
            aula_id: a.id,
            concluida: true,
            concluida_em: new Date().toISOString(),
          },
          { onConflict: "user_id,aula_id" }
        )
      );

    await Promise.all(promises);
    setAulas((prev) => prev.map((a) => ({ ...a, concluida: true })));
  };

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="h-48 md:h-64"
          style={{
            backgroundColor: modulo.cor_destaque || "#1C1C1F",
            backgroundImage: modulo.banner_url
              ? `url(${modulo.banner_url})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
        </div>
        <div className="container-app relative -mt-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-body-sm text-text-tertiary mb-4">
            <Link
              href="/"
              className="hover:text-text-secondary transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-secondary">
              Semana {modulo.numero_semana}
            </span>
          </nav>

          <FadeIn>
            <span className="text-body-sm text-pink-primary font-medium">
              Semana {modulo.numero_semana}
            </span>
            <h1 className="font-display text-h1 text-text-primary mt-1">
              {modulo.titulo}
            </h1>
            <p className="text-body text-text-secondary mt-2 max-w-2xl">
              {modulo.subtitulo}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <div className="container-app py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main — Aulas */}
          <div className="flex-1">
            <FadeIn delay={0.1}>
              <h2 className="font-display text-h3 text-text-primary mb-6">
                Conteúdos da semana
              </h2>
            </FadeIn>

            <StaggerContainer className="space-y-3">
              {aulas.map((aula, index) => (
                <LessonCard key={aula.id} aula={aula} index={index} />
              ))}
            </StaggerContainer>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0 space-y-6">
            <FadeIn delay={0.2}>
              {/* Progresso */}
              <div className="rounded-card border border-border bg-bg-secondary p-card-padding">
                <h3 className="font-display text-h4 text-text-primary mb-4">
                  Progresso
                </h3>
                <div className="flex justify-center mb-4">
                  <div className="relative w-[120px] h-[120px]">
                    <ProgressRing
                      percentage={progressPercent}
                      size={120}
                      strokeWidth={7}
                    />
                  </div>
                </div>
                <p className="text-body-sm text-text-secondary text-center mb-4">
                  {totalConcluidas} de {aulas.length} aulas concluídas
                </p>

                {totalConcluidas < aulas.length && (
                  <GlowButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={marcarTodas}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Marcar tudo como concluído
                  </GlowButton>
                )}
              </div>
            </FadeIn>

            {/* Descrição */}
            <FadeIn delay={0.25}>
              <div className="rounded-card border border-border bg-bg-secondary p-card-padding">
                <h3 className="font-display text-h4 text-text-primary mb-3">
                  Sobre esta semana
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  {modulo.descricao}
                </p>
              </div>
            </FadeIn>

            {/* Próxima semana */}
            {proximaSemana && (
              <FadeIn delay={0.3}>
                <Link
                  href={`/semana/${proximaSemana}`}
                  className="group flex items-center justify-between rounded-card border border-border bg-bg-secondary p-5 hover:border-pink-border transition-all duration-300"
                >
                  <div>
                    <span className="text-body-sm text-text-tertiary">
                      Próxima semana
                    </span>
                    <p className="text-[15px] font-medium text-text-primary group-hover:text-pink-primary transition-colors">
                      Semana {proximaSemana}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:text-pink-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </FadeIn>
            )}
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
