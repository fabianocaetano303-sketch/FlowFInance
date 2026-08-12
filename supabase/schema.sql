-- FinanceFlow — schema completo
-- Executar no SQL Editor do Supabase

create extension if not exists "pgcrypto";

-- Tabela: ganhos
create table if not exists ganhos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  valor decimal(10, 2) not null,
  descricao text not null,
  data date not null,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela: gastos
create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  valor decimal(10, 2) not null,
  categoria text not null,
  descricao text not null,
  eh_desnecessario boolean default false,
  data date not null,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela: dividas
create table if not exists dividas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  credor text not null,
  valor_total decimal(10, 2) not null,
  valor_pago decimal(10, 2) default 0,
  -- dinheiro ja separado/guardado para a divida, ainda nao pago
  valor_separado decimal(10, 2) not null default 0,
  tipo text not null check (tipo in ('unica', 'recorrente')),
  prazo_vencimento date,
  -- dia do mes (1-31) usado para renovar automaticamente dividas recorrentes
  dia_recorrencia integer check (dia_recorrencia is null or (dia_recorrencia between 1 and 31)),
  status text default 'aberta' check (status in ('aberta', 'paga')),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela: pagamentos_divida
create table if not exists pagamentos_divida (
  id uuid primary key default gen_random_uuid(),
  divida_id uuid not null references dividas(id) on delete cascade,
  valor_pago decimal(10, 2) not null,
  data_pagamento date not null,
  criado_em timestamptz default now()
);

-- Tabela: separacoes_divida (historico de dinheiro separado para dividas)
create table if not exists separacoes_divida (
  id uuid primary key default gen_random_uuid(),
  divida_id uuid not null references dividas(id) on delete cascade,
  valor_separado decimal(10, 2) not null,
  data_separacao date not null,
  criado_em timestamptz default now()
);

-- Tabela: configuracoes_usuario
create table if not exists configuracoes_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users(id) on delete cascade,
  meta_diaria decimal(10, 2) default 126.00,
  orcamento_alimentacao decimal(10, 2) default 500.00,
  orcamento_higiene decimal(10, 2) default 60.00,
  orcamento_contas decimal(10, 2),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela: vida_propositos
create table if not exists vida_propositos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users(id) on delete cascade,
  motivo text,
  definicao_sucesso text,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela: vida_metas
create table if not exists vida_metas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descricao text,
  prazo date,
  tipo text not null check (tipo in ('financeiro', 'pessoal', 'saude')),
  concluida boolean not null default false,
  data_conclusao date,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela: vida_habitos
create table if not exists vida_habitos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  frequencia text not null default 'diario' check (frequencia in ('diario', 'dias_uteis')),
  ativo boolean not null default true,
  criado_em timestamptz default now()
);

-- Tabela: vida_habitos_historico
create table if not exists vida_habitos_historico (
  id uuid primary key default gen_random_uuid(),
  habito_id uuid not null references vida_habitos(id) on delete cascade,
  data date not null,
  concluido boolean not null default true,
  criado_em timestamptz default now(),
  unique (habito_id, data)
);

-- Tabela: vida_diario
create table if not exists vida_diario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  bem text,
  melhorar text,
  acao_amanha text,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  unique (usuario_id, data)
);

-- Tabela: vida_analises_semanais
create table if not exists vida_analises_semanais (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  bateu_metas boolean,
  maior_obstaculo text,
  acoes_proxima_semana text,
  nota_disciplina integer check (nota_disciplina is null or (nota_disciplina between 0 and 10)),
  criado_em timestamptz default now(),
  unique (usuario_id, data)
);

-- Tabela: vida_configuracoes
create table if not exists vida_configuracoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users(id) on delete cascade,
  horario_reflexao time default '22:00',
  horario_lembrete_manha time default '07:00',
  frases_motivacionais text[] not null default '{}',
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela: notificacoes_preferencias
create table if not exists notificacoes_preferencias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users(id) on delete cascade,
  horario_matinal time not null default '08:00',
  horario_noturno time not null default '21:00',
  habilitado boolean not null default false,
  subscription jsonb,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

alter table ganhos enable row level security;
alter table gastos enable row level security;
alter table dividas enable row level security;
alter table pagamentos_divida enable row level security;
alter table separacoes_divida enable row level security;
alter table configuracoes_usuario enable row level security;
alter table vida_propositos enable row level security;
alter table vida_metas enable row level security;
alter table vida_habitos enable row level security;
alter table vida_habitos_historico enable row level security;
alter table vida_diario enable row level security;
alter table vida_analises_semanais enable row level security;
alter table vida_configuracoes enable row level security;
alter table notificacoes_preferencias enable row level security;

drop policy if exists ganhos_usuario on ganhos;
create policy ganhos_usuario on ganhos for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

drop policy if exists gastos_usuario on gastos;
create policy gastos_usuario on gastos for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

drop policy if exists dividas_usuario on dividas;
create policy dividas_usuario on dividas for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

drop policy if exists configuracoes_usuario_owner on configuracoes_usuario;
create policy configuracoes_usuario_owner on configuracoes_usuario for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- pagamentos_divida: acesso via join com dividas (nao tem usuario_id direto)
drop policy if exists pagamentos_divida_usuario on pagamentos_divida;
create policy pagamentos_divida_usuario on pagamentos_divida for all
  using (exists (select 1 from dividas d where d.id = pagamentos_divida.divida_id and d.usuario_id = auth.uid()))
  with check (exists (select 1 from dividas d where d.id = pagamentos_divida.divida_id and d.usuario_id = auth.uid()));

-- separacoes_divida: acesso via join com dividas (nao tem usuario_id direto)
drop policy if exists separacoes_divida_usuario on separacoes_divida;
create policy separacoes_divida_usuario on separacoes_divida for all
  using (exists (select 1 from dividas d where d.id = separacoes_divida.divida_id and d.usuario_id = auth.uid()))
  with check (exists (select 1 from dividas d where d.id = separacoes_divida.divida_id and d.usuario_id = auth.uid()));

drop policy if exists vida_propositos_usuario on vida_propositos;
create policy vida_propositos_usuario on vida_propositos for all
  to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

drop policy if exists vida_metas_usuario on vida_metas;
create policy vida_metas_usuario on vida_metas for all
  to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

drop policy if exists vida_habitos_usuario on vida_habitos;
create policy vida_habitos_usuario on vida_habitos for all
  to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- vida_habitos_historico: acesso via join com vida_habitos (nao tem usuario_id direto)
drop policy if exists vida_habitos_historico_usuario on vida_habitos_historico;
create policy vida_habitos_historico_usuario on vida_habitos_historico for all
  to authenticated
  using (exists (select 1 from vida_habitos h where h.id = vida_habitos_historico.habito_id and h.usuario_id = auth.uid()))
  with check (exists (select 1 from vida_habitos h where h.id = vida_habitos_historico.habito_id and h.usuario_id = auth.uid()));

drop policy if exists vida_diario_usuario on vida_diario;
create policy vida_diario_usuario on vida_diario for all
  to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

drop policy if exists vida_analises_semanais_usuario on vida_analises_semanais;
create policy vida_analises_semanais_usuario on vida_analises_semanais for all
  to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

drop policy if exists vida_configuracoes_usuario on vida_configuracoes;
create policy vida_configuracoes_usuario on vida_configuracoes for all
  to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

drop policy if exists notificacoes_preferencias_usuario on notificacoes_preferencias;
create policy notificacoes_preferencias_usuario on notificacoes_preferencias for all
  to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- Storage: bucket para notas fiscais
insert into storage.buckets (id, name, public)
values ('notas-fiscais', 'notas-fiscais', false)
on conflict (id) do nothing;

drop policy if exists "notas_fiscais_usuario_select" on storage.objects;
create policy "notas_fiscais_usuario_select" on storage.objects for select
  using (bucket_id = 'notas-fiscais' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "notas_fiscais_usuario_insert" on storage.objects;
create policy "notas_fiscais_usuario_insert" on storage.objects for insert
  with check (bucket_id = 'notas-fiscais' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "notas_fiscais_usuario_delete" on storage.objects;
create policy "notas_fiscais_usuario_delete" on storage.objects for delete
  using (bucket_id = 'notas-fiscais' and auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger: cria configuracoes_usuario padrao ao registrar usuario
create or replace function public.criar_configuracoes_padrao()
returns trigger as $$
begin
  insert into public.configuracoes_usuario (usuario_id)
  values (new.id)
  on conflict (usuario_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.criar_configuracoes_padrao();
