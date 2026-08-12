"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { VidaHabito } from "@/lib/types";
import { hojeISO } from "@/lib/financas";

interface HabitoComStatus {
  habito: VidaHabito;
  devidoHoje: boolean;
  concluidoHoje: boolean;
}

export default function SeuDiaResumo({ itens }: { itens: HabitoComStatus[] }) {
  const router = useRouter();
  const [pendente, setPendente] = useState<string | null>(null);

  const devidos = itens.filter((i) => i.devidoHoje);
  const concluidos = devidos.filter((i) => i.concluidoHoje).length;
  const faltam = devidos.length - concluidos;

  async function alternar(item: HabitoComStatus) {
    setPendente(item.habito.id);
    const supabase = createClient();
    await supabase
      .from("vida_habitos_historico")
      .upsert({ habito_id: item.habito.id, data: hojeISO(), concluido: !item.concluidoHoje }, { onConflict: "habito_id,data" });
    setPendente(null);
    router.refresh();
  }

  return (
    <div className="card !p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="titulo-secao !text-base">Seu Dia</p>
        {faltam > 0 ? (
          <div className="text-right">
            <span className="text-3xl font-bold text-tertiary tnum">{faltam}</span>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">
              {faltam === 1 ? "falta" : "faltam"}
            </p>
          </div>
        ) : devidos.length > 0 ? (
          <span className="text-sm font-semibold text-primary">Tudo em dia ✓</span>
        ) : null}
      </div>

      {devidos.length === 0 ? (
        <p className="text-sm text-on-surface-variant">Nenhum hábito para hoje.</p>
      ) : (
        <div className="space-y-2.5">
          {devidos.map((item) => (
            <button
              key={item.habito.id}
              onClick={() => alternar(item)}
              disabled={pendente === item.habito.id}
              className="w-full flex items-center gap-3 text-left"
            >
              <span
                className={`w-9 h-9 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-300 ${
                  item.concluidoHoje ? "bg-primary border-primary scale-100" : "border-outline-variant scale-95"
                }`}
              >
                {item.concluidoHoje && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#052E1F" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${item.concluidoHoje ? "text-on-surface-variant line-through" : "text-on-surface font-medium"}`}>
                {item.habito.nome}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
