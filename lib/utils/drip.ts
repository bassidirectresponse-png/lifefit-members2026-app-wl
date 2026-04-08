import type { EstadoSemana, EstadoModulo, TipoModulo } from "@/types/database";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function calcularSemanasLiberadas(dataInicioJornada: string): number {
  const inicio = new Date(dataInicioJornada).getTime();
  const agora = Date.now();
  const diffMs = agora - inicio;
  const semanas = Math.floor(diffMs / WEEK_MS) + 1;
  return Math.max(1, semanas);
}

export function getEstadoSemana(
  numeroSemana: number,
  semanasLiberadas: number,
  todasAulasConcluidas: boolean
): EstadoSemana {
  if (numeroSemana > semanasLiberadas) return "bloqueada";
  if (todasAulasConcluidas) return "concluida";
  return "atual";
}

/**
 * Calcula o estado de um módulo considerando tipo, drip e compras.
 */
export function getEstadoModulo(params: {
  tipo: TipoModulo;
  unlockAfterDays: number;
  dataInicioJornada: string;
  todasAulasConcluidas: boolean;
  totalAulas: number;
  purchased: boolean; // se user comprou (para tipo locked)
}): EstadoModulo {
  const { tipo, unlockAfterDays, dataInicioJornada, todasAulasConcluidas, totalAulas, purchased } = params;

  // Locked modules: always locked_upsell unless purchased
  if (tipo === "locked" && !purchased) return "locked_upsell";

  // Drip: check unlock_after_days
  if (unlockAfterDays > 0) {
    const diasDesdeInicio = diasDesdeJornada(dataInicioJornada);
    if (diasDesdeInicio < unlockAfterDays) return "bloqueada";
  }

  // Normal flow
  if (totalAulas > 0 && todasAulasConcluidas) return "concluida";
  return "atual";
}

/**
 * Dias desde o início da jornada
 */
export function diasDesdeJornada(dataInicioJornada: string): number {
  const inicio = new Date(dataInicioJornada).getTime();
  return Math.floor((Date.now() - inicio) / DAY_MS);
}

/**
 * Dias restantes para desbloquear um conteúdo com unlock_after_days
 */
export function diasParaDesbloquearDrip(
  unlockAfterDays: number,
  dataInicioJornada: string
): number {
  if (!unlockAfterDays || unlockAfterDays <= 0) return 0;
  const diasDesdeInicio = diasDesdeJornada(dataInicioJornada);
  return Math.max(0, unlockAfterDays - diasDesdeInicio);
}

// Legacy: compatibilidade com semanas (usado no dashboard antigo)
export function diasParaDesbloquear(
  numeroSemana: number,
  dataInicioJornada: string
): number {
  const inicio = new Date(dataInicioJornada).getTime();
  const desbloqueioMs = inicio + (numeroSemana - 1) * WEEK_MS;
  const diffMs = desbloqueioMs - Date.now();
  return Math.max(0, Math.ceil(diffMs / DAY_MS));
}

export function saudacaoPorHorario(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}
