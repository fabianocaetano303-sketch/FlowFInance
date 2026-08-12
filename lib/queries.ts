import { createClient } from "@/lib/supabase/server";
import type {
  ConfiguracoesUsuario,
  Divida,
  Gasto,
  Ganho,
  NotificacoesPreferencias,
  VidaAnaliseSemanal,
  VidaConfiguracoes,
  VidaDiario,
  VidaHabito,
  VidaHabitoHistorico,
  VidaMeta,
  VidaProposito,
} from "@/lib/types";
import type { HistoricoPorHabito } from "@/lib/vida";

export async function getUsuarioAtual() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getConfiguracoes(usuarioId: string): Promise<ConfiguracoesUsuario> {
  const supabase = createClient();
  const { data } = await supabase
    .from("configuracoes_usuario")
    .select("*")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (data) return data as ConfiguracoesUsuario;

  // fallback: cria configuracoes padrao se o trigger nao tiver rodado ainda
  const { data: criado } = await supabase
    .from("configuracoes_usuario")
    .insert({ usuario_id: usuarioId })
    .select("*")
    .single();

  return criado as ConfiguracoesUsuario;
}

export async function getGanhosPeriodo(usuarioId: string, inicio: string, fim: string): Promise<Ganho[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ganhos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: false });
  return (data as Ganho[]) || [];
}

export async function getGastosPeriodo(usuarioId: string, inicio: string, fim: string): Promise<Gasto[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("gastos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: false });
  return (data as Gasto[]) || [];
}

export async function getGanhosTodos(usuarioId: string): Promise<Ganho[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ganhos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });
  return (data as Ganho[]) || [];
}

export async function getGastosTodos(usuarioId: string): Promise<Gasto[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("gastos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });
  return (data as Gasto[]) || [];
}

export async function getDividas(usuarioId: string): Promise<Divida[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("dividas")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("status", { ascending: true })
    .order("prazo_vencimento", { ascending: true, nullsFirst: false });
  return (data as Divida[]) || [];
}

export async function getProposito(usuarioId: string): Promise<VidaProposito> {
  const supabase = createClient();
  const { data } = await supabase.from("vida_propositos").select("*").eq("usuario_id", usuarioId).maybeSingle();

  if (data) return data as VidaProposito;

  const { data: criado } = await supabase
    .from("vida_propositos")
    .insert({ usuario_id: usuarioId })
    .select("*")
    .single();

  return criado as VidaProposito;
}

export async function getConfiguracoesVida(usuarioId: string): Promise<VidaConfiguracoes> {
  const supabase = createClient();
  const { data } = await supabase.from("vida_configuracoes").select("*").eq("usuario_id", usuarioId).maybeSingle();

  if (data) return data as VidaConfiguracoes;

  const { data: criado } = await supabase
    .from("vida_configuracoes")
    .insert({ usuario_id: usuarioId })
    .select("*")
    .single();

  return criado as VidaConfiguracoes;
}

export async function getMetas(usuarioId: string): Promise<VidaMeta[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vida_metas")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("concluida", { ascending: true })
    .order("prazo", { ascending: true, nullsFirst: false });
  return (data as VidaMeta[]) || [];
}

export async function getHabitos(usuarioId: string): Promise<VidaHabito[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vida_habitos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("criado_em", { ascending: true });
  return (data as VidaHabito[]) || [];
}

export async function getHabitosHistorico(
  habitoIds: string[],
  inicio: string,
  fim: string
): Promise<HistoricoPorHabito> {
  const mapa: HistoricoPorHabito = {};
  if (habitoIds.length === 0) return mapa;

  const supabase = createClient();
  const { data } = await supabase
    .from("vida_habitos_historico")
    .select("*")
    .in("habito_id", habitoIds)
    .gte("data", inicio)
    .lte("data", fim);

  for (const registro of (data as VidaHabitoHistorico[]) || []) {
    if (!mapa[registro.habito_id]) mapa[registro.habito_id] = {};
    mapa[registro.habito_id][registro.data] = registro.concluido;
  }
  return mapa;
}

export async function getDiarioEntradas(usuarioId: string, limite = 30): Promise<VidaDiario[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vida_diario")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("data", { ascending: false })
    .limit(limite);
  return (data as VidaDiario[]) || [];
}

export async function getDiarioPeriodo(usuarioId: string, inicio: string, fim: string): Promise<VidaDiario[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vida_diario")
    .select("*")
    .eq("usuario_id", usuarioId)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: false });
  return (data as VidaDiario[]) || [];
}

export async function getDiarioHoje(usuarioId: string, hoje: string): Promise<VidaDiario | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vida_diario")
    .select("*")
    .eq("usuario_id", usuarioId)
    .eq("data", hoje)
    .maybeSingle();
  return (data as VidaDiario) || null;
}

export async function getAnalisesSemanais(usuarioId: string): Promise<VidaAnaliseSemanal[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vida_analises_semanais")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("data", { ascending: false });
  return (data as VidaAnaliseSemanal[]) || [];
}

export async function getNotificacoesPreferencias(usuarioId: string): Promise<NotificacoesPreferencias> {
  const supabase = createClient();
  const { data } = await supabase
    .from("notificacoes_preferencias")
    .select("*")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (data) return data as NotificacoesPreferencias;

  const { data: criado } = await supabase
    .from("notificacoes_preferencias")
    .insert({ usuario_id: usuarioId })
    .select("*")
    .single();

  return criado as NotificacoesPreferencias;
}
