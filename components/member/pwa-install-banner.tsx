"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { GlowButton } from "@/components/ui/glow-button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already dismissed?
    if (localStorage.getItem("lfm-pwa-dismissed")) return;

    // Already installed?
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // iOS detection
    const ua = navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua);
    setIsIos(iosDevice);

    if (iosDevice) {
      // Show iOS instructions after 3 seconds
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("lfm-pwa-dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-40 animate-fade-up">
      <div className="bg-bg-secondary border border-pink-border rounded-card p-5 shadow-glow-soft">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-button bg-pink-primary/10 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-pink-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-text-primary mb-1">
              {t("pwa.installTitle")}
            </h3>
            <p className="text-[13px] text-text-secondary mb-3">
              {t("pwa.installDesc")}
            </p>

            {isIos ? (
              <p className="text-[13px] text-text-tertiary">
                {t("pwa.iosSteps").replace(
                  "{icon}",
                  "⬆"
                )}
              </p>
            ) : (
              <div className="flex gap-2">
                <GlowButton size="sm" onClick={handleInstall}>
                  {t("pwa.install")}
                </GlowButton>
                <GlowButton size="sm" variant="ghost" onClick={dismiss}>
                  {t("pwa.dismiss")}
                </GlowButton>
              </div>
            )}
          </div>

          <button
            onClick={dismiss}
            className="text-text-tertiary hover:text-text-primary shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
