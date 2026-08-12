"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { FrequenciaHabito, VidaHabito } from "@/lib/types";
import { hojeISO } from "@/lib/financas";
import type { DiaGrade } from "@/lib/vida";
import GradeContribuicao from "@/components/GradeContribuicao";

const LABEL_FREQUENCIA: Record<FrequenciaHabito, string> = {
  diario: "Diariamente",
  dias_uteis: "Segunda a sexta",
};

interface HabitoCompleto {
  habito: VidaHabito;
  devidoHoje: boolean;
  concluidoHoje: boolean;
  streak: number;
  grade: DiaGrade[][];
}

export default function HabitosHoje({ habitosHoje }: { habitosHoje: HabitoCompleto[] }) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [pendente, setPendente] = useState<string | null>(null);
  const [novoRecorde, setNovoRecorde] = useState<string | null>(null);

  function atualizar() {
    router.refresh();
  }

  async function alternar(item: HabitoCompleto) {
    setPendente(item.habito.id);
    const marcandoConcluido = !item.concluidoHoje;
    const supabase = createClient();
    await supabase
      .from("vida_habitos_historico")
      .upsert({ habito_id: item.habito.id, data: hojeISO(), concluido: marcandoConcluido }, { onConflict: "habito_id,data" });
    setPendente(null);

    if (marcandoConcluido && item.streak + 1 > item.streak) {
      setNovoRecorde(item.habito.id);
      setTimeout(() => setNovoRecorde(null), 600);
    }
    atualizar();
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setModalAberto(true)} className="btn-primary w-full flex items-center justify-center gap-2">
        <span className="text-lg leading-none">+</span> Novo Hábito
      </button>

      {habitosHoje.length === 0 ? (
        <div className="card text-center text-sm text-on-surface-variant">Nenhum hábito cadastrado ainda.</div>
      ) : (
        <div className="space-y-4">
          {habitosHoje.map((item) => (
            <div key={item.habito.id} className={`card !p-5 ${!item.devidoHoje ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => item.devidoHoje && alternar(item)}
                  disabled={!item.devidoHoje || pendente === item.habito.id}
                  aria-label="Marcar hábito"
                  className={`w-12 h-12 rounded-2xl border-2 shrink-0 flex items-center justify-center transition-all duration-300 ${
                    item.concluidoHoje ? "bg-primary border-primary" : "border-outline-variant"
                  }`}
                >
                  {item.concluidoHoje && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#052E1F" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-base">{item.habito.nome}</p>
                  <p className="text-xs text-on-surface-variant">
                    {LABEL_FREQUENCIA[item.habito.frequencia]}
                    {!item.devidoHoje && " · Não é hoje"}
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className={`text-[32px] leading-none font-bold text-accent tnum ${novoRecorde === item.habito.id ? "animate-badge-pop" : ""}`}>
                    {item.streak}
                  </p>
                  <p className="number-label">Streak: {item.streak === 1 ? "1 dia" : `${item.streak} dias`}</p>
                </div>
                {item.streak > 0 && <span className="text-2xl">🔥</span>}
              </div>

              <GradeContribuicao semanas={item.grade} />
            </div>
          ))}
        </div>
      )}

      {modalAberto && <NovoHabitoModal onFechar={() => setModalAberto(false)} onSalvo={atualizar} />}
    </div>
  );
}

function NovoHabitoModal({ onFechar, onSalvo }: { onFechar: () => void; onSalvo: () => void }) {
  const [nome, setNome] = useState("");
  const [frequencia, setFrequencia] = useState<FrequenciaHabito>("diario");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) {
      setErro("Informe o nome do hábito.");
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErro("Sessão expirada.");
      setSalvando(false);
      return;
    }

    const { error } = await supabase.from("vida_habitos").insert({ usuario_id: user.id, nome, frequencia });

    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar o hábito.");
      return;
    }

    onSalvo();
    onFechar();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest border border-outline-variant w-full sm:max-w-sm rounded-t-xl sm:rounded-xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-on-surface">Novo Hábito</h2>
          <button onClick={onFechar} aria-label="Fechar" className="text-on-surface-variant hover:text-on-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-field">Nome do hábito</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Acordar cedo" className="input-field" />
          </div>
          <div>
            <label className="label-field">Frequência</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrequencia("diario")}
                className={`py-2.5 rounded text-sm font-medium border ${
                  frequencia === "diario" ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface"
                }`}
              >
                Diariamente
              </button>
              <button
                type="button"
                onClick={() => setFrequencia("dias_uteis")}
                className={`py-2.5 rounded text-sm font-medium border ${
                  frequencia === "dias_uteis" ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface"
                }`}
              >
                Segunda a sexta
              </button>
            </div>
          </div>

          {erro && <p className="text-sm text-error">{erro}</p>}

          <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
            {salvando ? "Salvando..." : "Salvar Hábito"}
          </button>
        </div>
      </div>
    </div>
  );
}
