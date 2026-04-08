"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookOpen, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function AdminNav() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "modulos";

  return (
    <nav className="flex items-center gap-1">
      <Link
        href="/admin"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-[14px] rounded-button transition-colors",
          tab === "modulos"
            ? "text-pink-primary bg-pink-primary/10"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
        )}
      >
        <BookOpen className="w-4 h-4" />
        Modules
      </Link>
      <Link
        href="/admin?tab=usuarios"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-[14px] rounded-button transition-colors",
          tab === "usuarios"
            ? "text-pink-primary bg-pink-primary/10"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
        )}
      >
        <Users className="w-4 h-4" />
        Utilisatrices
      </Link>
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-40 border-b border-border bg-bg-secondary/95 backdrop-blur-md">
        <div className="container-app flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-display text-lg text-text-primary"
            >
              Life Fit <span className="italic text-pink-primary">Admin</span>
            </Link>
            <Suspense fallback={null}>
              <AdminNav />
            </Suspense>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[14px] text-text-tertiary hover:text-pink-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour au site
          </Link>
        </div>
      </header>
      <main className="container-app py-8">{children}</main>
    </div>
  );
}
