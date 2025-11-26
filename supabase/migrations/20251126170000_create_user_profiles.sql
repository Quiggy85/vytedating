create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  birthdate date,
  gender text,
  bio text,
  location_lat double precision,
  location_lng double precision,
  location_city text,
  location_country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  enable row level security;
