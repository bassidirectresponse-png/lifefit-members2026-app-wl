"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlowButton } from "@/components/ui/glow-button";
import type { Modulo, Aula, Profile, TipoAula } from "@/types/database";

// Schemas
const moduloSchema = z.object({
  numero_semana: z.coerce.number().min(1),
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

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-pink-primary animate-spin" /></div>}>
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "modulos";
  const supabase = createClient();

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [editingAula, setEditingAula] = useState<{
    aula: Aula | null;
    moduloId: string;
  } | null>(null);
  const [showModuloForm, setShowModuloForm] = useState(false);
  const [expandedModulo, setExpandedModulo] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [modulosRes, aulasRes, usuariosRes] = await Promise.all([
      supabase.from("modulos").select("*").order("ordem"),
      supabase.from("aulas").select("*").order("ordem"),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
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
      <div className="flex items-center gap-4 mb-8 md:hidden">
        <a
          href="/admin"
          className={`px-4 py-2 rounded-button text-[15px] font-medium transition-colors ${
            tab === "modulos"
              ? "bg-pink-primary/10 text-pink-primary"
              : "text-text-secondary"
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-1.5" />
          Módulos
        </a>
        <a
          href="/admin?tab=usuarios"
          className={`px-4 py-2 rounded-button text-[15px] font-medium transition-colors ${
            tab === "usuarios"
              ? "bg-pink-primary/10 text-pink-primary"
              : "text-text-secondary"
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
          editingModulo={editingModulo}
          setEditingModulo={setEditingModulo}
          editingAula={editingAula}
          setEditingAula={setEditingAula}
          showModuloForm={showModuloForm}
          setShowModuloForm={setShowModuloForm}
          expandedModulo={expandedModulo}
          setExpandedModulo={setExpandedModulo}
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
// Módulos Tab
// =============================================
function ModulosTab({
  modulos,
  aulas,
  supabase,
  onRefresh,
  editingModulo,
  setEditingModulo,
  editingAula,
  setEditingAula,
  showModuloForm,
  setShowModuloForm,
  expandedModulo,
  setExpandedModulo,
}: {
  modulos: Modulo[];
  aulas: Aula[];
  supabase: ReturnType<typeof createClient>;
  onRefresh: () => void;
  editingModulo: Modulo | null;
  setEditingModulo: (m: Modulo | null) => void;
  editingAula: { aula: Aula | null; moduloId: string } | null;
  setEditingAula: (a: { aula: Aula | null; moduloId: string } | null) => void;
  showModuloForm: boolean;
  setShowModuloForm: (v: boolean) => void;
  expandedModulo: string | null;
  setExpandedModulo: (id: string | null) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ModuloForm>({
    resolver: zodResolver(moduloSchema),
  });

  const openNewModulo = () => {
    setEditingModulo(null);
    reset({
      numero_semana: modulos.length + 1,
      titulo: "",
      subtitulo: "",
      descricao: "",
      cor_destaque: "#EC4899",
      ordem: modulos.length + 1,
    });
    setShowModuloForm(true);
  };

  const openEditModulo = (modulo: Modulo) => {
    setEditingModulo(modulo);
    reset({
      numero_semana: modulo.numero_semana,
      titulo: modulo.titulo,
      subtitulo: modulo.subtitulo,
      descricao: modulo.descricao,
      cor_destaque: modulo.cor_destaque || "#EC4899",
      ordem: modulo.ordem,
    });
    setShowModuloForm(true);
  };

  const onSubmitModulo = async (data: ModuloForm) => {
    if (editingModulo) {
      await supabase.from("modulos").update(data).eq("id", editingModulo.id);
    } else {
      await supabase.from("modulos").insert(data);
    }
    setShowModuloForm(false);
    onRefresh();
  };

  const deleteModulo = async (id: string) => {
    if (!confirm("Tem certeza? Isso apagará todas as aulas desta semana.")) return;
    await supabase.from("modulos").delete().eq("id", id);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-h2 text-text-primary">Módulos</h1>
        <GlowButton onClick={openNewModulo} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo módulo
        </GlowButton>
      </div>

      {/* Modulo form modal */}
      {showModuloForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
          <div className="bg-bg-secondary border border-border rounded-card p-card-padding w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-h4 text-text-primary">
                {editingModulo ? "Editar módulo" : "Novo módulo"}
              </h2>
              <button
                onClick={() => setShowModuloForm(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmitModulo)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-body-sm text-text-secondary">
                    Nº Semana
                  </label>
                  <input
                    {...register("numero_semana")}
                    type="number"
                    className="w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px]"
                  />
                  {errors.numero_semana && (
                    <p className="text-[12px] text-pink-primary">
                      {errors.numero_semana.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-body-sm text-text-secondary">
                    Ordem
                  </label>
                  <input
                    {...register("ordem")}
                    type="number"
                    className="w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm text-text-secondary">
                  Título
                </label>
                <input
                  {...register("titulo")}
                  className="w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px]"
                />
                {errors.titulo && (
                  <p className="text-[12px] text-pink-primary">
                    {errors.titulo.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm text-text-secondary">
                  Subtítulo
                </label>
                <input
                  {...register("subtitulo")}
                  className="w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm text-text-secondary">
                  Descrição
                </label>
                <textarea
                  {...register("descricao")}
                  rows={3}
                  className="w-full px-3 py-2 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm text-text-secondary">
                  Cor destaque
                </label>
                <input
                  {...register("cor_destaque")}
                  type="color"
                  className="w-12 h-10 rounded-button border border-border cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <GlowButton type="submit" disabled={isSubmitting} size="sm">
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingModulo ? (
                    "Salvar"
                  ) : (
                    "Criar"
                  )}
                </GlowButton>
                <GlowButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModuloForm(false)}
                >
                  Cancelar
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Aula form modal */}
      {editingAula && (
        <AulaFormModal
          editingAula={editingAula}
          supabase={supabase}
          onClose={() => setEditingAula(null)}
          onRefresh={onRefresh}
        />
      )}

      {/* Modules list */}
      <div className="space-y-3">
        {modulos.map((modulo) => {
          const moduloAulas = aulas.filter((a) => a.modulo_id === modulo.id);
          const isExpanded = expandedModulo === modulo.id;

          return (
            <div
              key={modulo.id}
              className="rounded-card border border-border bg-bg-secondary overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                <div
                  className="w-2 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: modulo.cor_destaque || "#EC4899" }}
                />
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() =>
                      setExpandedModulo(isExpanded ? null : modulo.id)
                    }
                    className="text-left w-full"
                  >
                    <h3 className="text-[15px] font-medium text-text-primary truncate">
                      Semana {modulo.numero_semana}: {modulo.titulo}
                    </h3>
                    <p className="text-[13px] text-text-tertiary">
                      {moduloAulas.length} aulas
                    </p>
                  </button>
                </div>
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

              {/* Aulas expandidas */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-2">
                  {moduloAulas.map((aula) => (
                    <div
                      key={aula.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-button bg-bg-tertiary"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] text-text-primary truncate block">
                          {aula.ordem}. {aula.titulo}
                        </span>
                        <span className="text-[12px] text-text-tertiary">
                          {aula.tipo}
                          {aula.duracao_min ? ` · ${aula.duracao_min}min` : ""}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setEditingAula({ aula, moduloId: modulo.id })
                          }
                          className="p-1.5 text-text-tertiary hover:text-pink-primary rounded transition-colors"
                          aria-label="Editar aula"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Excluir esta aula?")) return;
                            await supabase
                              .from("aulas")
                              .delete()
                              .eq("id", aula.id);
                            onRefresh();
                          }}
                          className="p-1.5 text-text-tertiary hover:text-pink-primary rounded transition-colors"
                          aria-label="Excluir aula"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setEditingAula({ aula: null, moduloId: modulo.id })
                    }
                    className="flex items-center gap-2 text-body-sm text-pink-primary hover:text-pink-vibrant transition-colors mt-2"
                  >
                    <Plus className="w-4 h-4" /> Adicionar aula
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================
// Aula Form Modal
// =============================================
function AulaFormModal({
  editingAula,
  supabase,
  onClose,
  onRefresh,
}: {
  editingAula: { aula: Aula | null; moduloId: string };
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AulaForm>({
    resolver: zodResolver(aulaSchema),
    defaultValues: editingAula.aula
      ? {
          titulo: editingAula.aula.titulo,
          descricao: editingAula.aula.descricao,
          tipo: editingAula.aula.tipo as TipoAula,
          conteudo_url: editingAula.aula.conteudo_url || "",
          duracao_min: editingAula.aula.duracao_min || undefined,
          ordem: editingAula.aula.ordem,
        }
      : { titulo: "", descricao: "", tipo: "video", ordem: 1 },
  });

  const onSubmit = async (data: AulaForm) => {
    const payload = {
      ...data,
      modulo_id: editingAula.moduloId,
      conteudo_url: data.conteudo_url || null,
      duracao_min: data.duracao_min || null,
    };

    if (editingAula.aula) {
      await supabase
        .from("aulas")
        .update(payload)
        .eq("id", editingAula.aula.id);
    } else {
      await supabase.from("aulas").insert(payload);
    }

    onClose();
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary border border-border rounded-card p-card-padding w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-h4 text-text-primary">
            {editingAula.aula ? "Editar aula" : "Nova aula"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-body-sm text-text-secondary">Título</label>
            <input
              {...register("titulo")}
              className="w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px]"
            />
            {errors.titulo && (
              <p className="text-[12px] text-pink-primary">
                {errors.titulo.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-body-sm text-text-secondary">
              Descrição
            </label>
            <textarea
              {...register("descricao")}
              rows={2}
              className="w-full px-3 py-2 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-body-sm text-text-secondary">Tipo</label>
              <select
                {...register("tipo")}
                className="w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px]"
              >
                <option value="video">Vídeo</option>
                <option value="pdf">PDF</option>
                <option value="audio">Áudio</option>
                <option value="link">Link</option>
                <option value="checklist">Checklist</option>
                <option value="texto">Texto</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-body-sm text-text-secondary">Ordem</label>
              <input
                {...register("ordem")}
                type="number"
                className="w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-body-sm text-text-secondary">
              URL do conteúdo
            </label>
            <input
              {...register("conteudo_url")}
              className="w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px]"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-body-sm text-text-secondary">
              Duração (minutos)
            </label>
            <input
              {...register("duracao_min")}
              type="number"
              className="w-full h-10 px-3 rounded-button bg-bg-tertiary border border-border text-text-primary text-[15px]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <GlowButton type="submit" disabled={isSubmitting} size="sm">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingAula.aula ? (
                "Salvar"
              ) : (
                "Criar"
              )}
            </GlowButton>
            <GlowButton
              type="button"
              variant="ghost"
              size="sm"
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
// Usuárias Tab
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
      <h1 className="font-display text-h2 text-text-primary mb-6">Usuárias</h1>

      <div className="space-y-3">
        {usuarios.map((user) => (
          <div
            key={user.id}
            className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-card border border-border bg-bg-secondary"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-medium text-text-primary">
                {user.nome}
              </h3>
              <p className="text-[13px] text-text-tertiary">
                {user.role === "admin" ? "Administradora" : "Membro"} ·{" "}
                {user.ativo ? "Ativa" : "Inativa"}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Data início */}
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
                      updateDataInicio(user, new Date(e.target.value).toISOString());
                    }
                  }}
                  className="h-8 px-2 rounded bg-bg-tertiary border border-border text-text-primary text-[13px]"
                />
              </div>

              {/* Toggle ativo */}
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
