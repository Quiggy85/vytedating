begin;

create table if not exists public.vibe_rooms (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  country text not null,
  intent text not null,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- ensure only one active room per (city, country, intent)
create unique index if not exists vibe_rooms_unique_active
  on public.vibe_rooms (city, country, intent)
  where is_active = true;

alter table public.vibe_rooms enable row level security;

-- authenticated users can read active rooms
create policy "Authenticated users can read active vibe rooms" on public.vibe_rooms
  for select
  using (auth.role() = 'authenticated' and is_active = true);

commit;
