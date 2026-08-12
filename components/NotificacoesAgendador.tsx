"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NotificacoesPreferencias } from "@/lib/types";
import { formatarMoeda, hojeISO, urgenciaDivida } from "@/lib/financas";
import { agendarDiario, agendarSemanal, mostrarNotificacao, registrarServiceWorker } from "@/lib/notificacoes";

export default function NotificacoesAgendador({
  preferencias,
  nome,
  metaDiaria,
}: {
  preferencias: NotificacoesPreferencias;
  nome: string;
  metaDiaria: number;
}) {
  useEffect(() => {
    if (!preferencias.habilitado) return;

    registrarServiceWorker();

    const cancelamentos: Array<() => void> = [];

    cancelamentos.push(
      agendarDiario(preferencias.horario_matinal.slice(0, 5), () => {
        mostrarNotificacao(`Bom dia, ${nome}!`, `Você tem uma meta de ${formatarMoeda(metaDiaria)} hoje. Bora trabalhar?`, "/", "matinal");
      })
    );

    cancelamentos.push(
      agendarDiario(preferencias.horario_noturno.slice(0, 5), () => {
        mostrarNotificacao("Hora de refletir", "Registrou seus ganhos e gastos hoje? Vamos ao diário?", "/vida/diario", "noturna");
      })
    );

    cancelamentos.push(
      agendarSemanal(1, "10:00", () => {
        mostrarNotificacao("Análise semanal pronta", "Como foi sua semana? Vamos analisar?", "/vida/semana", "semanal");
      })
    );

    verificarDividaUrgente();

    return () => cancelamentos.forEach((cancelar) => cancelar());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferencias.habilitado, preferencias.horario_matinal, preferencias.horario_noturno]);

  async function verificarDividaUrgente() {
    const hoje = hojeISO();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: dividas } = await supabase.from("dividas").select("*").eq("usuario_id", user.id).eq("status", "aberta");
    if (!dividas) return;

    const urgentes = dividas
      .map((d) => ({ divida: d, urgencia: urgenciaDivida(d.prazo_vencimento, hoje) }))
      .filter((d) => d.urgencia.diasRestantes !== null && d.urgencia.diasRestantes >= 0 && d.urgencia.diasRestantes <= 3)
      .sort((a, b) => (a.urgencia.diasRestantes ?? 0) - (b.urgencia.diasRestantes ?? 0));

    if (urgentes.length === 0) return;

    const maisUrgente = urgentes[0];
    const chave = `ff_notif_divida_${maisUrgente.divida.id}_${hoje}`;
    if (localStorage.getItem(chave)) return;

    const dias = maisUrgente.urgencia.diasRestantes ?? 0;
    const quando = dias === 0 ? "vence hoje" : dias === 1 ? "vence amanhã" : `vence em ${dias} dias`;

    await mostrarNotificacao(
      "Dívida vencendo!",
      `${maisUrgente.divida.credor} ${quando}. Já separou dinheiro?`,
      "/dividas",
      "divida-urgente"
    );
    localStorage.setItem(chave, "1");
  }

  return null;
}
