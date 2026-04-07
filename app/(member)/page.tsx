"use client";

import { motion } from "framer-motion";
import { ArrowRight, Gift } from "lucide-react";
import Link from "next/link";
import { useMemberData, useEstadoSemana } from "@/lib/hooks/use-member-data";
import { saudacaoPorHorario, diasParaDesbloquear } from "@/lib/utils";
import { ProgressRing } from "@/components/ui/progress-ring";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { PageTransition } from "@/components/ui/page-transition";
import { FadeIn, StaggerContainer } from "@/components/ui/fade-in";
import { HeroSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { GlowButton } from "@/components/ui/glow-button";
import { WeekCard } from "@/components/member/week-card";
import type { ModuloComProgresso } from "@/types/database";

const fraseDoDia = [
  "Cada ritual completado é um passo em direção à mulher que você está se tornando.",
  "Não existe ritmo errado. O seu tempo é o tempo certo.",
  "Cuide do seu corpo com a mesma delicadeza que cuida de quem você ama.",
  "Pequenas escolhas diárias criam grandes transformações.",
  "Você não precisa ser perfeita. Precisa ser presente.",
];

function getFraseDoDia() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return fraseDoDia[dayOfYear % fraseDoDia.length];
}

function WeekCardWrapper({
  modulo,
  semanasLiberadas,
}: {
  modulo: ModuloComProgresso;
  semanasLiberadas: number;
}) {
  const estado = useEstadoSemana(modulo, semanasLiberadas);
  const dias =
    estado === "bloqueada"
      ? diasParaDesbloquear(
          modulo.numero_semana,
          new Date(
            Date.now() - (semanasLiberadas - 1) * 7 * 24 * 60 * 60 * 1000
          ).toISOString()
        )
      : undefined;

  return (
    <WeekCard
      modulo={modulo}
      estado={estado}
      aulasTotal={modulo.total_aulas}
      aulasConcluidas={modulo.aulas_concluidas}
      diasRestantes={dias}
    />
  );
}

export default function DashboardPage() {
  const {
    profile,
    modulos,
    loading,
    semanasLiberadas,
    totalAulas,
    aulasConcluidas,
  } = useMemberData();

  const progressPercentage =
    totalAulas > 0 ? (aulasConcluidas / totalAulas) * 100 : 0;

  const semanaAtual = modulos.find(
    (m) =>
      m.numero_semana <= semanasLiberadas &&
      m.aulas_concluidas < m.total_aulas
  );

  const semanasConcluidasCount = modulos.filter(
    (m) =>
      m.numero_semana <= semanasLiberadas &&
      m.total_aulas > 0 &&
      m.aulas_concluidas === m.total_aulas
  ).length;

  if (loading) {
    return (
      <div className="container-app py-8">
        <HeroSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container-app py-8 md:py-12">
        {/* Hero */}
        <FadeIn>
          <section className="mb-12 md:mb-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="space-y-3">
                <h1 className="font-display text-h1 text-text-primary">
                  {saudacaoPorHorario()},{" "}
                  <span className="text-pink-primary">
                    {profile?.nome?.split(" ")[0] || "linda"}
                  </span>
                </h1>
                <p className="text-body text-text-secondary max-w-lg italic font-display">
                  &ldquo;{getFraseDoDia()}&rdquo;
                </p>

                {/* Stats rápidas */}
                <div className="flex items-center gap-6 pt-4">
                  <div>
                    <span className="font-display text-h3 text-pink-primary">
                      <AnimatedCounter value={semanasConcluidasCount} />
                    </span>
                    <p className="text-body-sm text-text-tertiary">
                      {semanasConcluidasCount === 1
                        ? "semana concluída"
                        : "semanas concluídas"}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div>
                    <span className="font-display text-h3 text-pink-vibrant">
                      <AnimatedCounter value={aulasConcluidas} />
                    </span>
                    <p className="text-body-sm text-text-tertiary">
                      aulas completadas
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="relative w-[140px] h-[140px] shrink-0">
                <ProgressRing
                  percentage={progressPercentage}
                  size={140}
                  strokeWidth={8}
                  label="da jornada"
                />
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Semana Atual */}
        {semanaAtual && (
          <FadeIn delay={0.1}>
            <section className="mb-12 md:mb-16">
              <h2 className="font-display text-h3 text-text-primary mb-6">
                Sua Semana Atual
              </h2>
              <Link
                href={`/semana/${semanaAtual.numero_semana}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-card border border-pink-primary/30 bg-bg-secondary p-6 md:p-8 transition-all duration-500 hover:shadow-glow-soft hover:border-pink-primary/50">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      <span className="text-body-sm text-pink-primary font-medium">
                        Semana {semanaAtual.numero_semana}
                      </span>
                      <h3 className="font-display text-h2 text-text-primary">
                        {semanaAtual.titulo}
                      </h3>
                      <p className="text-body text-text-secondary max-w-xl">
                        {semanaAtual.subtitulo}
                      </p>

                      {/* Mini progress */}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex-1 max-w-[200px]">
                          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-pink-primary to-pink-vibrant"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${
                                  semanaAtual.total_aulas > 0
                                    ? (semanaAtual.aulas_concluidas /
                                        semanaAtual.total_aulas) *
                                      100
                                    : 0
                                }%`,
                              }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                            />
                          </div>
                        </div>
                        <span className="text-body-sm text-text-tertiary">
                          {semanaAtual.aulas_concluidas}/
                          {semanaAtual.total_aulas} aulas
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <GlowButton size="lg" className="shrink-0 md:self-end">
                      Continuar{" "}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </GlowButton>
                  </div>

                  {/* Glow decorativo */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-primary/5 rounded-full blur-3xl" />
                </div>
              </Link>
            </section>
          </FadeIn>
        )}

        {/* Todas as Semanas */}
        <FadeIn delay={0.2}>
          <section className="mb-12 md:mb-16" id="semanas">
            <h2 className="font-display text-h3 text-text-primary mb-6">
              Suas Semanas
            </h2>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulos.map((modulo) => (
                <WeekCardWrapper
                  key={modulo.id}
                  modulo={modulo}
                  semanasLiberadas={semanasLiberadas}
                />
              ))}
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* Bônus & Extras */}
        <FadeIn delay={0.3}>
          <section id="bonus" className="mb-8">
            <h2 className="font-display text-h3 text-text-primary mb-6">
              Bônus & Extras
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group rounded-card border border-border bg-bg-secondary p-card-padding hover:border-pink-border transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-button bg-pink-primary/10 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-pink-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-h4 text-text-primary mb-1">
                      Comunidade Exclusiva
                    </h3>
                    <p className="text-body-sm text-text-secondary">
                      Em breve você terá acesso ao nosso grupo privado, onde
                      mulheres como você compartilham suas jornadas, receitas e
                      conquistas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-card border border-border bg-bg-secondary p-card-padding hover:border-pink-border transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-button bg-pink-primary/10 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-pink-vibrant" />
                  </div>
                  <div>
                    <h3 className="font-display text-h4 text-text-primary mb-1">
                      Materiais para Download
                    </h3>
                    <p className="text-body-sm text-text-secondary">
                      Wallpapers exclusivos, planners semanais e guias
                      imprimíveis para acompanhar sua transformação no dia a dia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-body-sm text-text-tertiary">
            Life Fit Members — Seu clube de bem-estar
          </p>
        </footer>
      </div>
    </PageTransition>
  );
}
