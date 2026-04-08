"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ToggleLeft, ToggleRight, CalendarDays, Loader2, Lock, Unlock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";
import type { Profile, Modulo, UserPurchase } from "@/types/database";

export default function UsuariosPage() {
  const supabase = useMemo(() => createClient(), []);
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [lockedModules, setLockedModules] = useState<Modulo[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantModal, setGrantModal] = useState<Profile | null>(null);

  const load = useCallback(async () => {
    const [u, m, p] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("modulos").select("*").eq("tipo", "locked"),
      supabase.from("user_purchases").select("*"),
    ]);
    setUsuarios((u.data || []) as Profile[]);
    setLockedModules((m.data || []) as Modulo[]);
    setPurchases((p.data || []) as UserPurchase[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (user: Profile) => {
    const { error } = await supabase.from("profiles").update({ ativo: !user.ativo }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success(user.ativo ? `${user.nome} désactivée` : `${user.nome} activée`);
    await load();
  };

  const updateDate = async (user: Profile, date: string) => {
    const { error } = await supabase.from("profiles").update({ data_inicio_jornada: new Date(date).toISOString() }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Date mise à jour");
    await load();
  };

  const grantAccess = async (userId: string, moduloId: string) => {
    const { error } = await supabase.from("user_purchases").upsert(
      { user_id: userId, modulo_id: moduloId, purchased_at: new Date().toISOString() },
      { onConflict: "user_id,modulo_id" }
    );
    if (error) { toast.error(error.message); return; }
    toast.success("Accès accordé");
    await load();
  };

  const revokeAccess = async (userId: string, moduloId: string) => {
    const { error } = await supabase.from("user_purchases").delete().eq("user_id", userId).eq("modulo_id", moduloId);
    if (error) { toast.error(error.message); return; }
    toast.success("Accès révoqué");
    await load();
  };

  const hasPurchase = (userId: string, moduloId: string) =>
    purchases.some((p) => p.user_id === userId && p.modulo_id === moduloId);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-pink-primary animate-spin" /></div>;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Utilisatrices" }]} />

      <div className="mb-6">
        <h1 className="font-display text-h2 text-text-primary">Utilisatrices</h1>
        <p className="text-[14px] text-text-tertiary mt-1">
          {usuarios.length} utilisatrice{usuarios.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {usuarios.map((user) => (
          <div key={user.id} className="p-4 rounded-card border border-border bg-bg-secondary">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-[15px] font-medium text-text-primary">{user.nome}</h3>
                  {user.role === "admin" && <span className="px-2 py-0.5 rounded-tag bg-pink-primary/15 text-pink-primary text-[11px] font-bold uppercase">Admin</span>}
                  <StatusBadge active={user.ativo} />
                </div>
                <p className="text-[13px] text-text-tertiary">
                  Membre depuis {new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-text-tertiary" />
                  <input
                    type="date"
                    defaultValue={new Date(user.data_inicio_jornada).toISOString().split("T")[0]}
                    onChange={(e) => { if (e.target.value) updateDate(user, e.target.value); }}
                    className="h-8 px-2 rounded-lg bg-bg-tertiary border border-border text-text-primary text-[13px] outline-none focus:border-pink-primary"
                  />
                </div>

                {lockedModules.length > 0 && (
                  <button
                    onClick={() => setGrantModal(user)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium bg-pink-primary/10 text-pink-primary hover:bg-pink-primary/20 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" /> Accès premium
                  </button>
                )}

                <button
                  onClick={() => toggleActive(user)}
                  className={cn("p-2 rounded-lg transition-colors", user.ativo ? "text-pink-success hover:text-pink-primary hover:bg-bg-tertiary" : "text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary")}
                  title={user.ativo ? "Désactiver" : "Activer"}
                >
                  {user.ativo ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grant access modal */}
      {grantModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && setGrantModal(null)}>
          <div className="bg-bg-secondary border border-border rounded-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-text-primary">
                Accès premium — {grantModal.nome}
              </h3>
              <button onClick={() => setGrantModal(null)} className="text-text-tertiary hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              {lockedModules.map((mod) => {
                const has = hasPurchase(grantModal.id, mod.id);
                return (
                  <div key={mod.id} className="flex items-center justify-between p-3 rounded-[10px] border border-border bg-bg-tertiary">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[14px] text-text-primary truncate">{mod.titulo}</p>
                      {mod.price_display && <p className="text-[12px] text-text-tertiary">{mod.price_display}</p>}
                    </div>
                    {has ? (
                      <button
                        onClick={() => revokeAccess(grantModal.id, mod.id)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium bg-pink-success/20 text-pink-success hover:bg-pink-dark/20 hover:text-pink-primary transition-colors"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Accordé
                      </button>
                    ) : (
                      <button
                        onClick={() => grantAccess(grantModal.id, mod.id)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium bg-pink-primary text-bg-primary hover:bg-pink-vibrant transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" /> Accorder
                      </button>
                    )}
                  </div>
                );
              })}

              {lockedModules.length === 0 && (
                <p className="text-[14px] text-text-tertiary text-center py-4">
                  Aucun module premium créé
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
