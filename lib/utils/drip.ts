import type { EstadoSemana } from "@/types/database";

export function calcularSemanasLiberadas(dataInicioJornada: string): number {
  const inicio = new Date(dataInicioJornada).getTime();
  const agora = Date.now();
  const diffMs = agora - inicio;
  const semanas = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
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

export function diasParaDesbloquear(
  numeroSemana: number,
  dataInicioJornada: string
): number {
  const inicio = new Date(dataInicioJornada).getTime();
  const desbloqueioMs = inicio + (numeroSemana - 1) * 7 * 24 * 60 * 60 * 1000;
  const diffMs = desbloqueioMs - Date.now();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

export function saudacaoPorHorario(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}
