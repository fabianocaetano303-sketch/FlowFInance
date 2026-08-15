import { redirect } from "next/navigation";
import VidaSubNav from "@/components/VidaSubNav";
import VidaMantra from "@/components/VidaMantra";
import DiasSemList, { type RastreadorCompleto } from "@/components/DiasSemList";
import { getDiasSemAtivos, getDiasSemLogs, getProposito, getUsuarioAtual } from "@/lib/queries";
import { diasAtras, hojeISO } from "@/lib/financas";
import { JANELA_STREAK_DIAS, calcularStreakDiasSem, statusDiaSem, ultimos30DiasSem } from "@/lib/diasSem";

export const dynamic = "force-dynamic";

export default async function DiasSemPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const hoje = hojeISO();
  const [proposito, rastreadores] = await Promise.all([getProposito(usuario.id), getDiasSemAtivos(usuario.id)]);

  const logs = await getDiasSemLogs(
    rastreadores.map((r) => r.id),
    diasAtras(JANELA_STREAK_DIAS),
    hoje
  );

  const rastreadoresCompletos: RastreadorCompleto[] = rastreadores.map((rastreador) => {
    const logPorData = logs[rastreador.id] || {};
    return {
      rastreador,
      streak: calcularStreakDiasSem(logPorData, hoje),
      statusHoje: statusDiaSem(logPorData, hoje),
      temHistorico: Object.keys(logPorData).length > 0,
      grade: ultimos30DiasSem(logPorData, hoje),
    };
  });

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="titulo-secao">Dias Sem</h1>
        <p className="text-sm text-on-surface-variant">Rastreie o que você quer evitar, um dia de cada vez</p>
      </header>

      <div className="pt-2">
        <VidaSubNav />
      </div>

      <div className="px-4 pt-3 space-y-4">
        <VidaMantra motivo={proposito.motivo} />
        <DiasSemList rastreadores={rastreadoresCompletos} />
      </div>
    </>
  );
}
