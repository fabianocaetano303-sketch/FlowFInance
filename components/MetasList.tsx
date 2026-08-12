"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { TipoMeta, VidaMeta } from "@/lib/types";
import { formatarData, hojeISO } from "@/lib/financas";
import { progressoMeta, type ProgressoMetas } from "@/lib/vida";
import BarraProgresso from "@/components/BarraProgresso";

const LABEL_TIPO: Record<TipoMeta, string> = {
  financeiro: "Financeiro",
  pessoal: "Pessoal",
  saude: "Saúde",
};

export default function MetasList({ metas, progresso }: { metas: VidaMeta[]; progresso: ProgressoMetas }) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);

  const pendentes = metas.filter((m) => !m.concluida);
  const concluidas = metas.filter((m) => m.concluida);

  function atualizar() {
    router.refresh();
  }

  async function alternarConcluida(meta: VidaMeta) {
    const supabase = createClient();
    const concluida = !meta.concluida;
    await supabase
      .from("vida_metas")
      .update({ concluida, data_conclusao: concluida ? hojeISO() : null })
      .eq("id", meta.id);
    atualizar();
  }

  return (
    <div className="space-y-4">
      <div className="card !p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-on-surface">Metas deste mês</p>
          <p className="text-sm font-semibold text-secondary tnum">{progresso.percentual}%</p>
        </div>
        <p className="text-xs text-on-surface-variant tnum">
          {progresso.concluidas} de {progresso.total} concluídas
        </p>
      </div>

      <button onClick={() => setModalAberto(true)} className="btn-primary w-full flex items-center justify-center gap-2">
        <span className="text-lg leading-none">+</span> Nova Meta
      </button>

      {metas.length === 0 ? (
        <div className="card text-center text-sm text-on-surface-variant">Nenhuma meta cadastrada ainda.</div>
      ) : (
        <div className="space-y-2">
          {[...pendentes, ...concluidas].map((meta) => (
            <MetaCard key={meta.id} meta={meta} onAlternar={() => alternarConcluida(meta)} />
          ))}
        </div>
      )}

      {modalAberto && <NovaMetaModal onFechar={() => setModalAberto(false)} onSalvo={atualizar} />}
    </div>
  );
}

function MetaCard({ meta, onAlternar }: { meta: VidaMeta; onAlternar: () => void }) {
  const progresso = progressoMeta(meta);

  return (
    <div className={`card !p-4 ${meta.concluida ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={onAlternar}
          aria-label={meta.concluida ? "Marcar como não concluída" : "Marcar como concluída"}
          className={`mt-0.5 w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors ${
            meta.concluida ? "bg-primary border-primary text-on-primary" : "border-outline-variant"
          }`}
        >
          {meta.concluida && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-medium text-on-surface ${meta.concluida ? "line-through" : ""}`}>{meta.titulo}</p>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant shrink-0">
              {LABEL_TIPO[meta.tipo]}
            </span>
          </div>
          {meta.descricao && <p className="text-sm text-on-surface-variant mt-0.5">{meta.descricao}</p>}
        </div>
        {progresso.vencida && (
          <span className="text-[10px] font-semibold text-tertiary shrink-0 uppercase tracking-wide">Vencida</span>
        )}
      </div>

      <BarraProgresso percentual={progresso.percentual} cor={progresso.vencida ? "tertiary" : "primary"} altura="h-1.5" />
      {meta.prazo && <p className="text-xs text-on-surface-variant mt-1.5 tnum">Prazo: {formatarData(meta.prazo)}</p>}
    </div>
  );
}

function NovaMetaModal({ onFechar, onSalvo }: { onFechar: () => void; onSalvo: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [tipo, setTipo] = useState<TipoMeta>("pessoal");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(null);
    if (!titulo.trim()) {
      setErro("Informe um título para a meta.");
      return;
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

    const { error } = await supabase.from("vida_metas").insert({
      usuario_id: user.id,
      titulo,
      descricao: descricao || null,
      prazo: prazo || null,
      tipo,
    });

    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar a meta.");
      return;
    }

    onSalvo();
    onFechar();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest border border-outline-variant w-full sm:max-w-sm rounded-t-xl sm:rounded-xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-on-surface">Nova Meta</h2>
          <button onClick={onFechar} aria-label="Fechar" className="text-on-surface-variant hover:text-on-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-field">Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Terminar o curso" className="input-field" />
          </div>
          <div>
            <label className="label-field">Descrição (opcional)</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="input-field" />
          </div>
          <div>
            <label className="label-field">Prazo (opcional)</label>
            <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-field">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(LABEL_TIPO) as TipoMeta[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`py-2.5 rounded text-xs font-medium border ${
                    tipo === t ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface"
                  }`}
                >
                  {LABEL_TIPO[t]}
                </button>
              ))}
            </div>
          </div>

          {erro && <p className="text-sm text-error">{erro}</p>}

          <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
            {salvando ? "Salvando..." : "Salvar Meta"}
          </button>
        </div>
      </div>
    </div>
  );
}
