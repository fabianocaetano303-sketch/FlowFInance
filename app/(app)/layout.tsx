import BottomNav from "@/components/BottomNav";
import NotificacoesAgendador from "@/components/NotificacoesAgendador";
import { getConfiguracoes, getHabitos, getHabitosHistorico, getNotificacoesPreferencias, getUsuarioAtual } from "@/lib/queries";
import { hojeISO } from "@/lib/financas";
import { resumoHabitosHoje } from "@/lib/vida";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioAtual();
  let habitosPendentes = 0;
  let preferenciasNotificacao = null;
  let metaDiaria = 0;

  if (usuario) {
    const hoje = hojeISO();
    const [habitos, config, preferencias] = await Promise.all([
      getHabitos(usuario.id),
      getConfiguracoes(usuario.id),
      getNotificacoesPreferencias(usuario.id),
    ]);
    const habitosAtivos = habitos.filter((h) => h.ativo);
    const historico = await getHabitosHistorico(
      habitosAtivos.map((h) => h.id),
      hoje,
      hoje
    );
    const historicoHoje: Record<string, boolean> = {};
    for (const habito of habitosAtivos) {
      historicoHoje[habito.id] = historico[habito.id]?.[hoje] === true;
    }
    const resumo = resumoHabitosHoje(habitosAtivos, historicoHoje, hoje);
    habitosPendentes = resumo.devidos - resumo.concluidos;
    preferenciasNotificacao = preferencias;
    metaDiaria = Number(config.meta_diaria);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto pb-24">{children}</div>
      <BottomNav habitosPendentes={habitosPendentes} />
      {usuario && preferenciasNotificacao && (
        <NotificacoesAgendador
          preferencias={preferenciasNotificacao}
          nome={usuario.email?.split("@")[0] ?? "Usuário"}
          metaDiaria={metaDiaria}
        />
      )}
    </div>
  );
}
