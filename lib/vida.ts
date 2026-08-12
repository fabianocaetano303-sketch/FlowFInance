import type { FrequenciaHabito, VidaHabito, VidaMeta } from "@/lib/types";
import { diaDaSemana, hojeISO, inicioFimSemana, mesAnterior, toISODate } from "@/lib/financas";

/** Mapa habito_id -> { data -> concluido } usado por várias funções abaixo. */
export type HistoricoPorHabito = Record<string, Record<string, boolean>>;

export function ehDiaDevido(dataISO: string, frequencia: FrequenciaHabito): boolean {
  if (frequencia === "diario") return true;
  const dia = diaDaSemana(dataISO);
  return dia >= 1 && dia <= 5;
}

function diaAnteriorISO(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return toISODate(new Date(ano, mes - 1, dia - 1));
}

function proximoDiaISO(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return toISODate(new Date(ano, mes - 1, dia + 1));
}

/**
 * Sequência de dias seguidos (streak) que um hábito foi completado, contando
 * apenas os dias em que ele era devido. Um dia devido sem marcação zera a
 * sequência; hoje só é considerado "quebrado" se já foi marcado como não feito
 * — enquanto não é marcado, o dia atual simplesmente não é contado ainda.
 */
export function calcularStreak(
  historicoDoHabito: Record<string, boolean>,
  frequencia: FrequenciaHabito,
  hoje: string = hojeISO()
): number {
  let streak = 0;
  let cursor = hoje;
  let seguranca = 0;

  while (seguranca < 3650) {
    seguranca++;
    if (ehDiaDevido(cursor, frequencia)) {
      const feito = historicoDoHabito[cursor] === true;
      if (cursor === hoje && !feito) {
        // hoje ainda não foi marcado — não quebra a sequência, só não conta ainda
      } else if (feito) {
        streak++;
      } else {
        break;
      }
    }
    cursor = diaAnteriorISO(cursor);
  }
  return streak;
}

export interface HabitoComStatusHoje {
  habito: VidaHabito;
  devidoHoje: boolean;
  concluidoHoje: boolean;
}

export interface ResumoHabitosHoje {
  itens: HabitoComStatusHoje[];
  devidos: number;
  concluidos: number;
}

/** habitoIdParaConcluidoHoje: mapa habito_id -> concluido (apenas registros de hoje). */
export function resumoHabitosHoje(
  habitosAtivos: VidaHabito[],
  habitoIdParaConcluidoHoje: Record<string, boolean>,
  hoje: string = hojeISO()
): ResumoHabitosHoje {
  const itens: HabitoComStatusHoje[] = habitosAtivos.map((h) => ({
    habito: h,
    devidoHoje: ehDiaDevido(hoje, h.frequencia),
    concluidoHoje: habitoIdParaConcluidoHoje[h.id] === true,
  }));
  const devidos = itens.filter((i) => i.devidoHoje);
  const concluidos = devidos.filter((i) => i.concluidoHoje).length;
  return { itens, devidos: devidos.length, concluidos };
}

/** % de instâncias devidas (habito x dia) que foram concluídas num intervalo. */
export function percentualHabitosPeriodo(
  habitosAtivos: VidaHabito[],
  historico: HistoricoPorHabito,
  inicio: string,
  fim: string
): number {
  let devidos = 0;
  let concluidos = 0;
  for (const h of habitosAtivos) {
    let cursor = inicio;
    while (cursor <= fim) {
      if (ehDiaDevido(cursor, h.frequencia)) {
        devidos++;
        if (historico[h.id]?.[cursor]) concluidos++;
      }
      cursor = proximoDiaISO(cursor);
    }
  }
  return devidos > 0 ? Math.round((concluidos / devidos) * 100) : 0;
}

export interface PontoSemanal {
  inicioSemana: string;
  fimSemana: string;
  percentual: number;
}

/** Série das últimas N semanas com o % de hábitos completados em cada uma. */
export function serieSemanalHabitos(
  habitosAtivos: VidaHabito[],
  historico: HistoricoPorHabito,
  semanas: number = 6,
  referencia: Date = new Date()
): PontoSemanal[] {
  const pontos: PontoSemanal[] = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const ref = new Date(referencia);
    ref.setDate(ref.getDate() - i * 7);
    const { inicio, fim } = inicioFimSemana(ref);
    pontos.push({ inicioSemana: inicio, fimSemana: fim, percentual: percentualHabitosPeriodo(habitosAtivos, historico, inicio, fim) });
  }
  return pontos;
}

export interface HabitoComStreak {
  habito: VidaHabito;
  streak: number;
}

export function habitoComMaiorStreak(habitosComStreak: HabitoComStreak[]): HabitoComStreak | null {
  const comStreak = habitosComStreak.filter((h) => h.streak > 0);
  if (comStreak.length === 0) return null;
  return comStreak.reduce((melhor, atual) => (atual.streak > melhor.streak ? atual : melhor));
}

/** Conta quantas marcações "concluído" existem num intervalo, somando todos os hábitos. */
export function contarConclusoes(historico: HistoricoPorHabito, inicio: string, fim: string): number {
  let total = 0;
  for (const porData of Object.values(historico)) {
    for (const [data, concluido] of Object.entries(porData)) {
      if (concluido && data >= inicio && data <= fim) total++;
    }
  }
  return total;
}

/** Janela do mês anterior limitada ao mesmo número de dias já passados neste mês, para comparação justa. */
export function janelaComparavelMesAnterior(referencia: Date = new Date()): { inicio: string; fim: string } {
  const anterior = mesAnterior(referencia);
  const diaAtual = referencia.getDate();
  const ultimoDiaMesAnterior = new Date(anterior.getFullYear(), anterior.getMonth() + 1, 0).getDate();
  const diaClamp = Math.min(diaAtual, ultimoDiaMesAnterior);
  return {
    inicio: toISODate(new Date(anterior.getFullYear(), anterior.getMonth(), 1)),
    fim: toISODate(new Date(anterior.getFullYear(), anterior.getMonth(), diaClamp)),
  };
}

export interface ProgressoMetas {
  concluidas: number;
  total: number;
  percentual: number;
}

/** % de metas com prazo neste mês que já foram concluídas. */
export function percentualMetasMes(metas: VidaMeta[], inicioMes: string, fimMes: string): ProgressoMetas {
  const doMes = metas.filter((m) => m.prazo && m.prazo >= inicioMes && m.prazo <= fimMes);
  const concluidas = doMes.filter((m) => m.concluida).length;
  const total = doMes.length;
  return { concluidas, total, percentual: total > 0 ? Math.round((concluidas / total) * 100) : 0 };
}

export type EstadoDiaGrade = "completo" | "nao_completo" | "fora_frequencia";

export interface DiaGrade {
  data: string;
  estado: EstadoDiaGrade;
}

/**
 * Grade estilo "GitHub contributions" de um hábito: `semanas` semanas (segunda a
 * domingo), cada uma com 7 dias, terminando na semana de hoje. Dias fora da
 * frequência do hábito (ex: fim de semana num hábito "dias úteis") ou no futuro
 * ficam como "fora_frequencia".
 */
export function gradeContribuicao(
  frequencia: FrequenciaHabito,
  historicoDoHabito: Record<string, boolean>,
  semanas: number = 4,
  hoje: string = hojeISO()
): DiaGrade[][] {
  const [ano, mes, dia] = hoje.split("-").map(Number);
  const dataHoje = new Date(ano, mes - 1, dia);
  const diaSemana = dataHoje.getDay(); // 0 = domingo
  const offsetSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
  const primeiraSegunda = new Date(dataHoje);
  primeiraSegunda.setDate(dataHoje.getDate() - offsetSegunda - (semanas - 1) * 7);

  const grade: DiaGrade[][] = [];
  for (let s = 0; s < semanas; s++) {
    const semanaAtual: DiaGrade[] = [];
    for (let d = 0; d < 7; d++) {
      const data = new Date(primeiraSegunda);
      data.setDate(primeiraSegunda.getDate() + s * 7 + d);
      const dataISO = toISODate(data);

      let estado: EstadoDiaGrade;
      if (dataISO > hoje || !ehDiaDevido(dataISO, frequencia)) {
        estado = "fora_frequencia";
      } else if (historicoDoHabito[dataISO] === true) {
        estado = "completo";
      } else {
        estado = "nao_completo";
      }
      semanaAtual.push({ data: dataISO, estado });
    }
    grade.push(semanaAtual);
  }
  return grade;
}

export interface ProgressoMeta {
  percentual: number;
  vencida: boolean;
}

/**
 * Progresso visual de uma meta: 100% (verde) se concluída, 100% (vermelho) se o
 * prazo já passou sem conclusão, ou o % do tempo decorrido entre a criação e o
 * prazo caso contrário (a meta não tem um campo de progresso próprio).
 */
export function progressoMeta(meta: VidaMeta, hoje: string = hojeISO()): ProgressoMeta {
  if (meta.concluida) return { percentual: 100, vencida: false };
  if (!meta.prazo) return { percentual: 0, vencida: false };
  if (meta.prazo < hoje) return { percentual: 100, vencida: true };

  const inicio = new Date(meta.criado_em).getTime();
  const fim = new Date(`${meta.prazo}T00:00:00`).getTime();
  const agora = Date.now();
  const percentual = fim > inicio ? Math.round(((agora - inicio) / (fim - inicio)) * 100) : 0;
  return { percentual: Math.min(100, Math.max(0, percentual)), vencida: false };
}

/** Sequência de dias seguidos com pelo menos uma pergunta do diário respondida. */
export function streakDiario(datasComEntrada: Set<string>, hoje: string = hojeISO()): number {
  let streak = 0;
  let cursor = hoje;
  let seguranca = 0;

  while (seguranca < 3650) {
    seguranca++;
    const feito = datasComEntrada.has(cursor);
    if (cursor === hoje && !feito) {
      // hoje ainda não foi preenchido — não quebra a sequência, só não conta ainda
    } else if (feito) {
      streak++;
    } else {
      break;
    }
    cursor = diaAnteriorISO(cursor);
  }
  return streak;
}

export interface DiasPerfeitosSemana {
  perfeitos: number;
  totalDias: number;
  completa: boolean;
}

/**
 * Quantos dos últimos 7 dias (incluindo hoje) tiveram 100% dos hábitos devidos
 * completados — usado no mini-badge "Semana X/7 perfeita" do dashboard.
 * Dias sem nenhum hábito devido não contam nem a favor nem contra.
 */
export function diasPerfeitosSemana(
  habitosAtivos: VidaHabito[],
  historico: HistoricoPorHabito,
  hoje: string = hojeISO()
): DiasPerfeitosSemana {
  let perfeitos = 0;
  let totalDias = 0;
  let cursor = hoje;
  for (let i = 0; i < 7; i++) {
    let devidos = 0;
    let concluidos = 0;
    for (const h of habitosAtivos) {
      if (ehDiaDevido(cursor, h.frequencia)) {
        devidos++;
        if (historico[h.id]?.[cursor]) concluidos++;
      }
    }
    if (devidos > 0) {
      totalDias++;
      if (concluidos === devidos) perfeitos++;
    }
    cursor = diaAnteriorISO(cursor);
  }
  return { perfeitos, totalDias, completa: totalDias > 0 && perfeitos === totalDias };
}

export function passouDoHorario(horario: string, agora: Date = new Date()): boolean {
  const [h, m] = horario.split(":").map(Number);
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  return minutosAgora >= h * 60 + (m || 0);
}

export function ehSegunda(agora: Date = new Date()): boolean {
  return agora.getDay() === 1;
}
