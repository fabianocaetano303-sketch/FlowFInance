import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hojeISO, proximaOcorrenciaDia, proximoMes } from "@/lib/financas";

/**
 * PATCH /api/dividas/:id/pagar
 * Body: { valor_pago: number }
 *
 * Registra um pagamento (parcial ou total) sobre uma dívida.
 * Quando o total acumulado atinge valor_total:
 *  - recorrente: reseta valor_pago para 0, mantém status 'aberta' e avança
 *    prazo_vencimento para o próximo ciclo (dia_recorrencia) — a dívida continua aparecendo.
 *  - unica: muda status para 'paga' — sai da lista de dívidas ativas, mas o
 *    registro é preservado (histórico) em vez de ser removido do banco.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const dividaId = params.id;
  const { valor_pago } = await request.json();
  const valorPago = Number(valor_pago);

  if (!dividaId || !valorPago || valorPago <= 0) {
    return NextResponse.json({ erro: "Informe um valor a pagar válido." }, { status: 400 });
  }

  const { data: divida, error: erroBusca } = await supabase
    .from("dividas")
    .select("*")
    .eq("id", dividaId)
    .eq("usuario_id", user.id)
    .single();

  if (erroBusca || !divida) {
    return NextResponse.json({ erro: "Dívida não encontrada." }, { status: 404 });
  }

  if (divida.status !== "aberta") {
    return NextResponse.json({ erro: "Esta dívida já está paga." }, { status: 400 });
  }

  const hoje = hojeISO();

  const { error: erroInsert } = await supabase
    .from("pagamentos_divida")
    .insert({ divida_id: dividaId, valor_pago: valorPago, data_pagamento: hoje });

  if (erroInsert) {
    return NextResponse.json({ erro: "Não foi possível registrar o pagamento." }, { status: 500 });
  }

  const novoValorPago = Number(divida.valor_pago) + valorPago;
  const quitada = novoValorPago >= Number(divida.valor_total);

  if (!quitada) {
    await supabase.from("dividas").update({ valor_pago: novoValorPago }).eq("id", dividaId);
    return NextResponse.json({ status: "parcial", valorPago: novoValorPago });
  }

  if (divida.tipo === "unica") {
    await supabase
      .from("dividas")
      .update({ valor_pago: novoValorPago, valor_separado: 0, status: "paga" })
      .eq("id", dividaId);
    return NextResponse.json({ status: "quitada" });
  }

  // recorrente: reseta para o próximo ciclo. Com dia_recorrencia definido, avança sempre
  // para o mesmo dia do mês seguinte; sem ele, mantém o comportamento antigo (avança 1 mês
  // a partir do prazo atual) para dívidas criadas antes desse campo existir.
  const proximoVencimento = divida.dia_recorrencia
    ? proximaOcorrenciaDia(hoje, divida.dia_recorrencia, true)
    : divida.prazo_vencimento
      ? proximoMes(divida.prazo_vencimento)
      : null;

  await supabase
    .from("dividas")
    .update({ valor_pago: 0, valor_separado: 0, status: "aberta", prazo_vencimento: proximoVencimento })
    .eq("id", dividaId);

  return NextResponse.json({ status: "renovada", proximoVencimento });
}
