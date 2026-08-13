import { redirect } from "next/navigation";
import VidaSubNav from "@/components/VidaSubNav";
import VidaMantra from "@/components/VidaMantra";
import DiarioForm from "@/components/DiarioForm";
import DiarioTimeline from "@/components/DiarioTimeline";
import DiarioHistorico from "@/components/DiarioHistorico";
import { getDiarioEntradas, getDiarioHoje, getProposito, getUsuarioAtual } from "@/lib/queries";
import { diasAtras, hojeISO } from "@/lib/financas";

export const dynamic = "force-dynamic";

export default async function DiarioPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const hoje = hojeISO();
  const [proposito, entradaHoje, entradas] = await Promise.all([
    getProposito(usuario.id),
    getDiarioHoje(usuario.id, hoje),
    getDiarioEntradas(usuario.id, 30),
  ]);

  const ultimos7 = Array.from({ length: 7 }).map((_, i) => {
    const data = diasAtras(6 - i);
    const entrada = entradas.find((e) => e.data === data) ?? null;
    const respostas: [boolean, boolean, boolean] = [!!entrada?.bem, !!entrada?.melhorar, !!entrada?.acao_amanha];
    return { data, respostas, completo: respostas.every(Boolean) };
  });

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="titulo-secao">Diário</h1>
        <p className="text-sm text-on-surface-variant">Três perguntas, todo dia</p>
      </header>

      <div className="pt-2">
        <VidaSubNav />
      </div>

      <div className="px-4 pt-3 space-y-6">
        <VidaMantra motivo={proposito.motivo} />
        <DiarioForm entradaHoje={entradaHoje} />
        <DiarioTimeline dias={ultimos7} />
        <DiarioHistorico entradas={entradas} />
      </div>
    </>
  );
}
