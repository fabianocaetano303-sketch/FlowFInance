import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import DonutProgress from "@/components/DonutProgress";
import MetaDoDiaCard from "@/components/MetaDoDiaCard";
import {
  getAnalisesSemanais,
  getConfiguracoes,
  getDiarioHoje,
  getGanhosPeriodo,
  getGastosPeriodo,
  getHabitos,
  getHabitosHistorico,
  getUsuarioAtual,
} from "@/lib/queries";
import {
  formatarMoeda,
  hojeISO,
  inicioFimMes,
  inicioFimSemana,
  progressoMetaDia,
  projecaoMes,
  somaValores,
  toISODate,
} from "@/lib/financas";
import { diasPerfeitosSemana, resumoHabitosHoje } from "@/lib/vida";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const hoje = hojeISO();
  const { inicio: inicioMes } = inicioFimMes();
  const { inicio: inicioSemana, fim: fimSemana } = inicioFimSemana();
  const inicio7Dias = toISODate(new Date(Date.now() - 6 * 86400000));

  const [config, ganhos, gastos, ganhosMesAteHoje, habitos, diarioHoje, analises] = await Promise.all([
    getConfiguracoes(usuario.id),
    getGanhosPeriodo(usuario.id, hoje, hoje),
    getGastosPeriodo(usuario.id, hoje, hoje),
    getGanhosPeriodo(usuario.id, inicioMes, hoje),
    getHabitos(usuario.id),
    getDiarioHoje(usuario.id, hoje),
    getAnalisesSemanais(usuario.id),
  ]);

  const totalGanhos = somaValores(ganhos);
  const totalGastos = somaValores(gastos);
  const sobrou = totalGanhos - totalGastos;
  const projecao = projecaoMes(ganhosMesAteHoje);
  const metaDia = progressoMetaDia(totalGanhos, Number(config.meta_diaria));

  const habitosAtivos = habitos.filter((h) => h.ativo);
  const historico7Dias = await getHabitosHistorico(
    habitosAtivos.map((h) => h.id),
    inicio7Dias,
    hoje
  );
  const historicoHoje: Record<string, boolean> = {};
  for (const h of habitosAtivos) historicoHoje[h.id] = historico7Dias[h.id]?.[hoje] === true;
  const resumoHabitos = resumoHabitosHoje(habitosAtivos, historicoHoje, hoje);
  const semana = diasPerfeitosSemana(habitosAtivos, historico7Dias, hoje);

  const analiseEmDia = analises.some((a) => a.data >= inicioSemana && a.data <= fimSemana);

  const nomeUsuario = usuario.email?.split("@")[0] ?? "Usuário";

  return (
    <>
      <Header titulo={capitalize(nomeUsuario)} />

      <div className="px-4 pt-4 space-y-4">
        <MetaDoDiaCard progresso={metaDia} />

        {semana.totalDias > 0 && (
          <Link
            href="/vida/progresso"
            className={`card !p-3 flex items-center justify-center gap-2 text-sm font-medium ${
              semana.completa ? "border-accent/50 bg-accent/5 text-accent" : "text-on-surface-variant"
            }`}
          >
            {semana.completa ? "🏆" : "🔥"} Semana {semana.perfeitos}/{semana.totalDias} perfeita
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/registrar?tipo=ganho"
            className="btn-success flex items-center justify-center gap-2 py-3.5"
          >
            <span className="text-lg leading-none">+</span> Ganho
          </Link>
          <Link
            href="/registrar?tipo=gasto"
            className="btn-danger flex items-center justify-center gap-2 py-3.5"
          >
            <span className="text-lg leading-none">−</span> Gasto
          </Link>
        </div>

        <div className="card !p-5">
          <p className="label-field !mb-1">Ganho do dia</p>
          <p className="text-2xl font-semibold text-secondary tnum">{formatarMoeda(totalGanhos)}</p>
        </div>

        <div className="card !p-5">
          <p className="label-field !mb-1">Gastos do dia</p>
          <p className="text-2xl font-semibold text-tertiary tnum">{formatarMoeda(totalGastos)}</p>
        </div>

        <div className="card !p-5">
          <p className="label-field !mb-1">Sobrou no dia</p>
          <p className={`text-2xl font-semibold tnum ${sobrou >= 0 ? "text-secondary" : "text-tertiary"}`}>
            {formatarMoeda(sobrou)}
          </p>
        </div>

        <div className="card !p-5">
          <p className="label-field !mb-1">Projeção do mês</p>
          <p className="text-2xl font-semibold text-on-surface tnum">{formatarMoeda(projecao.projecao)}</p>
          <p className="text-xs text-on-surface-variant mt-1 tnum">
            Se continuar assim, terá {formatarMoeda(projecao.projecao)} até {diaMesCurto(projecao.dataFinalMes)}
          </p>
        </div>

        <Link href="/vida" className="card !p-4 flex items-center gap-4">
          <DonutProgress
            percentual={resumoHabitos.devidos > 0 ? Math.round((resumoHabitos.concluidos / resumoHabitos.devidos) * 100) : 0}
            tamanho={44}
            espessura={5}
          />
          <div className="flex-1 min-w-0 text-sm text-on-surface-variant">
            <span className="text-on-surface font-medium">
              Hábitos {resumoHabitos.concluidos}/{resumoHabitos.devidos}
            </span>
            {" · "}
            Diário: {diarioHoje ? "✓" : "✗"}
            {" · "}
            Análise: {analiseEmDia ? "em dia" : "pendente"}
          </div>
        </Link>
      </div>
    </>
  );
}

function capitalize(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function diaMesCurto(dataISO: string): string {
  const [, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}`;
}
