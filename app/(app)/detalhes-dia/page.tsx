import { redirect } from "next/navigation";
import SeletorDiaDetalhes from "@/components/SeletorDiaDetalhes";
import DetalhesDiaList from "@/components/DetalhesDiaList";
import type { RegistroUnificado } from "@/components/RegistroCard";
import { getGanhosPeriodo, getGastosPeriodo, getUsuarioAtual } from "@/lib/queries";
import { formatarData, formatarMoeda, gastosPorCategoria, hojeISO, somaValores } from "@/lib/financas";

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

      <div className="px-4 pt-3 space-y-4">
        <SeletorDiaDetalhes data={data} />

        <div className="card !p-5">
          <p className="text-2xl font-bold text-on-surface tnum mb-4">{formatarData(data)}</p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wide mb-1">Ganho</p>
              <p className="text-base font-semibold text-primary tnum">{formatarMoeda(totalGanhos)}</p>
            </div>
            <div>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wide mb-1">Gasto</p>
              <p className="text-base font-semibold text-tertiary tnum">{formatarMoeda(totalGastos)}</p>
            </div>
            <div>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wide mb-1">Sobrou</p>
              <p className={`text-base font-semibold tnum ${sobrou >= 0 ? "text-primary" : "text-tertiary"}`}>
                {formatarMoeda(sobrou)}
              </p>
            </div>
          </div>
        </div>

        <DetalhesDiaList ganhos={ganhos} gastos={gastos} porCategoria={porCategoria} />
      </div>
    </>
  );
}
