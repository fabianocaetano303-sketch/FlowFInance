import { redirect } from "next/navigation";
import VidaSubNav from "@/components/VidaSubNav";
import PropositoForm from "@/components/PropositoForm";
import MetasList from "@/components/MetasList";
import { getMetas, getProposito, getUsuarioAtual } from "@/lib/queries";
import { inicioFimMes } from "@/lib/financas";
import { percentualMetasMes } from "@/lib/vida";

export const dynamic = "force-dynamic";

export default async function PropositoPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const { inicio, fim } = inicioFimMes();
  const [proposito, metas] = await Promise.all([getProposito(usuario.id), getMetas(usuario.id)]);
  const progresso = percentualMetasMes(metas, inicio, fim);

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-on-surface">Propósito e Metas</h1>
        <p className="text-sm text-on-surface-variant">Por que você está fazendo essa mudança</p>
      </header>

      <div className="pt-2">
        <VidaSubNav />
      </div>

      <div className="px-4 pt-3 space-y-6">
        <PropositoForm proposito={proposito} />

        <div>
          <h2 className="text-base font-semibold text-on-surface mb-3">Metas</h2>
          <MetasList metas={metas} progresso={progresso} />
        </div>
      </div>
    </>
  );
}
