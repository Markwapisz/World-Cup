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
