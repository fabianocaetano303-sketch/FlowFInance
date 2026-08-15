import { formatarMoeda } from "@/lib/financas";

export default function ResumoSaldoDia({
  totalGanhos,
  totalGastos,
  saldo,
}: {
  totalGanhos: number;
  totalGastos: number;
  saldo: number;
}) {
  const positivo = saldo > 0;
  const negativo = saldo < 0;

  const corSaldo = positivo ? "text-primary" : negativo ? "text-tertiary" : "text-on-surface-variant";
  const bordaSaldo = positivo ? "border-primary/50" : negativo ? "border-tertiary/50" : "border-outline-variant";
  const brilho = positivo ? "glow-primary" : negativo ? "glow-tertiary" : "";
  const rotulo = positivo ? "✓ Saldo Positivo" : negativo ? "✗ Saldo Negativo" : "Saldo Neutro";
  const corRotulo = positivo ? "text-primary" : negativo ? "text-tertiary" : "text-on-surface-variant";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="card !p-4 text-center">
          <p className="label-field !mb-1.5">Ganho do dia</p>
          <p className="text-[36px] leading-none font-bold text-primary tnum">{formatarMoeda(totalGanhos)}</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="label-field !mb-1.5">Gastos do dia</p>
          <p className="text-[36px] leading-none font-bold text-tertiary tnum">{formatarMoeda(totalGastos)}</p>
        </div>
      </div>

      <div key={saldo} className={`card !p-6 text-center border-2 animate-grow-in ${bordaSaldo} ${brilho}`}>
        <p className={`text-sm font-semibold mb-2 ${corRotulo}`}>{rotulo}</p>
        <p className={`text-[44px] sm:text-[56px] leading-none font-bold tnum ${corSaldo}`}>{formatarMoeda(saldo)}</p>
        <p className="number-label mt-2">Saldo do dia</p>
      </div>
    </div>
  );
}
