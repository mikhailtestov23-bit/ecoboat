create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 24),
  score integer not null check (score >= 0 and score <= 100000),
  trash_collected integer not null check (trash_collected >= 0 and trash_collected <= 500),
  round_seconds integer not null default 60 check (round_seconds between 1 and 60),
  created_at timestamptz not null default now()
);

create index if not exists scores_rank_idx
  on public.scores (score desc, created_at asc);

alter table public.scores enable row level security;

drop policy if exists "scores are publicly readable" on public.scores;
create policy "scores are publicly readable"
  on public.scores
  for select
  to anon
  using (true);

drop policy if exists "players can submit bounded scores" on public.scores;
create policy "players can submit bounded scores"
  on public.scores
  for insert
  to anon
  with check (
    char_length(player_name) between 1 and 24
    and score between 0 and 100000
    and trash_collected between 0 and 500
    and round_seconds between 1 and 60
    and created_at <= now() + interval '1 minute'
    and created_at >= now() - interval '1 day'
  );
