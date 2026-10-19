-- One leaderboard entry per device per puzzle day.
-- device_id is a random id the browser generates and keeps in localStorage. It lives only on
-- the private games table, so it's never exposed through the public completions table.
alter table public.games add column device_id uuid;

-- A device can start any number of games for a day, but only one of them can be submitted.
-- submit-score sets submitted_at when it claims a game, so a second claim fails here even if
-- two submissions race. Rows from before this migration have a null device_id and don't conflict.
create unique index games_one_submission_per_device
  on public.games (device_id, puzzle_date)
  where submitted_at is not null;
