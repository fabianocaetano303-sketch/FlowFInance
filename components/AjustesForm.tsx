"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ConfiguracoesUsuario } from "@/lib/types";

export default function AjustesForm({ configuracoes }: { configuracoes: ConfiguracoesUsuario }) {
  const router = useRouter();
  const [metaDiaria, setMetaDiaria] = useState(String(configuracoes.meta_diaria));
  const [orcamentoAlimentacao, setOrcamentoAlimentacao] = useState(String(configuracoes.orcamento_alimentacao));
  const [orcamentoHigiene, setOrcamentoHigiene] = useState(String(configuracoes.orcamento_higiene));
  const [orcamentoContas, setOrcamentoContas] = useState(
    configuracoes.orcamento_contas != null ? String(configuracoes.orcamento_contas) : ""
  );
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    const meta = Number(metaDiaria.replace(",", "."));
    const alimentacao = Number(orcamentoAlimentacao.replace(",", "."));
    const higiene = Number(orcamentoHigiene.replace(",", "."));
    const contas = orcamentoContas.trim() ? Number(orcamentoContas.replace(",", ".")) : null;

    if (!meta || !alimentacao || !higiene) {
      setErro("Preencha os campos obrigatórios com valores válidos.");
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("configuracoes_usuario")
      .update({
        meta_diaria: meta,
        orcamento_alimentacao: alimentacao,
        orcamento_higiene: higiene,
        orcamento_contas: contas,
      })
      .eq("usuario_id", configuracoes.usuario_id);

    setSalvando(false);

    if (error) {
      setErro("Não foi possível salvar as configurações.");
      return;
    }

    setSucesso(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <label className="label-field">Meta diária de ganho (R$)</label>
        <input value={metaDiaria} onChange={(e) => setMetaDiaria(e.target.value)} inputMode="decimal" className="input-field tnum" />
        <p className="text-xs text-on-surface-variant mt-1">Usada para comparar sua média diária de ganhos.</p>
      </div>

      <div>
        <label className="label-field">Orçamento — Alimentação (R$/mês)</label>
        <input
          value={orcamentoAlimentacao}
          onChange={(e) => setOrcamentoAlimentacao(e.target.value)}
          inputMode="decimal"
          className="input-field tnum"
        />
      </div>

      <div>
        <label className="label-field">Orçamento — Higiene (R$/mês)</label>
        <input
          value={orcamentoHigiene}
          onChange={(e) => setOrcamentoHigiene(e.target.value)}
          inputMode="decimal"
          className="input-field tnum"
        />
      </div>

      <div>
        <label className="label-field">Orçamento — Contas (R$/mês)</label>
        <input
          value={orcamentoContas}
          onChange={(e) => setOrcamentoContas(e.target.value)}
          inputMode="decimal"
          placeholder="Opcional"
          className="input-field tnum"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          Usado no dashboard para calcular quanto falta ganhar para cobrir as contas do mês.
        </p>
      </div>

      {erro && <p className="text-sm text-error">{erro}</p>}
      {sucesso && <p className="text-sm text-secondary">Configurações salvas.</p>}

      <button type="submit" disabled={salvando} className="btn-primary w-full">
        {salvando ? "Salvando..." : "Salvar Configurações"}
      </button>
    </form>
  );
}
