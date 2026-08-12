# FinanceFlow

App de controle financeiro pessoal. Next.js 14 (App Router) + Tailwind + Supabase.

## Setup

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um projeto no [Supabase](https://supabase.com) e rode o SQL de `supabase/schema.sql` no SQL Editor. Isso cria as tabelas, RLS, o bucket de storage `notas-fiscais` e um trigger que cria configurações padrão para cada novo usuário.

3. Copie `.env.local.example` para `.env.local` e preencha:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ANTHROPIC_API_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   CRON_SECRET=...
   ```

   - `ANTHROPIC_API_KEY` é usada pela rota `/api/nota-fiscal` para ler fotos de notas fiscais com Claude Vision e registrar os gastos automaticamente.
   - `SUPABASE_SERVICE_ROLE_KEY` (em Project Settings → API no Supabase) é usada **apenas** pela rota de cron `/api/cron/renovar-dividas`, que precisa ler/atualizar dívidas de todos os usuários ignorando RLS. Nunca prefixar com `NEXT_PUBLIC_`.
   - `CRON_SECRET` é um valor aleatório (`openssl rand -hex 32`) que protege a rota de cron contra chamadas não autorizadas.

4. No painel do Supabase, em **Authentication → Providers**, deixe apenas Email/Senha habilitado (padrão).

5. Rode o projeto:

   ```bash
   npm run dev
   ```

## Dívidas recorrentes — renovação automática

Ao criar uma dívida do tipo **Recorrente**, informe o **dia do mês para pagar** (1–31). O primeiro vencimento é calculado automaticamente para a próxima ocorrência desse dia.

A renovação para o próximo ciclo acontece de duas formas:

- **Ao quitar o valor total**: `PATCH /api/dividas/:id/pagar` zera `valor_pago` e avança `prazo_vencimento` para o próximo mês, no mesmo `dia_recorrencia`.
- **Automaticamente, todo dia**, mesmo sem pagamento: a rota `GET /api/cron/renovar-dividas` varre todas as dívidas recorrentes cujo `prazo_vencimento` já passou e renova o ciclo (reabre com `valor_pago = 0` e avança para o próximo `dia_recorrencia`).

A segunda rota precisa ser chamada por um agendador externo diariamente — já está configurada em `vercel.json` (todo dia às 06:00 UTC) para deploys no Vercel, que injeta automaticamente o header `Authorization: Bearer $CRON_SECRET`. Fora do Vercel, chame com qualquer serviço de cron (ex: cron-job.org, `pg_cron` do Supabase via `pg_net`, ou um cron do próprio servidor):

```bash
curl "https://SEU-DOMINIO/api/cron/renovar-dividas?secret=SEU_CRON_SECRET"
```

Para testar localmente (com o servidor em `npm run dev`):

```bash
curl "http://localhost:3000/api/cron/renovar-dividas?secret=$(grep CRON_SECRET .env.local | cut -d= -f2)"
```

## Dashboard Principal

Simplificado de propósito — mostra só o essencial do dia, sem distrações:

- Ganho do dia
- Gastos do dia
- Sobrou no dia (ganho - gastos)

Dívidas, alertas de orçamento, gastos idiotas e filtros de período não aparecem mais aqui. `GET /api/dashboard` expõe o mesmo resumo diário (`ganhoDia`, `gastoDia`, `sobrouDia`). Alertas de orçamento, gastos idiotas e categorias ficam em **Relatórios**; o filtro de ganhos por período (dia da semana / intervalo) também foi movido para lá.

## Dívidas — página dedicada

`/dividas` tem seu próprio dashboard, independente do principal:

- Cada dívida ativa mostra Valor Total, Já Separado e Falta Pagar (`valor_total - valor_pago` — o valor separado só é abatido do total quando a dívida é efetivamente marcada como paga).
- Um resumo no topo soma Total Dívidas / Já Separado / Falta Pagar de todas as dívidas em aberto.
- **"+ Separar para Dívida"** (`POST /api/dividas/:id/separar`): soma ao `valor_separado` — dinheiro guardado, ainda não pago. Histórico em `separacoes_divida`.
- **"Marcar como Paga"**: quita o valor total restante de uma vez (`PATCH /api/dividas/:id/pagar` com o valor faltante) — dívidas únicas viram status `paga` e saem da lista ativa; recorrentes resetam para o próximo ciclo. Em ambos os casos `valor_separado` volta a zero.

## Navegação

Menu inferior: Início | Dívidas | Relatórios | Configurações.

## Dívidas recorrentes — renovação automática

Ao criar uma dívida do tipo **Recorrente**, informe o **dia do mês para pagar** (1–31). O primeiro vencimento é calculado automaticamente para a próxima ocorrência desse dia.

A renovação para o próximo ciclo acontece de duas formas:

- **Ao quitar o valor total**: `PATCH /api/dividas/:id/pagar` zera `valor_pago` e avança `prazo_vencimento` para o próximo mês, no mesmo `dia_recorrencia`.
- **Automaticamente, todo dia**, mesmo sem pagamento: a rota `GET /api/cron/renovar-dividas` varre todas as dívidas recorrentes cujo `prazo_vencimento` já passou e renova o ciclo (reabre com `valor_pago = 0` e avança para o próximo `dia_recorrencia`).

A segunda rota precisa ser chamada por um agendador externo diariamente — já está configurada em `vercel.json` (todo dia às 06:00 UTC) para deploys no Vercel, que injeta automaticamente o header `Authorization: Bearer $CRON_SECRET`. Fora do Vercel, chame com qualquer serviço de cron (ex: cron-job.org, `pg_cron` do Supabase via `pg_net`, ou um cron do próprio servidor):

```bash
curl "https://SEU-DOMINIO/api/cron/renovar-dividas?secret=SEU_CRON_SECRET"
```

Para testar localmente (com o servidor em `npm run dev`):

```bash
curl "http://localhost:3000/api/cron/renovar-dividas?secret=$(grep CRON_SECRET .env.local | cut -d= -f2)"
```

## Estrutura

- `app/(app)/` — páginas autenticadas (dashboard, dívidas, relatórios, ajustes, registrar), protegidas pelo `middleware.ts`.
- `app/login`, `app/cadastro` — autenticação.
- `app/api/nota-fiscal` — leitura de nota fiscal via IA (Claude Vision) e retorno dos itens extraídos.
- `app/api/ganhos/filtrado` — ganhos filtrados por dia da semana ou intervalo de datas.
- `app/api/dividas/[id]/pagar` — registra pagamento de dívida (parcial ou total); ao quitar, dívidas únicas viram status `paga` (saem da lista ativa) e dívidas recorrentes resetam para o próximo ciclo.
- `app/api/dividas/[id]/separar` — soma um valor ao `valor_separado` da dívida (dinheiro guardado, ainda não pago) e registra o histórico em `separacoes_divida`.
- `app/api/cron/renovar-dividas` — job diário que renova dívidas recorrentes vencidas (protegido por `CRON_SECRET`, usa `lib/supabase/admin.ts`).
- `app/api/dashboard` — resumo financeiro do dia (ganho, gasto, sobrou).
- `lib/financas.ts` — cálculos financeiros (somas, médias, orçamento, alertas, recorrência, resumo de dívidas).
- `lib/queries.ts` — leitura de dados do Supabase em Server Components.
- `lib/supabase/` — clients Supabase (browser, server, middleware, admin/service-role).
- `supabase/schema.sql` — schema completo do banco.
