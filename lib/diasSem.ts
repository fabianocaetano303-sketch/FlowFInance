import type { DiasSem } from "@/lib/types";
import { hojeISO, toISODate } from "@/lib/financas";

/** Janela de histórico buscada pra calcular o streak (dias pode ser bem maior que a grade de 30 dias). */
export const JANELA_STREAK_DIAS = 400;

function diaAnteriorISO(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return toISODate(new Date(ano, mes - 1, dia - 1));
}

/**
 * Streak de um "dias sem": quantos dias seguidos, contando de hoje pra trás,
 * estão marcados. Diferente do streak de hábitos — aqui hoje não marcado já
 * zera o contador na hora (não tem carência de "o dia ainda não acabou").
 */
export function calcularStreakDiasSem(logPorData: Record<string, boolean>, hoje: string = hojeISO()): number {
  if (logPorData[hoje] !== true) return 0;

  let streak = 0;
  let cursor = hoje;
  let seguranca = 0;
  while (logPorData[cursor] === true && seguranca < 3650) {
    streak++;
    cursor = diaAnteriorISO(cursor);
    seguranca++;
  }
  return streak;
}

export interface DiaDiasSem {
  data: string;
  marcado: boolean;
}

/** Últimos 30 dias (mais antigo primeiro, hoje por último) pra grade visual. */
export function ultimos30DiasSem(logPorData: Record<string, boolean>, hoje: string = hojeISO()): DiaDiasSem[] {
  const dias: DiaDiasSem[] = [];
  let cursor = hoje;
  for (let i = 0; i < 30; i++) {
    dias.unshift({ data: cursor, marcado: logPorData[cursor] === true });
    cursor = diaAnteriorISO(cursor);
  }
  return dias;
}

export interface RastreadorComStreak {
  rastreador: DiasSem;
  streak: number;
}

/** Os `limite` rastreadores com maior streak — usado no mini-card do painel da Vida. */
export function melhoresStreaksDiasSem(
  rastreadores: DiasSem[],
  logs: Record<string, Record<string, boolean>>,
  hoje: string = hojeISO(),
  limite = 3
): RastreadorComStreak[] {
  return rastreadores
    .map((r) => ({ rastreador: r, streak: calcularStreakDiasSem(logs[r.id] || {}, hoje) }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, limite);
}
