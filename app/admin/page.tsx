"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Users, FileText, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState({ modulos: 0, aulas: 0, usuarios: 0, concluidas: 0 });

  useEffect(() => {
    async function load() {
      const [m, a, u, p] = await Promise.all([
        supabase.from("modulos").select("id", { count: "exact", head: true }),
        supabase.from("aulas").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("progresso").select("id", { count: "exact", head: true }).eq("concluida", true),
      ]);
      setStats({
        modulos: m.count || 0,
        aulas: a.count || 0,
        usuarios: u.count || 0,
        concluidas: p.count || 0,
      });
    }
    load();
  }, [supabase]);

  const cards = [
    { label: "Modules", value: stats.modulos, icon: BookOpen, href: "/admin/modulos", color: "text-pink-primary" },
    { label: "Leçons", value: stats.aulas, icon: FileText, href: "/admin/modulos", color: "text-pink-vibrant" },
    { label: "Utilisatrices", value: stats.usuarios, icon: Users, href: "/admin/usuarios", color: "text-pink-success" },
    { label: "Leçons terminées", value: stats.concluidas, icon: TrendingUp, href: "#", color: "text-pink-rose" },
  ];

  return (
    <div>
      <h1 className="font-display text-h2 text-text-primary mb-2">Dashboard</h1>
      <p className="text-[14px] text-text-tertiary mb-8">
        Vue d&apos;ensemble de votre plateforme
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="p-5 rounded-card border border-border bg-bg-secondary hover:border-pink-border transition-all group"
            >
              <Icon className={`w-5 h-5 ${card.color} mb-3`} />
              <p className="font-display text-h3 text-text-primary">{card.value}</p>
              <p className="text-[13px] text-text-tertiary mt-0.5">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/admin/modulos"
          className="p-6 rounded-card border border-border bg-bg-secondary hover:border-pink-border transition-all"
        >
          <h3 className="font-display text-h4 text-text-primary mb-2">
            Gérer les modules
          </h3>
          <p className="text-[14px] text-text-secondary">
            Créer, modifier, réorganiser les modules et leurs leçons.
          </p>
        </Link>
        <Link
          href="/admin/usuarios"
          className="p-6 rounded-card border border-border bg-bg-secondary hover:border-pink-border transition-all"
        >
          <h3 className="font-display text-h4 text-text-primary mb-2">
            Gérer les utilisatrices
          </h3>
          <p className="text-[14px] text-text-secondary">
            Activer/désactiver des comptes, ajuster les dates de parcours.
          </p>
        </Link>
      </div>
    </div>
  );
}
