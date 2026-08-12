import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hojeISO, proximaOcorrenciaDia } from "@/lib/financas";

export const dynamic = "force-dynamic";

function autorizado(request: Request): boolean {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;

  const cabecalhoAuth = request.headers.get("authorization");
  if (cabecalhoAuth === `Bearer ${segredo}`) return true;

  const { searchParams } = new URL(request.url);
  return searchParams.get("secret") === segredo;
}

/**
 * Job diário: renova automaticamente dívidas recorrentes cujo ciclo já venceu
 * (prazo_vencimento <= hoje), avançando para a próxima ocorrência do
 * dia_recorrencia configurado. Disparado por um agendador externo (ex: Vercel
 * Cron, configurado em vercel.json) autenticado via CRON_SECRET.
 */
export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const hoje = hojeISO();

  const { data: dividasVencidas, error: erroBusca } = await supabase
    .from("dividas")
    .select("*")
    .eq("tipo", "recorrente")
    .eq("status", "aberta")
    .not("dia_recorrencia", "is", null)
    .lte("prazo_vencimento", hoje);

  if (erroBusca) {
    return NextResponse.json({ erro: "Não foi possível buscar dívidas recorrentes." }, { status: 500 });
  }

  const renovadas: { id: string; credor: string; prazoAnterior: string | null; novoPrazo: string }[] = [];

  for (const divida of dividasVencidas ?? []) {
    if (!divida.dia_recorrencia) continue;

    const referencia = divida.prazo_vencimento ?? hoje;
    const novoPrazo = proximaOcorrenciaDia(referencia, divida.dia_recorrencia, true);

    const { error: erroUpdate } = await supabase
      .from("dividas")
      .update({ valor_pago: 0, status: "aberta", prazo_vencimento: novoPrazo })
      .eq("id", divida.id);

    if (!erroUpdate) {
      renovadas.push({
        id: divida.id,
        credor: divida.credor,
        prazoAnterior: divida.prazo_vencimento,
        novoPrazo,
      });
    }
  }

  return NextResponse.json({ executadoEm: hoje, renovadas: renovadas.length, dividas: renovadas });
}
