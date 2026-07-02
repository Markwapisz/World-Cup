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
  winner text,
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
  winner text,
  locked boolean not null default false,
  updated_at timestamptz,
  primary key (pool_id, player_id, match_id)
);

alter table public.match_results add column if not exists winner text;
alter table public.player_picks add column if not exists winner text;

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

delete from public.pool_players where pool_id = 'main';

insert into public.pool_players (
  pool_id,
  id,
  name,
  champion,
  champion_locked,
  updated_at
)
select
  'main',
  player->>'id',
  player->>'name',
  nullif(player->>'champion', ''),
  coalesce((player->>'championLocked')::boolean, false),
  to_timestamp(nullif(player->>'updatedAt', '')::double precision / 1000)
from public.pool_state state,
jsonb_array_elements(coalesce(state.data->'players', '[]'::jsonb)) player
where state.id = 'main'
on conflict (pool_id, id) do update set
  name = excluded.name,
  champion = excluded.champion,
  champion_locked = excluded.champion_locked,
  updated_at = excluded.updated_at;

delete from public.match_results where pool_id = 'main';

insert into public.match_results (
  pool_id,
  match_id,
  match_date,
  stage,
  home_team,
  away_team,
  home_score,
  away_score,
  result_locked,
  result_updated_at,
  updated_at
)
select
  'main',
  match->>'id',
  nullif(match->>'date', '')::date,
  match->>'stage',
  match->>'home',
  match->>'away',
  nullif(match->>'homeScore', ''),
  nullif(match->>'awayScore', ''),
  coalesce((match->>'resultLocked')::boolean, false),
  to_timestamp(nullif(match->>'resultUpdatedAt', '')::double precision / 1000),
  to_timestamp(nullif(match->>'updatedAt', '')::double precision / 1000)
from public.pool_state state,
jsonb_array_elements(coalesce(state.data->'matches', '[]'::jsonb)) match
where state.id = 'main'
on conflict (pool_id, match_id) do update set
  match_date = excluded.match_date,
  stage = excluded.stage,
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  home_score = excluded.home_score,
  away_score = excluded.away_score,
  result_locked = excluded.result_locked,
  result_updated_at = excluded.result_updated_at,
  updated_at = excluded.updated_at;

delete from public.player_picks where pool_id = 'main';

insert into public.player_picks (
  pool_id,
  player_id,
  player_name,
  match_id,
  match_date,
  stage,
  home_team,
  away_team,
  home_score,
  away_score,
  locked,
  updated_at
)
select
  'main',
  pick->>'playerId',
  (
    select player->>'name'
    from jsonb_array_elements(coalesce(state.data->'players', '[]'::jsonb)) player
    where player->>'id' = pick->>'playerId'
    limit 1
  ),
  pick->>'matchId',
  (
    select nullif(match->>'date', '')::date
    from jsonb_array_elements(coalesce(state.data->'matches', '[]'::jsonb)) match
    where match->>'id' = pick->>'matchId'
    limit 1
  ),
  (
    select match->>'stage'
    from jsonb_array_elements(coalesce(state.data->'matches', '[]'::jsonb)) match
    where match->>'id' = pick->>'matchId'
    limit 1
  ),
  (
    select match->>'home'
    from jsonb_array_elements(coalesce(state.data->'matches', '[]'::jsonb)) match
    where match->>'id' = pick->>'matchId'
    limit 1
  ),
  (
    select match->>'away'
    from jsonb_array_elements(coalesce(state.data->'matches', '[]'::jsonb)) match
    where match->>'id' = pick->>'matchId'
    limit 1
  ),
  nullif(pick->>'homeScore', ''),
  nullif(pick->>'awayScore', ''),
  coalesce((pick->>'locked')::boolean, false),
  to_timestamp(nullif(pick->>'updatedAt', '')::double precision / 1000)
from public.pool_state state,
jsonb_array_elements(coalesce(state.data->'picks', '[]'::jsonb)) pick
where state.id = 'main'
on conflict (pool_id, player_id, match_id) do update set
  player_name = excluded.player_name,
  match_date = excluded.match_date,
  stage = excluded.stage,
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  home_score = excluded.home_score,
  away_score = excluded.away_score,
  locked = excluded.locked,
  updated_at = excluded.updated_at;
