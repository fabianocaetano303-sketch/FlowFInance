"use client";

import { useEffect, useState } from "react";
import type { Ganho } from "@/lib/types";
import { DIAS_SEMANA, formatarData, formatarMoeda, hojeISO } from "@/lib/financas";

type Modo = "dia_semana" | "intervalo";

interface Resultado {
  ganhos: Ganho[];
  total: number;
  mediaDiaria: number;
  quantidadeDias: number;
}

export default function PeriodoFiltro() {
  const [modo, setModo] = useState<Modo>("dia_semana");
  const [diaSemana, setDiaSemana] = useState(new Date().getDay());
  const [dataInicio, setDataInicio] = useState(hojeISO());
  const [dataFim, setDataFim] = useState(hojeISO());
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar() {
    setErro(null);
    setCarregando(true);

    const params = new URLSearchParams();
    if (modo === "dia_semana") {
      params.set("type", "dia_semana");
      params.set("dia", String(diaSemana));
    } else {
      if (dataInicio > dataFim) {
        setCarregando(false);
        setErro("A data inicial não pode ser depois da data final.");
        return;
      }
      params.set("type", "intervalo");
      params.set("data_inicio", dataInicio);
      params.set("data_fim", dataFim);
    }

    try {
      const resposta = await fetch(`/api/ganhos/filtrado?${params.toString()}`);
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível buscar os ganhos.");
      }

      setResultado(dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao buscar os ganhos.");
      setResultado(null);
    } finally {
      setCarregando(false);
    }
  }

  // aplica automaticamente quando o dia da semana muda
  useEffect(() => {
    if (modo === "dia_semana") {
      buscar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, diaSemana]);

  return (
    <div className="card !p-5 space-y-4">
      <p className="text-sm font-semibold text-on-surface">Ganhos por Período</p>

      <div className="grid grid-cols-2 bg-surface-container-low rounded p-1">
        <button
          type="button"
          onClick={() => setModo("dia_semana")}
          className={`py-2.5 rounded text-sm font-medium transition-colors ${
            modo === "dia_semana" ? "bg-surface-container-highest text-on-surface shadow-sm" : "text-on-surface-variant"
          }`}
        >
          Por dia da semana
        </button>
        <button
          type="button"
          onClick={() => setModo("intervalo")}
          className={`py-2.5 rounded text-sm font-medium transition-colors ${
            modo === "intervalo" ? "bg-surface-container-highest text-on-surface shadow-sm" : "text-on-surface-variant"
          }`}
        >
          Por intervalo
        </button>
      </div>

      {modo === "dia_semana" ? (
        <div>
          <label className="label-field" htmlFor="dia-semana">
            Dia da semana
          </label>
          <select
            id="dia-semana"
            value={diaSemana}
            onChange={(e) => setDiaSemana(Number(e.target.value))}
            className="input-field"
          >
            {DIAS_SEMANA.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field" htmlFor="data-inicio">
                Data inicial
              </label>
              <input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field" htmlFor="data-fim">
                Data final
              </label>
              <input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <button type="button" onClick={buscar} disabled={carregando} className="btn-primary w-full">
            {carregando ? "Filtrando..." : "Filtrar"}
          </button>
        </div>
      )}

      {erro && <p className="text-sm text-error">{erro}</p>}

      {carregando && modo === "dia_semana" && (
        <p className="text-sm text-on-surface-variant">Carregando...</p>
      )}

      {resultado && !carregando && (
        <div className="pt-2 border-t border-outline-variant space-y-4">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-on-surface-variant">Total ganho</p>
              <p className="font-semibold text-secondary tnum">{formatarMoeda(resultado.total)}</p>
            </div>
            <div>
              <p className="text-on-surface-variant">Média diária</p>
              <p className="font-semibold text-on-surface tnum">{formatarMoeda(resultado.mediaDiaria)}</p>
            </div>
            <div>
              <p className="text-on-surface-variant">
                {modo === "dia_semana" ? "Dias com ganho" : "Dias no período"}
              </p>
              <p className="font-semibold text-on-surface tnum">{resultado.quantidadeDias}</p>
            </div>
          </div>

          {resultado.ganhos.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Nenhum ganho encontrado nesse período.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {resultado.ganhos.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="text-on-surface">{g.descricao}</p>
                    <p className="text-xs text-on-surface-variant">{formatarData(g.data)}</p>
                  </div>
                  <span className="font-medium text-secondary tnum">{formatarMoeda(g.valor)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
