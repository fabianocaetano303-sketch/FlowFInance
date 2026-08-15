"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistroCard, EditarRegistroModal, type RegistroUnificado } from "@/components/RegistroCard";
import { formatarMoeda, somaValores } from "@/lib/financas";

export default function DetalhesDiaList({
  ganhos,
  gastos,
  porCategoria,
}: {
  ganhos: RegistroUnificado[];
  gastos: RegistroUnificado[];
  porCategoria: [string, number][];
}) {
  const router = useRouter();
  const [editando, setEditando] = useState<RegistroUnificado | null>(null);

  const totalGanhos = somaValores(ganhos);
  const totalGastos = somaValores(gastos);

  function atualizar() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-semibold text-secondary px-1">Ganhos</p>
        {ganhos.length === 0 ? (
          <div className="card text-center text-sm text-on-surface-variant">Nenhum ganho neste dia.</div>
        ) : (
          <>
            <div className="space-y-2">
              {ganhos.map((registro) => (
                <RegistroCard key={registro.id} registro={registro} onEditar={() => setEditando(registro)} onAlterado={atualizar} />
              ))}
            </div>
            <div className="flex items-center justify-between px-1 pt-1 text-sm">
              <span className="text-on-surface-variant">Total</span>
              <span className="font-semibold text-primary tnum">{formatarMoeda(totalGanhos)}</span>
            </div>
          </>
        )}
      </section>

      <section className="space-y-2">
        <p className="text-sm font-semibold text-tertiary px-1">Gastos</p>
        {gastos.length === 0 ? (
          <div className="card text-center text-sm text-on-surface-variant">Nenhum gasto neste dia.</div>
        ) : (
          <>
            <div className="space-y-2">
              {gastos.map((registro) => (
                <RegistroCard key={registro.id} registro={registro} onEditar={() => setEditando(registro)} onAlterado={atualizar} />
              ))}
            </div>
            <div className="flex items-center justify-between px-1 pt-1 text-sm">
              <span className="text-on-surface-variant">Total</span>
              <span className="font-semibold text-tertiary tnum">{formatarMoeda(totalGastos)}</span>
            </div>

            {porCategoria.length > 1 && (
              <div className="card !p-4 space-y-2 mt-2">
                <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Por categoria</p>
                {porCategoria.map(([categoria, valor]) => (
                  <div key={categoria} className="flex items-center justify-between text-sm">
                    <span className="text-on-surface">{categoria}</span>
                    <span className="font-medium text-on-surface tnum">{formatarMoeda(valor)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {editando && <EditarRegistroModal registro={editando} onFechar={() => setEditando(null)} onSalvo={atualizar} />}
    </div>
  );
}
