"use client";

import { Suspense, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  BookOpen,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
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
  GripVertical,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlowButton } from "@/components/ui/glow-button";
import type { Modulo, Aula, Profile, TipoAula } from "@/types/database";

// --- Input class reusável ---
const inputClass =
  "w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px] focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/30 transition-all outline-none";
const labelClass = "block text-body-sm text-text-secondary mb-1.5";
const textareaClass =
  "w-full px-3 py-2.5 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px] resize-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/30 transition-all outline-none";

// --- Schemas ---
const moduloSchema = z.object({
  numero_semana: z.coerce.number().min(1, "Obrigatório"),
  titulo: z.string().min(1, "Título obrigatório"),
  subtitulo: z.string().optional().default(""),
  descricao: z.string().optional().default(""),
  cor_destaque: z.string().optional().default("#EC4899"),
  ordem: z.coerce.number().min(0),
});

const aulaSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  descricao: z.string().optional().default(""),
  tipo: z.enum(["video", "pdf", "audio", "link", "checklist", "texto"]),
  conteudo_url: z.string().optional().default(""),
  duracao_min: z.coerce.number().optional(),
  ordem: z.coerce.number().min(0),
});

type ModuloForm = z.infer<typeof moduloSchema>;
type AulaForm = z.infer<typeof aulaSchema>;

const tipoIcons: Record<TipoAula, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  audio: Headphones,
  link: ExternalLink,
  checklist: CheckSquare,
  texto: BookOpenText,
};

const tipoLabels: Record<TipoAula, string> = {
  video: "Vídeo (YouTube / Google Drive)",
  pdf: "PDF (upload ou link)",
  audio: "Áudio",
  link: "Link externo (app, site)",
  checklist: "Checklist interativo",
  texto: "Texto / Artigo",
};

// =============================================
// Entry point with Suspense
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
      <AdminContent />
    </Suspense>
  );
}

// =============================================
// Main Admin Content
// =============================================
function AdminContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "modulos";
  const supabase = useMemo(() => createClient(), []);

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [modulosRes, aulasRes, usuariosRes] = await Promise.all([
      supabase.from("modulos").select("*").order("ordem"),
      supabase.from("aulas").select("*").order("ordem"),
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    setModulos((modulosRes.data || []) as Modulo[]);
    setAulas((aulasRes.data || []) as Aula[]);
    setUsuarios((usuariosRes.data || []) as Profile[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-pink-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8">
        <a
          href="/admin"
          className={`px-4 py-2 rounded-button text-[15px] font-medium transition-colors ${
            tab === "modulos"
              ? "bg-pink-primary/10 text-pink-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-1.5" />
          Módulos & Aulas
        </a>
        <a
          href="/admin?tab=usuarios"
          className={`px-4 py-2 rounded-button text-[15px] font-medium transition-colors ${
            tab === "usuarios"
              ? "bg-pink-primary/10 text-pink-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          Usuárias
        </a>
      </div>

      {tab === "modulos" && (
        <ModulosTab
          modulos={modulos}
          aulas={aulas}
          supabase={supabase}
          onRefresh={fetchData}
        />
      )}

      {tab === "usuarios" && (
        <UsuariosTab
          usuarios={usuarios}
          supabase={supabase}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}

// =============================================
// MÓDULOS TAB
// =============================================
function ModulosTab({
  modulos,
  aulas,
  supabase,
  onRefresh,
}: {
  modulos: Modulo[];
  aulas: Aula[];
  supabase: ReturnType<typeof createClient>;
  onRefresh: () => void;
}) {
  const [showModuloModal, setShowModuloModal] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [showAulaModal, setShowAulaModal] = useState(false);
  const [editingAula, setEditingAula] = useState<Aula | null>(null);
  const [aulaModuloId, setAulaModuloId] = useState<string>("");
  const [expandedModulo, setExpandedModulo] = useState<string | null>(null);

  const openNewModulo = () => {
    setEditingModulo(null);
    setShowModuloModal(true);
  };

  const openEditModulo = (m: Modulo) => {
    setEditingModulo(m);
    setShowModuloModal(true);
  };

  const openNewAula = (moduloId: string) => {
    setEditingAula(null);
    setAulaModuloId(moduloId);
    setShowAulaModal(true);
  };

  const openEditAula = (aula: Aula) => {
    setEditingAula(aula);
    setAulaModuloId(aula.modulo_id);
    setShowAulaModal(true);
  };

  const deleteModulo = async (id: string) => {
    if (!confirm("Tem certeza? Isso apagará todas as aulas deste módulo."))
      return;
    await supabase.from("modulos").delete().eq("id", id);
    onRefresh();
  };

  const deleteAula = async (id: string) => {
    if (!confirm("Excluir esta aula?")) return;
    await supabase.from("aulas").delete().eq("id", id);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Módulos</h1>
          <p className="text-body-sm text-text-tertiary mt-1">
            {modulos.length} módulos · {aulas.length} aulas no total
          </p>
        </div>
        <GlowButton onClick={openNewModulo} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo módulo
        </GlowButton>
      </div>

      {/* Modulo modal */}
      {showModuloModal && (
        <ModuloModal
          modulo={editingModulo}
          totalModulos={modulos.length}
          supabase={supabase}
          onClose={() => setShowModuloModal(false)}
          onSaved={() => {
            setShowModuloModal(false);
            onRefresh();
          }}
        />
      )}

      {/* Aula modal */}
      {showAulaModal && (
        <AulaModal
          aula={editingAula}
          moduloId={aulaModuloId}
          totalAulas={aulas.filter((a) => a.modulo_id === aulaModuloId).length}
          supabase={supabase}
          onClose={() => setShowAulaModal(false)}
          onSaved={() => {
            setShowAulaModal(false);
            onRefresh();
          }}
        />
      )}

      {/* Modules list */}
      <div className="space-y-4">
        {modulos.map((modulo) => {
          const moduloAulas = aulas
            .filter((a) => a.modulo_id === modulo.id)
            .sort((a, b) => a.ordem - b.ordem);
          const isExpanded = expandedModulo === modulo.id;

          return (
            <div
              key={modulo.id}
              className="rounded-card border border-border bg-bg-secondary overflow-hidden"
            >
              {/* Module header */}
              <div className="flex items-center gap-3 p-4">
                {/* Capa thumbnail */}
                <div
                  className="w-14 h-14 rounded-button shrink-0 flex items-center justify-center overflow-hidden border border-border"
                  style={{ backgroundColor: modulo.cor_destaque || "#1C1C1F" }}
                >
                  {modulo.banner_url ? (
                    <img
                      src={modulo.banner_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-text-tertiary" />
                  )}
                </div>

                {/* Info */}
                <button
                  onClick={() =>
                    setExpandedModulo(isExpanded ? null : modulo.id)
                  }
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-text-primary truncate">
                      Semana {modulo.numero_semana}: {modulo.titulo}
                    </h3>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
                    )}
                  </div>
                  <p className="text-[13px] text-text-tertiary truncate">
                    {modulo.subtitulo || "Sem subtítulo"} ·{" "}
                    {moduloAulas.length} aula
                    {moduloAulas.length !== 1 ? "s" : ""}
                  </p>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModulo(modulo)}
                    className="p-2 text-text-tertiary hover:text-pink-primary rounded-button hover:bg-bg-tertiary transition-colors"
                    aria-label="Editar módulo"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteModulo(modulo.id)}
                    className="p-2 text-text-tertiary hover:text-pink-primary rounded-button hover:bg-bg-tertiary transition-colors"
                    aria-label="Excluir módulo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Aulas list (expandida) */}
              {isExpanded && (
                <div className="border-t border-border bg-bg-primary/50">
                  <div className="p-4 space-y-2">
                    {moduloAulas.length === 0 && (
                      <p className="text-[13px] text-text-tertiary text-center py-4">
                        Nenhuma aula ainda. Adicione a primeira.
                      </p>
                    )}

                    {moduloAulas.map((aula) => {
                      const TipoIcon = tipoIcons[aula.tipo as TipoAula] || BookOpenText;
                      return (
                        <div
                          key={aula.id}
                          className="flex items-center gap-3 p-3 rounded-button bg-bg-secondary border border-border hover:border-pink-border transition-colors"
                        >
                          <GripVertical className="w-4 h-4 text-text-tertiary/50 shrink-0" />

                          <div className="w-8 h-8 rounded-lg bg-pink-primary/10 flex items-center justify-center shrink-0">
                            <TipoIcon className="w-4 h-4 text-pink-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[14px] text-text-primary block truncate">
                              {aula.ordem}. {aula.titulo}
                            </span>
                            <span className="text-[12px] text-text-tertiary">
                              {tipoLabels[aula.tipo as TipoAula]?.split(" (")[0] || aula.tipo}
                              {aula.duracao_min
                                ? ` · ${aula.duracao_min}min`
                                : ""}
                            </span>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => openEditAula(aula)}
                              className="p-1.5 text-text-tertiary hover:text-pink-primary rounded transition-colors"
                              aria-label="Editar aula"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteAula(aula.id)}
                              className="p-1.5 text-text-tertiary hover:text-pink-primary rounded transition-colors"
                              aria-label="Excluir aula"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add aula button */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => openNewAula(modulo.id)}
                      className="flex items-center gap-2 w-full p-3 rounded-button border border-dashed border-border hover:border-pink-primary/40 text-body-sm text-text-tertiary hover:text-pink-primary transition-all justify-center"
                    >
                      <Plus className="w-4 h-4" /> Adicionar aula
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {modulos.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-text-tertiary/40 mx-auto mb-4" />
            <p className="text-body text-text-secondary mb-4">
              Nenhum módulo criado ainda
            </p>
            <GlowButton onClick={openNewModulo} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Criar primeiro módulo
            </GlowButton>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// MÓDULO MODAL (criar/editar + upload de capa)
// =============================================
function ModuloModal({
  modulo,
  totalModulos,
  supabase,
  onClose,
  onSaved,
}: {
  modulo: Modulo | null;
  totalModulos: number;
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    modulo?.banner_url || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ModuloForm>({
    resolver: zodResolver(moduloSchema),
    defaultValues: modulo
      ? {
          numero_semana: modulo.numero_semana,
          titulo: modulo.titulo,
          subtitulo: modulo.subtitulo,
          descricao: modulo.descricao,
          cor_destaque: modulo.cor_destaque || "#EC4899",
          ordem: modulo.ordem,
        }
      : {
          numero_semana: totalModulos + 1,
          titulo: "",
          subtitulo: "",
          descricao: "",
          cor_destaque: "#EC4899",
          ordem: totalModulos + 1,
        },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("content")
      .upload(fileName, file, { upsert: true });

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("content").getPublicUrl(fileName);
      setBannerPreview(publicUrl);
    } else {
      alert("Erro ao fazer upload: " + error.message);
    }
    setUploading(false);
  };

  const onSubmit = async (data: ModuloForm) => {
    const payload = {
      ...data,
      banner_url: bannerPreview,
    };

    if (modulo) {
      await supabase.from("modulos").update(payload).eq("id", modulo.id);
    } else {
      await supabase.from("modulos").insert(payload);
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary border border-border rounded-card p-6 md:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-h4 text-text-primary">
            {modulo ? "Editar módulo" : "Novo módulo"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Capa / Banner */}
          <div>
            <label className={labelClass}>Capa do módulo</label>
            <div
              className="relative w-full h-40 rounded-card border-2 border-dashed border-border hover:border-pink-primary/40 transition-colors cursor-pointer overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {bannerPreview ? (
                <>
                  <img
                    src={bannerPreview}
                    alt="Capa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-body-sm text-text-primary font-medium">
                      Trocar imagem
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
                      <span className="text-body-sm">
                        Clique para enviar uma imagem
                      </span>
                      <span className="text-[12px] text-text-tertiary mt-1">
                        JPG, PNG ou WebP
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Nº Semana + Ordem */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nº Semana</label>
              <input
                {...register("numero_semana")}
                type="number"
                className={inputClass}
              />
              {errors.numero_semana && (
                <p className="text-[12px] text-pink-primary mt-1">
                  {errors.numero_semana.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Ordem de exibição</label>
              <input
                {...register("ordem")}
                type="number"
                className={inputClass}
              />
            </div>
          </div>

          {/* Título */}
          <div>
            <label className={labelClass}>Título</label>
            <input
              {...register("titulo")}
              className={inputClass}
              placeholder="Ex: Despertar do Corpo"
            />
            {errors.titulo && (
              <p className="text-[12px] text-pink-primary mt-1">
                {errors.titulo.message}
              </p>
            )}
          </div>

          {/* Subtítulo */}
          <div>
            <label className={labelClass}>Subtítulo</label>
            <input
              {...register("subtitulo")}
              className={inputClass}
              placeholder="Breve descrição que aparece nos cards"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className={labelClass}>Descrição completa</label>
            <textarea
              {...register("descricao")}
              rows={4}
              className={textareaClass}
              placeholder="Texto detalhado sobre o módulo..."
            />
          </div>

          {/* Cor destaque */}
          <div>
            <label className={labelClass}>Cor destaque</label>
            <div className="flex items-center gap-3">
              <input
                {...register("cor_destaque")}
                type="color"
                className="w-10 h-10 rounded-button border border-border cursor-pointer"
              />
              <span className="text-[13px] text-text-tertiary">
                Cor usada como fundo quando não há capa
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-border">
            <GlowButton type="submit" disabled={isSubmitting} size="md">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {modulo ? "Salvar alterações" : "Criar módulo"}
            </GlowButton>
            <GlowButton
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
            >
              Cancelar
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================
// AULA MODAL (criar/editar com tipo + url)
// =============================================
function AulaModal({
  aula,
  moduloId,
  totalAulas,
  supabase,
  onClose,
  onSaved,
}: {
  aula: Aula | null;
  moduloId: string;
  totalAulas: number;
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AulaForm>({
    resolver: zodResolver(aulaSchema),
    defaultValues: aula
      ? {
          titulo: aula.titulo,
          descricao: aula.descricao,
          tipo: aula.tipo as TipoAula,
          conteudo_url: aula.conteudo_url || "",
          duracao_min: aula.duracao_min || undefined,
          ordem: aula.ordem,
        }
      : {
          titulo: "",
          descricao: "",
          tipo: "video",
          conteudo_url: "",
          ordem: totalAulas + 1,
        },
  });

  const tipoAtual = watch("tipo");

  const getUrlPlaceholder = (tipo: string): string => {
    switch (tipo) {
      case "video":
        return "https://youtube.com/watch?v=... ou link do Google Drive";
      case "pdf":
        return "https://link-do-pdf.com/arquivo.pdf";
      case "audio":
        return "https://link-do-audio.com/arquivo.mp3";
      case "link":
        return "https://app-externo.com";
      default:
        return "URL do conteúdo (opcional)";
    }
  };

  const getUrlHelp = (tipo: string): string => {
    switch (tipo) {
      case "video":
        return "Cole o link do YouTube, Vimeo ou Google Drive. Para Drive, use o link de compartilhamento.";
      case "pdf":
        return "Cole o link direto do PDF. Pode ser do Google Drive (use link de preview) ou qualquer URL pública.";
      case "link":
        return "Link do app ou site externo que a aluna deve acessar.";
      default:
        return "";
    }
  };

  const onSubmit = async (data: AulaForm) => {
    const payload = {
      ...data,
      modulo_id: moduloId,
      conteudo_url: data.conteudo_url || null,
      duracao_min: data.duracao_min || null,
    };

    if (aula) {
      await supabase.from("aulas").update(payload).eq("id", aula.id);
    } else {
      await supabase.from("aulas").insert(payload);
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary border border-border rounded-card p-6 md:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-h4 text-text-primary">
            {aula ? "Editar aula" : "Nova aula"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Título */}
          <div>
            <label className={labelClass}>Título da aula</label>
            <input
              {...register("titulo")}
              className={inputClass}
              placeholder="Ex: Boas-vindas ao seu ritual"
            />
            {errors.titulo && (
              <p className="text-[12px] text-pink-primary mt-1">
                {errors.titulo.message}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              {...register("descricao")}
              rows={3}
              className={textareaClass}
              placeholder="Descreva o conteúdo desta aula..."
            />
          </div>

          {/* Tipo de conteúdo — visual, com ícones */}
          <div>
            <label className={labelClass}>Tipo de conteúdo</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(Object.keys(tipoLabels) as TipoAula[]).map((tipo) => {
                const Icon = tipoIcons[tipo];
                const isSelected = tipoAtual === tipo;
                return (
                  <label
                    key={tipo}
                    className={`flex items-center gap-2 p-3 rounded-button border cursor-pointer transition-all ${
                      isSelected
                        ? "border-pink-primary bg-pink-primary/10 text-pink-primary"
                        : "border-border bg-bg-tertiary text-text-secondary hover:border-pink-border"
                    }`}
                  >
                    <input
                      {...register("tipo")}
                      type="radio"
                      value={tipo}
                      className="sr-only"
                    />
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-medium">
                      {tipoLabels[tipo].split(" (")[0]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* URL do conteúdo */}
          {tipoAtual !== "checklist" && tipoAtual !== "texto" && (
            <div>
              <label className={labelClass}>URL do conteúdo</label>
              <input
                {...register("conteudo_url")}
                className={inputClass}
                placeholder={getUrlPlaceholder(tipoAtual)}
              />
              {getUrlHelp(tipoAtual) && (
                <p className="text-[12px] text-text-tertiary mt-1.5">
                  {getUrlHelp(tipoAtual)}
                </p>
              )}
            </div>
          )}

          {/* Ordem + Duração */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ordem</label>
              <input
                {...register("ordem")}
                type="number"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Duração (min)</label>
              <input
                {...register("duracao_min")}
                type="number"
                className={inputClass}
                placeholder="Opcional"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-border">
            <GlowButton type="submit" disabled={isSubmitting} size="md">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {aula ? "Salvar alterações" : "Criar aula"}
            </GlowButton>
            <GlowButton
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
            >
              Cancelar
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================
// USUÁRIAS TAB
// =============================================
function UsuariosTab({
  usuarios,
  supabase,
  onRefresh,
}: {
  usuarios: Profile[];
  supabase: ReturnType<typeof createClient>;
  onRefresh: () => void;
}) {
  const toggleAtivo = async (user: Profile) => {
    await supabase
      .from("profiles")
      .update({ ativo: !user.ativo })
      .eq("id", user.id);
    onRefresh();
  };

  const updateDataInicio = async (user: Profile, novaData: string) => {
    await supabase
      .from("profiles")
      .update({ data_inicio_jornada: novaData })
      .eq("id", user.id);
    onRefresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-h2 text-text-primary">Usuárias</h1>
        <p className="text-body-sm text-text-tertiary mt-1">
          {usuarios.length} usuária{usuarios.length !== 1 ? "s" : ""}{" "}
          cadastrada{usuarios.length !== 1 ? "s" : ""}
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
                  <span className="px-2 py-0.5 rounded-tag bg-pink-primary/10 text-pink-primary text-[11px] font-semibold">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[13px] text-text-tertiary">
                {user.ativo ? "Ativa" : "Inativa"} · Membro desde{" "}
                {new Date(user.created_at).toLocaleDateString("pt-BR")}
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
                    if (e.target.value) {
                      updateDataInicio(
                        user,
                        new Date(e.target.value).toISOString()
                      );
                    }
                  }}
                  className="h-8 px-2 rounded bg-bg-tertiary border border-border text-text-primary text-[13px]"
                />
              </div>

              <button
                onClick={() => toggleAtivo(user)}
                className={`p-1.5 rounded transition-colors ${
                  user.ativo
                    ? "text-pink-success hover:text-pink-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
                aria-label={user.ativo ? "Desativar" : "Ativar"}
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

        {usuarios.length === 0 && (
          <p className="text-body-sm text-text-tertiary text-center py-8">
            Nenhuma usuária cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
