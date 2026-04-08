"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlowButton } from "@/components/ui/glow-button";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { useI18n } from "@/lib/i18n/context";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("login.emailInvalid")),
        password: z.string().min(6, t("login.passwordMin")),
      }),
    [t]
  );

  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const quotes = [t("quotes.1"), t("quotes.2"), t("quotes.3"), t("quotes.4"), t("quotes.5")];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(t("login.error"));
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 bg-bg-primary relative">
        {/* Language switcher */}
        <div className="absolute top-4 right-4">
          <LocaleSwitcher />
        </div>

        <div className="w-full max-w-[400px]">
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
              {t("login.welcome")}
            </h1>
            <p className="text-body text-text-secondary mb-8">
              {t("login.subtitle")}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-body-sm font-medium text-text-secondary">
                  {t("login.email")}
                </label>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@exemple.com"
                  className="w-full h-12 px-4 rounded-button bg-bg-secondary border border-border text-text-primary placeholder:text-text-tertiary focus:border-pink-primary focus:ring-2 focus:ring-pink-primary/20 transition-all duration-200 text-body"
                />
                {errors.email && (
                  <p className="text-[13px] text-pink-primary">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-body-sm font-medium text-text-secondary">
                  {t("login.password")}
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full h-12 px-4 pr-12 rounded-button bg-bg-secondary border border-border text-text-primary placeholder:text-text-tertiary focus:border-pink-primary focus:ring-2 focus:ring-pink-primary/20 transition-all duration-200 text-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                    aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[13px] text-pink-primary">{errors.password.message}</p>
                )}
              </div>

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

              <GlowButton type="submit" disabled={isSubmitting} className="w-full h-12" size="lg">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("login.submit")}
              </GlowButton>
            </form>
          </motion.div>

          <div className="mt-10 h-16 flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-body-sm text-text-tertiary italic text-center font-display"
              >
                &ldquo;{quotes[quoteIndex]}&rdquo;
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right — Visual (desktop) */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary via-bg-tertiary to-bg-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" className="opacity-20">
            <circle cx="200" cy="200" r="180" stroke="#EC4899" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="140" stroke="#F472B6" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="100" stroke="#EC4899" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="60" stroke="#F472B6" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-16 left-12 right-12">
          <p className="font-display text-h3 text-text-primary/80 italic whitespace-pre-line">
            {t("login.tagline")}
          </p>
        </div>
      </div>
    </div>
  );
}
