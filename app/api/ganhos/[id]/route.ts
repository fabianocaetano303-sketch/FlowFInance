import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

async function buscarGanho(supabase: ReturnType<typeof createClient>, id: string, usuarioId: string) {
  return supabase.from("ganhos").select("*").eq("id", id).eq("usuario_id", usuarioId).single();
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: ganho, error: erroBusca } = await buscarGanho(supabase, params.id, user.id);
  if (erroBusca || !ganho) {
    return NextResponse.json({ erro: "Ganho não encontrado." }, { status: 404 });
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

  if (Object.keys(atualizacao).length === 0) {
    return NextResponse.json({ erro: "Nada para atualizar." }, { status: 400 });
  }

  atualizacao.atualizado_em = new Date().toISOString();

  const { data: atualizado, error: erroUpdate } = await supabase
    .from("ganhos")
    .update(atualizacao)
    .eq("id", params.id)
    .eq("usuario_id", user.id)
    .select("*")
    .single();

  if (erroUpdate) {
    return NextResponse.json({ erro: "Não foi possível atualizar o ganho." }, { status: 500 });
  }

  return NextResponse.json({ ganho: atualizado });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: ganho, error: erroBusca } = await buscarGanho(supabase, params.id, user.id);
  if (erroBusca || !ganho) {
    return NextResponse.json({ erro: "Ganho não encontrado." }, { status: 404 });
  }

  const { error: erroDelete } = await supabase.from("ganhos").delete().eq("id", params.id).eq("usuario_id", user.id);

  if (erroDelete) {
    return NextResponse.json({ erro: "Não foi possível excluir o ganho." }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
