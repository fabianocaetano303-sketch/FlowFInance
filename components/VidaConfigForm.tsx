"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { VidaConfiguracoes } from "@/lib/types";

export default function VidaConfigForm({ config }: { config: VidaConfiguracoes }) {
  const router = useRouter();
  const [horarioReflexao, setHorarioReflexao] = useState(config.horario_reflexao?.slice(0, 5) ?? "22:00");
  const [horarioManha, setHorarioManha] = useState(config.horario_lembrete_manha?.slice(0, 5) ?? "07:00");
  const [frases, setFrases] = useState<string[]>(config.frases_motivacionais ?? []);
  const [novaFrase, setNovaFrase] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function adicionarFrase() {
    if (!novaFrase.trim()) return;
    setFrases([...frases, novaFrase.trim()]);
    setNovaFrase("");
    setSalvo(false);
  }

  function removerFrase(indice: number) {
    setFrases(frases.filter((_, i) => i !== indice));
    setSalvo(false);
  }

  async function salvar() {
    setErro(null);
    setSalvando(true);
    setSalvo(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("vida_configuracoes")
      .update({
        horario_reflexao: horarioReflexao,
        horario_lembrete_manha: horarioManha,
        frases_motivacionais: frases,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", config.id);

    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar as configurações.");
      return;
    }
    setSalvo(true);
    router.refresh();
  }

  return (
    <div className="card !p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Lembrete matinal</label>
          <input
            type="time"
            value={horarioManha}
            onChange={(e) => {
              setHorarioManha(e.target.value);
              setSalvo(false);
            }}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field">Horário de reflexão</label>
          <input
            type="time"
            value={horarioReflexao}
            onChange={(e) => {
              setHorarioReflexao(e.target.value);
              setSalvo(false);
            }}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="label-field">Frases motivacionais</label>
        <div className="flex gap-2 mb-2">
          <input
            value={novaFrase}
            onChange={(e) => setNovaFrase(e.target.value)}
            placeholder="Escreva uma frase..."
            className="input-field"
          />
          <button type="button" onClick={adicionarFrase} className="btn-secondary shrink-0 !px-4">
            +
          </button>
        </div>
        {frases.length > 0 && (
          <ul className="space-y-1.5">
            {frases.map((frase, i) => (
              <li key={i} className="flex items-center justify-between gap-2 bg-surface-container-low rounded px-3 py-2">
                <span className="text-sm text-on-surface">{frase}</span>
                <button
                  type="button"
                  onClick={() => removerFrase(i)}
                  aria-label="Remover frase"
                  className="text-on-surface-variant hover:text-error shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {erro && <p className="text-sm text-error">{erro}</p>}
      {salvo && !salvando && <p className="text-sm text-secondary">Configurações salvas.</p>}

      <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
        {salvando ? "Salvando..." : "Salvar Configurações"}
      </button>
    </div>
  );
}
