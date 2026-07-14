-- Session gym app — Supabase schema.
-- Run this in your Supabase project's SQL editor (Dashboard → SQL → New query).
-- Auth is handled by Supabase Auth (magic-link email OTP). Every row is scoped to
-- the signed-in user via Row Level Security.

-- ---------------------------------------------------------------------------
-- app_state: one row per user holding the whole client state blob (program +
-- live session + settings). This is what syncs the app across devices.
-- ---------------------------------------------------------------------------
create table if not exists public.app_state (
	user_id uuid primary key references auth.users (id) on delete cascade,
	blob jsonb not null default '{}'::jsonb,
	updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "own app_state select" on public.app_state;
create policy "own app_state select" on public.app_state
	for select using (auth.uid() = user_id);

drop policy if exists "own app_state upsert" on public.app_state;
create policy "own app_state upsert" on public.app_state
	for insert with check (auth.uid() = user_id);

drop policy if exists "own app_state update" on public.app_state;
create policy "own app_state update" on public.app_state
	for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- set_logs: append-only log of every set (working / warmup / skipped). This is
-- the real data that will drive trends, charts, counts and the weight-
-- recommendation engine, replacing the seeded stubs.
-- ---------------------------------------------------------------------------
create table if not exists public.set_logs (
	id bigint generated always as identity primary key,
	user_id uuid not null references auth.users (id) on delete cascade,
	day_id text,
	exercise_name text not null,
	set_index int not null,
	weight numeric not null,
	reps_target int not null,
	reps_actual int not null,
	type text not null check (type in ('working', 'warmup', 'skipped')),
	created_at timestamptz not null default now()
);

create index if not exists set_logs_user_ex_time
	on public.set_logs (user_id, exercise_name, created_at desc);

alter table public.set_logs enable row level security;

drop policy if exists "own set_logs select" on public.set_logs;
create policy "own set_logs select" on public.set_logs
	for select using (auth.uid() = user_id);

drop policy if exists "own set_logs insert" on public.set_logs;
create policy "own set_logs insert" on public.set_logs
	for insert with check (auth.uid() = user_id);
