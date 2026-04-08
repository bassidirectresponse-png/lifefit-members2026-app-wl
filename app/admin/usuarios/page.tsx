"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ToggleLeft, ToggleRight, CalendarDays, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

export default function UsuariosPage() {
  const supabase = useMemo(() => createClient(), []);
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsuarios((data || []) as Profile[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (user: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ ativo: !user.ativo })
      .eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success(user.ativo ? `${user.nome} désactivée` : `${user.nome} activée`);
    await load();
  };

  const updateDate = async (user: Profile, date: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ data_inicio_jornada: new Date(date).toISOString() })
      .eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Date de début mise à jour pour ${user.nome}`);
    await load();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-pink-primary animate-spin" /></div>;
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Utilisatrices" }]} />

      <div className="mb-6">
        <h1 className="font-display text-h2 text-text-primary">Utilisatrices</h1>
        <p className="text-[14px] text-text-tertiary mt-1">
          {usuarios.length} utilisatrice{usuarios.length !== 1 ? "s" : ""} inscrite{usuarios.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {usuarios.map((user) => (
          <div
            key={user.id}
            className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-card border border-border bg-bg-secondary"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[15px] font-medium text-text-primary">{user.nome}</h3>
                {user.role === "admin" && (
                  <span className="px-2 py-0.5 rounded-tag bg-pink-primary/15 text-pink-primary text-[11px] font-bold uppercase tracking-wide">
                    Admin
                  </span>
                )}
                <StatusBadge active={user.ativo} />
              </div>
              <p className="text-[13px] text-text-tertiary">
                Membre depuis {new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-text-tertiary" />
                <div>
                  <p className="text-[11px] text-text-tertiary mb-0.5">Début du parcours</p>
                  <input
                    type="date"
                    defaultValue={new Date(user.data_inicio_jornada).toISOString().split("T")[0]}
                    onChange={(e) => {
                      if (e.target.value) updateDate(user, e.target.value);
                    }}
                    className="h-8 px-2 rounded-lg bg-bg-tertiary border border-border text-text-primary text-[13px] outline-none focus:border-pink-primary"
                  />
                </div>
              </div>

              <button
                onClick={() => toggleActive(user)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  user.ativo
                    ? "text-pink-success hover:text-pink-primary hover:bg-bg-tertiary"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary"
                )}
                title={user.ativo ? "Désactiver" : "Activer"}
              >
                {user.ativo ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
