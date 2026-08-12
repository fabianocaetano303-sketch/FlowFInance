export type Categoria =
  | "Alimentação"
  | "Higiene"
  | "Gasto Idiota"
  | "Dívida"
  | "Contas"
  | "Emergência";

export const CATEGORIAS: Categoria[] = [
  "Alimentação",
  "Higiene",
  "Gasto Idiota",
  "Dívida",
  "Contas",
  "Emergência",
];

export type TipoDivida = "unica" | "recorrente";
export type StatusDivida = "aberta" | "paga";

export interface Ganho {
  id: string;
  usuario_id: string;
  valor: number;
  descricao: string;
  data: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Gasto {
  id: string;
  usuario_id: string;
  valor: number;
  categoria: string;
  descricao: string;
  eh_desnecessario: boolean;
  data: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Divida {
  id: string;
  usuario_id: string;
  credor: string;
  valor_total: number;
  valor_pago: number;
  valor_separado: number;
  tipo: TipoDivida;
  prazo_vencimento: string | null;
  dia_recorrencia: number | null;
  status: StatusDivida;
  criado_em: string;
  atualizado_em: string;
}

export interface PagamentoDivida {
  id: string;
  divida_id: string;
  valor_pago: number;
  data_pagamento: string;
  criado_em: string;
}

export interface SeparacaoDivida {
  id: string;
  divida_id: string;
  valor_separado: number;
  data_separacao: string;
  criado_em: string;
}

export interface ConfiguracoesUsuario {
  id: string;
  usuario_id: string;
  meta_diaria: number;
  orcamento_alimentacao: number;
  orcamento_higiene: number;
  orcamento_contas: number | null;
  criado_em: string;
  atualizado_em: string;
}

export type TipoMeta = "financeiro" | "pessoal" | "saude";
export type FrequenciaHabito = "diario" | "dias_uteis";

export interface VidaProposito {
  id: string;
  usuario_id: string;
  motivo: string | null;
  definicao_sucesso: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface VidaMeta {
  id: string;
  usuario_id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  tipo: TipoMeta;
  concluida: boolean;
  data_conclusao: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface VidaHabito {
  id: string;
  usuario_id: string;
  nome: string;
  frequencia: FrequenciaHabito;
  ativo: boolean;
  criado_em: string;
}

export interface VidaHabitoHistorico {
  id: string;
  habito_id: string;
  data: string;
  concluido: boolean;
  criado_em: string;
}

export interface VidaDiario {
  id: string;
  usuario_id: string;
  data: string;
  bem: string | null;
  melhorar: string | null;
  acao_amanha: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface VidaAnaliseSemanal {
  id: string;
  usuario_id: string;
  data: string;
  bateu_metas: boolean | null;
  maior_obstaculo: string | null;
  acoes_proxima_semana: string | null;
  nota_disciplina: number | null;
  criado_em: string;
}

export interface VidaConfiguracoes {
  id: string;
  usuario_id: string;
  horario_reflexao: string;
  horario_lembrete_manha: string;
  frases_motivacionais: string[];
  criado_em: string;
  atualizado_em: string;
}

export interface NotificacoesPreferencias {
  id: string;
  usuario_id: string;
  horario_matinal: string;
  horario_noturno: string;
  habilitado: boolean;
  subscription: unknown;
  criado_em: string;
  atualizado_em: string;
}

export type Database = {
  public: {
    Tables: {
      ganhos: {
        Row: Ganho;
        Insert: Partial<Ganho> & { valor: number; descricao: string; data: string; usuario_id: string };
        Update: Partial<Ganho>;
        Relationships: [];
      };
      gastos: {
        Row: Gasto;
        Insert: Partial<Gasto> & {
          valor: number;
          categoria: string;
          descricao: string;
          data: string;
          usuario_id: string;
        };
        Update: Partial<Gasto>;
        Relationships: [];
      };
      dividas: {
        Row: Divida;
        Insert: Partial<Divida> & {
          credor: string;
          valor_total: number;
          tipo: TipoDivida;
          usuario_id: string;
        };
        Update: Partial<Divida>;
        Relationships: [];
      };
      pagamentos_divida: {
        Row: PagamentoDivida;
        Insert: Partial<PagamentoDivida> & { divida_id: string; valor_pago: number; data_pagamento: string };
        Update: Partial<PagamentoDivida>;
        Relationships: [];
      };
      separacoes_divida: {
        Row: SeparacaoDivida;
        Insert: Partial<SeparacaoDivida> & { divida_id: string; valor_separado: number; data_separacao: string };
        Update: Partial<SeparacaoDivida>;
        Relationships: [];
      };
      configuracoes_usuario: {
        Row: ConfiguracoesUsuario;
        Insert: Partial<ConfiguracoesUsuario> & { usuario_id: string };
        Update: Partial<ConfiguracoesUsuario>;
        Relationships: [];
      };
      vida_propositos: {
        Row: VidaProposito;
        Insert: Partial<VidaProposito> & { usuario_id: string };
        Update: Partial<VidaProposito>;
        Relationships: [];
      };
      vida_metas: {
        Row: VidaMeta;
        Insert: Partial<VidaMeta> & { usuario_id: string; titulo: string; tipo: TipoMeta };
        Update: Partial<VidaMeta>;
        Relationships: [];
      };
      vida_habitos: {
        Row: VidaHabito;
        Insert: Partial<VidaHabito> & { usuario_id: string; nome: string };
        Update: Partial<VidaHabito>;
        Relationships: [];
      };
      vida_habitos_historico: {
        Row: VidaHabitoHistorico;
        Insert: Partial<VidaHabitoHistorico> & { habito_id: string; data: string };
        Update: Partial<VidaHabitoHistorico>;
        Relationships: [];
      };
      vida_diario: {
        Row: VidaDiario;
        Insert: Partial<VidaDiario> & { usuario_id: string; data: string };
        Update: Partial<VidaDiario>;
        Relationships: [];
      };
      vida_analises_semanais: {
        Row: VidaAnaliseSemanal;
        Insert: Partial<VidaAnaliseSemanal> & { usuario_id: string; data: string };
        Update: Partial<VidaAnaliseSemanal>;
        Relationships: [];
      };
      vida_configuracoes: {
        Row: VidaConfiguracoes;
        Insert: Partial<VidaConfiguracoes> & { usuario_id: string };
        Update: Partial<VidaConfiguracoes>;
        Relationships: [];
      };
      notificacoes_preferencias: {
        Row: NotificacoesPreferencias;
        Insert: Partial<NotificacoesPreferencias> & { usuario_id: string };
        Update: Partial<NotificacoesPreferencias>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
