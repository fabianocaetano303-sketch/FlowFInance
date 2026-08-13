import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/dividas/:id
 *
 * Exclui definitivamente uma dívida já paga (ex: marcada como paga por
 * engano). O delete cascateia pra pagamentos_divida e separacoes_divida
 * (FK on delete cascade no schema), então o histórico de pagamento some
 * junto — e com isso deixa de contar em qualquer resumo/relatório.
 * Não permite excluir dívida ainda aberta por essa rota.
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: divida, error: erroBusca } = await supabase
    .from("dividas")
    .select("*")
    .eq("id", params.id)
    .eq("usuario_id", user.id)
    .single();

  if (erroBusca || !divida) {
    return NextResponse.json({ erro: "Dívida não encontrada." }, { status: 404 });
  }

  if (divida.status !== "paga") {
    return NextResponse.json({ erro: "Só é possível excluir dívidas já pagas." }, { status: 400 });
  }

  const { error: erroDelete } = await supabase.from("dividas").delete().eq("id", params.id).eq("usuario_id", user.id);

  if (erroDelete) {
    return NextResponse.json({ erro: "Não foi possível excluir a dívida." }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
