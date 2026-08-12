"use client";

import { useState } from "react";
import type { Gasto } from "@/lib/types";
import { CATEGORIAS } from "@/lib/types";
import { formatarData, formatarMoeda } from "@/lib/financas";

interface Resultado {
  gastos: Gasto[];
  total: number;
  quantidade: number;
}

export default function GastosFiltro() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [valorMin, setValorMin] = useState("");
  const [valorMax, setValorMax] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar() {
    setErro(null);
    setCarregando(true);

    const params = new URLSearchParams();
    if (busca.trim()) params.set("busca", busca.trim());
    if (categoria) params.set("categoria", categoria);
    if (dataInicio) params.set("data_inicio", dataInicio);
    if (dataFim) params.set("data_fim", dataFim);
    if (valorMin) params.set("valor_min", valorMin.replace(",", "."));
    if (valorMax) params.set("valor_max", valorMax.replace(",", "."));

    try {
      const resposta = await fetch(`/api/gastos/filtrado?${params.toString()}`);
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || "Não foi possível buscar os gastos.");
      setResultado(dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao buscar os gastos.");
      setResultado(null);
    } finally {
      setCarregando(false);
    }
  }

  function limpar() {
    setBusca("");
    setCategoria("");
    setDataInicio("");
    setDataFim("");
    setValorMin("");
    setValorMax("");
    setResultado(null);
    setErro(null);
  }

  return (
    <div className="card !p-5 space-y-4">
      <p className="text-sm font-semibold text-on-surface">Buscar Gastos</p>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por descrição..."
        className="input-field"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Data inicial</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-field">Data final</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="input-field" />
        </div>
      </div>

      <div>
        <label className="label-field">Categoria</label>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input-field">
          <option value="">Todas</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field">Valor mínimo</label>
          <input
            value={valorMin}
            onChange={(e) => setValorMin(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            className="input-field tnum"
          />
        </div>
        <div>
          <label className="label-field">Valor máximo</label>
          <input
            value={valorMax}
            onChange={(e) => setValorMax(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            className="input-field tnum"
          />
        </div>
      </div>

      {erro && <p className="text-sm text-error">{erro}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={limpar} className="btn-secondary flex-1">
          Limpar
        </button>
        <button type="button" onClick={buscar} disabled={carregando} className="btn-primary flex-1">
          {carregando ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {resultado && !carregando && (
        <div className="pt-2 border-t border-outline-variant space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">
              {resultado.quantidade} {resultado.quantidade === 1 ? "gasto encontrado" : "gastos encontrados"}
            </span>
            <span className="font-semibold text-tertiary tnum">{formatarMoeda(resultado.total)}</span>
          </div>

          {resultado.gastos.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Nenhum gasto encontrado com esses filtros.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {resultado.gastos.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="text-on-surface">{g.descricao}</p>
                    <p className="text-xs text-on-surface-variant">
                      {g.categoria} · {formatarData(g.data)}
                    </p>
                  </div>
                  <span className="font-medium text-tertiary tnum">{formatarMoeda(g.valor)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
