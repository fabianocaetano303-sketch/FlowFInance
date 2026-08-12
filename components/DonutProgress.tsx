function corPorFaixa(percentual: number): string {
  if (percentual > 80) return "#10B981";
  if (percentual >= 50) return "#F97316";
  return "#EF4444";
}

export default function DonutProgress({
  percentual,
  tamanho = 120,
  espessura = 10,
  label,
}: {
  percentual: number;
  tamanho?: number;
  espessura?: number;
  label?: string;
}) {
  const valor = Math.min(100, Math.max(0, percentual));
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia * (1 - valor / 100);
  const cor = corPorFaixa(valor);
  const fonteNumero = Math.max(10, Math.round(tamanho * 0.19));

  return (
    <div style={{ width: tamanho, height: tamanho }} className="relative shrink-0">
      <svg width={tamanho} height={tamanho} className="-rotate-90">
        <circle cx={tamanho / 2} cy={tamanho / 2} r={raio} stroke="#334155" strokeWidth={espessura} fill="none" />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke={cor}
          strokeWidth={espessura}
          fill="none"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold tnum leading-none" style={{ color: cor, fontSize: fonteNumero }}>
          {valor}%
        </span>
        {label && <span className="text-[10px] text-on-surface-variant mt-0.5 text-center px-2">{label}</span>}
      </div>
    </div>
  );
}
