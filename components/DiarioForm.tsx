"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { VidaDiario } from "@/lib/types";
import { hojeISO } from "@/lib/financas";

export default function DiarioForm({ entradaHoje }: { entradaHoje: VidaDiario | null }) {
  const router = useRouter();
  const [bem, setBem] = useState(entradaHoje?.bem ?? "");
  const [melhorar, setMelhorar] = useState(entradaHoje?.melhorar ?? "");
  const [acaoAmanha, setAcaoAmanha] = useState(entradaHoje?.acao_amanha ?? "");
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

    const { error } = await supabase
      .from("vida_diario")
      .upsert(
        {
          usuario_id: user.id,
          data: hojeISO(),
          bem,
          melhorar,
          acao_amanha: acaoAmanha,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: "usuario_id,data" }
      );

    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar sua reflexão.");
      return;
    }
    setSalvo(true);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <PerguntaCard
        pergunta="O que fiz bem hoje?"
        valor={bem}
        onChange={(v) => {
          setBem(v);
          setSalvo(false);
        }}
        icone="✓"
        corIcone="text-primary"
        corFundo="bg-primary/10"
      />
      <PerguntaCard
        pergunta="O que errei ou poderia melhorar?"
        valor={melhorar}
        onChange={(v) => {
          setMelhorar(v);
          setSalvo(false);
        }}
        icone="⚠️"
        corIcone="text-warning"
        corFundo="bg-warning/10"
      />
      <PerguntaCard
        pergunta="Que ação vou tomar amanhã?"
        valor={acaoAmanha}
        onChange={(v) => {
          setAcaoAmanha(v);
          setSalvo(false);
        }}
        icone="→"
        corIcone="text-accent"
        corFundo="bg-accent/10"
      />

      {erro && <p className="text-sm text-error">{erro}</p>}
      {salvo && !salvando && <p className="text-sm text-primary animate-fade-in">Reflexão salva.</p>}

      <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
        {salvando ? "Salvando..." : "Salvar Reflexão"}
      </button>
    </div>
  );
}

function PerguntaCard({
  pergunta,
  valor,
  onChange,
  icone,
  corIcone,
  corFundo,
}: {
  pergunta: string;
  valor: string;
  onChange: (v: string) => void;
  icone: string;
  corIcone: string;
  corFundo: string;
}) {
  const respondida = valor.trim().length > 0;

  return (
    <div className="card !p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-on-surface">{pergunta}</p>
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all duration-300 ${
            respondida ? `${corFundo} ${corIcone} scale-100` : "bg-surface-container-high text-on-surface-variant scale-90"
          }`}
        >
          {icone}
        </span>
      </div>
      <textarea value={valor} onChange={(e) => onChange(e.target.value)} rows={3} className="input-field" />
    </div>
  );
}
