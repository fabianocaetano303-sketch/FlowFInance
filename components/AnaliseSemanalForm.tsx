"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hojeISO } from "@/lib/financas";

export default function AnaliseSemanalForm() {
  const router = useRouter();
  const [bateuMetas, setBateuMetas] = useState<boolean | null>(null);
  const [obstaculo, setObstaculo] = useState("");
  const [acoes, setAcoes] = useState("");
  const [nota, setNota] = useState(5);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setErro(null);
    setSalvando(true);
    setSalvo(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErro("Sessão expirada.");
      setSalvando(false);
      return;
    }

    const { error } = await supabase.from("vida_analises_semanais").upsert(
      {
        usuario_id: user.id,
        data: hojeISO(),
        bateu_metas: bateuMetas,
        maior_obstaculo: obstaculo,
        acoes_proxima_semana: acoes,
        nota_disciplina: nota,
      },
      { onConflict: "usuario_id,data" }
    );

    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar sua análise.");
      return;
    }
    setSalvo(true);
    setBateuMetas(null);
    setObstaculo("");
    setAcoes("");
    setNota(5);
    router.refresh();
  }

  return (
    <div className="card !p-5 space-y-4">
      <p className="text-sm font-semibold text-on-surface">Análise da semana</p>

      <div>
        <label className="label-field">Você bateu suas metas esta semana?</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setBateuMetas(true)}
            className={`py-2.5 rounded text-sm font-medium border ${
              bateuMetas === true ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface"
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setBateuMetas(false)}
            className={`py-2.5 rounded text-sm font-medium border ${
              bateuMetas === false ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface"
            }`}
          >
            Não
          </button>
        </div>
      </div>

      <div>
        <label className="label-field">Qual foi o maior obstáculo?</label>
        <textarea value={obstaculo} onChange={(e) => setObstaculo(e.target.value)} rows={3} className="input-field" />
      </div>

      <div>
        <label className="label-field">Que ações vai tomar na próxima semana?</label>
        <textarea value={acoes} onChange={(e) => setAcoes(e.target.value)} rows={3} className="input-field" />
      </div>

      <div>
        <label className="label-field">De 0 a 10, qual sua nota de disciplina?</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={10}
            value={nota}
            onChange={(e) => setNota(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-lg font-semibold text-on-surface tnum w-8 text-right">{nota}</span>
        </div>
      </div>

      {erro && <p className="text-sm text-error">{erro}</p>}
      {salvo && !salvando && <p className="text-sm text-secondary">Análise salva.</p>}

      <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
        {salvando ? "Salvando..." : "Salvar Análise"}
      </button>
    </div>
  );
}
