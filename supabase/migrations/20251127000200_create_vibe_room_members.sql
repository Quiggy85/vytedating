begin;

create table if not exists public.vibe_room_members (
  room_id uuid not null references public.vibe_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.vibe_room_members enable row level security;

-- members can see membership rows for their rooms
create policy "Members can read their vibe room memberships" on public.vibe_room_members
  for select
  using (auth.role() = 'authenticated' and auth.uid() = user_id);

-- allow users to join/leave rooms for themselves
create policy "Users can modify their own vibe room memberships" on public.vibe_room_members
  for all
  using (auth.role() = 'authenticated' and auth.uid() = user_id)
  with check (auth.role() = 'authenticated' and auth.uid() = user_id);

commit;
