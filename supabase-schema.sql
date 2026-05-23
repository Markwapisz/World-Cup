create table if not exists public.pool_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.pool_state enable row level security;

drop policy if exists "Family can read pool" on public.pool_state;
drop policy if exists "Family can create pool" on public.pool_state;
drop policy if exists "Family can update pool" on public.pool_state;

create policy "Family can read pool"
on public.pool_state
for select
to anon
using (id = 'main');

create policy "Family can create pool"
on public.pool_state
for insert
to anon
with check (id = 'main');

create policy "Family can update pool"
on public.pool_state
for update
to anon
using (id = 'main')
with check (id = 'main');

create table if not exists public.pool_players (
  pool_id text not null default 'main',
  id text not null,
  name text not null,
  champion text,
  champion_locked boolean not null default false,
  updated_at timestamptz,
  primary key (pool_id, id)
);

create table if not exists public.match_results (
  pool_id text not null default 'main',
  match_id text not null,
  match_date date,
  stage text,
  home_team text,
  away_team text,
  home_score text,
  away_score text,
  result_locked boolean not null default false,
  result_updated_at timestamptz,
  updated_at timestamptz,
  primary key (pool_id, match_id)
);

create table if not exists public.player_picks (
  pool_id text not null default 'main',
  player_id text not null,
  player_name text,
  match_id text not null,
  match_date date,
  stage text,
  home_team text,
  away_team text,
  home_score text,
  away_score text,
  locked boolean not null default false,
  updated_at timestamptz,
  primary key (pool_id, player_id, match_id)
);

alter table public.pool_players enable row level security;
alter table public.match_results enable row level security;
alter table public.player_picks enable row level security;

drop policy if exists "Family can read players" on public.pool_players;
drop policy if exists "Family can create players" on public.pool_players;
drop policy if exists "Family can update players" on public.pool_players;
drop policy if exists "Family can delete players" on public.pool_players;

drop policy if exists "Family can read results" on public.match_results;
drop policy if exists "Family can create results" on public.match_results;
drop policy if exists "Family can update results" on public.match_results;
drop policy if exists "Family can delete results" on public.match_results;

drop policy if exists "Family can read picks" on public.player_picks;
drop policy if exists "Family can create picks" on public.player_picks;
drop policy if exists "Family can update picks" on public.player_picks;
drop policy if exists "Family can delete picks" on public.player_picks;

create policy "Family can read players"
on public.pool_players
for select
to anon
using (pool_id = 'main');

create policy "Family can create players"
on public.pool_players
for insert
to anon
with check (pool_id = 'main');

create policy "Family can update players"
on public.pool_players
for update
to anon
using (pool_id = 'main')
with check (pool_id = 'main');

create policy "Family can delete players"
on public.pool_players
for delete
to anon
using (pool_id = 'main');

create policy "Family can read results"
on public.match_results
for select
to anon
using (pool_id = 'main');

create policy "Family can create results"
on public.match_results
for insert
to anon
with check (pool_id = 'main');

create policy "Family can update results"
on public.match_results
for update
to anon
using (pool_id = 'main')
with check (pool_id = 'main');

create policy "Family can delete results"
on public.match_results
for delete
to anon
using (pool_id = 'main');

create policy "Family can read picks"
on public.player_picks
for select
to anon
using (pool_id = 'main');

create policy "Family can create picks"
on public.player_picks
for insert
to anon
with check (pool_id = 'main');

create policy "Family can update picks"
on public.player_picks
for update
to anon
using (pool_id = 'main')
with check (pool_id = 'main');

create policy "Family can delete picks"
on public.player_picks
for delete
to anon
using (pool_id = 'main');
