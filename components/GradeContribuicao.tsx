import type { DiaGrade } from "@/lib/vida";
import { formatarData } from "@/lib/financas";

const LEGENDAS = ["S", "T", "Q", "Q", "S", "S", "D"];

export default function GradeContribuicao({ semanas }: { semanas: DiaGrade[][] }) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {LEGENDAS.map((l, i) => (
          <span key={i} className="text-[9px] text-on-surface-variant text-center">
            {l}
          </span>
        ))}
      </div>
      <div className="space-y-1.5">
        {semanas.map((semana, i) => (
          <div key={i} className="grid grid-cols-7 gap-1.5">
            {semana.map((dia) => (
              <div
                key={dia.data}
                title={`${formatarData(dia.data)} · ${
                  dia.estado === "completo" ? "Completo" : dia.estado === "nao_completo" ? "Não completado" : "Fora da frequência"
                }`}
                className={`aspect-square rounded-sm ${
                  dia.estado === "completo"
                    ? "bg-primary"
                    : dia.estado === "nao_completo"
                      ? "bg-surface-container-high"
                      : "border border-outline-variant"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
