"use client";

import { useState } from "react";
import { CATEGORIAS } from "@/lib/types";
import { formatarData, formatarMoeda } from "@/lib/financas";

export type RegistroTipo = "ganho" | "gasto";

export interface RegistroUnificado {
  id: string;
  tipo: RegistroTipo;
  valor: number;
  descricao: string;
  data: string;
  categoria?: string;
  eh_desnecessario?: boolean;
  criado_em?: string;
}

function formatarHorario(criadoEm?: string): string | null {
  if (!criadoEm) return null;
  const data = new Date(criadoEm);
  if (Number.isNaN(data.getTime())) return null;
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function RegistroCard({
  registro,
  onEditar,
  onAlterado,
}: {
  registro: RegistroUnificado;
  onEditar: () => void;
  onAlterado: () => void;
}) {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const ehGanho = registro.tipo === "ganho";
  const horario = formatarHorario(registro.criado_em);

  async function excluir() {
    setExcluindo(true);
    const rota = ehGanho ? `/api/ganhos/${registro.id}` : `/api/gastos/${registro.id}`;
    const resposta = await fetch(rota, { method: "DELETE" });
    setExcluindo(false);
    if (resposta.ok) onAlterado();
  }

  return (
    <div className="card !p-4">
      <div className="flex items-center gap-3">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            ehGanho ? "bg-primary-container text-on-primary-container" : "bg-tertiary-container text-on-tertiary-container"
          }`}
        >
          {ehGanho ? "+" : "−"}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface truncate">{registro.descricao}</p>
          <p className="text-xs text-on-surface-variant tnum">
            {formatarData(registro.data)}
            {horario && ` · ${horario}`}
            {registro.categoria && ` · ${registro.categoria}`}
          </p>
        </div>

        <span className={`text-sm font-semibold tnum shrink-0 ${ehGanho ? "text-primary" : "text-tertiary"}`}>
          {ehGanho ? "+" : "−"} {formatarMoeda(registro.valor)}
        </span>
      </div>

      {confirmandoExclusao ? (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant">
          <span className="text-xs text-on-surface-variant flex-1">Excluir este registro?</span>
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
        <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-outline-variant">
          <button
            type="button"
            onClick={onEditar}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Editar
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoExclusao(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-error"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}

export function EditarRegistroModal({
  registro,
  onFechar,
  onSalvo,
}: {
  registro: RegistroUnificado;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const ehGanho = registro.tipo === "ganho";
  const [valor, setValor] = useState(String(registro.valor).replace(".", ","));
  const [descricao, setDescricao] = useState(registro.descricao);
  const [data, setData] = useState(registro.data);
  const [categoria, setCategoria] = useState(registro.categoria ?? CATEGORIAS[0]);
  const [desnecessario, setDesnecessario] = useState(registro.eh_desnecessario ?? false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(null);
    const valorNumerico = Number(valor.replace(",", "."));
    if (!valorNumerico || valorNumerico <= 0) {
      setErro("Informe um valor válido.");
      return;
    }
    if (!descricao.trim()) {
      setErro("Informe uma descrição.");
      return;
    }

    setSalvando(true);
    const rota = ehGanho ? `/api/ganhos/${registro.id}` : `/api/gastos/${registro.id}`;
    const payload = ehGanho
      ? { valor: valorNumerico, descricao, data }
      : { valor: valorNumerico, descricao, data, categoria, eh_desnecessario: desnecessario };

    const resposta = await fetch(rota, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSalvando(false);

    if (!resposta.ok) {
      const dados = await resposta.json().catch(() => ({}));
      setErro(dados.erro || "Não foi possível salvar as alterações.");
      return;
    }

    onSalvo();
    onFechar();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest border border-outline-variant w-full sm:max-w-sm rounded-t-xl sm:rounded-xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-on-surface">Editar {ehGanho ? "Ganho" : "Gasto"}</h2>
          <button onClick={onFechar} aria-label="Fechar" className="text-on-surface-variant hover:text-on-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-field">Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="label-field">Valor (R$)</label>
            <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" className="input-field tnum" />
          </div>

          <div>
            <label className="label-field">Descrição</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input-field" />
          </div>

          {!ehGanho && (
            <>
              <div>
                <label className="label-field">Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input-field">
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={desnecessario}
                  onChange={(e) => setDesnecessario(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant accent-tertiary"
                />
                Gasto desnecessário (gasto idiota)
              </label>
            </>
          )}

          {erro && <p className="text-sm text-error">{erro}</p>}

          <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
