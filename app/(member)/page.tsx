"use client";

import { motion } from "framer-motion";
import { ArrowRight, Gift, AlertCircle, Lock, Check, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemberData, useModuleEstado } from "@/lib/hooks/use-member-data";
import { getEstadoModulo } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { ProgressRing } from "@/components/ui/progress-ring";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { PageTransition } from "@/components/ui/page-transition";
import { FadeIn } from "@/components/ui/fade-in";
import { HeroSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { GlowButton } from "@/components/ui/glow-button";
import { NetflixRow, NetflixCard } from "@/components/member/netflix-row";
import type { ModuloComProgresso, UserPurchase } from "@/types/database";

function useGreeting() {
  const { t } = useI18n();
  const hora = new Date().getHours();
  if (hora < 12) return t("dashboard.greeting.morning");
  if (hora < 18) return t("dashboard.greeting.afternoon");
  return t("dashboard.greeting.evening");
}

// Regular module card (main/bonus)
function ModuleCard({ modulo, dataInicio, purchases }: {
  modulo: ModuloComProgresso;
  dataInicio: string;
  purchases: UserPurchase[];
}) {
  const { t } = useI18n();
  const { estado, diasRestantes } = useModuleEstado(modulo, dataInicio, purchases);
  const isBlocked = estado === "bloqueada";
  const isCompleted = estado === "concluida";
  const isCurrent = estado === "atual";
  const progress = modulo.total_aulas > 0 ? (modulo.aulas_concluidas / modulo.total_aulas) * 100 : 0;

  const inner = (
    <div className={`group relative h-[200px] md:h-[220px] rounded-card overflow-hidden border transition-all duration-500 ${
      isBlocked ? "opacity-40 border-border cursor-not-allowed"
      : isCurrent ? "border-pink-primary/50 shadow-glow-soft hover:shadow-glow hover:-translate-y-1"
      : "border-border hover:border-pink-border hover:shadow-card-hover hover:-translate-y-1"
    }`}>
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
        style={{ backgroundColor: modulo.cor_destaque || "#1C1C1F", backgroundImage: modulo.banner_url ? `url(${modulo.banner_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />

      {/* Overlay for locked drip */}
      {isBlocked && (
        <div className="absolute inset-0 bg-bg-primary/50 flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-pink-primary/60 mx-auto mb-2" />
            <span className="text-[13px] text-text-secondary">
              {t("week.locked", { days: diasRestantes, n: diasRestantes })}
            </span>
          </div>
        </div>
      )}

      <div className="absolute top-3 right-3 z-10">
        {isCompleted && <span className="flex items-center gap-1 px-2.5 py-1 rounded-tag bg-pink-primary/20 text-pink-primary text-[12px] font-medium backdrop-blur-sm"><Check className="w-3 h-3" />{t("week.completed")}</span>}
        {isCurrent && <span className="px-2.5 py-1 rounded-tag bg-pink-primary text-bg-primary text-[12px] font-semibold animate-glow-pulse">{t("week.current")}</span>}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <p className="text-[12px] text-pink-primary font-medium mb-0.5">{t("week.week")} {modulo.numero_semana}</p>
        <h3 className="font-display text-[17px] text-text-primary leading-tight line-clamp-2 mb-2">{modulo.titulo}</h3>
        {!isBlocked && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-bg-tertiary/80 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-pink-primary to-pink-vibrant" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6, delay: 0.2 }} />
            </div>
            <span className="text-[11px] text-text-tertiary shrink-0">{modulo.aulas_concluidas}/{modulo.total_aulas}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (isBlocked) return <NetflixCard>{inner}</NetflixCard>;
  return <NetflixCard><Link href={`/semana/${modulo.numero_semana}`}>{inner}</Link></NetflixCard>;
}

// Locked/Upsell module card — visually distinct
function LockedUpsellCard({ modulo }: { modulo: ModuloComProgresso }) {
  return (
    <NetflixCard className="w-[300px] md:w-[340px]">
      <div className="relative h-[260px] md:h-[280px] rounded-card overflow-hidden border border-pink-dark/40 bg-bg-secondary group hover:border-pink-primary/50 hover:shadow-glow-soft transition-all duration-500">
        {/* Cover */}
        <div className="h-[120px] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[120px] transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ backgroundColor: modulo.cor_destaque || "#1C1C1F", backgroundImage: (modulo.cover_image || modulo.banner_url) ? `url(${modulo.cover_image || modulo.banner_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-t from-bg-secondary to-transparent" />
        </div>

        {/* Badge */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-tag bg-pink-dark text-pink-rose text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm">
            <Star className="w-3 h-3" /> Premium
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-[17px] text-text-primary leading-tight line-clamp-1 mb-1">
            {modulo.titulo}
          </h3>
          {modulo.sales_copy && (
            <p className="text-[13px] text-text-secondary line-clamp-2 mb-3">
              {modulo.sales_copy}
            </p>
          )}
          <div className="flex items-center justify-between">
            {modulo.price_display && (
              <span className="font-display text-[20px] text-pink-primary font-semibold">
                {modulo.price_display}
              </span>
            )}
            {modulo.checkout_url && (
              <a
                href={modulo.checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-button bg-pink-primary text-bg-primary font-semibold text-[13px] hover:bg-pink-vibrant transition-all btn-glow"
              >
                {modulo.cta_text || "Débloquer"} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </NetflixCard>
  );
}

export default function DashboardPage() {
  const { profile, modulos, purchases, loading, totalAulas, aulasConcluidas, error } = useMemberData();
  const { t } = useI18n();
  const greeting = useGreeting();

  const progressPercentage = totalAulas > 0 ? (aulasConcluidas / totalAulas) * 100 : 0;
  const dataInicio = profile?.data_inicio_jornada || new Date().toISOString();

  // Categorize modules
  const mainModules = modulos.filter((m) => (m.tipo || "main") === "main");
  const bonusModules = modulos.filter((m) => m.tipo === "bonus");
  const lockedModules = modulos.filter((m) => m.tipo === "locked" && !purchases.some((p) => p.modulo_id === m.id));
  const purchasedLockedModules = modulos.filter((m) => m.tipo === "locked" && purchases.some((p) => p.modulo_id === m.id));

  const semanaAtual = mainModules.find((m) => {
    const purchased = purchases.some((p) => p.modulo_id === m.id);
    const estado = getEstadoModulo({
      tipo: m.tipo || "main", unlockAfterDays: m.unlock_after_days || 0,
      dataInicioJornada: dataInicio,
      todasAulasConcluidas: m.total_aulas > 0 && m.aulas_concluidas === m.total_aulas,
      totalAulas: m.total_aulas, purchased,
    });
    return estado === "atual" && m.aulas_concluidas < m.total_aulas;
  });

  const semanasConcluidasCount = mainModules.filter((m) => m.total_aulas > 0 && m.aulas_concluidas === m.total_aulas).length;

  const quotes = [t("quotes.1"), t("quotes.2"), t("quotes.3"), t("quotes.4"), t("quotes.5")];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  if (loading) {
    return <div className="container-app py-8"><HeroSkeleton /><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div></div>;
  }

  if (error) {
    return <div className="container-app py-16 text-center"><AlertCircle className="w-12 h-12 text-pink-primary mx-auto mb-4" /><h2 className="font-display text-h3 text-text-primary mb-2">{t("dashboard.errorTitle")}</h2><p className="text-body text-text-secondary mb-6">{error}</p><a href="/login" className="text-pink-primary underline">{t("dashboard.loginAgain")}</a></div>;
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
                  {greeting}, <span className="text-pink-primary">{profile?.nome?.split(" ")[0] || ""}</span>
                </h1>
                <p className="text-body text-text-secondary max-w-lg italic font-display">&ldquo;{quotes[dayOfYear % quotes.length]}&rdquo;</p>
                <div className="flex items-center gap-6 pt-4">
                  <div>
                    <span className="font-display text-h3 text-pink-primary"><AnimatedCounter value={semanasConcluidasCount} /></span>
                    <p className="text-body-sm text-text-tertiary">{t("dashboard.weeksCompleted", { n: semanasConcluidasCount })}</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div>
                    <span className="font-display text-h3 text-pink-vibrant"><AnimatedCounter value={aulasConcluidas} /></span>
                    <p className="text-body-sm text-text-tertiary">{t("dashboard.lessonsCompleted")}</p>
                  </div>
                </div>
              </div>
              <div className="relative w-[140px] h-[140px] shrink-0">
                <ProgressRing percentage={progressPercentage} size={140} strokeWidth={8} label={t("dashboard.ofJourney")} />
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Current week card */}
        {semanaAtual && (
          <FadeIn delay={0.1}>
            <section className="container-app mb-10 md:mb-14">
              <h2 className="font-display text-h3 text-text-primary mb-5">{t("dashboard.currentWeek")}</h2>
              <Link href={`/semana/${semanaAtual.numero_semana}`} className="group block">
                <div className="relative overflow-hidden rounded-card border border-pink-primary/30 bg-bg-secondary p-6 md:p-8 transition-all duration-500 hover:shadow-glow-soft hover:border-pink-primary/50">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1 space-y-2">
                      <span className="text-body-sm text-pink-primary font-medium">{t("week.week")} {semanaAtual.numero_semana}</span>
                      <h3 className="font-display text-h2 text-text-primary">{semanaAtual.titulo}</h3>
                      <p className="text-body text-text-secondary max-w-xl">{semanaAtual.subtitulo}</p>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex-1 max-w-[200px]">
                          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full bg-gradient-to-r from-pink-primary to-pink-vibrant" initial={{ width: 0 }} animate={{ width: `${semanaAtual.total_aulas > 0 ? (semanaAtual.aulas_concluidas / semanaAtual.total_aulas) * 100 : 0}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
                          </div>
                        </div>
                        <span className="text-body-sm text-text-tertiary">{semanaAtual.aulas_concluidas}/{semanaAtual.total_aulas} {t("week.lessons")}</span>
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

        {/* Main modules — Netflix rows */}
        {mainModules.length > 0 && (
          <FadeIn delay={0.15}>
            <div className="container-app mb-10 md:mb-14">
              <NetflixRow title={t("dashboard.yourWeeks")}>
                {mainModules.map((m) => <ModuleCard key={m.id} modulo={m} dataInicio={dataInicio} purchases={purchases} />)}
              </NetflixRow>
            </div>
          </FadeIn>
        )}

        {/* Purchased locked modules (now unlocked) */}
        {purchasedLockedModules.length > 0 && (
          <FadeIn delay={0.2}>
            <div className="container-app mb-10 md:mb-14">
              <NetflixRow title="Contenu Débloqué">
                {purchasedLockedModules.map((m) => <ModuleCard key={m.id} modulo={m} dataInicio={dataInicio} purchases={purchases} />)}
              </NetflixRow>
            </div>
          </FadeIn>
        )}

        {/* Bonus section */}
        {bonusModules.length > 0 && (
          <FadeIn delay={0.25}>
            <div className="container-app mb-10 md:mb-14">
              <NetflixRow title={t("dashboard.bonus")} subtitle="Contenus supplémentaires offerts">
                {bonusModules.map((m) => <ModuleCard key={m.id} modulo={m} dataInicio={dataInicio} purchases={purchases} />)}
              </NetflixRow>
            </div>
          </FadeIn>
        )}

        {/* Locked/Upsell section */}
        {lockedModules.length > 0 && (
          <FadeIn delay={0.3}>
            <section className="container-app mb-10 md:mb-14">
              <div className="flex items-center gap-2 mb-4 px-1">
                <Star className="w-5 h-5 text-pink-primary" />
                <h2 className="font-display text-h3 text-text-primary">Contenu Premium</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                {lockedModules.map((m) => <LockedUpsellCard key={m.id} modulo={m} />)}
              </div>
            </section>
          </FadeIn>
        )}

        {/* Community & Downloads */}
        <FadeIn delay={0.35}>
          <section className="container-app mt-10 md:mt-14 mb-8" id="bonus">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group rounded-card border border-border bg-bg-secondary p-card-padding hover:border-pink-border transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-button bg-pink-primary/10 flex items-center justify-center shrink-0"><Gift className="w-5 h-5 text-pink-primary" /></div>
                  <div>
                    <h3 className="font-display text-h4 text-text-primary mb-1">{t("dashboard.community")}</h3>
                    <p className="text-body-sm text-text-secondary">{t("dashboard.communityDesc")}</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-card border border-border bg-bg-secondary p-card-padding hover:border-pink-border transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-button bg-pink-primary/10 flex items-center justify-center shrink-0"><Gift className="w-5 h-5 text-pink-vibrant" /></div>
                  <div>
                    <h3 className="font-display text-h4 text-text-primary mb-1">{t("dashboard.downloads")}</h3>
                    <p className="text-body-sm text-text-secondary">{t("dashboard.downloadsDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        <footer className="container-app mt-16 pt-8 border-t border-border text-center">
          <p className="text-body-sm text-text-tertiary">{t("dashboard.footer")}</p>
        </footer>
      </div>
    </PageTransition>
  );
}
