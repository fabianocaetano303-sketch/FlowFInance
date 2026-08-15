"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistroCard, EditarRegistroModal, type RegistroUnificado } from "@/components/RegistroCard";

export type { RegistroTipo, RegistroUnificado } from "@/components/RegistroCard";

export default function MeusRegistrosList({ ganhos, gastos }: { ganhos: RegistroUnificado[]; gastos: RegistroUnificado[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState<RegistroUnificado | null>(null);

  function atualizar() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-on-surface">Ganhos</p>
          <p className="text-xs text-on-surface-variant tnum">{ganhos.length} registro(s)</p>
        </div>
        {ganhos.length === 0 ? (
          <div className="card text-center text-sm text-on-surface-variant">Nenhum ganho registrado ainda.</div>
        ) : (
          <div className="space-y-2">
            {ganhos.map((registro) => (
              <RegistroCard key={registro.id} registro={registro} onEditar={() => setEditando(registro)} onAlterado={atualizar} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-on-surface">Gastos</p>
          <p className="text-xs text-on-surface-variant tnum">{gastos.length} registro(s)</p>
        </div>
        {gastos.length === 0 ? (
          <div className="card text-center text-sm text-on-surface-variant">Nenhum gasto registrado ainda.</div>
        ) : (
          <div className="space-y-2">
            {gastos.map((registro) => (
              <RegistroCard key={registro.id} registro={registro} onEditar={() => setEditando(registro)} onAlterado={atualizar} />
            ))}
          </div>
        )}
      </section>

      {editando && <EditarRegistroModal registro={editando} onFechar={() => setEditando(null)} onSalvo={atualizar} />}
    </div>
  );
}
