import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/dias-sem — lista os rastreadores ativos (não deletados) do usuário. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("dias_sem")
    .select("*")
    .eq("usuario_id", user.id)
    .is("deletado_em", null)
    .order("criado_em", { ascending: true });

  if (error) {
    return NextResponse.json({ erro: "Não foi possível buscar os rastreadores." }, { status: 500 });
  }

  return NextResponse.json({ rastreadores: data ?? [] });
}

/** POST /api/dias-sem — cria um novo rastreador. Body: { descricao } */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { descricao } = await request.json();

  if (typeof descricao !== "string" || !descricao.trim()) {
    return NextResponse.json({ erro: "Informe o que você quer evitar." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dias_sem")
    .insert({ usuario_id: user.id, descricao: descricao.trim() })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ erro: "Não foi possível criar o rastreador." }, { status: 500 });
  }

  return NextResponse.json({ rastreador: data });
}
