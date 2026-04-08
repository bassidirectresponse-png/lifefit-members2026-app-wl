"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { FormField, Input, Textarea } from "@/components/admin/form-field";
import { ImageUploader } from "@/components/admin/image-uploader";
import { LocaleTabsField } from "@/components/admin/locale-tabs";
import { ModuleTypeSelector } from "@/components/admin/module-type-selector";
import { LockedFields } from "@/components/admin/locked-fields";
import type { TipoModulo, I18nField } from "@/types/database";

export default function NovoModuloPage() {
  const supabase = useMemo(() => createClient(), []);
  const toast = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    numero_semana: 1,
    titulo: "",
    subtitulo: "",
    descricao: "",
    cor_destaque: "#EC4899",
    banner_url: "",
    ordem: 1,
    tipo: "main" as TipoModulo,
    unlock_after_days: 0,
    titulo_i18n: {} as I18nField,
    subtitulo_i18n: {} as I18nField,
    descricao_i18n: {} as I18nField,
    // Locked fields
    sales_copy: "",
    price_display: "",
    checkout_url: "",
    cta_text: "",
    cover_image: "",
  });

  const set = (key: string, val: unknown) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.titulo.trim()) { toast.error("Le titre est obligatoire"); return; }
    setSaving(true);

    const { error } = await supabase.from("modulos").insert({
      numero_semana: Number(form.numero_semana),
      titulo: form.titulo,
      subtitulo: form.subtitulo,
      descricao: form.descricao,
      cor_destaque: form.cor_destaque,
      banner_url: form.banner_url || null,
      ordem: Number(form.ordem),
      tipo: form.tipo,
      unlock_after_days: Number(form.unlock_after_days) || 0,
      titulo_i18n: form.titulo_i18n,
      subtitulo_i18n: form.subtitulo_i18n,
      descricao_i18n: form.descricao_i18n,
      sales_copy: form.tipo === "locked" ? form.sales_copy || null : null,
      price_display: form.tipo === "locked" ? form.price_display || null : null,
      checkout_url: form.tipo === "locked" ? form.checkout_url || null : null,
      cta_text: form.tipo === "locked" ? form.cta_text || null : null,
      cover_image: form.tipo === "locked" ? form.cover_image || null : null,
    });

    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success("Module créé avec succès");
    router.push("/admin/modulos");
  };

  return (
    <div className="max-w-2xl">
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Modules", href: "/admin/modulos" }, { label: "Nouveau module" }]} />
      <h1 className="font-display text-h2 text-text-primary mb-8">Nouveau module</h1>

      <div className="space-y-6">
        {/* Type */}
        <ModuleTypeSelector value={form.tipo} onChange={(v) => set("tipo", v)} />

        {/* Cover */}
        <FormField label="Image de couverture">
          <ImageUploader value={form.banner_url} onChange={(url) => set("banner_url", url)} />
        </FormField>

        {/* Week + Order + Drip */}
        <div className="grid grid-cols-3 gap-4">
          <FormField label="N° Semaine *">
            <Input type="number" value={form.numero_semana} onChange={(e) => set("numero_semana", e.target.value)} />
          </FormField>
          <FormField label="Ordre">
            <Input type="number" value={form.ordem} onChange={(e) => set("ordem", e.target.value)} />
          </FormField>
          <FormField label="Libérer après (jours)">
            <Input type="number" value={form.unlock_after_days} onChange={(e) => set("unlock_after_days", e.target.value)} min={0} placeholder="0 = immédiat" />
          </FormField>
        </div>

        {/* Title — default lang */}
        <FormField label="Titre principal (langue par défaut) *">
          <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Réveil du Corps" />
        </FormField>

        {/* i18n title */}
        <LocaleTabsField label="Titre — traductions" field="titulo_i18n" value={form.titulo_i18n} onChange={(f, v) => set(f, v)} />

        {/* Subtitle */}
        <FormField label="Sous-titre">
          <Input value={form.subtitulo} onChange={(e) => set("subtitulo", e.target.value)} placeholder="Courte description" />
        </FormField>
        <LocaleTabsField label="Sous-titre — traductions" field="subtitulo_i18n" value={form.subtitulo_i18n} onChange={(f, v) => set(f, v)} />

        {/* Description */}
        <FormField label="Description">
          <Textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} rows={4} placeholder="Description détaillée..." />
        </FormField>
        <LocaleTabsField label="Description — traductions" field="descricao_i18n" value={form.descricao_i18n} onChange={(f, v) => set(f, v)} multiline />

        {/* Color */}
        <FormField label="Couleur d'accent">
          <div className="flex items-center gap-3">
            <input type="color" value={form.cor_destaque} onChange={(e) => set("cor_destaque", e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
            <span className="text-[13px] text-text-tertiary">Fond quand il n&apos;y a pas d&apos;image</span>
          </div>
        </FormField>

        {/* Locked fields */}
        {form.tipo === "locked" && (
          <LockedFields
            salesCopy={form.sales_copy}
            priceDisplay={form.price_display}
            checkoutUrl={form.checkout_url}
            ctaText={form.cta_text}
            coverImage={form.cover_image}
            onChange={(k, v) => set(k, v)}
          />
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant active:scale-[0.98] transition-all btn-glow disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Créer le module
          </button>
          <button onClick={() => router.push("/admin/modulos")} className="h-10 px-5 rounded-[10px] text-[14px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-border transition-all">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
