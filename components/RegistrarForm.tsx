"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIAS } from "@/lib/types";
import { hojeISO } from "@/lib/financas";
import NotaFiscalUpload from "@/components/NotaFiscalUpload";

type Tipo = "ganho" | "gasto";

export default function RegistrarForm({ tipoInicial }: { tipoInicial: Tipo }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>(tipoInicial);
  const [data, setData] = useState(hojeISO());
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS[0]);
  const [desnecessario, setDesnecessario] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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

    setCarregando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErro("Sessão expirada. Faça login novamente.");
      setCarregando(false);
      return;
    }

    const tabela = tipo === "ganho" ? "ganhos" : "gastos";
    const payload =
      tipo === "ganho"
        ? { usuario_id: user.id, valor: valorNumerico, descricao, data }
        : {
            usuario_id: user.id,
            valor: valorNumerico,
            descricao,
            data,
            categoria,
            eh_desnecessario: desnecessario,
          };

    const { error } = await supabase.from(tabela).insert(payload);
    setCarregando(false);

    if (error) {
      setErro("Não foi possível registrar. Tente novamente.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="px-4 pt-4">
      <div className="grid grid-cols-2 bg-surface-container-low rounded p-1 mb-5">
        <button
          type="button"
          onClick={() => setTipo("ganho")}
          className={`py-2.5 rounded text-sm font-medium transition-colors ${
            tipo === "ganho" ? "bg-surface-container-highest text-on-surface shadow-sm" : "text-on-surface-variant"
          }`}
        >
          Ganho
        </button>
        <button
          type="button"
          onClick={() => setTipo("gasto")}
          className={`py-2.5 rounded text-sm font-medium transition-colors ${
            tipo === "gasto" ? "bg-surface-container-highest text-on-surface shadow-sm" : "text-on-surface-variant"
          }`}
        >
          Gasto
        </button>
      </div>

      {tipo === "gasto" && (
        <div className="mb-5">
          <NotaFiscalUpload />
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label-field" htmlFor="data">
            Data
          </label>
          <input
            id="data"
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="label-field" htmlFor="valor">
            Valor (R$)
          </label>
          <input
            id="valor"
            type="text"
            inputMode="decimal"
            required
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            className="input-field tnum"
          />
        </div>

        {tipo === "gasto" && (
          <div>
            <label className="label-field" htmlFor="categoria">
              Categoria
            </label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="input-field"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label-field" htmlFor="descricao">
            Descrição
          </label>
          <input
            id="descricao"
            type="text"
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={tipo === "ganho" ? "Ex: Venda de consultoria" : "Ex: Almoço"}
            className="input-field"
          />
        </div>

        {tipo === "gasto" && (
          <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
            <input
              type="checkbox"
              checked={desnecessario}
              onChange={(e) => setDesnecessario(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant accent-tertiary"
            />
            Marcar como gasto desnecessário (gasto idiota)
          </label>
        )}

        {erro && <p className="text-sm text-error">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className={tipo === "ganho" ? "btn-success w-full" : "btn-danger w-full"}
        >
          {carregando ? "Registrando..." : `Registrar ${tipo === "ganho" ? "Ganho" : "Gasto"}`}
        </button>
      </form>
    </div>
  );
}
