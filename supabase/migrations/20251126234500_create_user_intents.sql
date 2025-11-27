create table if not exists public.user_intents (
  user_id uuid primary key references auth.users (id) on delete cascade,
  intent text not null,
  updated_at timestamptz not null default now()
);

alter table public.user_intents
  enable row level security;

create policy "Users can manage their own intents"
  on public.user_intents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
