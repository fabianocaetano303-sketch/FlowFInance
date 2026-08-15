import { formatarData } from "@/lib/financas";
import type { DiaDiasSem } from "@/lib/diasSem";

export default function GradeDiasSem({ dias }: { dias: DiaDiasSem[] }) {
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {dias.map((dia) => (
        <div
          key={dia.data}
          title={`${formatarData(dia.data)} · ${dia.marcado ? "Marcado" : "Não marcado"}`}
          className={`aspect-square rounded-sm ${dia.marcado ? "bg-primary" : "bg-surface-container-high"}`}
        />
      ))}
    </div>
  );
}
