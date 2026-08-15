import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGanhosPeriodo, getGastosPeriodo } from "@/lib/queries";
import { somaValores } from "@/lib/financas";

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** GET /api/dia/:data — todos os ganhos e gastos de um dia específico, com resumo. */
export async function GET(_request: Request, { params }: { params: { data: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  if (!DATA_REGEX.test(params.data)) {
    return NextResponse.json({ erro: "Data inválida. Use o formato YYYY-MM-DD." }, { status: 400 });
  }

  const [ganhos, gastos] = await Promise.all([
    getGanhosPeriodo(user.id, params.data, params.data),
    getGastosPeriodo(user.id, params.data, params.data),
  ]);

  const ganhoDia = somaValores(ganhos);
  const gastoDia = somaValores(gastos);

  return NextResponse.json({
    data: params.data,
    ganhos,
    gastos,
    resumo: { ganhoDia, gastoDia, sobrouDia: ganhoDia - gastoDia },
  });
}
