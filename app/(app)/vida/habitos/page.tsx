import { redirect } from "next/navigation";
import VidaSubNav from "@/components/VidaSubNav";
import VidaMantra from "@/components/VidaMantra";
import HabitosHoje from "@/components/HabitosHoje";
import { getHabitos, getHabitosHistorico, getProposito, getUsuarioAtual } from "@/lib/queries";
import { diasAtras, hojeISO } from "@/lib/financas";
import { calcularStreak, ehDiaDevido, gradeContribuicao } from "@/lib/vida";

export const dynamic = "force-dynamic";

const JANELA_HISTORICO_DIAS = 200;

export default async function HabitosPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const hoje = hojeISO();
  const inicioJanela = diasAtras(JANELA_HISTORICO_DIAS);

  const [proposito, habitos] = await Promise.all([getProposito(usuario.id), getHabitos(usuario.id)]);
  const habitosAtivos = habitos.filter((h) => h.ativo);
  const historico = await getHabitosHistorico(
    habitosAtivos.map((h) => h.id),
    inicioJanela,
    hoje
  );

  const habitosHoje = habitosAtivos.map((h) => ({
    habito: h,
    devidoHoje: ehDiaDevido(hoje, h.frequencia),
    concluidoHoje: historico[h.id]?.[hoje] === true,
    streak: calcularStreak(historico[h.id] || {}, h.frequencia, hoje),
    grade: gradeContribuicao(h.frequencia, historico[h.id] || {}, 4, hoje),
  }));

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="titulo-secao">Hábitos</h1>
        <p className="text-sm text-on-surface-variant">Marque o que você completou hoje</p>
      </header>

      <div className="pt-2">
        <VidaSubNav />
      </div>

      <div className="px-4 pt-3 space-y-4">
        <VidaMantra motivo={proposito.motivo} />
        <HabitosHoje habitosHoje={habitosHoje} />
      </div>
    </>
  );
}
