import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { somaValores } from "@/lib/financas";

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const busca = searchParams.get("busca")?.trim();
  const categoria = searchParams.get("categoria")?.trim();
  const dataInicio = searchParams.get("data_inicio");
  const dataFim = searchParams.get("data_fim");
  const valorMinParam = searchParams.get("valor_min");
  const valorMaxParam = searchParams.get("valor_max");

  if (dataInicio && !DATA_REGEX.test(dataInicio)) {
    return NextResponse.json({ erro: "data_inicio inválida. Use o formato YYYY-MM-DD." }, { status: 400 });
  }
  if (dataFim && !DATA_REGEX.test(dataFim)) {
    return NextResponse.json({ erro: "data_fim inválida. Use o formato YYYY-MM-DD." }, { status: 400 });
  }
  if (dataInicio && dataFim && dataInicio > dataFim) {
    return NextResponse.json({ erro: "data_inicio não pode ser posterior a data_fim." }, { status: 400 });
  }

  const valorMin = valorMinParam !== null ? Number(valorMinParam) : null;
  const valorMax = valorMaxParam !== null ? Number(valorMaxParam) : null;
  if (valorMinParam !== null && Number.isNaN(valorMin)) {
    return NextResponse.json({ erro: "valor_min inválido." }, { status: 400 });
  }
  if (valorMaxParam !== null && Number.isNaN(valorMax)) {
    return NextResponse.json({ erro: "valor_max inválido." }, { status: 400 });
  }

  let query = supabase.from("gastos").select("*").eq("usuario_id", user.id);

  if (busca) query = query.ilike("descricao", `%${busca}%`);
  if (categoria) query = query.eq("categoria", categoria);
  if (dataInicio) query = query.gte("data", dataInicio);
  if (dataFim) query = query.lte("data", dataFim);
  if (valorMin !== null) query = query.gte("valor", valorMin);
  if (valorMax !== null) query = query.lte("valor", valorMax);

  const { data: gastos, error } = await query.order("data", { ascending: false });

  if (error) {
    return NextResponse.json({ erro: "Não foi possível buscar os gastos." }, { status: 500 });
  }

  const total = somaValores(gastos ?? []);

  return NextResponse.json({ gastos: gastos ?? [], total, quantidade: (gastos ?? []).length });
}
