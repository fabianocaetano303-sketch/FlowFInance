import Link from "next/link";
import { redirect } from "next/navigation";
import PeriodoFiltro from "@/components/PeriodoFiltro";
import GastosFiltro from "@/components/GastosFiltro";
import GraficosRelatorio from "@/components/GraficosRelatorio";
import ExportarPdfButton from "@/components/ExportarPdfButton";
import { getConfiguracoes, getGanhosPeriodo, getGastosPeriodo, getUsuarioAtual } from "@/lib/queries";
import {
  calcularAlertasOrcamento,
  comparativoMensal,
  formatarMoeda,
  gastosDesnecessarios,
  gastosPorCategoria,
  inicioFimMes,
  inicioFimSemana,
  mesAnterior,
  serieDiaria,
  somaValores,
} from "@/lib/financas";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: { periodo?: string };
}) {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const periodo = searchParams.periodo === "semana" ? "semana" : "mes";
  const { inicio, fim } = periodo === "semana" ? inicioFimSemana() : inicioFimMes();
  const { inicio: inicioMes, fim: fimMes } = inicioFimMes();
  const { inicio: inicioMesAnterior, fim: fimMesAnterior } = inicioFimMes(mesAnterior());

  const [config, ganhos, gastos, ganhosMes, gastosMes, ganhosMesAnterior, gastosMesAnterior] = await Promise.all([
    getConfiguracoes(usuario.id),
    getGanhosPeriodo(usuario.id, inicio, fim),
    getGastosPeriodo(usuario.id, inicio, fim),
    getGanhosPeriodo(usuario.id, inicioMes, fimMes),
    getGastosPeriodo(usuario.id, inicioMes, fimMes),
    getGanhosPeriodo(usuario.id, inicioMesAnterior, fimMesAnterior),
    getGastosPeriodo(usuario.id, inicioMesAnterior, fimMesAnterior),
  ]);

  const totalGanhos = somaValores(ganhos);
  const totalGastos = somaValores(gastos);
  const saldo = totalGanhos - totalGastos;
  const porCategoria = Object.entries(gastosPorCategoria(gastos)).sort((a, b) => b[1] - a[1]);
  const alertas = calcularAlertasOrcamento(gastos, config);
  const idiotas = gastosDesnecessarios(gastos);
  const totalIdiotas = somaValores(idiotas);

  const porCategoriaMes = Object.entries(gastosPorCategoria(gastosMes)).sort((a, b) => b[1] - a[1]);
  const serie = serieDiaria(ganhosMes, gastosMes, inicioMes, fimMes);
  const comparativo = comparativoMensal(ganhosMes, gastosMes, ganhosMesAnterior, gastosMesAnterior);

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full space-y-3">
        <div>
          <h1 className="text-xl font-semibold text-on-surface">Relatório</h1>
          <p className="text-sm text-on-surface-variant">
            {periodo === "semana" ? "Semana atual" : "Mês atual"} · {formatarPeriodo(inicio)} a {formatarPeriodo(fim)}
          </p>
        </div>
        <ExportarPdfButton
          resumo={{
            periodoLabel: `${periodo === "semana" ? "Semana atual" : "Mês atual"} · ${formatarPeriodo(inicio)} a ${formatarPeriodo(fim)}`,
            ganhos: totalGanhos,
            gastos: totalGastos,
            saldo,
          }}
          porCategoria={porCategoria}
          graficosId="graficos-relatorio"
        />
      </header>

      <div className="px-4 pt-3 space-y-4">
        <div className="grid grid-cols-2 bg-surface-container-low rounded p-1">
          <Link
            href="/relatorios?periodo=semana"
            className={`text-center py-2.5 rounded text-sm font-medium transition-colors ${
              periodo === "semana" ? "bg-surface-container-highest text-on-surface shadow-sm" : "text-on-surface-variant"
            }`}
          >
            Semana
          </Link>
          <Link
            href="/relatorios?periodo=mes"
            className={`text-center py-2.5 rounded text-sm font-medium transition-colors ${
              periodo === "mes" ? "bg-surface-container-highest text-on-surface shadow-sm" : "text-on-surface-variant"
            }`}
          >
            Mês
          </Link>
        </div>

        <Link href="/meus-registros" className="card !p-4 flex items-center justify-between text-sm font-medium text-on-surface">
          Meus Registros
          <span className="text-primary">Editar e excluir →</span>
        </Link>

        <div className="card !p-5 space-y-3">
          <p className="text-sm font-semibold text-on-surface">Resumo</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Ganhos</span>
            <span className="font-semibold text-secondary tnum">{formatarMoeda(totalGanhos)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Gastos</span>
            <span className="font-semibold text-tertiary tnum">{formatarMoeda(totalGastos)}</span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-outline-variant">
            <span className="text-on-surface-variant">Saldo</span>
            <span className={`font-semibold tnum ${saldo >= 0 ? "text-secondary" : "text-tertiary"}`}>
              {formatarMoeda(saldo)}
            </span>
          </div>
        </div>

        <AnaliseFinanceira comparativo={comparativo} />

        {alertas.length > 0 && (
          <div className="card !p-5 space-y-3">
            <p className="text-sm font-semibold text-error">Orçamentos ultrapassados</p>
            {alertas.map((a) => (
              <div key={a.categoria} className="text-xs text-on-surface-variant">
                <p className="font-medium text-on-surface">{a.categoria}</p>
                <p className="tnum">
                  Gastou {formatarMoeda(a.gasto)}, limite era {formatarMoeda(a.limite)}, ultrapassou{" "}
                  <span className="text-error font-medium">{formatarMoeda(a.ultrapassou)}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="card !p-5 space-y-3">
          <p className="text-sm font-semibold text-on-surface">Gastos por categoria</p>
          {porCategoria.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Nenhum gasto no período.</p>
          ) : (
            <ul className="space-y-2.5">
              {porCategoria.map(([categoria, valor]) => (
                <li key={categoria} className="flex items-center justify-between text-sm">
                  <span className="text-on-surface">{categoria}</span>
                  <span className="font-medium text-on-surface tnum">{formatarMoeda(valor)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card !p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-tertiary">Gastos Idiotas</p>
            <p className="text-sm font-semibold text-tertiary tnum">{formatarMoeda(totalIdiotas)}</p>
          </div>
          {idiotas.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Nenhum gasto desnecessário no período.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {idiotas.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-on-surface">{g.descricao}</span>
                  <span className="font-medium text-on-surface tnum">{formatarMoeda(g.valor)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div id="graficos-relatorio">
          <GraficosRelatorio porCategoria={porCategoriaMes} serie={serie} />
        </div>

        <GastosFiltro />

        <PeriodoFiltro />
      </div>
    </>
  );
}

function AnaliseFinanceira({
  comparativo,
}: {
  comparativo: ReturnType<typeof comparativoMensal>;
}) {
  const { variacaoGanhos, variacaoGastos, scoreEficiencia } = comparativo;

  return (
    <div className="card !p-5 space-y-3">
      <p className="text-sm font-semibold text-on-surface">Análise Financeira</p>

      <p className="text-sm text-on-surface-variant">
        {variacaoGanhos === null ? (
          "Sem dados do mês anterior para comparar ganhos."
        ) : (
          <>
            Você ganhou{" "}
            <span className={`font-semibold ${variacaoGanhos >= 0 ? "text-secondary" : "text-tertiary"}`}>
              {Math.abs(variacaoGanhos).toFixed(0)}% {variacaoGanhos >= 0 ? "a mais" : "a menos"}
            </span>{" "}
            que o mês passado.
          </>
        )}
      </p>

      <p className="text-sm text-on-surface-variant">
        {variacaoGastos === null ? (
          "Sem dados do mês anterior para comparar gastos."
        ) : (
          <>
            Você gastou{" "}
            <span className={`font-semibold ${variacaoGastos <= 0 ? "text-secondary" : "text-tertiary"}`}>
              {Math.abs(variacaoGastos).toFixed(0)}% {variacaoGastos >= 0 ? "a mais" : "a menos"}
            </span>{" "}
            que o mês passado.
          </>
        )}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
        <span className="text-sm text-on-surface-variant">Score de eficiência</span>
        <span className="text-sm font-semibold text-on-surface tnum">
          {scoreEficiencia}/10 · {descricaoScore(scoreEficiencia)}
        </span>
      </div>
    </div>
  );
}

function descricaoScore(score: number): string {
  if (score >= 8) return "Excelente";
  if (score >= 5) return "Bom";
  if (score >= 3) return "Regular";
  return "Atenção";
}

function formatarPeriodo(dataISO: string): string {
  const [, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}`;
}
