"use client";

import { useMemo, useState } from "react";
import type { VidaDiario } from "@/lib/types";
import { formatarData } from "@/lib/financas";

export default function DiarioHistorico({ entradas }: { entradas: VidaDiario[] }) {
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    if (!busca.trim()) return entradas;
    const termo = busca.trim().toLowerCase();
    return entradas.filter((e) =>
      [e.bem, e.melhorar, e.acao_amanha].some((campo) => campo?.toLowerCase().includes(termo))
    );
  }, [entradas, busca]);

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-on-surface">Histórico (últimos 30 dias)</p>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por palavra-chave..."
        className="input-field"
      />

      {filtradas.length === 0 ? (
        <div className="card text-center text-sm text-on-surface-variant">Nenhuma entrada encontrada.</div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((e) => (
            <div key={e.id} className="card !p-4 space-y-2">
              <p className="text-xs font-medium text-on-surface-variant tnum">{formatarData(e.data)}</p>
              {e.bem && (
                <p className="text-sm text-on-surface">
                  <span className="text-on-surface-variant">Bem: </span>
                  {e.bem}
                </p>
              )}
              {e.melhorar && (
                <p className="text-sm text-on-surface">
                  <span className="text-on-surface-variant">Melhorar: </span>
                  {e.melhorar}
                </p>
              )}
              {e.acao_amanha && (
                <p className="text-sm text-on-surface">
                  <span className="text-on-surface-variant">Amanhã: </span>
                  {e.acao_amanha}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
