export default function BadgeConquista({
  icone,
  titulo,
  descricao,
  ganho,
  periodo,
}: {
  icone: string;
  titulo: string;
  descricao: string;
  ganho: boolean;
  periodo?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden card !p-4 flex items-center gap-3 ${
        ganho ? "border-accent/50" : "opacity-40 grayscale"
      }`}
    >
      {ganho && <div className="absolute inset-0 animate-shine-bg animate-shine pointer-events-none" />}
      <span className={`text-3xl shrink-0 ${ganho ? "animate-badge-pop" : ""}`}>{icone}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-on-surface">{titulo}</p>
        <p className="text-xs text-on-surface-variant">{descricao}</p>
        {ganho && periodo && <p className="text-[10px] text-accent font-medium mt-0.5">{periodo}</p>}
      </div>
    </div>
  );
}
