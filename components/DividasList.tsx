"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Divida, TipoDivida } from "@/lib/types";
import {
  formatarData,
  formatarMoeda,
  hojeISO,
  proximaOcorrenciaDia,
  urgenciaDivida,
  valorFaltanteDivida,
  type NivelUrgenciaDivida,
} from "@/lib/financas";

const RANK_URGENCIA: Record<NivelUrgenciaDivida, number> = {
  vencida: 0,
  hoje: 1,
  amanha: 2,
  proxima: 3,
  em_dia: 4,
};

export default function DividasList({ dividasIniciais }: { dividasIniciais: Divida[] }) {
  const router = useRouter();
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [dividaSeparar, setDividaSeparar] = useState<Divida | null>(null);
  const [dividaPagar, setDividaPagar] = useState<Divida | null>(null);

  const hoje = hojeISO();
  const dividasAbertas = dividasIniciais
    .filter((d) => d.status === "aberta")
    .slice()
    .sort((a, b) => {
      const urgA = urgenciaDivida(a.prazo_vencimento, hoje);
      const urgB = urgenciaDivida(b.prazo_vencimento, hoje);
      const diffRank = RANK_URGENCIA[urgA.nivel] - RANK_URGENCIA[urgB.nivel];
      if (diffRank !== 0) return diffRank;
      return (urgA.diasRestantes ?? Infinity) - (urgB.diasRestantes ?? Infinity);
    });
  const dividasPagas = dividasIniciais.filter((d) => d.status === "paga");

  function atualizar() {
    router.refresh();
  }

  return (
    <div className="px-4 pt-4 space-y-4">
      <button onClick={() => setModalNovaAberto(true)} className="btn-primary w-full flex items-center justify-center gap-2">
        <span className="text-lg leading-none">+</span> Nova Dívida
      </button>

      {dividasAbertas.length === 0 ? (
        <div className="card text-center text-sm text-on-surface-variant">Nenhuma dívida em aberto. 🎉</div>
      ) : (
        <div className="space-y-3">
          {dividasAbertas.map((divida) => (
            <DividaCard
              key={divida.id}
              divida={divida}
              onSeparar={() => setDividaSeparar(divida)}
              onMarcarPaga={() => setDividaPagar(divida)}
            />
          ))}
        </div>
      )}

      {dividasPagas.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">Dívidas Pagas</p>
          <div className="space-y-2">
            {dividasPagas.map((divida) => (
              <DividaPagaCard key={divida.id} divida={divida} />
            ))}
          </div>
        </div>
      )}

      {modalNovaAberto && <NovaDividaModal onFechar={() => setModalNovaAberto(false)} onSalvo={atualizar} />}
      {dividaSeparar && (
        <SepararModal divida={dividaSeparar} onFechar={() => setDividaSeparar(null)} onSalvo={atualizar} />
      )}
      {dividaPagar && (
        <MarcarPagaModal divida={dividaPagar} onFechar={() => setDividaPagar(null)} onSalvo={atualizar} />
      )}
    </div>
  );
}

function DividaCard({
  divida,
  onSeparar,
  onMarcarPaga,
}: {
  divida: Divida;
  onSeparar: () => void;
  onMarcarPaga: () => void;
}) {
  const falta = valorFaltanteDivida(divida.valor_total, divida.valor_pago);
  const urgencia = urgenciaDivida(divida.prazo_vencimento);
  const ESTILO_URGENCIA: Record<string, string> = {
    vencida: "bg-tertiary-container text-on-tertiary-container animate-pulse-soft",
    hoje: "bg-tertiary text-on-tertiary animate-pulse-soft",
    amanha: "bg-tertiary text-on-tertiary",
    proxima: "bg-warning-container text-on-warning-container",
  };
  const icone = urgencia.nivel === "vencida" || urgencia.nivel === "hoje" ? "🔴" : "⏰";

  return (
    <div className="card !p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-on-surface">{divida.credor}</p>
            {urgencia.label && (
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${ESTILO_URGENCIA[urgencia.nivel]}`}
              >
                {icone} {urgencia.label}
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant">
            {divida.tipo === "unica" ? "Única" : "Recorrente"}
            {divida.tipo === "recorrente" && divida.dia_recorrencia && ` · Todo dia ${divida.dia_recorrencia}`}
            {divida.prazo_vencimento && ` · Vence em ${formatarData(divida.prazo_vencimento)}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div>
          <p className="text-on-surface-variant">Valor Total</p>
          <p className="font-semibold text-on-surface tnum">{formatarMoeda(divida.valor_total)}</p>
        </div>
        <div>
          <p className="text-on-surface-variant">Já Separado</p>
          <p className="font-semibold text-secondary tnum">{formatarMoeda(divida.valor_separado)}</p>
        </div>
        <div>
          <p className="text-on-surface-variant">Falta Pagar</p>
          <p className="font-semibold text-tertiary tnum">{formatarMoeda(falta)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onSeparar} className="btn-secondary flex-1 !py-2 !text-xs">
          + Separar para Dívida
        </button>
        <button onClick={onMarcarPaga} className="btn-success flex-1 !py-2 !text-xs">
          Marcar como Paga
        </button>
      </div>
    </div>
  );
}

function DividaPagaCard({ divida }: { divida: Divida }) {
  return (
    <div className="card !p-4 bg-surface-container-low opacity-70">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-on-surface-variant">{divida.credor}</p>
          <p className="text-xs text-on-surface-variant">Dívida única · Paga</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant">
          {formatarMoeda(divida.valor_total)}
        </span>
      </div>
    </div>
  );
}

function NovaDividaModal({ onFechar, onSalvo }: { onFechar: () => void; onSalvo: () => void }) {
  const [credor, setCredor] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [tipo, setTipo] = useState<TipoDivida>("unica");
  const [prazoVencimento, setPrazoVencimento] = useState("");
  const [diaRecorrencia, setDiaRecorrencia] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(null);
    const valor = Number(valorTotal.replace(",", "."));
    if (!credor.trim() || !valor || valor <= 0) {
      setErro("Preencha credor e valor total corretamente.");
      return;
    }

    let dia: number | null = null;
    if (tipo === "recorrente") {
      dia = Number(diaRecorrencia);
      if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
        setErro("Informe o dia do mês para pagar (1 a 31).");
        return;
      }
    }

    setSalvando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErro("Sessão expirada.");
      setSalvando(false);
      return;
    }

    const prazo =
      tipo === "recorrente" && dia != null
        ? proximaOcorrenciaDia(hojeISO(), dia)
        : prazoVencimento || null;

    const { error } = await supabase.from("dividas").insert({
      usuario_id: user.id,
      credor,
      valor_total: valor,
      tipo,
      prazo_vencimento: prazo,
      dia_recorrencia: dia,
    });

    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar a dívida.");
      return;
    }

    onSalvo();
    onFechar();
  }

  return (
    <ModalBase titulo="Nova Dívida" onFechar={onFechar}>
      <div className="space-y-4">
        <div>
          <label className="label-field">Credor</label>
          <input value={credor} onChange={(e) => setCredor(e.target.value)} placeholder="Ex: Banco do Brasil" className="input-field" />
        </div>
        <div>
          <label className="label-field">Valor Total (R$)</label>
          <input
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            className="input-field tnum"
          />
        </div>
        <div>
          <label className="label-field">Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo("unica")}
              className={`py-2.5 rounded text-sm font-medium border ${
                tipo === "unica" ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface"
              }`}
            >
              Única
            </button>
            <button
              type="button"
              onClick={() => setTipo("recorrente")}
              className={`py-2.5 rounded text-sm font-medium border ${
                tipo === "recorrente" ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface"
              }`}
            >
              Recorrente
            </button>
          </div>
        </div>
        {tipo === "recorrente" ? (
          <div>
            <label className="label-field">Dia do mês para pagar</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              value={diaRecorrencia}
              onChange={(e) => setDiaRecorrencia(e.target.value)}
              placeholder="Ex: 15"
              className="input-field tnum"
            />
            <p className="text-xs text-on-surface-variant mt-1">
              A dívida é renovada automaticamente todo mês nesse dia.
            </p>
          </div>
        ) : (
          <div>
            <label className="label-field">Prazo de vencimento (opcional)</label>
            <input
              type="date"
              value={prazoVencimento}
              onChange={(e) => setPrazoVencimento(e.target.value)}
              className="input-field"
            />
          </div>
        )}

        {erro && <p className="text-sm text-error">{erro}</p>}

        <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
          {salvando ? "Salvando..." : "Salvar Dívida"}
        </button>
      </div>
    </ModalBase>
  );
}

function SepararModal({
  divida,
  onFechar,
  onSalvo,
}: {
  divida: Divida;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const falta = valorFaltanteDivida(divida.valor_total, divida.valor_pago);
  const [valor, setValor] = useState(String(falta.toFixed(2)).replace(".", ","));
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function salvar() {
    setErro(null);
    const valorNumerico = Number(valor.replace(",", "."));
    if (!valorNumerico || valorNumerico <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    setSalvando(true);
    const resposta = await fetch(`/api/dividas/${divida.id}/separar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor_separado: valorNumerico }),
    });
    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível registrar a separação.");
      return;
    }

    onSalvo();
    setSucesso(true);
  }

  return (
    <ModalBase titulo={`Separar para ${divida.credor}`} onFechar={onFechar}>
      {sucesso ? (
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-on-surface">Valor separado com sucesso.</p>
          <button onClick={onFechar} className="btn-primary w-full">
            Ok
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Faltam <span className="font-semibold text-on-surface tnum">{formatarMoeda(falta)}</span> para quitar esta dívida.
          </p>

          <div>
            <label className="label-field">Valor a separar (R$)</label>
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              inputMode="decimal"
              className="input-field tnum"
            />
          </div>

          {erro && <p className="text-sm text-error">{erro}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setValor(String(falta.toFixed(2)).replace(".", ","))}
              className="btn-secondary flex-1"
            >
              Separar tudo
            </button>
            <button onClick={salvar} disabled={salvando} className="btn-success flex-1">
              {salvando ? "Salvando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </ModalBase>
  );
}

type ResultadoPagamento =
  | { status: "renovada"; proximoVencimento: string | null }
  | { status: "quitada" };

function MarcarPagaModal({
  divida,
  onFechar,
  onSalvo,
}: {
  divida: Divida;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const falta = valorFaltanteDivida(divida.valor_total, divida.valor_pago);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoPagamento | null>(null);

  async function confirmar() {
    setErro(null);
    setSalvando(true);
    const resposta = await fetch(`/api/dividas/${divida.id}/pagar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor_pago: falta }),
    });
    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível marcar a dívida como paga.");
      return;
    }

    const dados = await resposta.json();
    onSalvo();

    if (dados.status === "renovada") {
      setResultado({ status: "renovada", proximoVencimento: dados.proximoVencimento ?? null });
    } else {
      setResultado({ status: "quitada" });
    }
  }

  if (resultado) {
    return (
      <ModalBase titulo={`Pagamento — ${divida.credor}`} onFechar={onFechar}>
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {resultado.status === "renovada" ? (
            <>
              <p className="text-sm font-medium text-on-surface">Dívida renovada para o próximo ciclo</p>
              {resultado.proximoVencimento && (
                <p className="text-sm text-on-surface-variant">
                  Próxima data de pagamento:{" "}
                  <span className="font-semibold text-on-surface tnum">
                    {formatarData(resultado.proximoVencimento)}
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-medium text-on-surface">
              Dívida quitada e movida para <span className="text-on-surface-variant">Dívidas Pagas</span>.
            </p>
          )}

          <button onClick={onFechar} className="btn-primary w-full">
            Ok
          </button>
        </div>
      </ModalBase>
    );
  }

  return (
    <ModalBase titulo={`Marcar como Paga — ${divida.credor}`} onFechar={onFechar}>
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          Isso registra o pagamento de{" "}
          <span className="font-semibold text-on-surface tnum">{formatarMoeda(falta)}</span> e quita o valor
          total desta dívida.
        </p>

        {erro && <p className="text-sm text-error">{erro}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onFechar} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button onClick={confirmar} disabled={salvando} className="btn-success flex-1">
            {salvando ? "Confirmando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

function ModalBase({ titulo, onFechar, children }: { titulo: string; onFechar: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest border border-outline-variant w-full sm:max-w-sm rounded-t-xl sm:rounded-xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-on-surface">{titulo}</h2>
          <button onClick={onFechar} aria-label="Fechar" className="text-on-surface-variant hover:text-on-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
