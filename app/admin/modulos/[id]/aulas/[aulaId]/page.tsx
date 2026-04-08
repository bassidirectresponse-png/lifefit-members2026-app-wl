"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Save, PlayCircle, FileText, Headphones, ExternalLink, CheckSquare, BookOpenText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { FormField, Input, Textarea } from "@/components/admin/form-field";
import { LocaleTabsField } from "@/components/admin/locale-tabs";
import { VideoPreview } from "@/components/admin/video-preview";
import { cn } from "@/lib/utils";
import type { Modulo, Aula, TipoAula, I18nField } from "@/types/database";

const TIPOS: { value: TipoAula; label: string; icon: typeof PlayCircle; help: string }[] = [
  { value: "video", label: "Vidéo", icon: PlayCircle, help: "YouTube, Vimeo ou Drive" },
  { value: "pdf", label: "PDF", icon: FileText, help: "Lien direct PDF" },
  { value: "audio", label: "Audio", icon: Headphones, help: "Fichier audio" },
  { value: "link", label: "Lien externe", icon: ExternalLink, help: "App ou site" },
  { value: "checklist", label: "Checklist", icon: CheckSquare, help: "Liste interactive" },
  { value: "texto", label: "Texte", icon: BookOpenText, help: "Article écrit" },
];

export default function EditAulaPage() {
  const { id: moduloId, aulaId } = useParams<{ id: string; aulaId: string }>();
  const supabase = useMemo(() => createClient(), []);
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [form, setForm] = useState({
    titulo: "", descricao: "", tipo: "video" as TipoAula,
    conteudo_url: "", duracao_min: "" as string | number, ordem: 1,
    unlock_after_days: 0,
    titulo_i18n: {} as I18nField, descricao_i18n: {} as I18nField,
  });

  const set = (key: string, val: unknown) => setForm((prev) => ({ ...prev, [key]: val }));

  const load = useCallback(async () => {
    const [mRes, aRes] = await Promise.all([
      supabase.from("modulos").select("titulo, id").eq("id", moduloId).single(),
      supabase.from("aulas").select("*").eq("id", aulaId).single(),
    ]);
    setModulo(mRes.data as Modulo | null);
    if (aRes.data) {
      const a = aRes.data as Aula;
      setForm({
        titulo: a.titulo, descricao: a.descricao, tipo: a.tipo as TipoAula,
        conteudo_url: a.conteudo_url || "", duracao_min: a.duracao_min ?? "",
        ordem: a.ordem, unlock_after_days: a.unlock_after_days || 0,
        titulo_i18n: a.titulo_i18n || {}, descricao_i18n: a.descricao_i18n || {},
      });
    }
    setLoading(false);
  }, [supabase, moduloId, aulaId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.titulo.trim()) { toast.error("Le titre est obligatoire"); return; }
    setSaving(true);
    const { error } = await supabase.from("aulas").update({
      titulo: form.titulo, descricao: form.descricao, tipo: form.tipo,
      conteudo_url: form.conteudo_url || null,
      duracao_min: form.duracao_min ? Number(form.duracao_min) : null,
      ordem: Number(form.ordem), unlock_after_days: Number(form.unlock_after_days) || 0,
      titulo_i18n: form.titulo_i18n, descricao_i18n: form.descricao_i18n,
    }).eq("id", aulaId);
    if (error) toast.error(error.message); else toast.success("Leçon enregistrée");
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-pink-primary animate-spin" /></div>;

  return (
    <div className="max-w-2xl">
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Modules", href: "/admin/modulos" }, { label: modulo?.titulo || "...", href: `/admin/modulos/${moduloId}` }, { label: form.titulo || "Leçon" }]} />
      <h1 className="font-display text-h2 text-text-primary mb-8">Modifier la leçon</h1>

      <div className="space-y-6">
        <FormField label="Titre *">
          <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} />
        </FormField>
        <LocaleTabsField label="Titre — traductions" field="titulo_i18n" value={form.titulo_i18n} onChange={(f, v) => set(f, v)} />

        <FormField label="Description">
          <Textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} rows={3} />
        </FormField>
        <LocaleTabsField label="Description — traductions" field="descricao_i18n" value={form.descricao_i18n} onChange={(f, v) => set(f, v)} multiline />

        <FormField label="Type de contenu">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TIPOS.map((t) => {
              const Icon = t.icon; const sel = form.tipo === t.value;
              return (
                <button key={t.value} type="button" onClick={() => set("tipo", t.value)} className={cn("flex flex-col items-start gap-1 p-3 rounded-[10px] border text-left transition-all", sel ? "border-pink-primary bg-pink-primary/10 text-pink-primary" : "border-border bg-bg-tertiary text-text-secondary hover:border-pink-border")}>
                  <Icon className="w-4 h-4" />
                  <span className="text-[13px] font-semibold">{t.label}</span>
                  <span className="text-[11px] text-text-tertiary">{t.help}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        {form.tipo !== "checklist" && form.tipo !== "texto" && (
          <FormField label="URL du contenu">
            <Input value={form.conteudo_url} onChange={(e) => set("conteudo_url", e.target.value)} placeholder="https://..." />
          </FormField>
        )}
        {form.tipo === "video" && form.conteudo_url && <VideoPreview url={form.conteudo_url as string} />}

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Ordre">
            <Input type="number" value={form.ordem} onChange={(e) => set("ordem", e.target.value)} />
          </FormField>
          <FormField label="Durée (min)">
            <Input type="number" value={form.duracao_min} onChange={(e) => set("duracao_min", e.target.value)} placeholder="Opt." />
          </FormField>
          <FormField label="Libérer après (jours)">
            <Input type="number" value={form.unlock_after_days} onChange={(e) => set("unlock_after_days", e.target.value)} min={0} placeholder="0" />
          </FormField>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant active:scale-[0.98] transition-all btn-glow disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </button>
          <button onClick={() => router.push(`/admin/modulos/${moduloId}`)} className="h-10 px-5 rounded-[10px] text-[14px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-border transition-all">Retour</button>
        </div>
      </div>
    </div>
  );
}
