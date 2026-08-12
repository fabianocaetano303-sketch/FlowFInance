"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { VidaProposito } from "@/lib/types";

export default function PropositoForm({ proposito }: { proposito: VidaProposito }) {
  const router = useRouter();
  const [motivo, setMotivo] = useState(proposito.motivo ?? "");
  const [sucesso, setSucesso] = useState(proposito.definicao_sucesso ?? "");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setErro(null);
    setSalvando(true);
    setSalvo(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("vida_propositos")
      .update({ motivo, definicao_sucesso: sucesso, atualizado_em: new Date().toISOString() })
      .eq("id", proposito.id);

    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar seu propósito.");
      return;
    }
    setSalvo(true);
    router.refresh();
  }

  return (
    <div className="card !p-5 space-y-4">
      <div>
        <label className="label-field">Por que estou fazendo essa mudança?</label>
        <textarea
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            setSalvo(false);
          }}
          rows={4}
          placeholder="Escreva com suas palavras..."
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">Como vou saber que consegui?</label>
        <textarea
          value={sucesso}
          onChange={(e) => {
            setSucesso(e.target.value);
            setSalvo(false);
          }}
          rows={4}
          placeholder="Defina o que é sucesso para você..."
          className="input-field"
        />
      </div>

      {erro && <p className="text-sm text-error">{erro}</p>}
      {salvo && !salvando && <p className="text-sm text-secondary">Propósito salvo.</p>}

      <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
        {salvando ? "Salvando..." : "Salvar Propósito"}
      </button>
    </div>
  );
}
