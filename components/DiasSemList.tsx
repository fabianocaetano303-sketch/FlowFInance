"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DiasSem } from "@/lib/types";
import { hojeISO } from "@/lib/financas";
import type { DiaDiasSem } from "@/lib/diasSem";
import GradeDiasSem from "@/components/GradeDiasSem";

export interface RastreadorCompleto {
  rastreador: DiasSem;
  streak: number;
  marcadoHoje: boolean;
  temHistorico: boolean;
  grade: DiaDiasSem[];
}

export default function DiasSemList({ rastreadores }: { rastreadores: RastreadorCompleto[] }) {
  const router = useRouter();

  function atualizar() {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <NovoRastreadorForm onCriado={atualizar} />

      {rastreadores.length === 0 ? (
        <div className="card text-center text-sm text-on-surface-variant">
          Nenhum rastreador ainda. Crie um acima pra começar.
        </div>
      ) : (
        <div className="space-y-3">
          {rastreadores.map((item) => (
            <RastreadorCard key={item.rastreador.id} item={item} onAlterado={atualizar} />
          ))}
        </div>
      )}
    </div>
  );
}

function NovoRastreadorForm({ onCriado }: { onCriado: () => void }) {
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function criar() {
    setErro(null);
    if (!descricao.trim()) {
      setErro("Diz o que você quer evitar.");
      return;
    }

    setSalvando(true);
    const resposta = await fetch("/api/dias-sem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao }),
    });
    setSalvando(false);

    if (!resposta.ok) {
      const dados = await resposta.json().catch(() => ({}));
      setErro(dados.erro || "Não foi possível criar o rastreador.");
      return;
    }

    setDescricao("");
    onCriado();
  }

  return (
    <div className="card !p-5 space-y-3">
      <label className="label-field">O que você quer evitar?</label>
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Ex: Beber cerveja, Gasto idiota, Doce, Cigarro"
        className="input-field"
        onKeyDown={(e) => e.key === "Enter" && criar()}
      />
      {erro && <p className="text-sm text-error">{erro}</p>}
      <button onClick={criar} disabled={salvando} className="btn-primary w-full">
        {salvando ? "Criando..." : "Criar"}
      </button>
    </div>
  );
}

function RastreadorCard({ item, onAlterado }: { item: RastreadorCompleto; onAlterado: () => void }) {
  const { rastreador, streak, marcadoHoje, temHistorico, grade } = item;
  const [marcando, setMarcando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const sequenciaQuebrada = streak === 0 && temHistorico;

  async function alternarHoje() {
    setErro(null);
    setMarcando(true);
    const resposta = await fetch(`/api/dias-sem/${rastreador.id}/marcar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: hojeISO(), marcado: !marcadoHoje }),
    });
    setMarcando(false);

    if (!resposta.ok) {
      setErro("Não foi possível salvar.");
      return;
    }

    onAlterado();
  }

  async function excluir() {
    setExcluindo(true);
    const resposta = await fetch(`/api/dias-sem/${rastreador.id}`, { method: "DELETE" });
    setExcluindo(false);

    if (!resposta.ok) {
      setErro("Não foi possível excluir.");
      return;
    }

    onAlterado();
  }

  return (
    <div className="card !p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-base font-semibold text-on-surface">Dias sem {rastreador.descricao.toLowerCase()}</p>
        <button
          onClick={alternarHoje}
          disabled={marcando}
          aria-label={marcadoHoje ? "Desmarcar hoje" : "Marcar hoje"}
          className={`w-11 h-11 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-300 ${
            marcadoHoje ? "bg-primary border-primary" : "border-outline-variant"
          }`}
        >
          {marcadoHoje && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#052E1F" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      <p className="number-hero">{streak}</p>
      <p className="number-label mb-3">{streak === 1 ? "1 dia" : `${streak} dias`}</p>

      {sequenciaQuebrada && (
        <p className="text-xs font-medium text-tertiary mb-3">Sequência quebrada — comece novamente hoje.</p>
      )}

      <GradeDiasSem dias={grade} />

      {erro && <p className="text-sm text-error mt-3">{erro}</p>}

      {confirmandoExclusao ? (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant">
          <span className="text-xs text-on-surface-variant flex-1">Parar de rastrear este item?</span>
          <button
            type="button"
            onClick={() => setConfirmandoExclusao(false)}
            className="text-xs font-medium text-on-surface-variant hover:text-on-surface px-2 py-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={excluir}
            disabled={excluindo}
            className="text-xs font-medium text-error hover:underline px-2 py-1"
          >
            {excluindo ? "Excluindo..." : "Confirmar"}
          </button>
        </div>
      ) : (
        <div className="flex justify-end mt-3 pt-3 border-t border-outline-variant">
          <button
            type="button"
            onClick={() => setConfirmandoExclusao(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-error"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Deletar
          </button>
        </div>
      )}
    </div>
  );
}
