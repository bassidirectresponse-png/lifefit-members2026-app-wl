export type TipoAula = "video" | "pdf" | "audio" | "link" | "checklist" | "texto";

export interface Profile {
  id: string;
  nome: string;
  avatar_url: string | null;
  data_inicio_jornada: string;
  ativo: boolean;
  role: "member" | "admin";
  created_at: string;
}

export interface Modulo {
  id: string;
  numero_semana: number;
  titulo: string;
  subtitulo: string;
  descricao: string;
  banner_url: string | null;
  cor_destaque: string | null;
  ordem: number;
  created_at: string;
}

export interface Aula {
  id: string;
  modulo_id: string;
  titulo: string;
  descricao: string;
  tipo: TipoAula;
  conteudo_url: string | null;
  conteudo_extra: Record<string, unknown> | null;
  duracao_min: number | null;
  ordem: number;
  thumbnail_url: string | null;
}

export interface Progresso {
  id: string;
  user_id: string;
  aula_id: string;
  concluida: boolean;
  concluida_em: string | null;
}

export interface ChecklistProgress {
  id: string;
  user_id: string;
  aula_id: string;
  item_index: number;
  marcado: boolean;
}

// Tipos compostos para a UI
export interface ModuloComProgresso extends Modulo {
  aulas: Aula[];
  total_aulas: number;
  aulas_concluidas: number;
}

export interface AulaComProgresso extends Aula {
  concluida: boolean;
}

export type EstadoSemana = "concluida" | "atual" | "bloqueada";
