"use client";

import { motion } from "framer-motion";
import { ArrowRight, Gift, AlertCircle, Lock, Check } from "lucide-react";
import Link from "next/link";
import { useMemberData } from "@/lib/hooks/use-member-data";
import { diasParaDesbloquear } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { ProgressRing } from "@/components/ui/progress-ring";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { PageTransition } from "@/components/ui/page-transition";
import { FadeIn } from "@/components/ui/fade-in";
import { HeroSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { GlowButton } from "@/components/ui/glow-button";
import { NetflixRow, NetflixCard } from "@/components/member/netflix-row";
import type { ModuloComProgresso, EstadoSemana } from "@/types/database";

function useGreeting() {
  const { t } = useI18n();
  const hora = new Date().getHours();
  if (hora < 12) return t("dashboard.greeting.morning");
  if (hora < 18) return t("dashboard.greeting.afternoon");
  return t("dashboard.greeting.evening");
}

function NetflixWeekCard({
  modulo,
  estado,
  diasRestantes,
}: {
  modulo: ModuloComProgresso;
  estado: EstadoSemana;
  diasRestantes?: number;
  semanasLiberadas?: number;
}) {
  const { t } = useI18n();
  const isBlocked = estado === "bloqueada";
  const isCompleted = estado === "concluida";
  const isCurrent = estado === "atual";
  const progress =
    modulo.total_aulas > 0
      ? (modulo.aulas_concluidas / modulo.total_aulas) * 100
      : 0;

  const inner = (
    <div
      className={`group relative h-[200px] md:h-[220px] rounded-card overflow-hidden border transition-all duration-500 ${
        isBlocked
          ? "opacity-40 border-border cursor-not-allowed"
          : isCurrent
          ? "border-pink-primary/50 shadow-glow-soft hover:shadow-glow hover:-translate-y-1"
          : "border-border hover:border-pink-border hover:shadow-card-hover hover:-translate-y-1"
      }`}
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
        style={{
          backgroundColor: modulo.cor_destaque || "#1C1C1F",
          backgroundImage: modulo.banner_url
            ? `url(${modulo.banner_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />

      {/* Badge */}
      <div className="absolute top-3 right-3 z-10">
        {isBlocked && diasRestantes && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-tag bg-bg-primary/80 text-text-tertiary text-[12px] font-medium backdrop-blur-sm">
            <Lock className="w-3 h-3" />
            {diasRestantes}d
          </span>
        )}
        {isCompleted && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-tag bg-pink-primary/20 text-pink-primary text-[12px] font-medium backdrop-blur-sm">
            <Check className="w-3 h-3" />
            {t("week.completed")}
          </span>
        )}
        {isCurrent && (
          <span className="px-2.5 py-1 rounded-tag bg-pink-primary text-bg-primary text-[12px] font-semibold animate-glow-pulse">
            {t("week.current")}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <p className="text-[12px] text-pink-primary font-medium mb-0.5">
          {t("week.week")} {modulo.numero_semana}
        </p>
        <h3 className="font-display text-[17px] text-text-primary leading-tight line-clamp-2 mb-2">
          {modulo.titulo}
        </h3>

        {!isBlocked && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-bg-tertiary/80 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pink-primary to-pink-vibrant"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </div>
            <span className="text-[11px] text-text-tertiary shrink-0">
              {modulo.aulas_concluidas}/{modulo.total_aulas}
            </span>
          </div>
        )}

        {isBlocked && diasRestantes && (
          <p className="text-[12px] text-text-tertiary">
            {t("week.locked", { days: diasRestantes, n: diasRestantes })}
          </p>
        )}
      </div>
    </div>
  );

  if (isBlocked) return <NetflixCard>{inner}</NetflixCard>;

  return (
    <NetflixCard>
      <Link href={`/semana/${modulo.numero_semana}`}>{inner}</Link>
    </NetflixCard>
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
    error,
  } = useMemberData();
  const { t } = useI18n();
  const greeting = useGreeting();

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

  // Split modules into categories for Netflix rows
  const currentAndNext = modulos.filter(
    (m) => m.numero_semana <= semanasLiberadas && m.aulas_concluidas < m.total_aulas
  );
  const completedModules = modulos.filter(
    (m) => m.total_aulas > 0 && m.aulas_concluidas === m.total_aulas
  );
  const lockedModules = modulos.filter(
    (m) => m.numero_semana > semanasLiberadas
  );

  const getEstado = (m: ModuloComProgresso): EstadoSemana => {
    if (m.numero_semana > semanasLiberadas) return "bloqueada";
    if (m.total_aulas > 0 && m.aulas_concluidas === m.total_aulas) return "concluida";
    return "atual";
  };

  const getDias = (m: ModuloComProgresso) => {
    if (m.numero_semana <= semanasLiberadas) return undefined;
    return diasParaDesbloquear(
      m.numero_semana,
      profile?.data_inicio_jornada || new Date().toISOString()
    );
  };

  const quotes = [
    t("quotes.1"), t("quotes.2"), t("quotes.3"), t("quotes.4"), t("quotes.5"),
  ];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  if (loading) {
    return (
      <div className="container-app py-8">
        <HeroSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-16 text-center">
        <AlertCircle className="w-12 h-12 text-pink-primary mx-auto mb-4" />
        <h2 className="font-display text-h3 text-text-primary mb-2">{t("dashboard.errorTitle")}</h2>
        <p className="text-body text-text-secondary mb-6">{error}</p>
        <a href="/login" className="text-pink-primary underline">{t("dashboard.loginAgain")}</a>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="py-8 md:py-12">
        {/* Hero */}
        <FadeIn>
          <section className="container-app mb-10 md:mb-14">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="space-y-3">
                <h1 className="font-display text-h1 text-text-primary">
                  {greeting},{" "}
                  <span className="text-pink-primary">
                    {profile?.nome?.split(" ")[0] || ""}
                  </span>
                </h1>
                <p className="text-body text-text-secondary max-w-lg italic font-display">
                  &ldquo;{quotes[dayOfYear % quotes.length]}&rdquo;
                </p>

                <div className="flex items-center gap-6 pt-4">
                  <div>
                    <span className="font-display text-h3 text-pink-primary">
                      <AnimatedCounter value={semanasConcluidasCount} />
                    </span>
                    <p className="text-body-sm text-text-tertiary">
                      {t("dashboard.weeksCompleted", { n: semanasConcluidasCount }).split(" | ")[semanasConcluidasCount === 1 ? 0 : 1] || t("dashboard.weeksCompleted")}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div>
                    <span className="font-display text-h3 text-pink-vibrant">
                      <AnimatedCounter value={aulasConcluidas} />
                    </span>
                    <p className="text-body-sm text-text-tertiary">
                      {t("dashboard.lessonsCompleted")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative w-[140px] h-[140px] shrink-0">
                <ProgressRing
                  percentage={progressPercentage}
                  size={140}
                  strokeWidth={8}
                  label={t("dashboard.ofJourney")}
                />
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Current week hero card */}
        {semanaAtual && (
          <FadeIn delay={0.1}>
            <section className="container-app mb-10 md:mb-14">
              <h2 className="font-display text-h3 text-text-primary mb-5">
                {t("dashboard.currentWeek")}
              </h2>
              <Link href={`/semana/${semanaAtual.numero_semana}`} className="group block">
                <div className="relative overflow-hidden rounded-card border border-pink-primary/30 bg-bg-secondary p-6 md:p-8 transition-all duration-500 hover:shadow-glow-soft hover:border-pink-primary/50">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1 space-y-2">
                      <span className="text-body-sm text-pink-primary font-medium">
                        {t("week.week")} {semanaAtual.numero_semana}
                      </span>
                      <h3 className="font-display text-h2 text-text-primary">
                        {semanaAtual.titulo}
                      </h3>
                      <p className="text-body text-text-secondary max-w-xl">
                        {semanaAtual.subtitulo}
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex-1 max-w-[200px]">
                          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-pink-primary to-pink-vibrant"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${semanaAtual.total_aulas > 0 ? (semanaAtual.aulas_concluidas / semanaAtual.total_aulas) * 100 : 0}%`,
                              }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                            />
                          </div>
                        </div>
                        <span className="text-body-sm text-text-tertiary">
                          {semanaAtual.aulas_concluidas}/{semanaAtual.total_aulas} {t("week.lessons")}
                        </span>
                      </div>
                    </div>
                    <GlowButton size="lg" className="shrink-0 md:self-end">
                      {t("dashboard.continue")} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </GlowButton>
                  </div>
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-primary/5 rounded-full blur-3xl" />
                </div>
              </Link>
            </section>
          </FadeIn>
        )}

        {/* Netflix rows */}
        <div className="space-y-10 md:space-y-14">
          {/* Continue watching / current */}
          {currentAndNext.length > 0 && (
            <FadeIn delay={0.15}>
              <div className="container-app">
                <NetflixRow title={t("dashboard.yourWeeks")}>
                  {currentAndNext.map((m) => (
                    <NetflixWeekCard
                      key={m.id}
                      modulo={m}
                      estado={getEstado(m)}
                      diasRestantes={getDias(m)}
                      semanasLiberadas={semanasLiberadas}
                    />
                  ))}
                </NetflixRow>
              </div>
            </FadeIn>
          )}

          {/* Completed */}
          {completedModules.length > 0 && (
            <FadeIn delay={0.2}>
              <div className="container-app">
                <NetflixRow title={t("week.completed")}>
                  {completedModules.map((m) => (
                    <NetflixWeekCard
                      key={m.id}
                      modulo={m}
                      estado="concluida"
                      semanasLiberadas={semanasLiberadas}
                    />
                  ))}
                </NetflixRow>
              </div>
            </FadeIn>
          )}

          {/* Coming soon / locked */}
          {lockedModules.length > 0 && (
            <FadeIn delay={0.25}>
              <div className="container-app">
                <NetflixRow title={t("dashboard.seeAll")}>
                  {lockedModules.map((m) => (
                    <NetflixWeekCard
                      key={m.id}
                      modulo={m}
                      estado="bloqueada"
                      diasRestantes={getDias(m)}
                      semanasLiberadas={semanasLiberadas}
                    />
                  ))}
                </NetflixRow>
              </div>
            </FadeIn>
          )}

          {/* All modules if no categorization makes sense */}
          {currentAndNext.length === 0 && completedModules.length === 0 && modulos.length > 0 && (
            <FadeIn delay={0.15}>
              <div className="container-app">
                <NetflixRow title={t("dashboard.yourWeeks")}>
                  {modulos.map((m) => (
                    <NetflixWeekCard
                      key={m.id}
                      modulo={m}
                      estado={getEstado(m)}
                      diasRestantes={getDias(m)}
                      semanasLiberadas={semanasLiberadas}
                    />
                  ))}
                </NetflixRow>
              </div>
            </FadeIn>
          )}
        </div>

        {/* Bonus */}
        <FadeIn delay={0.3}>
          <section className="container-app mt-10 md:mt-14 mb-8" id="bonus">
            <h2 className="font-display text-h3 text-text-primary mb-6">
              {t("dashboard.bonus")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group rounded-card border border-border bg-bg-secondary p-card-padding hover:border-pink-border transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-button bg-pink-primary/10 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-pink-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-h4 text-text-primary mb-1">
                      {t("dashboard.community")}
                    </h3>
                    <p className="text-body-sm text-text-secondary">
                      {t("dashboard.communityDesc")}
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
                      {t("dashboard.downloads")}
                    </h3>
                    <p className="text-body-sm text-text-secondary">
                      {t("dashboard.downloadsDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Footer */}
        <footer className="container-app mt-16 pt-8 border-t border-border text-center">
          <p className="text-body-sm text-text-tertiary">
            {t("dashboard.footer")}
          </p>
        </footer>
      </div>
    </PageTransition>
  );
}
