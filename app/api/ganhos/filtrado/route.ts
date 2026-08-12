import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { diaDaSemana, diferencaDias, somaValores } from "@/lib/financas";

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
  const tipo = searchParams.get("type");

  if (tipo === "dia_semana") {
    const diaParam = searchParams.get("dia");
    const dia = diaParam !== null ? Number(diaParam) : NaN;

    if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
      return NextResponse.json(
        { erro: "Parâmetro 'dia' inválido. Use um número de 0 (domingo) a 6 (sábado)." },
        { status: 400 }
      );
    }

    const { data: ganhos, error } = await supabase
      .from("ganhos")
      .select("*")
      .eq("usuario_id", user.id)
      .order("data", { ascending: false });

    if (error) {
      return NextResponse.json({ erro: "Não foi possível buscar os ganhos." }, { status: 500 });
    }

    const filtrados = (ganhos ?? []).filter((g) => diaDaSemana(g.data) === dia);
    const total = somaValores(filtrados);
    const quantidadeDias = new Set(filtrados.map((g) => g.data)).size;
    const mediaDiaria = quantidadeDias > 0 ? total / quantidadeDias : 0;

    return NextResponse.json({ ganhos: filtrados, total, mediaDiaria, quantidadeDias });
  }

  if (tipo === "intervalo") {
    const dataInicio = searchParams.get("data_inicio");
    const dataFim = searchParams.get("data_fim");

    if (!dataInicio || !dataFim || !DATA_REGEX.test(dataInicio) || !DATA_REGEX.test(dataFim)) {
      return NextResponse.json(
        { erro: "Informe data_inicio e data_fim no formato YYYY-MM-DD." },
        { status: 400 }
      );
    }

    if (dataInicio > dataFim) {
      return NextResponse.json({ erro: "data_inicio não pode ser posterior a data_fim." }, { status: 400 });
    }

    const { data: ganhos, error } = await supabase
      .from("ganhos")
      .select("*")
      .eq("usuario_id", user.id)
      .gte("data", dataInicio)
      .lte("data", dataFim)
      .order("data", { ascending: false });

    if (error) {
      return NextResponse.json({ erro: "Não foi possível buscar os ganhos." }, { status: 500 });
    }

    const total = somaValores(ganhos ?? []);
    const quantidadeDias = diferencaDias(dataInicio, dataFim) + 1;
    const mediaDiaria = quantidadeDias > 0 ? total / quantidadeDias : 0;

    return NextResponse.json({ ganhos: ganhos ?? [], total, mediaDiaria, quantidadeDias });
  }

  return NextResponse.json(
    { erro: "Parâmetro 'type' inválido. Use 'dia_semana' ou 'intervalo'." },
    { status: 400 }
  );
}
