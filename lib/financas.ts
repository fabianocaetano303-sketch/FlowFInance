import type { Divida, Gasto, Ganho, ConfiguracoesUsuario } from "@/lib/types";

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
}

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function hojeISO(): string {
  return toISODate(new Date());
}

export function toISODate(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function inicioFimMes(ref: Date = new Date()): { inicio: string; fim: string } {
  const inicio = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const fim = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { inicio: toISODate(inicio), fim: toISODate(fim) };
}

export function mesAnterior(ref: Date = new Date()): Date {
  return new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
}

export function inicioFimSemana(ref: Date = new Date()): { inicio: string; fim: string } {
  const diaSemana = ref.getDay(); // 0 = domingo
  const inicio = new Date(ref);
  inicio.setDate(ref.getDate() - diaSemana);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  return { inicio: toISODate(inicio), fim: toISODate(fim) };
}

export function noPeriodo<T extends { data: string }>(itens: T[], inicio: string, fim: string): T[] {
  return itens.filter((i) => i.data >= inicio && i.data <= fim);
}

export function somaValores(itens: { valor: number }[]): number {
  return itens.reduce((total, i) => total + Number(i.valor), 0);
}

export function mediaDiaria(ganhosDoMes: Ganho[], dataReferencia: Date = new Date()): number {
  const totalGanhos = somaValores(ganhosDoMes);
  const diaAtual = dataReferencia.getDate();
  return diaAtual > 0 ? totalGanhos / diaAtual : 0;
}

export interface ProjecaoMes {
  mediaDiaria: number;
  diaAtual: number;
  diasNoMes: number;
  projecao: number;
  dataFinalMes: string;
}

/**
 * Projeta o total de ganhos do mês com base na média diária até hoje:
 * projecao = (soma dos ganhos do mês até hoje / dia atual) * dias no mês.
 */
export function projecaoMes(ganhosMes: Ganho[], dataReferencia: Date = new Date()): ProjecaoMes {
  const diaAtual = dataReferencia.getDate();
  const diasNoMes = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() + 1, 0).getDate();
  const media = diaAtual > 0 ? somaValores(ganhosMes) / diaAtual : 0;
  const dataFinalMes = toISODate(new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), diasNoMes));
  return { mediaDiaria: media, diaAtual, diasNoMes, projecao: media * diasNoMes, dataFinalMes };
}

export interface ComparativoMensal {
  ganhosAtual: number;
  ganhosAnterior: number;
  gastosAtual: number;
  gastosAnterior: number;
  variacaoGanhos: number | null;
  variacaoGastos: number | null;
  scoreEficiencia: number;
}

/**
 * Compara ganhos/gastos do mês atual com o mês anterior (% de variação) e calcula
 * um score de eficiência (0-10) baseado na taxa de economia do mês atual
 * (quanto sobra em relação ao que foi ganho).
 */
export function comparativoMensal(
  ganhosMesAtual: Ganho[],
  gastosMesAtual: Gasto[],
  ganhosMesAnterior: Ganho[],
  gastosMesAnterior: Gasto[]
): ComparativoMensal {
  const totalGanhosAtual = somaValores(ganhosMesAtual);
  const totalGastosAtual = somaValores(gastosMesAtual);
  const totalGanhosAnterior = somaValores(ganhosMesAnterior);
  const totalGastosAnterior = somaValores(gastosMesAnterior);

  const variacaoGanhos =
    totalGanhosAnterior > 0 ? ((totalGanhosAtual - totalGanhosAnterior) / totalGanhosAnterior) * 100 : null;
  const variacaoGastos =
    totalGastosAnterior > 0 ? ((totalGastosAtual - totalGastosAnterior) / totalGastosAnterior) * 100 : null;

  const taxaEconomia =
    totalGanhosAtual > 0 ? Math.max(0, Math.min(1, (totalGanhosAtual - totalGastosAtual) / totalGanhosAtual)) : 0;

  return {
    ganhosAtual: totalGanhosAtual,
    ganhosAnterior: totalGanhosAnterior,
    gastosAtual: totalGastosAtual,
    gastosAnterior: totalGastosAnterior,
    variacaoGanhos,
    variacaoGastos,
    scoreEficiencia: Math.round(taxaEconomia * 10),
  };
}

export interface PontoDiario {
  dia: number;
  data: string;
  ganhos: number;
  gastos: number;
  saldoAcumulado: number;
}

/** Série dia-a-dia (ganhos, gastos e saldo acumulado) para os gráficos de barra/linha. */
export function serieDiaria(ganhosMes: Ganho[], gastosMes: Gasto[], inicio: string, fim: string): PontoDiario[] {
  const porDiaGanhos: Record<string, number> = {};
  for (const g of ganhosMes) porDiaGanhos[g.data] = (porDiaGanhos[g.data] || 0) + Number(g.valor);
  const porDiaGastos: Record<string, number> = {};
  for (const g of gastosMes) porDiaGastos[g.data] = (porDiaGastos[g.data] || 0) + Number(g.valor);

  const pontos: PontoDiario[] = [];
  let acumulado = 0;
  let cursor = inicio;
  while (cursor <= fim) {
    const ganhos = porDiaGanhos[cursor] || 0;
    const gastos = porDiaGastos[cursor] || 0;
    acumulado += ganhos - gastos;
    const dia = Number(cursor.split("-")[2]);
    pontos.push({ dia, data: cursor, ganhos, gastos, saldoAcumulado: acumulado });
    cursor = proximoDiaISO(cursor);
  }
  return pontos;
}

function proximoDiaISO(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return toISODate(new Date(ano, mes - 1, dia + 1));
}

export interface FaltaParaContas {
  gap: number;
  orcamentoContas: number;
  saldoMes: number;
}

/**
 * Falta_para_Contas = Orcamento_Contas - (Ganhos_Mes - Gastos_Mes)
 * Quanto falta ganhar para cobrir as contas do mês (dívidas têm seção própria).
 */
export function faltaParaContas(
  ganhosDoMes: Ganho[],
  gastosDoMes: Gasto[],
  config: Pick<ConfiguracoesUsuario, "orcamento_contas">
): FaltaParaContas {
  const orcamentoContas = Number(config.orcamento_contas || 0);
  const saldoMes = somaValores(ganhosDoMes) - somaValores(gastosDoMes);
  const gap = Math.max(0, orcamentoContas - saldoMes);
  return { gap, orcamentoContas, saldoMes };
}

export interface ProgressoMetaDia {
  meta: number;
  ganhoHoje: number;
  falta: number;
  percentual: number;
  faixa: "atingida" | "perto" | "longe";
}

/**
 * Progresso da meta diária de ganho: "atingida" quando ganhoHoje >= meta,
 * "perto" quando falta menos de 20% da meta, "longe" caso contrário.
 */
export function progressoMetaDia(ganhoHoje: number, meta: number): ProgressoMetaDia {
  const falta = Math.max(0, meta - ganhoHoje);
  const percentual = meta > 0 ? Math.min(100, Math.round((ganhoHoje / meta) * 100)) : 0;
  const faixa: ProgressoMetaDia["faixa"] = falta <= 0 ? "atingida" : falta < meta * 0.2 ? "perto" : "longe";
  return { meta, ganhoHoje, falta, percentual, faixa };
}

export type NivelUrgenciaDivida = "vencida" | "hoje" | "amanha" | "proxima" | "em_dia";

export interface UrgenciaDivida {
  nivel: NivelUrgenciaDivida;
  diasRestantes: number | null;
  label: string | null;
}

/**
 * Classifica a urgência de uma dívida pelo prazo de vencimento, para exibir
 * badge e ordenar a lista (mais urgentes primeiro). Sem prazo cadastrado, ou
 * faltando mais de 7 dias, não há badge (label null).
 */
export function urgenciaDivida(prazoVencimento: string | null, hoje: string = hojeISO()): UrgenciaDivida {
  if (!prazoVencimento) return { nivel: "em_dia", diasRestantes: null, label: null };

  const dias = diferencaDias(hoje, prazoVencimento);

  if (dias < 0) return { nivel: "vencida", diasRestantes: dias, label: `VENCIDA HÁ ${Math.abs(dias)} DIA${Math.abs(dias) === 1 ? "" : "S"}` };
  if (dias === 0) return { nivel: "hoje", diasRestantes: dias, label: "VENCE HOJE" };
  if (dias === 1) return { nivel: "amanha", diasRestantes: dias, label: "VENCE AMANHÃ" };
  if (dias <= 7) return { nivel: "proxima", diasRestantes: dias, label: `VENCE EM ${dias} DIAS` };
  return { nivel: "em_dia", diasRestantes: dias, label: null };
}

export interface ResumoDividas {
  total: number;
  separado: number;
  falta: number;
}

/**
 * Resumo das dívidas ativas para a página "Dívidas": total devido, quanto já foi
 * separado (guardado, ainda não pago) e quanto falta pagar. O valor separado só é
 * de fato abatido do total quando a dívida é marcada como paga — até lá, "falta"
 * reflete só valor_total - valor_pago.
 */
export function resumoDividas(dividas: Divida[]): ResumoDividas {
  const ativas = dividas.filter((d) => d.status === "aberta");
  return ativas.reduce(
    (resumo, d) => ({
      total: resumo.total + Number(d.valor_total),
      separado: resumo.separado + Number(d.valor_separado),
      falta: resumo.falta + valorFaltanteDivida(d.valor_total, d.valor_pago),
    }),
    { total: 0, separado: 0, falta: 0 }
  );
}

export function gastosPorCategoria(gastos: Gasto[]): Record<string, number> {
  const mapa: Record<string, number> = {};
  for (const gasto of gastos) {
    mapa[gasto.categoria] = (mapa[gasto.categoria] || 0) + Number(gasto.valor);
  }
  return mapa;
}

export function gastosDesnecessarios(gastos: Gasto[]): Gasto[] {
  return gastos.filter((g) => g.eh_desnecessario || g.categoria === "Gasto Idiota");
}

export interface AlertaOrcamento {
  categoria: string;
  gasto: number;
  limite: number;
  ultrapassou: number;
}

export function calcularAlertasOrcamento(
  gastos: Gasto[],
  config: Pick<ConfiguracoesUsuario, "orcamento_alimentacao" | "orcamento_higiene" | "orcamento_contas">
): AlertaOrcamento[] {
  const porCategoria = gastosPorCategoria(gastos);
  const orcamentos: { categoria: string; limite: number | null }[] = [
    { categoria: "Alimentação", limite: config.orcamento_alimentacao },
    { categoria: "Higiene", limite: config.orcamento_higiene },
    { categoria: "Contas", limite: config.orcamento_contas },
  ];

  const alertas: AlertaOrcamento[] = [];
  for (const { categoria, limite } of orcamentos) {
    if (limite == null) continue;
    const gasto = porCategoria[categoria] || 0;
    if (gasto > limite) {
      alertas.push({ categoria, gasto, limite: Number(limite), ultrapassou: gasto - Number(limite) });
    }
  }
  return alertas;
}

export function valorFaltanteDivida(valorTotal: number, valorPago: number): number {
  return Math.max(0, Number(valorTotal) - Number(valorPago));
}

export function proximoMes(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const data = new Date(ano, mes - 1 + 1, dia);
  return toISODate(data);
}

function diaClampadoNoMes(ano: number, mesIndex: number, dia: number): number {
  const ultimoDiaDoMes = new Date(ano, mesIndex + 1, 0).getDate();
  return Math.min(dia, ultimoDiaDoMes);
}

/**
 * Calcula a próxima data (YYYY-MM-DD) cujo dia do mês seja `diaRecorrencia`
 * (1-31, ajustado para o último dia em meses menores, ex: 31 em fevereiro vira 28/29).
 *
 * - estritamenteApos = false: aceita o próprio mês da referência se o dia ainda não passou
 *   (usado ao criar a dívida, para definir o primeiro vencimento).
 * - estritamenteApos = true: sempre avança para depois da referência, mesmo que o dia
 *   coincida (usado para renovar um ciclo já vencido, garantindo avanço para o próximo mês).
 */
export function proximaOcorrenciaDia(
  referenciaISO: string,
  diaRecorrencia: number,
  estritamenteApos = false
): string {
  const [ano, mes, dia] = referenciaISO.split("-").map(Number);
  const mesIndex = mes - 1;

  const diaClampEsteMes = diaClampadoNoMes(ano, mesIndex, diaRecorrencia);
  const candidatoEsteMes = new Date(ano, mesIndex, diaClampEsteMes);
  const dataReferencia = new Date(ano, mesIndex, dia);

  const valeEsteMes = estritamenteApos ? candidatoEsteMes > dataReferencia : candidatoEsteMes >= dataReferencia;
  if (valeEsteMes) {
    return toISODate(candidatoEsteMes);
  }

  const proximoMesIndex = mesIndex + 1;
  const anoAjustado = ano + Math.floor(proximoMesIndex / 12);
  const mesAjustado = ((proximoMesIndex % 12) + 12) % 12;
  const diaClampProximoMes = diaClampadoNoMes(anoAjustado, mesAjustado, diaRecorrencia);
  return toISODate(new Date(anoAjustado, mesAjustado, diaClampProximoMes));
}

// valor segue Date.getDay(): 0 = domingo ... 6 = sábado
export const DIAS_SEMANA: { valor: number; label: string }[] = [
  { valor: 1, label: "Segunda-feira" },
  { valor: 2, label: "Terça-feira" },
  { valor: 3, label: "Quarta-feira" },
  { valor: 4, label: "Quinta-feira" },
  { valor: 5, label: "Sexta-feira" },
  { valor: 6, label: "Sábado" },
  { valor: 0, label: "Domingo" },
];

export function diaDaSemana(dataISO: string): number {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return new Date(ano, mes - 1, dia).getDay();
}

export function diferencaDias(dataInicioISO: string, dataFimISO: string): number {
  const [a1, m1, d1] = dataInicioISO.split("-").map(Number);
  const [a2, m2, d2] = dataFimISO.split("-").map(Number);
  const inicio = new Date(a1, m1 - 1, d1);
  const fim = new Date(a2, m2 - 1, d2);
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.round((fim.getTime() - inicio.getTime()) / msPorDia);
}
