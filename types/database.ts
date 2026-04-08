export type TipoAula = "video" | "pdf" | "audio" | "link" | "checklist" | "texto";
export type TipoModulo = "main" | "bonus" | "locked";
export type Locale = "fr" | "pt" | "en" | "es";

// JSON map of locale → translated string
export type I18nField = Partial<Record<Locale, string>>;

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
  // New fields
  tipo: TipoModulo;
  unlock_after_days: number;
  titulo_i18n: I18nField;
  subtitulo_i18n: I18nField;
  descricao_i18n: I18nField;
  // Locked/upsell fields
  sales_copy: string | null;
  price_display: string | null;
  checkout_url: string | null;
  cta_text: string | null;
  cover_image: string | null;
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
  // New fields
  unlock_after_days: number;
  titulo_i18n: I18nField;
  descricao_i18n: I18nField;
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

export interface UserPurchase {
  id: string;
  user_id: string;
  modulo_id: string;
  purchased_at: string;
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
export type EstadoModulo = "concluida" | "atual" | "bloqueada" | "locked_upsell";

// Helper to get localized text with fallback
export function getLocalizedText(
  i18nField: I18nField | null | undefined,
  fallback: string,
  locale: Locale
): string {
  if (!i18nField) return fallback;
  return i18nField[locale] || i18nField.fr || fallback;
}
