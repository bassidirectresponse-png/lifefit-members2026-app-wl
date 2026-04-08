"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Save, PlayCircle, FileText, Headphones, ExternalLink, CheckSquare, BookOpenText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { FormField, Input, Textarea } from "@/components/admin/form-field";
import { VideoPreview } from "@/components/admin/video-preview";
import { cn } from "@/lib/utils";
import type { Modulo, TipoAula } from "@/types/database";

const TIPOS: { value: TipoAula; label: string; icon: typeof PlayCircle; help: string }[] = [
  { value: "video", label: "Vidéo", icon: PlayCircle, help: "YouTube, Vimeo ou Google Drive" },
  { value: "pdf", label: "PDF", icon: FileText, help: "Lien direct vers un PDF" },
  { value: "audio", label: "Audio", icon: Headphones, help: "Lien vers fichier audio" },
  { value: "link", label: "Lien externe", icon: ExternalLink, help: "App ou site externe" },
  { value: "checklist", label: "Checklist", icon: CheckSquare, help: "Liste interactive" },
  { value: "texto", label: "Texte", icon: BookOpenText, help: "Article / contenu écrit" },
];

export default function NovaAulaPage() {
  const { id: moduloId } = useParams<{ id: string }>();
  const supabase = useMemo(() => createClient(), []);
  const toast = useToast();
  const router = useRouter();
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "video" as TipoAula,
    conteudo_url: "",
    duracao_min: "",
    ordem: 1,
  });

  const set = (key: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("modulos").select("titulo, id").eq("id", moduloId).single();
      setModulo(data as Modulo | null);
      const { count } = await supabase.from("aulas").select("id", { count: "exact", head: true }).eq("modulo_id", moduloId);
      setForm((prev) => ({ ...prev, ordem: (count || 0) + 1 }));
    }
    load();
  }, [supabase, moduloId]);

  const handleSubmit = async () => {
    if (!form.titulo.trim()) { toast.error("Le titre est obligatoire"); return; }
    setSaving(true);

    const { error } = await supabase.from("aulas").insert({
      modulo_id: moduloId,
      titulo: form.titulo,
      descricao: form.descricao,
      tipo: form.tipo,
      conteudo_url: form.conteudo_url || null,
      duracao_min: form.duracao_min ? Number(form.duracao_min) : null,
      ordem: Number(form.ordem),
    });

    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success("Leçon créée");
    router.push(`/admin/modulos/${moduloId}`);
  };

  return (
    <div className="max-w-2xl">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Modules", href: "/admin/modulos" },
          { label: modulo?.titulo || "...", href: `/admin/modulos/${moduloId}` },
          { label: "Nouvelle leçon" },
        ]}
      />

      <h1 className="font-display text-h2 text-text-primary mb-8">
        Nouvelle leçon
      </h1>

      <div className="space-y-6">
        <FormField label="Titre *">
          <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Bienvenue dans votre rituel" />
        </FormField>

        <FormField label="Description">
          <Textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} rows={3} placeholder="Décrivez le contenu..." />
        </FormField>

        {/* Tipo visual */}
        <FormField label="Type de contenu">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TIPOS.map((t) => {
              const Icon = t.icon;
              const sel = form.tipo === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("tipo", t.value)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-[10px] border text-left transition-all",
                    sel
                      ? "border-pink-primary bg-pink-primary/10 text-pink-primary"
                      : "border-border bg-bg-tertiary text-text-secondary hover:border-pink-border"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[13px] font-semibold">{t.label}</span>
                  <span className="text-[11px] text-text-tertiary">{t.help}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        {/* URL */}
        {form.tipo !== "checklist" && form.tipo !== "texto" && (
          <FormField label="URL du contenu">
            <Input
              value={form.conteudo_url}
              onChange={(e) => set("conteudo_url", e.target.value)}
              placeholder={
                form.tipo === "video"
                  ? "https://youtube.com/watch?v=... ou Google Drive"
                  : form.tipo === "pdf"
                  ? "https://lien-pdf.com/fichier.pdf"
                  : "https://..."
              }
            />
          </FormField>
        )}

        {/* Video preview */}
        {form.tipo === "video" && form.conteudo_url && (
          <FormField label="Aperçu vidéo">
            <VideoPreview url={form.conteudo_url} />
          </FormField>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ordre">
            <Input type="number" value={form.ordem} onChange={(e) => set("ordem", e.target.value)} />
          </FormField>
          <FormField label="Durée (min)">
            <Input type="number" value={form.duracao_min} onChange={(e) => set("duracao_min", e.target.value)} placeholder="Optionnel" />
          </FormField>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant active:scale-[0.98] transition-all btn-glow disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Créer la leçon
          </button>
          <button onClick={() => router.push(`/admin/modulos/${moduloId}`)} className="h-10 px-5 rounded-[10px] text-[14px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-border transition-all">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
