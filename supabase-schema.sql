-- ══════════════════════════════════════════════════
-- NGXGlass — Supabase Database Schema
-- Run this in your Supabase project → SQL Editor
-- ══════════════════════════════════════════════════

-- 1. User profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  avatar_url  text,
  plan        text default 'free' check (plan in ('free', 'pro', 'premium')),
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Portfolio holdings
create table if not exists public.portfolio_holdings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  sym         text not null,
  shares      numeric not null check (shares > 0),
  avg_cost    numeric not null check (avg_cost > 0),
  buy_date    date,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, sym)
);

-- 3. Price alerts
create table if not exists public.price_alerts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  sym         text not null,
  direction   text not null check (direction in ('above', 'below')),
  target      numeric not null check (target > 0),
  triggered   boolean default false,
  created_at  timestamptz default now()
);

-- 4. Watchlist
create table if not exists public.watchlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  sym         text not null,
  added_at    timestamptz default now(),
  unique (user_id, sym)
);

-- ── Row Level Security ──
alter table public.profiles           enable row level security;
alter table public.portfolio_holdings enable row level security;
alter table public.price_alerts       enable row level security;
alter table public.watchlist          enable row level security;

-- Profiles: users can only read/update their own
drop policy if exists "Users can view own profile"   on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Holdings: full CRUD for own rows
drop policy if exists "Holdings: own rows only" on public.portfolio_holdings;
create policy "Holdings: own rows only" on public.portfolio_holdings
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Alerts: full CRUD for own rows
drop policy if exists "Alerts: own rows only" on public.price_alerts;
create policy "Alerts: own rows only" on public.price_alerts
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Watchlist: full CRUD for own rows
drop policy if exists "Watchlist: own rows only" on public.watchlist;
create policy "Watchlist: own rows only" on public.watchlist
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
