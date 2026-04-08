"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Loader2,
  ImageIcon,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { SortableList } from "@/components/admin/sortable-list";
import type { Modulo, Aula } from "@/types/database";

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
    setModulos(reordered);
    const updates = reordered.map((m, i) =>
      supabase.from("modulos").update({ ordem: i + 1 }).eq("id", m.id)
    );
    await Promise.all(updates);
    toast.success("Ordre mis à jour");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("modulos").delete().eq("id", deleteTarget.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Module "${deleteTarget.titulo}" supprimé`);
      await load();
    }
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
      ordem: modulos.length + 1,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Module dupliqué");
      await load();
    }
  };

  const aulasCount = (moduloId: string) =>
    aulas.filter((a) => a.modulo_id === moduloId).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-pink-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Modules" }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Modules</h1>
          <p className="text-[14px] text-text-tertiary mt-1">
            {modulos.length} module{modulos.length !== 1 ? "s" : ""} · Glissez pour réorganiser
          </p>
        </div>
        <Link
          href="/admin/modulos/novo"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant active:scale-[0.98] transition-all btn-glow"
        >
          <Plus className="w-4 h-4" /> Nouveau module
        </Link>
      </div>

      {modulos.length === 0 ? (
        <div className="text-center py-20 rounded-card border border-dashed border-border">
          <ImageIcon className="w-12 h-12 text-text-tertiary/30 mx-auto mb-4" />
          <p className="text-body text-text-secondary mb-4">Aucun module créé</p>
          <Link
            href="/admin/modulos/novo"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant transition-all btn-glow"
          >
            <Plus className="w-4 h-4" /> Créer le premier module
          </Link>
        </div>
      ) : (
        <SortableList
          items={modulos}
          onReorder={handleReorder}
          renderItem={(mod) => (
            <div className="flex items-center gap-3 p-4 rounded-card border border-border bg-bg-secondary hover:border-pink-border/50 transition-colors">
              {/* Thumbnail */}
              <div
                className="w-16 h-16 rounded-[10px] shrink-0 overflow-hidden border border-border flex items-center justify-center"
                style={{ backgroundColor: mod.cor_destaque || "#1C1C1F" }}
              >
                {mod.banner_url ? (
                  <img src={mod.banner_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-text-tertiary/50" />
                )}
              </div>

              {/* Info — clickable */}
              <Link href={`/admin/modulos/${mod.id}`} className="flex-1 min-w-0 group">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-text-primary truncate group-hover:text-pink-primary transition-colors">
                    Semaine {mod.numero_semana} — {mod.titulo}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0 group-hover:text-pink-primary transition-colors" />
                </div>
                <p className="text-[13px] text-text-tertiary truncate mt-0.5">
                  {mod.subtitulo || "—"} · {aulasCount(mod.id)} leçon{aulasCount(mod.id) !== 1 ? "s" : ""}
                </p>
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => handleDuplicate(mod)}
                  className="p-2 text-text-tertiary hover:text-pink-primary rounded-lg hover:bg-bg-tertiary transition-colors"
                  title="Dupliquer"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <Link
                  href={`/admin/modulos/${mod.id}`}
                  className="p-2 text-text-tertiary hover:text-pink-primary rounded-lg hover:bg-bg-tertiary transition-colors"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setDeleteTarget(mod)}
                  className="p-2 text-text-tertiary hover:text-pink-primary rounded-lg hover:bg-bg-tertiary transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title={`Supprimer "${deleteTarget.titulo}" ?`}
          description={`Cela supprimera également ${aulasCount(deleteTarget.id)} leçon(s) associée(s). Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
