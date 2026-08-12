import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGanhosPeriodo, getGastosPeriodo } from "@/lib/queries";
import { hojeISO, somaValores } from "@/lib/financas";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const hoje = hojeISO();
  const [ganhos, gastos] = await Promise.all([
    getGanhosPeriodo(user.id, hoje, hoje),
    getGastosPeriodo(user.id, hoje, hoje),
  ]);

  const totalGanhos = somaValores(ganhos);
  const totalGastos = somaValores(gastos);

  return NextResponse.json({
    dia: hoje,
    ganhoDia: totalGanhos,
    gastoDia: totalGastos,
    sobrouDia: totalGanhos - totalGastos,
  });
}
