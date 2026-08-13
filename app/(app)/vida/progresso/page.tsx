import { redirect } from "next/navigation";
import VidaSubNav from "@/components/VidaSubNav";
import VidaMantra from "@/components/VidaMantra";
import BarraProgresso from "@/components/BarraProgresso";
import BadgeConquista from "@/components/BadgeConquista";
import {
  getDiarioEntradas,
  getGastosPeriodo,
  getHabitos,
  getHabitosHistorico,
  getMetas,
  getProposito,
  getUsuarioAtual,
} from "@/lib/queries";
import { diasAtras, gastosDesnecessarios, hojeISO, inicioFimMes, mesAnterior } from "@/lib/financas";
import { janelaComparavelMesAnterior, percentualHabitosPeriodo, percentualMetasMes, streakDiario } from "@/lib/vida";

export const dynamic = "force-dynamic";

const JANELA_HISTORICO_DIAS = 200;
const JANELA_DIARIO_DIAS = 70;

interface Comparativo {
  atual: number;
  anterior: number;
}

function Seta({ atual, anterior }: Comparativo) {
  const delta = atual - anterior;
  if (delta === 0) return <span className="text-on-surface-variant">— estável</span>;
  const positivo = delta > 0;
  return (
    <span className={positivo ? "text-primary" : "text-tertiary"}>
      {positivo ? "↑" : "↓"} {positivo ? "+" : ""}
      {delta}pts
    </span>
  );
}

export default async function ProgressoGeralPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const hoje = hojeISO();
  const { inicio: inicioMes, fim: fimMes } = inicioFimMes();
  const inicioJanelaHabitos = diasAtras(JANELA_HISTORICO_DIAS);
  const inicioJanelaDiario = diasAtras(JANELA_DIARIO_DIAS);
  const janelaAnterior = janelaComparavelMesAnterior();
  const { inicio: inicioMesAnteriorCompleto, fim: fimMesAnteriorCompleto } = inicioFimMes(mesAnterior());
  const seteDiasAtras = diasAtras(6);

  const [proposito, habitos, metas, entradasDiario, gastosMes] = await Promise.all([
    getProposito(usuario.id),
    getHabitos(usuario.id),
    getMetas(usuario.id),
    getDiarioEntradas(usuario.id, JANELA_DIARIO_DIAS),
    getGastosPeriodo(usuario.id, inicioMes, fimMes),
  ]);

  const habitosAtivos = habitos.filter((h) => h.ativo);
  const historico = await getHabitosHistorico(
    habitosAtivos.map((h) => h.id),
    inicioJanelaHabitos,
    hoje
  );

  // --- Hábitos cumpridos ---
  const habitosPercentualAtual = percentualHabitosPeriodo(habitosAtivos, historico, inicioMes, hoje);
  const habitosPercentualAnterior = percentualHabitosPeriodo(habitosAtivos, historico, janelaAnterior.inicio, janelaAnterior.fim);

  // --- Metas no prazo ---
  const metasAtual = percentualMetasMes(metas, inicioMes, fimMes);
  const metasAnterior = percentualMetasMes(metas, inicioMesAnteriorCompleto, fimMesAnteriorCompleto);

  // --- Dias de reflexão ---
  const entradasNoMes = entradasDiario.filter((e) => e.data >= inicioMes && e.data <= hoje && (e.bem || e.melhorar || e.acao_amanha));
  const diaAtualDoMes = Number(hoje.split("-")[2]);
  const reflexaoAtualPercentual = diaAtualDoMes > 0 ? Math.round((entradasNoMes.length / diaAtualDoMes) * 100) : 0;

  const entradasMesAnterior = entradasDiario.filter(
    (e) => e.data >= janelaAnterior.inicio && e.data <= janelaAnterior.fim && (e.bem || e.melhorar || e.acao_amanha)
  );
  const diasJanelaAnterior =
    Math.round((new Date(janelaAnterior.fim).getTime() - new Date(janelaAnterior.inicio).getTime()) / 86400000) + 1;
  const reflexaoAnteriorPercentual = diasJanelaAnterior > 0 ? Math.round((entradasMesAnterior.length / diasJanelaAnterior) * 100) : 0;

  // --- Badges ---
  const semanaPerfeita = percentualHabitosPeriodo(habitosAtivos, historico, seteDiasAtras, hoje) === 100;

  const datasComEntrada = new Set(
    entradasDiario.filter((e) => e.bem || e.melhorar || e.acao_amanha).map((e) => e.data)
  );
  const streakReflexao = streakDiario(datasComEntrada, hoje);
  const reflexaoConsistente = streakReflexao >= 20;

  const idiotas = gastosDesnecessarios(gastosMes);
  const zeroDividaIdiota = gastosMes.length > 0 && idiotas.length === 0;

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="titulo-secao">Progresso Geral</h1>
        <p className="text-sm text-on-surface-variant">Resumo do mês e conquistas</p>
      </header>

      <div className="pt-2">
        <VidaSubNav />
      </div>

      <div className="px-4 pt-3 space-y-6">
        <VidaMantra motivo={proposito.motivo} />

        <section className="space-y-3">
          <div className="card !p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-on-surface">Hábitos cumpridos</p>
              <p className="text-lg font-bold text-on-surface tnum">{habitosPercentualAtual}%</p>
            </div>
            <BarraProgresso percentual={habitosPercentualAtual} cor="primary" />
          </div>

          <div className="card !p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-on-surface">Metas no prazo</p>
              <p className="text-lg font-bold text-on-surface tnum">
                {metasAtual.concluidas}/{metasAtual.total}
              </p>
            </div>
            <BarraProgresso percentual={metasAtual.percentual} cor="accent" />
          </div>

          <div className="card !p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-on-surface">Dias de reflexão</p>
              <p className="text-lg font-bold text-on-surface tnum">
                {entradasNoMes.length}/{diaAtualDoMes}
              </p>
            </div>
            <BarraProgresso percentual={reflexaoAtualPercentual} cor="warning" />
          </div>
        </section>

        <section className="card !p-5 space-y-3">
          <p className="text-sm font-semibold text-on-surface">Comparado ao mês passado</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Hábitos</span>
            <span className="tnum">
              {habitosPercentualAnterior}% → {habitosPercentualAtual}%{" "}
              <Seta atual={habitosPercentualAtual} anterior={habitosPercentualAnterior} />
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Metas</span>
            <span className="tnum">
              {metasAnterior.concluidas}/{metasAnterior.total} → {metasAtual.concluidas}/{metasAtual.total}{" "}
              <Seta atual={metasAtual.percentual} anterior={metasAnterior.percentual} />
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Reflexão</span>
            <span className="tnum">
              {entradasMesAnterior.length}/{diasJanelaAnterior} → {entradasNoMes.length}/{diaAtualDoMes}{" "}
              <Seta atual={reflexaoAtualPercentual} anterior={reflexaoAnteriorPercentual} />
            </span>
          </div>
        </section>

        <section className="space-y-3">
          <p className="titulo-secao !text-base">Conquistas</p>
          <div className="space-y-2">
            <BadgeConquista
              icone="🏆"
              titulo="Semana perfeita"
              descricao="100% dos hábitos nos últimos 7 dias"
              ganho={semanaPerfeita}
              periodo={`${seteDiasAtras.split("-").reverse().slice(0, 2).join("/")} – hoje`}
            />
            <BadgeConquista
              icone="📖"
              titulo="Reflexão consistente"
              descricao="Diário preenchido 20 dias seguidos"
              ganho={reflexaoConsistente}
              periodo={`Streak atual: ${streakReflexao} dias`}
            />
            <BadgeConquista
              icone="💰"
              titulo="Zero dívida idiota"
              descricao="Nenhum gasto idiota este mês"
              ganho={zeroDividaIdiota}
              periodo="Este mês"
            />
          </div>
        </section>
      </div>
    </>
  );
}
