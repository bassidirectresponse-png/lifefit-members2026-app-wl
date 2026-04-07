"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlowButton } from "@/components/ui/glow-button";

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

const fraseMotivacionais = [
  "Cada pequena escolha de hoje constrói a mulher que você será amanhã.",
  "Não é sobre perfeição. É sobre presença e consistência.",
  "Seu corpo é seu templo — cuide dele com gentileza e intenção.",
  "A transformação mais bonita começa por dentro.",
  "Você merece se sentir plena, leve e confiante.",
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fraseIndex, setFraseIndex] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIndex((prev) => (prev + 1) % fraseMotivacionais.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo — Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 bg-bg-primary">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 mb-12"
          >
            <Sparkles className="w-6 h-6 text-pink-primary" />
            <span className="font-display text-2xl text-text-primary">
              Life Fit <span className="italic text-pink-primary">Members</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-h2 text-text-primary mb-2">
              Bem-vinda de volta
            </h1>
            <p className="text-body text-text-secondary mb-8">
              Entre na sua área exclusiva
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-body-sm font-medium text-text-secondary"
                >
                  E-mail
                </label>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="w-full h-12 px-4 rounded-button bg-bg-secondary border border-border text-text-primary placeholder:text-text-tertiary focus:border-pink-primary focus:ring-2 focus:ring-pink-primary/20 transition-all duration-200 text-body"
                />
                {errors.email && (
                  <p className="text-[13px] text-pink-primary">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-body-sm font-medium text-text-secondary"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    className="w-full h-12 px-4 pr-12 rounded-button bg-bg-secondary border border-border text-text-primary placeholder:text-text-tertiary focus:border-pink-primary focus:ring-2 focus:ring-pink-primary/20 transition-all duration-200 text-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[13px] text-pink-primary">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Erro geral */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-button bg-pink-dark/20 border border-pink-dark/30 text-pink-primary text-body-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <GlowButton
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12"
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Entrar"
                )}
              </GlowButton>
            </form>
          </motion.div>

          {/* Frase motivacional */}
          <div className="mt-10 h-16 flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={fraseIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-body-sm text-text-tertiary italic text-center font-display"
              >
                &ldquo;{fraseMotivacionais[fraseIndex]}&rdquo;
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Lado direito — Imagem (só desktop) */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary via-bg-tertiary to-bg-primary" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-bg-primary/50" />

        {/* Placeholder visual — ondas decorativas */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            fill="none"
            className="opacity-20"
          >
            <circle cx="200" cy="200" r="180" stroke="#EC4899" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="140" stroke="#F472B6" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="100" stroke="#EC4899" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="60" stroke="#F472B6" strokeWidth="0.5" />
            <path
              d="M20 200 Q100 160, 200 200 T380 200"
              stroke="#EC4899"
              strokeWidth="1"
              opacity="0.3"
            />
            <path
              d="M20 220 Q100 180, 200 220 T380 220"
              stroke="#F472B6"
              strokeWidth="1"
              opacity="0.2"
            />
          </svg>
        </div>

        {/* Texto overlay */}
        <div className="absolute bottom-16 left-12 right-12">
          <p className="font-display text-h3 text-text-primary/80 italic">
            Seu corpo merece rituais,
            <br />
            não punições.
          </p>
        </div>
      </div>
    </div>
  );
}
