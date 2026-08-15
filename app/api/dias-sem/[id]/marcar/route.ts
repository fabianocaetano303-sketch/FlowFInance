import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { diasAtras, hojeISO } from "@/lib/financas";
import { calcularStreakDiasSem, JANELA_STREAK_DIAS } from "@/lib/diasSem";

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** POST /api/dias-sem/:id/marcar — Body: { data, marcado }. Upsert do dia + recalcula o streak. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
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
    .is("deletado_em", null)
    .single();

  if (erroBusca || !rastreador) {
    return NextResponse.json({ erro: "Rastreador não encontrado." }, { status: 404 });
  }

  const body = await request.json();
  const data = body.data;
  const marcado = Boolean(body.marcado);

  if (typeof data !== "string" || !DATA_REGEX.test(data)) {
    return NextResponse.json({ erro: "Data inválida. Use o formato YYYY-MM-DD." }, { status: 400 });
  }

  const { error: erroUpsert } = await supabase
    .from("dias_sem_log")
    .upsert({ dias_sem_id: params.id, data, marcado }, { onConflict: "dias_sem_id,data" });

  if (erroUpsert) {
    return NextResponse.json({ erro: "Não foi possível salvar a marcação." }, { status: 500 });
  }

  const hoje = hojeISO();
  const { data: logs } = await supabase
    .from("dias_sem_log")
    .select("data, marcado")
    .eq("dias_sem_id", params.id)
    .gte("data", diasAtras(JANELA_STREAK_DIAS))
    .lte("data", hoje);

  const logPorData: Record<string, boolean> = {};
  for (const registro of logs ?? []) logPorData[registro.data] = registro.marcado;

  const streak = calcularStreakDiasSem(logPorData, hoje);

  return NextResponse.json({ status: "ok", streak });
}
