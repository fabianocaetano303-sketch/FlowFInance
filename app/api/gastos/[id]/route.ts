import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIAS } from "@/lib/types";

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

async function buscarGasto(supabase: ReturnType<typeof createClient>, id: string, usuarioId: string) {
  return supabase.from("gastos").select("*").eq("id", id).eq("usuario_id", usuarioId).single();
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: gasto, error: erroBusca } = await buscarGasto(supabase, params.id, user.id);
  if (erroBusca || !gasto) {
    return NextResponse.json({ erro: "Gasto não encontrado." }, { status: 404 });
  }

  const body = await request.json();
  const atualizacao: Record<string, unknown> = {};

  if (body.valor !== undefined) {
    const valor = Number(body.valor);
    if (!valor || valor <= 0) {
      return NextResponse.json({ erro: "Valor inválido." }, { status: 400 });
    }
    atualizacao.valor = valor;
  }

  if (body.descricao !== undefined) {
    if (typeof body.descricao !== "string" || !body.descricao.trim()) {
      return NextResponse.json({ erro: "Descrição inválida." }, { status: 400 });
    }
    atualizacao.descricao = body.descricao.trim();
  }

  if (body.data !== undefined) {
    if (typeof body.data !== "string" || !DATA_REGEX.test(body.data)) {
      return NextResponse.json({ erro: "Data inválida. Use o formato YYYY-MM-DD." }, { status: 400 });
    }
    atualizacao.data = body.data;
  }

  if (body.categoria !== undefined) {
    if (!CATEGORIAS.includes(body.categoria)) {
      return NextResponse.json({ erro: "Categoria inválida." }, { status: 400 });
    }
    atualizacao.categoria = body.categoria;
  }

  if (body.eh_desnecessario !== undefined) {
    atualizacao.eh_desnecessario = Boolean(body.eh_desnecessario);
  }

  if (Object.keys(atualizacao).length === 0) {
    return NextResponse.json({ erro: "Nada para atualizar." }, { status: 400 });
  }

  atualizacao.atualizado_em = new Date().toISOString();

  const { data: atualizado, error: erroUpdate } = await supabase
    .from("gastos")
    .update(atualizacao)
    .eq("id", params.id)
    .eq("usuario_id", user.id)
    .select("*")
    .single();

  if (erroUpdate) {
    return NextResponse.json({ erro: "Não foi possível atualizar o gasto." }, { status: 500 });
  }

  return NextResponse.json({ gasto: atualizado });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: gasto, error: erroBusca } = await buscarGasto(supabase, params.id, user.id);
  if (erroBusca || !gasto) {
    return NextResponse.json({ erro: "Gasto não encontrado." }, { status: 404 });
  }

  const { error: erroDelete } = await supabase.from("gastos").delete().eq("id", params.id).eq("usuario_id", user.id);

  if (erroDelete) {
    return NextResponse.json({ erro: "Não foi possível excluir o gasto." }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
