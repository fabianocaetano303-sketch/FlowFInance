import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hojeISO } from "@/lib/financas";

/**
 * POST /api/dividas/:id/separar
 * Body: { valor_separado: number }
 *
 * Soma o valor informado ao valor_separado já guardado para a dívida
 * (dinheiro reservado, ainda não pago) e registra o histórico em separacoes_divida.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const dividaId = params.id;
  const { valor_separado } = await request.json();
  const valorSeparado = Number(valor_separado);

  if (!dividaId || !valorSeparado || valorSeparado <= 0) {
    return NextResponse.json({ erro: "Informe um valor válido para separar." }, { status: 400 });
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
    .from("separacoes_divida")
    .insert({ divida_id: dividaId, valor_separado: valorSeparado, data_separacao: hoje });

  if (erroInsert) {
    return NextResponse.json({ erro: "Não foi possível registrar a separação." }, { status: 500 });
  }

  const novoValorSeparado = Number(divida.valor_separado) + valorSeparado;

  await supabase.from("dividas").update({ valor_separado: novoValorSeparado }).eq("id", dividaId);

  return NextResponse.json({ status: "ok", valorSeparado: novoValorSeparado });
}
