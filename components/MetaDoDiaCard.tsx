import type { ProgressoMetaDia } from "@/lib/financas";
import { formatarMoeda } from "@/lib/financas";
import BarraProgresso from "@/components/BarraProgresso";

const ESTILO_FAIXA = {
  atingida: { texto: "text-primary", cor: "primary" as const, pulsa: false },
  perto: { texto: "text-warning", cor: "warning" as const, pulsa: false },
  longe: { texto: "text-tertiary", cor: "tertiary" as const, pulsa: true },
};

export default function MetaDoDiaCard({ progresso }: { progresso: ProgressoMetaDia }) {
  const estilo = ESTILO_FAIXA[progresso.faixa];

  return (
    <div className="card !p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="label-field !mb-0">Meta do Dia</p>
        <p className="text-xs text-on-surface-variant tnum">
          {formatarMoeda(progresso.ganhoHoje)} de {formatarMoeda(progresso.meta)}
        </p>
      </div>

      <p className={`text-[34px] leading-tight font-bold tnum ${estilo.texto} ${estilo.pulsa ? "animate-pulse-soft" : ""}`}>
        {progresso.faixa === "atingida" ? "✓ META ATINGIDA" : `Faltam ${formatarMoeda(progresso.falta)}`}
      </p>

      <div className="mt-3">
        <BarraProgresso percentual={progresso.percentual} cor={estilo.cor} altura="h-2.5" />
      </div>
    </div>
  );
}
