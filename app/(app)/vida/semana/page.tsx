import { redirect } from "next/navigation";
import VidaSubNav from "@/components/VidaSubNav";
import VidaMantra from "@/components/VidaMantra";
import AnaliseSemanalForm from "@/components/AnaliseSemanalForm";
import TendenciaLinha from "@/components/TendenciaLinha";
import { getAnalisesSemanais, getProposito, getUsuarioAtual } from "@/lib/queries";
import { formatarData } from "@/lib/financas";

export const dynamic = "force-dynamic";

export default async function AnaliseSemanalPage() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const [proposito, analises] = await Promise.all([getProposito(usuario.id), getAnalisesSemanais(usuario.id)]);

  const ultimaAnalise = analises[0] ?? null;
  const ultimas4 = [...analises]
    .slice(0, 4)
    .reverse()
    .map((a) => {
      const [, mes, dia] = a.data.split("-");
      return { label: `${dia}/${mes}`, valor: a.nota_disciplina };
    });

  return (
    <>
      <header className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="titulo-secao">Análise da Semana</h1>
        <p className="text-sm text-on-surface-variant">Disponível quando quiser preencher</p>
      </header>

      <div className="pt-2">
        <VidaSubNav />
      </div>

      <div className="px-4 pt-3 space-y-6">
        <VidaMantra motivo={proposito.motivo} />

        <div className="card !p-6 text-center animate-fade-in">
          <p className="text-sm text-on-surface-variant mb-1">
            {ultimaAnalise ? `Semana de ${formatarData(ultimaAnalise.data)}` : "Nenhuma análise ainda"}
          </p>
          {ultimaAnalise?.nota_disciplina != null ? (
            <>
              <p className="number-hero">{ultimaAnalise.nota_disciplina}/10</p>
              <p className="number-label">Sua nota de disciplina</p>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant py-4">Preencha a análise abaixo para começar a acompanhar.</p>
          )}
        </div>

        {ultimas4.length >= 2 && (
          <div className="card !p-5">
            <p className="text-sm font-semibold text-on-surface mb-2">Tendência — últimas {ultimas4.length} semanas</p>
            <TendenciaLinha pontos={ultimas4} />
          </div>
        )}

        <AnaliseSemanalForm />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-on-surface">Histórico</p>
          {analises.length === 0 ? (
            <div className="card text-center text-sm text-on-surface-variant">Nenhuma análise registrada ainda.</div>
          ) : (
            <div className="space-y-2">
              {analises.map((a) => (
                <div key={a.id} className="card !p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-on-surface-variant tnum">{formatarData(a.data)}</p>
                    {a.nota_disciplina !== null && (
                      <span className="text-xs font-semibold text-accent tnum">Disciplina: {a.nota_disciplina}/10</span>
                    )}
                  </div>
                  {a.bateu_metas !== null && (
                    <p className="text-sm text-on-surface">
                      Bateu as metas: <span className="font-medium">{a.bateu_metas ? "Sim" : "Não"}</span>
                    </p>
                  )}
                  {a.maior_obstaculo && (
                    <p className="text-sm text-on-surface">
                      <span className="text-on-surface-variant">Obstáculo: </span>
                      {a.maior_obstaculo}
                    </p>
                  )}
                  {a.acoes_proxima_semana && (
                    <p className="text-sm text-on-surface">
                      <span className="text-on-surface-variant">Próxima semana: </span>
                      {a.acoes_proxima_semana}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
