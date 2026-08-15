import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** DELETE /api/dias-sem/:id — soft delete (seta deletado_em); some da lista mas fica no banco. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: rastreador, error: erroBusca } = await supabase
    .from("dias_sem")
    .select("*")
    .eq("id", params.id)
    .eq("usuario_id", user.id)
    .single();

  if (erroBusca || !rastreador) {
    return NextResponse.json({ erro: "Rastreador não encontrado." }, { status: 404 });
  }

  const { error: erroUpdate } = await supabase
    .from("dias_sem")
    .update({ deletado_em: new Date().toISOString() })
    .eq("id", params.id)
    .eq("usuario_id", user.id);

  if (erroUpdate) {
    return NextResponse.json({ erro: "Não foi possível excluir o rastreador." }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
