import { redirect } from "next/navigation";
import { getGanhosTodos, getGastosTodos, getUsuarioAtual } from "@/lib/queries";
import MeusRegistrosList, { type RegistroUnificado } from "@/components/MeusRegistrosList";

export const dynamic = "force-dynamic";

export default async function MeusRegistrosPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const [ganhos, gastos] = await Promise.all([getGanhosTodos(usuario.id), getGastosTodos(usuario.id)]);

  const registros: RegistroUnificado[] = [
    ...ganhos.map((g) => ({ id: g.id, tipo: "ganho" as const, valor: g.valor, descricao: g.descricao, data: g.data })),
    ...gastos.map((g) => ({
      id: g.id,
      tipo: "gasto" as const,
      valor: g.valor,
      descricao: g.descricao,
      data: g.data,
      categoria: g.categoria,
      eh_desnecessario: g.eh_desnecessario,
    })),
  ].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-on-surface">Meus Registros</h1>
        <p className="text-sm text-on-surface-variant">Todos os ganhos e gastos — edite ou exclua quando precisar</p>
      </header>

      <div className="px-4 pt-3">
        <MeusRegistrosList registrosIniciais={registros} />
      </div>
    </>
  );
}
