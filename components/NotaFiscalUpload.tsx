"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIAS } from "@/lib/types";
import { formatarMoeda, hojeISO } from "@/lib/financas";

interface ItemExtraido {
  descricao: string;
  valor: number;
  categoria: string;
}

export default function NotaFiscalUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [itens, setItens] = useState<ItemExtraido[] | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setErro(null);
    setItens(null);
    setCarregando(true);

    try {
      const base64 = await arquivoParaBase64(arquivo);
      const resposta = await fetch("/api/nota-fiscal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem: base64, mediaType: arquivo.type }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        throw new Error(dados.erro || "Não foi possível ler a nota fiscal.");
      }

      const dados = await resposta.json();
      if (!dados.itens || dados.itens.length === 0) {
        setErro("Não foi possível identificar itens na imagem.");
      } else {
        setItens(dados.itens);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao processar a imagem.");
    } finally {
      setCarregando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function atualizarItem(index: number, campo: keyof ItemExtraido, valor: string) {
    if (!itens) return;
    const novos = [...itens];
    if (campo === "valor") {
      novos[index] = { ...novos[index], valor: Number(valor.replace(",", ".")) || 0 };
    } else {
      novos[index] = { ...novos[index], [campo]: valor };
    }
    setItens(novos);
  }

  function removerItem(index: number) {
    if (!itens) return;
    setItens(itens.filter((_, i) => i !== index));
  }

  async function confirmarRegistro() {
    if (!itens || itens.length === 0) return;
    setSalvando(true);
    setErro(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErro("Sessão expirada. Faça login novamente.");
      setSalvando(false);
      return;
    }

    const hoje = hojeISO();
    const registros = itens.map((item) => ({
      usuario_id: user.id,
      valor: item.valor,
      descricao: item.descricao,
      categoria: item.categoria,
      eh_desnecessario: false,
      data: hoje,
    }));

    const { error } = await supabase.from("gastos").insert(registros);
    setSalvando(false);

    if (error) {
      setErro("Não foi possível salvar os gastos.");
      return;
    }

    setItens(null);
    router.push("/");
    router.refresh();
  }

  const total = itens?.reduce((soma, item) => soma + item.valor, 0) ?? 0;

  return (
    <div className="card !p-4">
      {!itens && (
        <>
          <label
            htmlFor="nota-fiscal"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline-variant rounded-lg py-6 cursor-pointer hover:bg-surface-container-low transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-sm font-medium text-primary">
              {carregando ? "Lendo nota fiscal..." : "Ler nota fiscal com IA"}
            </span>
            <span className="text-xs text-on-surface-variant">Tire uma foto ou envie uma imagem</span>
          </label>
          <input
            ref={inputRef}
            id="nota-fiscal"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={carregando}
            onChange={handleArquivo}
          />
        </>
      )}

      {erro && <p className="text-sm text-error mt-2">{erro}</p>}

      {itens && itens.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-on-surface">Itens identificados — confirme antes de registrar</p>
          <ul className="space-y-3">
            {itens.map((item, index) => (
              <li key={index} className="border border-outline-variant rounded p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.descricao}
                    onChange={(e) => atualizarItem(index, "descricao", e.target.value)}
                    className="input-field !py-2 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removerItem(index)}
                    aria-label="Remover item"
                    className="text-on-surface-variant hover:text-error shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={item.valor}
                    onChange={(e) => atualizarItem(index, "valor", e.target.value)}
                    className="input-field !py-2 w-28 tnum"
                  />
                  <select
                    value={item.categoria}
                    onChange={(e) => atualizarItem(index, "categoria", e.target.value)}
                    className="input-field !py-2 flex-1"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
            <span className="text-sm font-medium text-on-surface-variant">Total</span>
            <span className="text-base font-semibold text-on-surface tnum">{formatarMoeda(total)}</span>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setItens(null)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="button" onClick={confirmarRegistro} disabled={salvando} className="btn-success flex-1">
              {salvando ? "Salvando..." : `Registrar ${itens.length} gasto(s)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function arquivoParaBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = reader.result as string;
      const base64 = resultado.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(arquivo);
  });
}
