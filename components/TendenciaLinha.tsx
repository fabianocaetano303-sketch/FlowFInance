interface Ponto {
  label: string;
  valor: number | null;
}

export default function TendenciaLinha({ pontos, max = 10 }: { pontos: Ponto[]; max?: number }) {
  const largura = 320;
  const altura = 110;
  const padding = 24;
  const passoX = pontos.length > 1 ? (largura - padding * 2) / (pontos.length - 1) : 0;

  const coords = pontos.map((p, i) => ({
    x: padding + i * passoX,
    y: p.valor === null ? null : altura - padding - (p.valor / max) * (altura - padding * 2),
    valor: p.valor,
    label: p.label,
  }));

  return (
    <svg width="100%" viewBox={`0 0 ${largura} ${altura + 24}`} className="overflow-visible">
      {coords.slice(0, -1).map((ponto, i) => {
        const proximo = coords[i + 1];
        if (ponto.y === null || proximo.y === null) return null;
        return (
          <line
            key={i}
            x1={ponto.x}
            y1={ponto.y}
            x2={proximo.x}
            y2={proximo.y}
            stroke="#06B6D4"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
      {coords.map(
        (ponto, i) =>
          ponto.y !== null && (
            <g key={i}>
              <circle cx={ponto.x} cy={ponto.y} r={4} fill="#06B6D4" />
              <text x={ponto.x} y={ponto.y - 10} textAnchor="middle" fontSize={11} fontWeight={700} fill="#06B6D4">
                {ponto.valor}
              </text>
              <text x={ponto.x} y={altura + 16} textAnchor="middle" fontSize={9} fill="#94A3B8">
                {ponto.label}
              </text>
            </g>
          )
      )}
    </svg>
  );
}
