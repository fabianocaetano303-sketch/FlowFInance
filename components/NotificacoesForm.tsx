"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { NotificacoesPreferencias } from "@/lib/types";
import { notificacoesSuportadas, pedirPermissao, registrarServiceWorker } from "@/lib/notificacoes";

export default function NotificacoesForm({ preferencias }: { preferencias: NotificacoesPreferencias }) {
  const router = useRouter();
  const [habilitado, setHabilitado] = useState(preferencias.habilitado);
  const [horarioMatinal, setHorarioMatinal] = useState(preferencias.horario_matinal.slice(0, 5));
  const [horarioNoturno, setHorarioNoturno] = useState(preferencias.horario_noturno.slice(0, 5));
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [permissaoNegada, setPermissaoNegada] = useState(false);

  const suportado = notificacoesSuportadas();

  async function alternarHabilitado(novoValor: boolean) {
    setErro(null);
    setPermissaoNegada(false);

    if (novoValor) {
      const permissao = await pedirPermissao();
      if (permissao === "denied") {
        setPermissaoNegada(true);
        return;
      }
      if (permissao === "unsupported") {
        setErro("Seu navegador não suporta notificações.");
        return;
      }
      await registrarServiceWorker();
    }

    setHabilitado(novoValor);
  }

  async function salvar() {
    setErro(null);
    setSalvando(true);
    setSucesso(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("notificacoes_preferencias")
      .update({
        habilitado,
        horario_matinal: horarioMatinal,
        horario_noturno: horarioNoturno,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", preferencias.id);

    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar as preferências.");
      return;
    }
    setSucesso(true);
    router.refresh();
  }

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-on-surface">Lembretes</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Notificações no navegador enquanto o app estiver aberto</p>
        </div>
        <button
          type="button"
          onClick={() => alternarHabilitado(!habilitado)}
          role="switch"
          aria-checked={habilitado}
          className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${habilitado ? "bg-primary" : "bg-surface-container-high"}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${habilitado ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
      </div>

      {!suportado && <p className="text-xs text-warning">Seu navegador não suporta notificações web.</p>}
      {permissaoNegada && (
        <p className="text-xs text-tertiary">
          Permissão de notificação bloqueada. Habilite nas configurações do navegador para este site.
        </p>
      )}

      {habilitado && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Lembrete matinal</label>
            <input type="time" value={horarioMatinal} onChange={(e) => setHorarioMatinal(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-field">Lembrete noturno</label>
            <input type="time" value={horarioNoturno} onChange={(e) => setHorarioNoturno(e.target.value)} className="input-field" />
          </div>
        </div>
      )}

      <p className="text-xs text-on-surface-variant">
        Também avisa quando uma dívida vence em até 3 dias e, toda segunda às 10h, que a análise semanal está disponível.
      </p>

      {erro && <p className="text-sm text-error">{erro}</p>}
      {sucesso && !salvando && <p className="text-sm text-secondary">Preferências salvas.</p>}

      <button type="button" onClick={salvar} disabled={salvando} className="btn-primary w-full">
        {salvando ? "Salvando..." : "Salvar Preferências"}
      </button>
    </div>
  );
}
