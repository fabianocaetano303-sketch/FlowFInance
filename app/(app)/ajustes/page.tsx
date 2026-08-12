import { redirect } from "next/navigation";
import { getConfiguracoes, getNotificacoesPreferencias, getUsuarioAtual } from "@/lib/queries";
import AjustesForm from "@/components/AjustesForm";
import NotificacoesForm from "@/components/NotificacoesForm";
import InstalarAppCard from "@/components/InstalarAppCard";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const [configuracoes, preferenciasNotificacao] = await Promise.all([
    getConfiguracoes(usuario.id),
    getNotificacoesPreferencias(usuario.id),
  ]);

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-on-surface">Configurações</h1>
        <p className="text-sm text-on-surface-variant">Defina sua meta diária e orçamentos por categoria</p>
      </header>

      <div className="px-4 pt-4 space-y-4">
        <InstalarAppCard />
        <AjustesForm configuracoes={configuracoes} />
        <NotificacoesForm preferencias={preferenciasNotificacao} />

        <div className="text-center">
          <p className="text-xs text-on-surface-variant">Conectado como {usuario.email}</p>
        </div>
      </div>
    </>
  );
}
