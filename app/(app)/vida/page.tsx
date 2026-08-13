import Link from "next/link";
import { redirect } from "next/navigation";
import VidaSubNav from "@/components/VidaSubNav";
import VidaMantra from "@/components/VidaMantra";
import SeuDiaResumo from "@/components/SeuDiaResumo";
import DonutProgress from "@/components/DonutProgress";
import BarraProgresso from "@/components/BarraProgresso";
import {
  getConfiguracoesVida,
  getDiarioHoje,
  getHabitos,
  getHabitosHistorico,
  getMetas,
  getProposito,
  getUsuarioAtual,
} from "@/lib/queries";
import { diasAtras, formatarData, hojeISO, inicioFimMes } from "@/lib/financas";
import {
  calcularStreak,
  contarConclusoes,
  ehDiaDevido,
  ehSegunda,
  habitoComMaiorStreak,
  janelaComparavelMesAnterior,
  passouDoHorario,
  percentualHabitosPeriodo,
  percentualMetasMes,
  progressoMeta,
  resumoHabitosHoje,
} from "@/lib/vida";

export const dynamic = "force-dynamic";

const JANELA_HISTORICO_DIAS = 200;

export default async function VidaDashboardPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const hoje = hojeISO();
  const { inicio: inicioMes, fim: fimMes } = inicioFimMes();
  const inicioJanela = diasAtras(JANELA_HISTORICO_DIAS);
  const janelaAnterior = janelaComparavelMesAnterior();

  const [proposito, metas, habitos, config, diarioHoje] = await Promise.all([
    getProposito(usuario.id),
    getMetas(usuario.id),
    getHabitos(usuario.id),
    getConfiguracoesVida(usuario.id),
    getDiarioHoje(usuario.id, hoje),
  ]);

  const habitosAtivos = habitos.filter((h) => h.ativo);
  const historico = await getHabitosHistorico(
    habitosAtivos.map((h) => h.id),
    inicioJanela,
    hoje
  );

  const historicoHoje: Record<string, boolean> = {};
  for (const h of habitosAtivos) historicoHoje[h.id] = historico[h.id]?.[hoje] === true;
  const resumoHoje = resumoHabitosHoje(habitosAtivos, historicoHoje, hoje);
  const itensHoje = habitosAtivos.map((h) => ({
    habito: h,
    devidoHoje: ehDiaDevido(hoje, h.frequencia),
    concluidoHoje: historicoHoje[h.id] === true,
  }));

  const habitosComStreak = habitosAtivos.map((h) => ({
    habito: h,
    streak: calcularStreak(historico[h.id] || {}, h.frequencia, hoje),
  }));
  const melhorHabito = habitoComMaiorStreak(habitosComStreak);

  const percentualHabitosMes = percentualHabitosPeriodo(habitosAtivos, historico, inicioMes, hoje);
  const progressoMetas = percentualMetasMes(metas, inicioMes, fimMes);

  const conclusoesMesAtual = contarConclusoes(historico, inicioMes, hoje);
  const conclusoesMesAnterior = contarConclusoes(historico, janelaAnterior.inicio, janelaAnterior.fim);
  const melhorQueMesPassado = conclusoesMesAtual > conclusoesMesAnterior;

  const faltamHabitos = resumoHoje.devidos - resumoHoje.concluidos;
  const horaDeRefletir = passouDoHorario(config.horario_reflexao) && !diarioHoje;
  const segunda = ehSegunda();

  const metasAtivas = metas.filter((m) => !m.concluida).slice(0, 5);

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="titulo-secao">Vida</h1>
        <p className="text-sm text-on-surface-variant">Propósito, metas, hábitos e reflexão</p>
      </header>

      <div className="pt-2">
        <VidaSubNav />
      </div>

      <div className="px-4 pt-3 space-y-5">
        <VidaMantra motivo={proposito.motivo} destaque />

        {(horaDeRefletir || segunda) && (
          <div className="space-y-2">
            {horaDeRefletir && (
              <div className="card !p-4 border-accent/40 bg-accent/5">
                <p className="text-sm font-medium text-accent">Hora de refletir sobre seu dia?</p>
              </div>
            )}
            {segunda && (
              <Link href="/vida/semana" className="block card !p-4 border-warning/40 bg-warning/5">
                <p className="text-sm font-medium text-warning">Análise semanal disponível →</p>
              </Link>
            )}
          </div>
        )}

        <section className="space-y-3">
          <SeuDiaResumo itens={itensHoje} />
        </section>

        <section className="space-y-3">
          <p className="titulo-secao !text-base">Progresso Visual</p>

          <div className="card !p-5">
            {melhorHabito ? (
              <>
                <p className="text-sm text-on-surface-variant mb-1">🔥 Melhor streak</p>
                <p className="number-hero">{melhorHabito.streak}</p>
                <p className="number-label">
                  {melhorHabito.habito.nome} · {melhorHabito.streak === 1 ? "1 dia" : `${melhorHabito.streak} dias`} seguidos
                </p>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant">Nenhum streak ativo ainda. Complete um hábito hoje.</p>
            )}
          </div>

          <div className="card !p-5 flex items-center gap-5">
            <DonutProgress percentual={percentualHabitosMes} tamanho={100} label="hábitos no mês" />
            <div>
              <p className="text-sm font-medium text-on-surface">Hábitos completados</p>
              <p className="text-xs text-on-surface-variant mt-1">neste mês, considerando só os dias devidos de cada hábito</p>
            </div>
          </div>

          <div className="card !p-5">
            <p className="label-field !mb-1">Comparado ao mês passado</p>
            <p className="text-base text-on-surface">
              Completou mais hábitos?{" "}
              <span className={`font-semibold ${melhorQueMesPassado ? "text-primary" : "text-tertiary"}`}>
                {melhorQueMesPassado ? "Sim" : "Não"}
              </span>
            </p>
            <p className="text-xs text-on-surface-variant mt-1 tnum">
              {conclusoesMesAtual} este mês vs {conclusoesMesAnterior} no mesmo período do mês passado
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="titulo-secao !text-base">Metas</p>
            <Link href="/vida/proposito" className="text-xs font-medium text-accent hover:underline">
              Ver todas →
            </Link>
          </div>

          <div className="card !p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-on-surface-variant">Metas do mês</p>
              <p className="text-sm font-semibold text-on-surface tnum">
                {progressoMetas.concluidas}/{progressoMetas.total}
              </p>
            </div>
            <BarraProgresso percentual={progressoMetas.percentual} cor="accent" />
          </div>

          {metasAtivas.length === 0 ? (
            <div className="card text-center text-sm text-on-surface-variant">Nenhuma meta em aberto.</div>
          ) : (
            <div className="space-y-2">
              {metasAtivas.map((meta) => {
                const progresso = progressoMeta(meta, hoje);
                return (
                  <div key={meta.id} className="card !p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-on-surface">{meta.titulo}</p>
                      <span
                        className={`text-xs font-semibold tnum ${progresso.vencida ? "text-tertiary" : "text-on-surface"}`}
                      >
                        {progresso.vencida ? "Vencida" : `${progresso.percentual}%`}
                      </span>
                    </div>
                    <BarraProgresso percentual={progresso.percentual} cor={progresso.vencida ? "tertiary" : "primary"} altura="h-2" />
                    {meta.prazo && (
                      <p className="text-xs text-on-surface-variant mt-1.5 tnum">Prazo: {formatarData(meta.prazo)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
