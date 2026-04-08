"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Save,
  Plus,
  Pencil,
  Trash2,
  PlayCircle,
  FileText,
  Headphones,
  ExternalLink,
  CheckSquare,
  BookOpenText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { FormField, Input, Textarea } from "@/components/admin/form-field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { SortableList } from "@/components/admin/sortable-list";
import type { Modulo, Aula, TipoAula } from "@/types/database";

const tipoIcons: Record<TipoAula, typeof PlayCircle> = {
  video: PlayCircle, pdf: FileText, audio: Headphones,
  link: ExternalLink, checklist: CheckSquare, texto: BookOpenText,
};
const tipoLabels: Record<TipoAula, string> = {
  video: "Vidéo", pdf: "PDF", audio: "Audio",
  link: "Lien", checklist: "Checklist", texto: "Texte",
};

export default function EditModuloPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = useMemo(() => createClient(), []);
  const toast = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [deleteAula, setDeleteAula] = useState<Aula | null>(null);
  const [form, setForm] = useState({
    numero_semana: 1,
    titulo: "",
    subtitulo: "",
    descricao: "",
    cor_destaque: "#EC4899",
    banner_url: "",
    ordem: 1,
  });

  const set = (key: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const load = useCallback(async () => {
    const [mRes, aRes] = await Promise.all([
      supabase.from("modulos").select("*").eq("id", id).single(),
      supabase.from("aulas").select("*").eq("modulo_id", id).order("ordem"),
    ]);

    if (!mRes.data) {
      router.push("/admin/modulos");
      return;
    }

    const mod = mRes.data as Modulo;
    setModulo(mod);
    setForm({
      numero_semana: mod.numero_semana,
      titulo: mod.titulo,
      subtitulo: mod.subtitulo,
      descricao: mod.descricao,
      cor_destaque: mod.cor_destaque || "#EC4899",
      banner_url: mod.banner_url || "",
      ordem: mod.ordem,
    });
    setAulas((aRes.data || []) as Aula[]);
    setLoading(false);
  }, [supabase, id, router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("modulos").update({
      ...form,
      banner_url: form.banner_url || null,
    }).eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Module enregistré");
    }
    setSaving(false);
  };

  const handleReorderAulas = async (reordered: Aula[]) => {
    setAulas(reordered);
    await Promise.all(
      reordered.map((a, i) =>
        supabase.from("aulas").update({ ordem: i + 1 }).eq("id", a.id)
      )
    );
    toast.success("Ordre des leçons mis à jour");
  };

  const handleDeleteAula = async () => {
    if (!deleteAula) return;
    const { error } = await supabase.from("aulas").delete().eq("id", deleteAula.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Leçon "${deleteAula.titulo}" supprimée`);
      await load();
    }
    setDeleteAula(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-pink-primary animate-spin" />
      </div>
    );
  }

  if (!modulo) return null;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Modules", href: "/admin/modulos" },
          { label: modulo.titulo },
        ]}
      />

      <div className="grid lg:grid-cols-[1fr,380px] gap-8">
        {/* Left: Module form */}
        <div>
          <h1 className="font-display text-h2 text-text-primary mb-6">
            Modifier le module
          </h1>

          <div className="space-y-6">
            <FormField label="Image de couverture">
              <ImageUploader
                value={form.banner_url}
                onChange={(url) => set("banner_url", url)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="N° Semaine">
                <Input
                  type="number"
                  value={form.numero_semana}
                  onChange={(e) => set("numero_semana", Number(e.target.value))}
                />
              </FormField>
              <FormField label="Ordre">
                <Input
                  type="number"
                  value={form.ordem}
                  onChange={(e) => set("ordem", Number(e.target.value))}
                />
              </FormField>
            </div>

            <FormField label="Titre *">
              <Input
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
              />
            </FormField>

            <FormField label="Sous-titre">
              <Input
                value={form.subtitulo}
                onChange={(e) => set("subtitulo", e.target.value)}
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                rows={5}
              />
            </FormField>

            <FormField label="Couleur d'accent">
              <input
                type="color"
                value={form.cor_destaque}
                onChange={(e) => set("cor_destaque", e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
            </FormField>

            <div className="pt-4 border-t border-border">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant active:scale-[0.98] transition-all btn-glow disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        {/* Right: Lessons list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-h4 text-text-primary">
              Leçons ({aulas.length})
            </h2>
            <Link
              href={`/admin/modulos/${id}/aulas/nova`}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium bg-pink-primary/10 text-pink-primary hover:bg-pink-primary/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Link>
          </div>

          {aulas.length === 0 ? (
            <div className="text-center py-12 rounded-card border border-dashed border-border">
              <p className="text-[14px] text-text-tertiary mb-3">
                Aucune leçon dans ce module
              </p>
              <Link
                href={`/admin/modulos/${id}/aulas/nova`}
                className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-[13px] font-medium bg-pink-primary text-bg-primary hover:bg-pink-vibrant transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Créer la première
              </Link>
            </div>
          ) : (
            <SortableList
              items={aulas}
              onReorder={handleReorderAulas}
              renderItem={(aula) => {
                const Icon = tipoIcons[aula.tipo as TipoAula] || BookOpenText;
                return (
                  <div className="flex items-center gap-2.5 p-3 rounded-[10px] bg-bg-secondary border border-border hover:border-pink-border/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-pink-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-pink-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-text-primary truncate">
                        {aula.titulo}
                      </p>
                      <p className="text-[12px] text-text-tertiary">
                        {tipoLabels[aula.tipo as TipoAula]}
                        {aula.duracao_min ? ` · ${aula.duracao_min} min` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/admin/modulos/${id}/aulas/${aula.id}`}
                      className="p-1.5 text-text-tertiary hover:text-pink-primary rounded transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setDeleteAula(aula)}
                      className="p-1.5 text-text-tertiary hover:text-pink-primary rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }}
            />
          )}
        </div>
      </div>

      {deleteAula && (
        <ConfirmDialog
          title={`Supprimer "${deleteAula.titulo}" ?`}
          description="Cette leçon sera définitivement supprimée."
          onConfirm={handleDeleteAula}
          onCancel={() => setDeleteAula(null)}
        />
      )}
    </div>
  );
}
