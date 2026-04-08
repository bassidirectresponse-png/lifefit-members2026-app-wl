"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Copy, Loader2, ChevronRight, BookOpen, Gift, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { SortableList } from "@/components/admin/sortable-list";
import type { Modulo, Aula, TipoModulo } from "@/types/database";

const sectionConfig: Record<TipoModulo, { label: string; icon: typeof BookOpen; description: string }> = {
  main: { label: "Contenu Principal", icon: BookOpen, description: "Modules du parcours standard" },
  bonus: { label: "Contenu Bonus", icon: Gift, description: "Modules bonus supplémentaires" },
  locked: { label: "Premium / Upsell", icon: Lock, description: "Modules bloqués jusqu'à l'achat" },
};

export default function ModulosPage() {
  const supabase = useMemo(() => createClient(), []);
  const toast = useToast();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Modulo | null>(null);

  const load = useCallback(async () => {
    const [m, a] = await Promise.all([
      supabase.from("modulos").select("*").order("ordem"),
      supabase.from("aulas").select("*"),
    ]);
    setModulos((m.data || []) as Modulo[]);
    setAulas((a.data || []) as Aula[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const handleReorder = async (reordered: Modulo[]) => {
    setModulos((prev) => {
      const otherTypes = prev.filter((m) => m.tipo !== reordered[0]?.tipo);
      return [...otherTypes, ...reordered].sort((a, b) => {
        const typeOrder = { main: 0, bonus: 1, locked: 2 };
        if (a.tipo !== b.tipo) return (typeOrder[a.tipo] || 0) - (typeOrder[b.tipo] || 0);
        return a.ordem - b.ordem;
      });
    });
    await Promise.all(reordered.map((m, i) => supabase.from("modulos").update({ ordem: i + 1 }).eq("id", m.id)));
    toast.success("Ordre mis à jour");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("modulos").delete().eq("id", deleteTarget.id);
    if (error) toast.error(error.message);
    else { toast.success(`Module "${deleteTarget.titulo}" supprimé`); await load(); }
    setDeleteTarget(null);
  };

  const handleDuplicate = async (mod: Modulo) => {
    const { error } = await supabase.from("modulos").insert({
      numero_semana: mod.numero_semana + 100,
      titulo: mod.titulo + " (copie)",
      subtitulo: mod.subtitulo,
      descricao: mod.descricao,
      banner_url: mod.banner_url,
      cor_destaque: mod.cor_destaque,
      ordem: modulos.filter((m) => m.tipo === mod.tipo).length + 1,
      tipo: mod.tipo,
      unlock_after_days: mod.unlock_after_days,
      titulo_i18n: mod.titulo_i18n,
      subtitulo_i18n: mod.subtitulo_i18n,
      descricao_i18n: mod.descricao_i18n,
    });
    if (error) toast.error(error.message);
    else { toast.success("Module dupliqué"); await load(); }
  };

  const aulasCount = (moduloId: string) => aulas.filter((a) => a.modulo_id === moduloId).length;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-pink-primary animate-spin" /></div>;

  const mainMods = modulos.filter((m) => (m.tipo || "main") === "main");
  const bonusMods = modulos.filter((m) => m.tipo === "bonus");
  const lockedMods = modulos.filter((m) => m.tipo === "locked");

  const renderModuleItem = (mod: Modulo) => (
    <div className="flex items-center gap-3 p-4 rounded-card border border-border bg-bg-secondary hover:border-pink-border/50 transition-colors">
      <div className="w-14 h-14 rounded-[10px] shrink-0 overflow-hidden border border-border flex items-center justify-center" style={{ backgroundColor: mod.cor_destaque || "#1C1C1F" }}>
        {mod.banner_url ? <img src={mod.banner_url} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-5 h-5 text-text-tertiary/50" />}
      </div>

      <Link href={`/admin/modulos/${mod.id}`} className="flex-1 min-w-0 group">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-text-primary truncate group-hover:text-pink-primary transition-colors">
            S{mod.numero_semana} — {mod.titulo}
          </h3>
          <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0 group-hover:text-pink-primary transition-colors" />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[13px] text-text-tertiary truncate">
            {mod.subtitulo || "—"} · {aulasCount(mod.id)} leçon{aulasCount(mod.id) !== 1 ? "s" : ""}
          </span>
          {mod.unlock_after_days > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary">{mod.unlock_after_days}j drip</span>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={() => handleDuplicate(mod)} className="p-2 text-text-tertiary hover:text-pink-primary rounded-lg hover:bg-bg-tertiary transition-colors" title="Dupliquer"><Copy className="w-4 h-4" /></button>
        <Link href={`/admin/modulos/${mod.id}`} className="p-2 text-text-tertiary hover:text-pink-primary rounded-lg hover:bg-bg-tertiary transition-colors" title="Modifier"><Pencil className="w-4 h-4" /></Link>
        <button onClick={() => setDeleteTarget(mod)} className="p-2 text-text-tertiary hover:text-pink-primary rounded-lg hover:bg-bg-tertiary transition-colors" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );

  const renderSection = (tipo: TipoModulo, mods: Modulo[]) => {
    const config = sectionConfig[tipo];
    const Icon = config.icon;
    return (
      <section key={tipo} className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-pink-primary" />
          <h2 className="text-[18px] font-semibold text-text-primary">{config.label}</h2>
          <span className="text-[13px] text-text-tertiary">({mods.length})</span>
        </div>
        {mods.length === 0 ? (
          <div className="text-center py-8 rounded-card border border-dashed border-border">
            <p className="text-[14px] text-text-tertiary">{config.description} — aucun module</p>
          </div>
        ) : (
          <SortableList items={mods} onReorder={handleReorder} renderItem={renderModuleItem} />
        )}
      </section>
    );
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Modules" }]} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Modules</h1>
          <p className="text-[14px] text-text-tertiary mt-1">{modulos.length} module{modulos.length !== 1 ? "s" : ""} au total</p>
        </div>
        <Link href="/admin/modulos/novo" className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant active:scale-[0.98] transition-all btn-glow">
          <Plus className="w-4 h-4" /> Nouveau module
        </Link>
      </div>

      {modulos.length === 0 ? (
        <div className="text-center py-20 rounded-card border border-dashed border-border">
          <BookOpen className="w-12 h-12 text-text-tertiary/30 mx-auto mb-4" />
          <p className="text-body text-text-secondary mb-4">Aucun module créé</p>
          <Link href="/admin/modulos/novo" className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant transition-all btn-glow">
            <Plus className="w-4 h-4" /> Créer le premier
          </Link>
        </div>
      ) : (
        <>
          {renderSection("main", mainMods)}
          {renderSection("bonus", bonusMods)}
          {renderSection("locked", lockedMods)}
        </>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Supprimer "${deleteTarget.titulo}" ?`}
          description={`Cela supprimera ${aulasCount(deleteTarget.id)} leçon(s). Irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
