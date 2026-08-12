import { redirect } from "next/navigation";
import { getDividas, getUsuarioAtual } from "@/lib/queries";
import { formatarMoeda, resumoDividas } from "@/lib/financas";
import DividasList from "@/components/DividasList";

export const dynamic = "force-dynamic";

export default async function DividasPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const dividas = await getDividas(usuario.id);
  const resumo = resumoDividas(dividas);

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold text-on-surface">FinanceFlow</span>
        </div>
        <h1 className="text-xl font-semibold text-on-surface mt-3">Dívidas</h1>
        <p className="text-sm text-on-surface-variant">Gerencie e acompanhe seus compromissos financeiros</p>
      </header>

      <div className="px-4 pt-2">
        <div className="card !p-5 grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-on-surface-variant">Total Dívidas</p>
            <p className="font-semibold text-on-surface tnum">{formatarMoeda(resumo.total)}</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Já Separado</p>
            <p className="font-semibold text-secondary tnum">{formatarMoeda(resumo.separado)}</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Falta Pagar</p>
            <p className="font-semibold text-tertiary tnum">{formatarMoeda(resumo.falta)}</p>
          </div>
        </div>
      </div>

      <DividasList dividasIniciais={dividas} />
    </>
  );
}
