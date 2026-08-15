import { redirect } from "next/navigation";
import SeletorDiaDetalhes from "@/components/SeletorDiaDetalhes";
import ResumoSaldoDia from "@/components/ResumoSaldoDia";
import DetalhesDiaList from "@/components/DetalhesDiaList";
import type { RegistroUnificado } from "@/components/RegistroCard";
import { getGanhosPeriodo, getGastosPeriodo, getUsuarioAtual } from "@/lib/queries";
import { formatarData, gastosPorCategoria, hojeISO, somaValores } from "@/lib/financas";

export const dynamic = "force-dynamic";

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default async function DetalhesDiaPage({ searchParams }: { searchParams: { data?: string } }) {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const data = searchParams.data && DATA_REGEX.test(searchParams.data) ? searchParams.data : hojeISO();

  const [ganhosRaw, gastosRaw] = await Promise.all([
    getGanhosPeriodo(usuario.id, data, data),
    getGastosPeriodo(usuario.id, data, data),
  ]);

  const totalGanhos = somaValores(ganhosRaw);
  const totalGastos = somaValores(gastosRaw);
  const sobrou = totalGanhos - totalGastos;
  const porCategoria = Object.entries(gastosPorCategoria(gastosRaw)).sort((a, b) => b[1] - a[1]);

  const ganhos: RegistroUnificado[] = ganhosRaw.map((g) => ({
    id: g.id,
    tipo: "ganho",
    valor: g.valor,
    descricao: g.descricao,
    data: g.data,
    criado_em: g.criado_em,
  }));

  const gastos: RegistroUnificado[] = gastosRaw.map((g) => ({
    id: g.id,
    tipo: "gasto",
    valor: g.valor,
    descricao: g.descricao,
    data: g.data,
    categoria: g.categoria,
    eh_desnecessario: g.eh_desnecessario,
    criado_em: g.criado_em,
  }));

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-on-surface">Detalhes do Dia</h1>
        <p className="text-sm text-on-surface-variant">Veja tudo que aconteceu num dia específico</p>
      </header>

      <div className="px-4 pt-3 space-y-5">
        <SeletorDiaDetalhes data={data} />

        <p className="text-sm font-semibold text-on-surface-variant tnum text-center">{formatarData(data)}</p>

        <ResumoSaldoDia totalGanhos={totalGanhos} totalGastos={totalGastos} saldo={sobrou} />

        <div>
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide px-1 mb-2">Detalhes</p>
          <DetalhesDiaList ganhos={ganhos} gastos={gastos} porCategoria={porCategoria} />
        </div>
      </div>
    </>
  );
}
