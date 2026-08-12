import { redirect } from "next/navigation";
import VidaSubNav from "@/components/VidaSubNav";
import VidaMantra from "@/components/VidaMantra";
import VidaConfigForm from "@/components/VidaConfigForm";
import { getConfiguracoesVida, getProposito, getUsuarioAtual } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function VidaConfigPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const [proposito, config] = await Promise.all([getProposito(usuario.id), getConfiguracoesVida(usuario.id)]);

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-on-surface">Configurações da Vida</h1>
        <p className="text-sm text-on-surface-variant">Horários de lembrete e frases motivacionais</p>
      </header>

      <div className="pt-2">
        <VidaSubNav />
      </div>

      <div className="px-4 pt-3 space-y-4">
        <VidaMantra motivo={proposito.motivo} />
        <VidaConfigForm config={config} />
      </div>
    </>
  );
}
