-- ══════════════════════════════════════════════════════════════════
-- NGX Glass — Production Database Schema v2
-- Safe to run on an existing v1 database (uses IF NOT EXISTS / IF NOT EXISTS)
-- Run in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- ─── Extensions ───────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ══════════════════════════════════════════════════════════════════
-- 1. ROLES
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.roles (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null unique,
  description text,
  created_at  timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════════
-- 2. PERMISSIONS
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.permissions (
  id          uuid primary key default gen_random_uuid(),
  resource    text not null,
  action      text not null,
  description text,
  unique (resource, action)
);

-- ══════════════════════════════════════════════════════════════════
-- 3. ROLE_PERMISSIONS  (junction)
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.role_permissions (
  role_id       uuid not null references public.roles(id)       on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ══════════════════════════════════════════════════════════════════
-- 4. PROFILES  (extends auth.users)
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  email      text not null,
  avatar_url text,
  plan       text default 'free' check (plan in ('free', 'pro', 'premium')),
  failed_login_attempts integer     not null default 0,
  locked_until          timestamptz,
  last_login_at         timestamptz,
  last_login_ip         inet,
  email_verified        boolean     not null default false,
  mfa_enabled           boolean     not null default false,
  mfa_secret            text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Safe migration from v1 (name → full_name, new security columns)
alter table public.profiles add column if not exists full_name             text;
alter table public.profiles add column if not exists failed_login_attempts integer     not null default 0;
alter table public.profiles add column if not exists locked_until          timestamptz;
alter table public.profiles add column if not exists last_login_at         timestamptz;
alter table public.profiles add column if not exists last_login_ip         inet;
alter table public.profiles add column if not exists email_verified        boolean     not null default false;
alter table public.profiles add column if not exists mfa_enabled           boolean     not null default false;
alter table public.profiles add column if not exists mfa_secret            text;
alter table public.profiles add column if not exists updated_at            timestamptz default now();
update public.profiles set full_name = name where full_name is null;

-- ══════════════════════════════════════════════════════════════════
-- 5. USER_ROLES  (junction)
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.user_roles (
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  role_id     uuid        not null references public.roles(id)    on delete cascade,
  assigned_at timestamptz default now(),
  assigned_by uuid        references public.profiles(id) on delete set null,
  primary key (user_id, role_id)
);

-- ══════════════════════════════════════════════════════════════════
-- 6. SESSIONS  (multi-device refresh-token registry)
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.sessions (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references public.profiles(id) on delete cascade,
  refresh_token_hash text        not null unique,
  device_name        text,
  user_agent         text,
  ip_address         inet,
  last_active_at     timestamptz default now(),
  expires_at         timestamptz not null,
  revoked            boolean     not null default false,
  revoked_at         timestamptz,
  created_at         timestamptz default now()
);

create index if not exists idx_sessions_user    on public.sessions(user_id);
create index if not exists idx_sessions_expires on public.sessions(expires_at);

-- ══════════════════════════════════════════════════════════════════
-- 7. AUDIT LOGS
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.audit_logs (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references public.profiles(id) on delete set null,
  event_type text        not null,
  status     text        not null check (status in ('success', 'failure')),
  ip_address inet,
  user_agent text,
  metadata   jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_audit_user    on public.audit_logs(user_id);
create index if not exists idx_audit_event   on public.audit_logs(event_type);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);

-- ══════════════════════════════════════════════════════════════════
-- 8. PASSWORD RESET TOKENS
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.password_reset_tokens (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  token_hash text        not null unique,
  expires_at timestamptz not null,
  used       boolean     not null default false,
  used_at    timestamptz,
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════════
-- 9. PORTFOLIO HOLDINGS
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.portfolio_holdings (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    not null references auth.users(id) on delete cascade,
  sym        text    not null,
  shares     numeric not null check (shares > 0),
  avg_cost   numeric not null check (avg_cost > 0),
  buy_date   date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, sym)
);

-- ══════════════════════════════════════════════════════════════════
-- 10. PRICE ALERTS
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.price_alerts (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    not null references auth.users(id) on delete cascade,
  sym        text    not null,
  direction  text    not null check (direction in ('above', 'below')),
  target     numeric not null check (target > 0),
  triggered  boolean not null default false,
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════════
-- 11. WATCHLIST
-- ══════════════════════════════════════════════════════════════════
create table if not exists public.watchlist (
  user_id  uuid not null references auth.users(id) on delete cascade,
  sym      text not null,
  added_at timestamptz default now(),
  primary key (user_id, sym)
);

-- ══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════

create or replace function public.user_has_role(role_name text)
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from   public.user_roles ur
    join   public.roles r on ur.role_id = r.id
    where  ur.user_id = auth.uid()
    and    r.name = role_name
  )
$$;

-- profiles
alter table public.profiles enable row level security;
drop policy if exists "profiles: own read"           on public.profiles;
drop policy if exists "profiles: own update"         on public.profiles;
drop policy if exists "Users can view own profile"   on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id or public.user_has_role('admin'));
create policy "profiles: own update"
  on public.profiles for update using (auth.uid() = id);

-- user_roles
alter table public.user_roles enable row level security;
drop policy if exists "user_roles: own read"    on public.user_roles;
drop policy if exists "user_roles: admin write" on public.user_roles;
create policy "user_roles: own read"
  on public.user_roles for select
  using (auth.uid() = user_id or public.user_has_role('admin'));
create policy "user_roles: admin write"
  on public.user_roles for all using (public.user_has_role('admin'));

-- roles
alter table public.roles enable row level security;
drop policy if exists "roles: authenticated read" on public.roles;
drop policy if exists "roles: admin write"        on public.roles;
create policy "roles: authenticated read"
  on public.roles for select to authenticated using (true);
create policy "roles: admin write"
  on public.roles for all using (public.user_has_role('admin'));

-- permissions
alter table public.permissions enable row level security;
drop policy if exists "permissions: authenticated read" on public.permissions;
drop policy if exists "permissions: admin write"        on public.permissions;
create policy "permissions: authenticated read"
  on public.permissions for select to authenticated using (true);
create policy "permissions: admin write"
  on public.permissions for all using (public.user_has_role('admin'));

-- role_permissions
alter table public.role_permissions enable row level security;
drop policy if exists "role_permissions: authenticated read" on public.role_permissions;
drop policy if exists "role_permissions: admin write"        on public.role_permissions;
create policy "role_permissions: authenticated read"
  on public.role_permissions for select to authenticated using (true);
create policy "role_permissions: admin write"
  on public.role_permissions for all using (public.user_has_role('admin'));

-- sessions
alter table public.sessions enable row level security;
drop policy if exists "sessions: own read"   on public.sessions;
drop policy if exists "sessions: own delete" on public.sessions;
create policy "sessions: own read"
  on public.sessions for select using (auth.uid() = user_id);
create policy "sessions: own delete"
  on public.sessions for delete using (auth.uid() = user_id);

-- audit_logs
alter table public.audit_logs enable row level security;
drop policy if exists "audit_logs: own read" on public.audit_logs;
create policy "audit_logs: own read"
  on public.audit_logs for select
  using (auth.uid() = user_id or public.user_has_role('admin'));

-- password_reset_tokens: no direct client access (service-role only)
alter table public.password_reset_tokens enable row level security;

-- portfolio / alerts / watchlist
alter table public.portfolio_holdings enable row level security;
alter table public.price_alerts       enable row level security;
alter table public.watchlist          enable row level security;
drop policy if exists "Holdings: own rows only"  on public.portfolio_holdings;
drop policy if exists "Alerts: own rows only"    on public.price_alerts;
drop policy if exists "Watchlist: own rows only" on public.watchlist;
create policy "holdings: own all" on public.portfolio_holdings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "alerts: own all" on public.price_alerts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "watchlist: own all" on public.watchlist for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.assign_default_role()
returns trigger language plpgsql security definer as $$
declare
  _role_id uuid;
begin
  select id into _role_id from public.roles where name = 'user' limit 1;
  if _role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, _role_id)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.assign_default_role();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- ══════════════════════════════════════════════════════════════════
-- SEED DATA
-- ══════════════════════════════════════════════════════════════════

insert into public.roles (name, description) values
  ('admin',   'Full system access'),
  ('premium', 'Premium tier — alerts and advanced analytics'),
  ('user',    'Standard authenticated user')
on conflict (name) do nothing;

insert into public.permissions (resource, action, description) values
  ('market',    'read',   'View live market data'),
  ('heatmap',   'read',   'View sector heatmap'),
  ('news',      'read',   'Read news and filings'),
  ('portfolio', 'read',   'View own portfolio'),
  ('portfolio', 'write',  'Manage portfolio holdings'),
  ('alerts',    'read',   'View price alerts'),
  ('alerts',    'write',  'Create and delete alerts'),
  ('watchlist', 'read',   'View watchlist'),
  ('watchlist', 'write',  'Manage watchlist'),
  ('admin',     'read',   'View admin dashboard'),
  ('admin',     'write',  'Manage users and settings')
on conflict (resource, action) do nothing;

do $$
declare
  r_admin   uuid := (select id from public.roles where name = 'admin');
  r_premium uuid := (select id from public.roles where name = 'premium');
  r_user    uuid := (select id from public.roles where name = 'user');
begin
  insert into public.role_permissions (role_id, permission_id)
    select r_admin, id from public.permissions on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
    select r_premium, id from public.permissions
    where (resource, action) in (
      ('market','read'),('heatmap','read'),('news','read'),
      ('portfolio','read'),('portfolio','write'),
      ('alerts','read'),('alerts','write'),
      ('watchlist','read'),('watchlist','write')
    ) on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
    select r_user, id from public.permissions
    where (resource, action) in (
      ('market','read'),('heatmap','read'),('news','read'),
      ('portfolio','read'),('portfolio','write'),
      ('watchlist','read'),('watchlist','write')
    ) on conflict do nothing;
end;
$$;
