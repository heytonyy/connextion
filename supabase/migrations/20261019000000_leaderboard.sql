-- games: one row per started round, holds that day's answers so a completion can be verified.
-- Only edge functions (service role) touch this table.
create table public.games (
  id uuid primary key default gen_random_uuid(),
  puzzle_date date not null,
  -- [{ "title": "...", "words": ["A", "B", "C", "D"] }, ...] copied from the NYT puzzle
  answers jsonb not null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

-- completions: public per-day leaderboard. Rows are only inserted by the submit-score edge
-- function after it replays the guesses against the stored answers.
create table public.completions (
  id bigint generated always as identity primary key,
  game_id uuid not null unique references public.games (id) on delete cascade,
  puzzle_date date not null,
  initials text not null check (initials ~ '^[A-Z]{2,3}$'),
  seconds integer not null check (seconds >= 0),
  mistakes smallint not null check (mistakes between 0 and 3),
  created_at timestamptz not null default now()
);

create index completions_rank_idx on public.completions (puzzle_date, seconds, created_at);

alter table public.games enable row level security;
alter table public.completions enable row level security;

-- no policies on games: anon/authenticated can't read or write it
revoke all on public.games from anon, authenticated;

-- anyone can read the leaderboard; nobody but the service role can write it
revoke all on public.completions from anon, authenticated;
grant select on public.completions to anon, authenticated;

create policy "leaderboard is public"
  on public.completions for select
  to anon, authenticated
  using (true);
