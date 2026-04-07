"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Calendar, Award, Lock, LogOut, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calcularSemanasLiberadas } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";
import { FadeIn } from "@/components/ui/fade-in";
import { GlowButton } from "@/components/ui/glow-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/types/database";

const profileSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ContaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [, setTotalModulos] = useState(0);
  const [aulasConcluidas, setAulasConcluidas] = useState(0);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, modulosRes, progressoRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("modulos").select("id"),
        supabase
          .from("progresso")
          .select("id")
          .eq("user_id", user.id)
          .eq("concluida", true),
      ]);

      const profileData = profileRes.data as Profile;
      setProfile(profileData);
      setTotalModulos(modulosRes.data?.length || 0);
      setAulasConcluidas(progressoRes.data?.length || 0);
      resetProfile({ nome: profileData.nome });
      setLoading(false);
    }

    fetchData();
  }, [supabase, resetProfile]);

  const onProfileSubmit = async (data: ProfileForm) => {
    if (!profile) return;
    await supabase.from("profiles").update({ nome: data.nome }).eq("id", profile.id);
    setProfile((prev) => (prev ? { ...prev, nome: data.nome } : prev));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    await supabase.auth.updateUser({ password: data.password });
    resetPassword();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="container-app py-8 max-w-2xl mx-auto">
        <Skeleton className="w-48 h-10 mb-8" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  const semanasLiberadas = profile
    ? calcularSemanasLiberadas(profile.data_inicio_jornada)
    : 0;
  const dataInicio = profile
    ? new Date(profile.data_inicio_jornada).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <PageTransition>
      <div className="container-app py-8 md:py-12 max-w-2xl mx-auto">
        <FadeIn>
          <h1 className="font-display text-h1 text-text-primary mb-8">
            Minha Conta
          </h1>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="rounded-card border border-border bg-bg-secondary p-5 text-center">
              <Calendar className="w-5 h-5 text-pink-primary mx-auto mb-2" />
              <span className="font-display text-h3 text-pink-primary block">
                <AnimatedCounter value={semanasLiberadas} />
              </span>
              <span className="text-[13px] text-text-tertiary">
                semanas liberadas
              </span>
            </div>
            <div className="rounded-card border border-border bg-bg-secondary p-5 text-center">
              <Award className="w-5 h-5 text-pink-vibrant mx-auto mb-2" />
              <span className="font-display text-h3 text-pink-vibrant block">
                <AnimatedCounter value={aulasConcluidas} />
              </span>
              <span className="text-[13px] text-text-tertiary">
                aulas concluídas
              </span>
            </div>
            <div className="rounded-card border border-border bg-bg-secondary p-5 text-center">
              <User className="w-5 h-5 text-pink-success mx-auto mb-2" />
              <span className="text-body-sm text-text-secondary block mt-1">
                Membro desde
              </span>
              <span className="text-[13px] text-text-tertiary">{dataInicio}</span>
            </div>
          </div>
        </FadeIn>

        {/* Editar perfil */}
        <FadeIn delay={0.15}>
          <section className="rounded-card border border-border bg-bg-secondary p-card-padding mb-6">
            <h2 className="font-display text-h4 text-text-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-primary" />
              Dados pessoais
            </h2>
            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="nome"
                  className="block text-body-sm font-medium text-text-secondary"
                >
                  Nome
                </label>
                <input
                  {...registerProfile("nome")}
                  id="nome"
                  className="w-full h-12 px-4 rounded-button bg-bg-tertiary border border-border text-text-primary placeholder:text-text-tertiary focus:border-pink-primary focus:ring-2 focus:ring-pink-primary/20 transition-all duration-200 text-body"
                />
                {profileErrors.nome && (
                  <p className="text-[13px] text-pink-primary">
                    {profileErrors.nome.message}
                  </p>
                )}
              </div>
              <GlowButton
                type="submit"
                disabled={profileSubmitting}
                size="sm"
              >
                {profileSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : profileSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Salvo
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </GlowButton>
            </form>
          </section>
        </FadeIn>

        {/* Alterar senha */}
        <FadeIn delay={0.2}>
          <section className="rounded-card border border-border bg-bg-secondary p-card-padding mb-6">
            <h2 className="font-display text-h4 text-text-primary mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-pink-primary" />
              Alterar senha
            </h2>
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-body-sm font-medium text-text-secondary"
                >
                  Nova senha
                </label>
                <input
                  {...registerPassword("password")}
                  id="password"
                  type="password"
                  className="w-full h-12 px-4 rounded-button bg-bg-tertiary border border-border text-text-primary placeholder:text-text-tertiary focus:border-pink-primary focus:ring-2 focus:ring-pink-primary/20 transition-all duration-200 text-body"
                />
                {passwordErrors.password && (
                  <p className="text-[13px] text-pink-primary">
                    {passwordErrors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-body-sm font-medium text-text-secondary"
                >
                  Confirmar nova senha
                </label>
                <input
                  {...registerPassword("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  className="w-full h-12 px-4 rounded-button bg-bg-tertiary border border-border text-text-primary placeholder:text-text-tertiary focus:border-pink-primary focus:ring-2 focus:ring-pink-primary/20 transition-all duration-200 text-body"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-[13px] text-pink-primary">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
              <GlowButton
                type="submit"
                disabled={passwordSubmitting}
                size="sm"
                variant="secondary"
              >
                {passwordSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : passwordSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Senha alterada
                  </>
                ) : (
                  "Alterar senha"
                )}
              </GlowButton>
            </form>
          </section>
        </FadeIn>

        {/* Logout */}
        <FadeIn delay={0.25}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-text-tertiary hover:text-pink-primary transition-colors duration-200 text-body-sm"
          >
            <LogOut className="w-4 h-4" />
            Sair da minha conta
          </button>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
