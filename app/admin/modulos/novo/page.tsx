"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { FormField, Input, Textarea } from "@/components/admin/form-field";
import { ImageUploader } from "@/components/admin/image-uploader";

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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.titulo.trim()) errs.titulo = "Le titre est obligatoire";
    if (form.numero_semana < 1) errs.numero_semana = "Numéro invalide";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    const { error } = await supabase.from("modulos").insert({
      ...form,
      banner_url: form.banner_url || null,
    });

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    toast.success("Module créé avec succès");
    router.push("/admin/modulos");
  };

  return (
    <div className="max-w-2xl">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Modules", href: "/admin/modulos" },
          { label: "Nouveau module" },
        ]}
      />

      <h1 className="font-display text-h2 text-text-primary mb-8">
        Nouveau module
      </h1>

      <div className="space-y-6">
        <FormField label="Image de couverture">
          <ImageUploader
            value={form.banner_url}
            onChange={(url) => set("banner_url", url)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="N° Semaine *" error={errors.numero_semana}>
            <Input
              type="number"
              value={form.numero_semana}
              onChange={(e) => set("numero_semana", Number(e.target.value))}
            />
          </FormField>
          <FormField label="Ordre d'affichage">
            <Input
              type="number"
              value={form.ordem}
              onChange={(e) => set("ordem", Number(e.target.value))}
            />
          </FormField>
        </div>

        <FormField label="Titre *" error={errors.titulo}>
          <Input
            value={form.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            placeholder="Ex: Réveil du Corps"
          />
        </FormField>

        <FormField label="Sous-titre">
          <Input
            value={form.subtitulo}
            onChange={(e) => set("subtitulo", e.target.value)}
            placeholder="Courte description pour les cartes"
          />
        </FormField>

        <FormField label="Description complète">
          <Textarea
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            rows={5}
            placeholder="Description détaillée du module..."
          />
        </FormField>

        <FormField label="Couleur d'accent">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.cor_destaque}
              onChange={(e) => set("cor_destaque", e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
            />
            <span className="text-[13px] text-text-tertiary">
              Fond quand il n&apos;y a pas d&apos;image
            </span>
          </div>
        </FormField>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant active:scale-[0.98] transition-all btn-glow disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Créer le module
          </button>
          <button
            onClick={() => router.push("/admin/modulos")}
            className="h-10 px-5 rounded-[10px] text-[14px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-border transition-all"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
