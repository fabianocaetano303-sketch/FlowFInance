export default function BarraProgresso({
  percentual,
  cor = "primary",
  altura = "h-2.5",
}: {
  percentual: number;
  cor?: "primary" | "tertiary" | "warning" | "accent";
  altura?: string;
}) {
  const corClasse =
    cor === "tertiary" ? "bg-tertiary" : cor === "warning" ? "bg-warning" : cor === "accent" ? "bg-accent" : "bg-primary";
  const valor = Math.min(100, Math.max(0, percentual));

  return (
    <div className={`w-full ${altura} bg-surface-container-high rounded-full overflow-hidden`}>
      <div
        className={`h-full ${corClasse} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${valor}%` }}
      />
    </div>
  );
}
