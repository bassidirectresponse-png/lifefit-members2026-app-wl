"use client";

import {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  PlayCircle,
  FileText,
  Headphones,
  ExternalLink,
  CheckSquare,
  BookOpenText,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  Save,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Modulo, Aula, Profile, TipoAula } from "@/types/database";

// Reusable styles
const inputCls =
  "w-full h-10 px-3 rounded-[10px] bg-bg-tertiary border border-border text-text-primary text-[15px] outline-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/30 transition-all";
const textareaCls =
  "w-full px-3 py-2.5 rounded-[10px] bg-bg-tertiary border border-border text-text-primary text-[15px] resize-none outline-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/30 transition-all";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-[10px] bg-pink-primary text-bg-primary font-semibold text-[14px] hover:bg-pink-vibrant active:scale-[0.98] transition-all btn-glow disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-[10px] bg-bg-tertiary text-text-secondary border border-border font-medium text-[14px] hover:text-text-primary hover:border-pink-border transition-all";
const btnGhost =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-[13px] text-text-tertiary hover:text-pink-primary hover:bg-bg-tertiary transition-all";

const TIPO_OPTIONS: { value: TipoAula; label: string; icon: typeof PlayCircle }[] = [
  { value: "video", label: "Vidéo (YouTube / Drive)", icon: PlayCircle },
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "audio", label: "Audio", icon: Headphones },
  { value: "link", label: "Lien externe", icon: ExternalLink },
  { value: "checklist", label: "Checklist", icon: CheckSquare },
  { value: "texto", label: "Texte / Article", icon: BookOpenText },
];

// =============================================
// Entry
// =============================================
export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-pink-primary animate-spin" />
        </div>
      }
    >
      <AdminRouter />
    </Suspense>
  );
}

function AdminRouter() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "modulos";
  const supabase = useMemo(() => createClient(), []);

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [m, a, u] = await Promise.all([
        supabase.from("modulos").select("*").order("ordem"),
        supabase.from("aulas").select("*").order("ordem"),
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      if (m.error) throw m.error;
      setModulos(m.data as Modulo[]);
      setAulas((a.data || []) as Aula[]);
      setUsuarios((u.data || []) as Profile[]);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-pink-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-pink-primary mx-auto mb-3" />
        <p className="text-body text-text-secondary mb-4">{error}</p>
        <button onClick={refresh} className={btnPrimary}>
          Réessayer
        </button>
      </div>
    );
  }

  if (tab === "usuarios") {
    return (
      <UsersTab usuarios={usuarios} supabase={supabase} onRefresh={refresh} />
    );
  }

  return (
    <ModulesTab
      modulos={modulos}
      aulas={aulas}
      supabase={supabase}
      onRefresh={refresh}
    />
  );
}

// =============================================
// MODULES TAB
// =============================================
function ModulesTab({
  modulos,
  aulas,
  supabase,
  onRefresh,
}: {
  modulos: Modulo[];
  aulas: Aula[];
  supabase: ReturnType<typeof createClient>;
  onRefresh: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [moduleModal, setModuleModal] = useState<{
    open: boolean;
    data: Modulo | null;
  }>({ open: false, data: null });
  const [lessonModal, setLessonModal] = useState<{
    open: boolean;
    data: Aula | null;
    moduloId: string;
  }>({ open: false, data: null, moduloId: "" });
  const [busy, setBusy] = useState(false);

  const deleteModule = async (id: string) => {
    if (!confirm("Supprimer ce module et toutes ses leçons ?")) return;
    setBusy(true);
    await supabase.from("modulos").delete().eq("id", id);
    await onRefresh();
    setBusy(false);
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Supprimer cette leçon ?")) return;
    setBusy(true);
    await supabase.from("aulas").delete().eq("id", id);
    await onRefresh();
    setBusy(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Modules</h1>
          <p className="text-[14px] text-text-tertiary mt-1">
            {modulos.length} modules · {aulas.length} leçons au total
          </p>
        </div>
        <button
          className={btnPrimary}
          onClick={() => setModuleModal({ open: true, data: null })}
        >
          <Plus className="w-4 h-4" /> Nouveau module
        </button>
      </div>

      {/* Module list */}
      <div className="space-y-4">
        {modulos.map((mod) => {
          const modAulas = aulas
            .filter((a) => a.modulo_id === mod.id)
            .sort((a, b) => a.ordem - b.ordem);
          const isOpen = expanded === mod.id;

          return (
            <div
              key={mod.id}
              className="rounded-card border border-border bg-bg-secondary overflow-hidden"
            >
              {/* Module row */}
              <div className="flex items-center gap-3 p-4">
                {/* Thumbnail */}
                <div
                  className="w-16 h-16 rounded-[10px] shrink-0 overflow-hidden border border-border flex items-center justify-center"
                  style={{
                    backgroundColor: mod.cor_destaque || "#1C1C1F",
                  }}
                >
                  {mod.banner_url ? (
                    <img
                      src={mod.banner_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-text-tertiary/50" />
                  )}
                </div>

                {/* Info + expand toggle */}
                <button
                  className="flex-1 text-left min-w-0"
                  onClick={() => setExpanded(isOpen ? null : mod.id)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] font-semibold text-text-primary truncate">
                      Semaine {mod.numero_semana} — {mod.titulo}
                    </h3>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
                    )}
                  </div>
                  <p className="text-[13px] text-text-tertiary truncate mt-0.5">
                    {mod.subtitulo || "—"} · {modAulas.length} leçon
                    {modAulas.length !== 1 ? "s" : ""}
                  </p>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    className={btnGhost}
                    onClick={() =>
                      setModuleModal({ open: true, data: mod })
                    }
                    aria-label="Modifier module"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className={btnGhost}
                    onClick={() => deleteModule(mod.id)}
                    disabled={busy}
                    aria-label="Supprimer module"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Lessons panel */}
              {isOpen && (
                <div className="border-t border-border bg-bg-primary/40">
                  <div className="p-4 space-y-2">
                    {modAulas.length === 0 && (
                      <p className="text-[13px] text-text-tertiary text-center py-6">
                        Aucune leçon dans ce module. Ajoutez-en une !
                      </p>
                    )}

                    {modAulas.map((aula) => {
                      const tipoOpt = TIPO_OPTIONS.find(
                        (o) => o.value === aula.tipo
                      );
                      const TipoIcon = tipoOpt?.icon || BookOpenText;
                      return (
                        <div
                          key={aula.id}
                          className="flex items-center gap-3 p-3 rounded-[10px] bg-bg-secondary border border-border hover:border-pink-border/50 transition-colors"
                        >
                          <GripVertical className="w-4 h-4 text-text-tertiary/30 shrink-0" />
                          <div className="w-8 h-8 rounded-lg bg-pink-primary/10 flex items-center justify-center shrink-0">
                            <TipoIcon className="w-4 h-4 text-pink-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] text-text-primary truncate">
                              {aula.ordem}. {aula.titulo}
                            </p>
                            <p className="text-[12px] text-text-tertiary">
                              {tipoOpt?.label.split(" (")[0] || aula.tipo}
                              {aula.duracao_min
                                ? ` · ${aula.duracao_min} min`
                                : ""}
                              {aula.conteudo_url
                                ? " · ✓ URL"
                                : ""}
                            </p>
                          </div>
                          <button
                            className={btnGhost}
                            onClick={() =>
                              setLessonModal({
                                open: true,
                                data: aula,
                                moduloId: mod.id,
                              })
                            }
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className={btnGhost}
                            onClick={() => deleteLesson(aula.id)}
                            disabled={busy}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      className="flex items-center justify-center gap-2 w-full p-3 rounded-[10px] border border-dashed border-border hover:border-pink-primary/40 text-[14px] text-text-tertiary hover:text-pink-primary transition-all"
                      onClick={() =>
                        setLessonModal({
                          open: true,
                          data: null,
                          moduloId: mod.id,
                        })
                      }
                    >
                      <Plus className="w-4 h-4" /> Ajouter une leçon
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {modulos.length === 0 && (
          <div className="text-center py-20 rounded-card border border-dashed border-border">
            <BookOpenText className="w-12 h-12 text-text-tertiary/30 mx-auto mb-4" />
            <p className="text-body text-text-secondary mb-4">
              Aucun module créé
            </p>
            <button
              className={btnPrimary}
              onClick={() => setModuleModal({ open: true, data: null })}
            >
              <Plus className="w-4 h-4" /> Créer le premier module
            </button>
          </div>
        )}
      </div>

      {/* Module Modal */}
      {moduleModal.open && (
        <ModuleFormModal
          module={moduleModal.data}
          totalModules={modulos.length}
          supabase={supabase}
          onClose={() => setModuleModal({ open: false, data: null })}
          onSaved={async () => {
            setModuleModal({ open: false, data: null });
            await onRefresh();
          }}
        />
      )}

      {/* Lesson Modal */}
      {lessonModal.open && (
        <LessonFormModal
          lesson={lessonModal.data}
          moduloId={lessonModal.moduloId}
          totalLessons={
            aulas.filter((a) => a.modulo_id === lessonModal.moduloId).length
          }
          supabase={supabase}
          onClose={() =>
            setLessonModal({ open: false, data: null, moduloId: "" })
          }
          onSaved={async () => {
            setLessonModal({ open: false, data: null, moduloId: "" });
            await onRefresh();
          }}
        />
      )}
    </div>
  );
}

// =============================================
// MODULE FORM MODAL
// =============================================
function ModuleFormModal({
  module: mod,
  totalModules,
  supabase,
  onClose,
  onSaved,
}: {
  module: Modulo | null;
  totalModules: number;
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(mod?.banner_url || "");
  const [formError, setFormError] = useState("");

  // Form state (controlled, simpler than react-hook-form for reliability)
  const [form, setForm] = useState({
    numero_semana: mod?.numero_semana ?? totalModules + 1,
    titulo: mod?.titulo ?? "",
    subtitulo: mod?.subtitulo ?? "",
    descricao: mod?.descricao ?? "",
    cor_destaque: mod?.cor_destaque ?? "#EC4899",
    ordem: mod?.ordem ?? totalModules + 1,
  });

  const set = (key: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("content")
      .upload(path, file, { upsert: true });
    if (error) {
      setFormError("Erreur upload: " + error.message);
    } else {
      const { data } = supabase.storage.from("content").getPublicUrl(path);
      setBannerUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      setFormError("Le titre est obligatoire");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = {
      ...form,
      numero_semana: Number(form.numero_semana),
      ordem: Number(form.ordem),
      banner_url: bannerUrl || null,
    };

    let result;
    if (mod) {
      result = await supabase
        .from("modulos")
        .update(payload)
        .eq("id", mod.id);
    } else {
      result = await supabase.from("modulos").insert(payload);
    }

    if (result.error) {
      setFormError(result.error.message);
      setSaving(false);
      return;
    }

    await onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-secondary border border-border rounded-card p-6 md:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-[22px] text-text-primary">
            {mod ? "Modifier le module" : "Nouveau module"}
          </h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Cover image */}
          <div>
            <label className="block text-[14px] text-text-secondary mb-2">
              Image de couverture
            </label>
            <div
              className="relative w-full h-44 rounded-card border-2 border-dashed border-border hover:border-pink-primary/40 transition-colors cursor-pointer overflow-hidden group"
              onClick={() => fileRef.current?.click()}
            >
              {bannerUrl ? (
                <>
                  <img
                    src={bannerUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[14px] text-text-primary font-medium">
                      Changer l&apos;image
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-pink-primary" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-[14px]">
                        Cliquez pour envoyer
                      </span>
                      <span className="text-[12px] mt-1 text-text-tertiary">
                        JPG, PNG ou WebP
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          </div>

          {/* Week + Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] text-text-secondary mb-1.5">
                N° Semaine
              </label>
              <input
                type="number"
                value={form.numero_semana}
                onChange={(e) => set("numero_semana", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[14px] text-text-secondary mb-1.5">
                Ordre d&apos;affichage
              </label>
              <input
                type="number"
                value={form.ordem}
                onChange={(e) => set("ordem", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[14px] text-text-secondary mb-1.5">
              Titre *
            </label>
            <input
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              className={inputCls}
              placeholder="Ex: Réveil du Corps"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-[14px] text-text-secondary mb-1.5">
              Sous-titre
            </label>
            <input
              value={form.subtitulo}
              onChange={(e) => set("subtitulo", e.target.value)}
              className={inputCls}
              placeholder="Courte description pour les cartes"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[14px] text-text-secondary mb-1.5">
              Description
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              rows={4}
              className={textareaCls}
              placeholder="Description détaillée du module..."
            />
          </div>

          {/* Accent color */}
          <div>
            <label className="block text-[14px] text-text-secondary mb-1.5">
              Couleur d&apos;accent
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.cor_destaque}
                onChange={(e) => set("cor_destaque", e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <span className="text-[13px] text-text-tertiary">
                Couleur de fond quand il n&apos;y a pas d&apos;image
              </span>
            </div>
          </div>

          {/* Error */}
          {formError && (
            <div className="p-3 rounded-[10px] bg-pink-dark/20 border border-pink-dark/30 text-pink-primary text-[14px]">
              {formError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-border">
            <button
              className={btnPrimary}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              {mod ? "Enregistrer" : "Créer le module"}
            </button>
            <button className={btnSecondary} onClick={onClose}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// LESSON FORM MODAL
// =============================================
function LessonFormModal({
  lesson,
  moduloId,
  totalLessons,
  supabase,
  onClose,
  onSaved,
}: {
  lesson: Aula | null;
  moduloId: string;
  totalLessons: number;
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    titulo: lesson?.titulo ?? "",
    descricao: lesson?.descricao ?? "",
    tipo: (lesson?.tipo as TipoAula) ?? "video",
    conteudo_url: lesson?.conteudo_url ?? "",
    duracao_min: lesson?.duracao_min ?? "",
    ordem: lesson?.ordem ?? totalLessons + 1,
  });

  const set = (key: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const urlPlaceholders: Record<string, string> = {
    video: "https://youtube.com/watch?v=... ou lien Google Drive",
    pdf: "https://lien-vers-le-pdf.com/fichier.pdf",
    audio: "https://lien-vers-audio.com/fichier.mp3",
    link: "https://app-externe.com",
    checklist: "",
    texto: "",
  };

  const urlHelps: Record<string, string> = {
    video:
      "Collez le lien YouTube, Vimeo ou Google Drive (lien de partage).",
    pdf: "Lien direct vers le PDF ou lien de preview Google Drive.",
    link: "Lien de l'app ou site externe que l'élève doit visiter.",
    audio: "Lien direct vers le fichier audio.",
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      setFormError("Le titre est obligatoire");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = {
      modulo_id: moduloId,
      titulo: form.titulo,
      descricao: form.descricao,
      tipo: form.tipo,
      conteudo_url: form.conteudo_url || null,
      duracao_min: form.duracao_min ? Number(form.duracao_min) : null,
      ordem: Number(form.ordem),
    };

    let result;
    if (lesson) {
      result = await supabase
        .from("aulas")
        .update(payload)
        .eq("id", lesson.id);
    } else {
      result = await supabase.from("aulas").insert(payload);
    }

    if (result.error) {
      setFormError(result.error.message);
      setSaving(false);
      return;
    }

    await onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-secondary border border-border rounded-card p-6 md:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-[22px] text-text-primary">
            {lesson ? "Modifier la leçon" : "Nouvelle leçon"}
          </h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[14px] text-text-secondary mb-1.5">
              Titre *
            </label>
            <input
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              className={inputCls}
              placeholder="Ex: Bienvenue dans votre rituel"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[14px] text-text-secondary mb-1.5">
              Description
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              rows={3}
              className={textareaCls}
              placeholder="Décrivez le contenu de cette leçon..."
            />
          </div>

          {/* Content type — visual cards */}
          <div>
            <label className="block text-[14px] text-text-secondary mb-2">
              Type de contenu
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TIPO_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = form.tipo === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("tipo", opt.value)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-[10px] border text-left transition-all text-[13px] font-medium",
                      selected
                        ? "border-pink-primary bg-pink-primary/10 text-pink-primary"
                        : "border-border bg-bg-tertiary text-text-secondary hover:border-pink-border"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {opt.label.split(" (")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* URL */}
          {form.tipo !== "checklist" && form.tipo !== "texto" && (
            <div>
              <label className="block text-[14px] text-text-secondary mb-1.5">
                URL du contenu
              </label>
              <input
                value={form.conteudo_url}
                onChange={(e) => set("conteudo_url", e.target.value)}
                className={inputCls}
                placeholder={urlPlaceholders[form.tipo] || "https://..."}
              />
              {urlHelps[form.tipo] && (
                <p className="text-[12px] text-text-tertiary mt-1.5">
                  {urlHelps[form.tipo]}
                </p>
              )}
            </div>
          )}

          {/* Order + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] text-text-secondary mb-1.5">
                Ordre
              </label>
              <input
                type="number"
                value={form.ordem}
                onChange={(e) => set("ordem", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[14px] text-text-secondary mb-1.5">
                Durée (min)
              </label>
              <input
                type="number"
                value={form.duracao_min}
                onChange={(e) => set("duracao_min", e.target.value)}
                className={inputCls}
                placeholder="Optionnel"
              />
            </div>
          </div>

          {/* Error */}
          {formError && (
            <div className="p-3 rounded-[10px] bg-pink-dark/20 border border-pink-dark/30 text-pink-primary text-[14px]">
              {formError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-border">
            <button
              className={btnPrimary}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              {lesson ? "Enregistrer" : "Créer la leçon"}
            </button>
            <button className={btnSecondary} onClick={onClose}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// USERS TAB
// =============================================
function UsersTab({
  usuarios,
  supabase,
  onRefresh,
}: {
  usuarios: Profile[];
  supabase: ReturnType<typeof createClient>;
  onRefresh: () => Promise<void>;
}) {
  const toggleActive = async (user: Profile) => {
    await supabase
      .from("profiles")
      .update({ ativo: !user.ativo })
      .eq("id", user.id);
    await onRefresh();
  };

  const updateDate = async (user: Profile, date: string) => {
    await supabase
      .from("profiles")
      .update({ data_inicio_jornada: new Date(date).toISOString() })
      .eq("id", user.id);
    await onRefresh();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-h2 text-text-primary">
          Utilisatrices
        </h1>
        <p className="text-[14px] text-text-tertiary mt-1">
          {usuarios.length} utilisatrice
          {usuarios.length !== 1 ? "s" : ""} inscrite
          {usuarios.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {usuarios.map((user) => (
          <div
            key={user.id}
            className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-card border border-border bg-bg-secondary"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-medium text-text-primary">
                  {user.nome}
                </h3>
                {user.role === "admin" && (
                  <span className="px-2 py-0.5 rounded-tag bg-pink-primary/15 text-pink-primary text-[11px] font-bold uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[13px] text-text-tertiary mt-0.5">
                {user.ativo ? "Active" : "Inactive"} · Membre depuis{" "}
                {new Date(user.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-text-tertiary" />
                <input
                  type="date"
                  defaultValue={
                    new Date(user.data_inicio_jornada)
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) => {
                    if (e.target.value) updateDate(user, e.target.value);
                  }}
                  className="h-8 px-2 rounded-lg bg-bg-tertiary border border-border text-text-primary text-[13px]"
                />
              </div>

              <button
                onClick={() => toggleActive(user)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  user.ativo
                    ? "text-pink-success hover:text-pink-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
                aria-label={user.ativo ? "Désactiver" : "Activer"}
              >
                {user.ativo ? (
                  <ToggleRight className="w-6 h-6" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
