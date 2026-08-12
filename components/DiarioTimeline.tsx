interface DiaTimeline {
  data: string;
  respostas: [boolean, boolean, boolean];
  completo: boolean;
}

export default function DiarioTimeline({ dias }: { dias: DiaTimeline[] }) {
  return (
    <div className="card !p-5">
      <p className="text-sm font-semibold text-on-surface mb-4">Últimos 7 dias</p>
      <div className="grid grid-cols-7 gap-2">
        {dias.map((dia) => {
          const [, mes, diaNum] = dia.data.split("-");
          return (
            <div
              key={dia.data}
              className={`flex flex-col items-center gap-2 rounded-lg py-2.5 ${
                dia.completo ? "bg-primary/10 border border-primary/40" : ""
              }`}
            >
              <span className={`text-[10px] tnum ${dia.completo ? "text-primary font-semibold" : "text-on-surface-variant"}`}>
                {diaNum}/{mes}
              </span>
              <div className="flex flex-col gap-1">
                {dia.respostas.map((respondida, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${respondida ? "bg-primary" : "bg-surface-container-high"}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
