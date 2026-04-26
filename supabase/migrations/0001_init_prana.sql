create schema if not exists prana;
grant usage on schema prana to authenticated, anon, service_role;
grant select, insert, update, delete on all tables in schema prana to authenticated, service_role;
alter default privileges in schema prana grant select, insert, update, delete on tables to authenticated, service_role;

-- ============================================================
-- PRANA — PURAMA ONE
-- Initial schema (15 tables) — RLS enabled on every table
-- Apply via: sshpass + docker exec supabase-db psql
-- ============================================================

set check_function_bodies = false;
create extension if not exists pgcrypto with schema public;

-- ─────────────────────────────────────────────────────────────
-- 1) PROFILES (extension auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  locale text default 'fr',
  timezone text default 'Europe/Paris',
  plan text default 'free' check (plan in ('free','starter','pro','ultime')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  onboarded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_email on prana.profiles(email);
create index if not exists idx_profiles_stripe_customer on prana.profiles(stripe_customer_id);

-- ─────────────────────────────────────────────────────────────
-- 2) PULSE CHECKS
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.pulse_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  stress int not null check (stress between 0 and 10),
  energy int not null check (energy between 0 and 10),
  time_available text not null check (time_available in ('20s','2min','10min','1h')),
  context text not null check (context in ('home','work','outside','transit','bed','other')),
  mood_tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_pulse_user_recent on prana.pulse_checks(user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 3) REGULATION PROTOCOLS (catalog) + sessions
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.regulation_protocols (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_fr text not null,
  name_en text not null,
  duration_seconds int not null,
  category text not null,
  steps jsonb not null,
  audio_url_fr text,
  audio_url_en text,
  base_plan text default 'free' check (base_plan in ('free','starter','pro','ultime')),
  created_at timestamptz default now()
);

create table if not exists prana.regulation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  protocol_id uuid references prana.regulation_protocols(id),
  pulse_before_id uuid references prana.pulse_checks(id),
  pulse_after_id uuid references prana.pulse_checks(id),
  completed boolean default false,
  duration_seconds_actual int,
  created_at timestamptz default now()
);

create index if not exists idx_regsessions_user on prana.regulation_sessions(user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 4) LIFEOS — captures, tasks, projects, people, notes
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  raw_text text not null,
  source text not null check (source in ('text','voice','image','email','share')),
  audio_url text,
  classified_at timestamptz,
  classification jsonb,
  archived boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_captures_user_unclassified
  on prana.captures(user_id, classified_at)
  where classified_at is null and archived = false;

create table if not exists prana.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  name text not null,
  why text,
  status text default 'active' check (status in ('active','paused','done','dropped')),
  target_date date,
  created_at timestamptz default now()
);

create table if not exists prana.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  name text not null,
  relation text,
  notes text,
  last_contact_at timestamptz,
  contact_frequency_days int,
  created_at timestamptz default now()
);

create table if not exists prana.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo','doing','done','dropped')),
  priority int default 3 check (priority between 1 and 5),
  energy_required text check (energy_required in ('low','medium','high')),
  time_estimate_minutes int,
  due_at timestamptz,
  project_id uuid references prana.projects(id) on delete set null,
  person_id uuid references prana.people(id) on delete set null,
  source_capture_id uuid references prana.captures(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_tasks_user_active on prana.tasks(user_id, status, priority desc);

create table if not exists prana.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  title text,
  body text not null,
  tags text[] default '{}',
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 5) EXECUTIONS (drafts agent IA)
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  type text not null check (type in ('message','email','post','plan','doc','script')),
  context_json jsonb,
  draft_text text not null,
  draft_alternatives jsonb,
  approved boolean default false,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 6) ROOMS (viral collectif)
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_fr text not null,
  name_en text not null,
  description_fr text,
  description_en text,
  duration_days int not null,
  category text not null,
  daily_action_template jsonb,
  created_by uuid references prana.profiles(id) on delete set null,
  is_official boolean default false,
  is_premium boolean default false,
  cover_image_url text,
  participants_count int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_rooms_official on prana.rooms(is_official, created_at desc);

create table if not exists prana.room_memberships (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references prana.rooms(id) on delete cascade,
  user_id uuid not null references prana.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  current_day int default 1,
  completed boolean default false,
  invited_by uuid references prana.profiles(id) on delete set null,
  unique(room_id, user_id)
);

create table if not exists prana.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references prana.rooms(id) on delete cascade,
  user_id uuid references prana.profiles(id) on delete set null,
  is_ai_host boolean default false,
  body text not null,
  day_number int,
  created_at timestamptz default now()
);

create index if not exists idx_room_messages_recent on prana.room_messages(room_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 7) TWIN PROFILE
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.twin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references prana.profiles(id) on delete cascade,
  communication_style jsonb,
  decision_patterns jsonb,
  stress_triggers text[],
  recharge_activities text[],
  efficient_hours int[],
  working_habits jsonb,
  personal_rules text[],
  values text[],
  protective_mode boolean default false,
  last_full_update timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 8) SCORE (daily aggregates)
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.daily_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  date date not null,
  stress_avg numeric,
  energy_avg numeric,
  sleep_quality int,
  focus_minutes int default 0,
  one_action_done boolean default false,
  micro_actions_done int default 0,
  protocols_done int default 0,
  streak_days int default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists idx_daily_scores_user_date on prana.daily_scores(user_id, date desc);

-- ─────────────────────────────────────────────────────────────
-- 9) SAFETY EVENTS
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.safety_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references prana.profiles(id) on delete set null,
  trigger text not null check (trigger in ('sos_button','classifier_flag','keyword_match')),
  severity text check (severity in ('low','medium','high','critical')),
  context_text text,
  hotlines_shown text[],
  pro_referred boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 10) POINTS & CASH (Phase 1 = points only)
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.user_points (
  user_id uuid primary key references prana.profiles(id) on delete cascade,
  points int default 0,
  cash_eur_centimes int default 0,
  total_earned int default 0,
  total_redeemed int default 0,
  updated_at timestamptz default now()
);

create table if not exists prana.point_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  delta int not null,
  reason text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_point_events_user on prana.point_events(user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 11) REFERRALS
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references prana.profiles(id) on delete cascade,
  referee_id uuid not null references prana.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending','converted','rewarded')),
  reward_points int,
  created_at timestamptz default now(),
  unique(referrer_id, referee_id)
);

-- ─────────────────────────────────────────────────────────────
-- 12) STRIPE EVENTS (idempotency)
-- ─────────────────────────────────────────────────────────────
create table if not exists prana.stripe_events (
  id text primary key,
  type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Touch updated_at automatically
create or replace function prana.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_profiles on prana.profiles;
create trigger trg_touch_profiles
  before update on prana.profiles
  for each row execute function prana.touch_updated_at();

drop trigger if exists trg_touch_notes on prana.notes;
create trigger trg_touch_notes
  before update on prana.notes
  for each row execute function prana.touch_updated_at();

drop trigger if exists trg_touch_twin on prana.twin_profiles;
create trigger trg_touch_twin
  before update on prana.twin_profiles
  for each row execute function prana.touch_updated_at();

-- Auto-create profile on auth.users insert
create or replace function prana.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = prana
as $$
begin
  insert into prana.profiles (id, email, display_name, locale, timezone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'locale', 'fr'),
    coalesce(new.raw_user_meta_data->>'timezone', 'Europe/Paris')
  )
  on conflict (id) do nothing;

  -- Initialize points wallet
  insert into prana.user_points (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function prana.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY — ENABLE EVERYWHERE
-- ============================================================

alter table prana.profiles enable row level security;
alter table prana.pulse_checks enable row level security;
alter table prana.regulation_protocols enable row level security;
alter table prana.regulation_sessions enable row level security;
alter table prana.captures enable row level security;
alter table prana.projects enable row level security;
alter table prana.people enable row level security;
alter table prana.tasks enable row level security;
alter table prana.notes enable row level security;
alter table prana.executions enable row level security;
alter table prana.rooms enable row level security;
alter table prana.room_memberships enable row level security;
alter table prana.room_messages enable row level security;
alter table prana.twin_profiles enable row level security;
alter table prana.daily_scores enable row level security;
alter table prana.safety_events enable row level security;
alter table prana.user_points enable row level security;
alter table prana.point_events enable row level security;
alter table prana.referrals enable row level security;
alter table prana.stripe_events enable row level security;

-- ============================================================
-- POLICIES
-- ============================================================

-- PROFILES
drop policy if exists "profiles select own" on prana.profiles;
create policy "profiles select own" on prana.profiles for select
  using (auth.uid() = id);
drop policy if exists "profiles update own" on prana.profiles;
create policy "profiles update own" on prana.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Generic helper: own-row policies for tables with user_id column
do $$
declare
  t text;
  tables text[] := array[
    'pulse_checks','regulation_sessions','captures','projects','people',
    'tasks','notes','executions','twin_profiles','daily_scores',
    'point_events','user_points'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "%1$s select own" on prana.%1$s', t);
    execute format('create policy "%1$s select own" on prana.%1$s for select using (auth.uid() = user_id)', t);
    execute format('drop policy if exists "%1$s insert own" on prana.%1$s', t);
    execute format('create policy "%1$s insert own" on prana.%1$s for insert with check (auth.uid() = user_id)', t);
    execute format('drop policy if exists "%1$s update own" on prana.%1$s', t);
    execute format('create policy "%1$s update own" on prana.%1$s for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('drop policy if exists "%1$s delete own" on prana.%1$s', t);
    execute format('create policy "%1$s delete own" on prana.%1$s for delete using (auth.uid() = user_id)', t);
  end loop;
end$$;

-- ROOMS — public read for official rooms, otherwise membership required
drop policy if exists "rooms select public" on prana.rooms;
create policy "rooms select public" on prana.rooms for select
  using (
    is_official = true
    or exists (
      select 1 from prana.room_memberships m
      where m.room_id = rooms.id and m.user_id = auth.uid()
    )
  );

drop policy if exists "rooms insert pro" on prana.rooms;
create policy "rooms insert pro" on prana.rooms for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from prana.profiles p
      where p.id = auth.uid() and p.plan in ('pro','ultime')
    )
  );

-- ROOM MEMBERSHIPS — own only
drop policy if exists "room_memberships select own" on prana.room_memberships;
create policy "room_memberships select own" on prana.room_memberships for select
  using (auth.uid() = user_id);
drop policy if exists "room_memberships insert own" on prana.room_memberships;
create policy "room_memberships insert own" on prana.room_memberships for insert
  with check (auth.uid() = user_id);
drop policy if exists "room_memberships delete own" on prana.room_memberships;
create policy "room_memberships delete own" on prana.room_memberships for delete
  using (auth.uid() = user_id);

-- ROOM MESSAGES — read if member, write own (or AI host via service role)
drop policy if exists "room_messages select if member" on prana.room_messages;
create policy "room_messages select if member" on prana.room_messages for select
  using (
    exists (
      select 1 from prana.room_memberships m
      where m.room_id = room_messages.room_id and m.user_id = auth.uid()
    )
  );
drop policy if exists "room_messages insert own" on prana.room_messages;
create policy "room_messages insert own" on prana.room_messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from prana.room_memberships m
      where m.room_id = room_messages.room_id and m.user_id = auth.uid()
    )
  );

-- REGULATION PROTOCOLS — public read (catalog)
drop policy if exists "protocols select public" on prana.regulation_protocols;
create policy "protocols select public" on prana.regulation_protocols for select using (true);

-- REFERRALS — own only
drop policy if exists "referrals select own" on prana.referrals;
create policy "referrals select own" on prana.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);
drop policy if exists "referrals insert own" on prana.referrals;
create policy "referrals insert own" on prana.referrals for insert
  with check (auth.uid() = referrer_id);

-- SAFETY EVENTS — own read; service role writes via admin client
drop policy if exists "safety_events select own" on prana.safety_events;
create policy "safety_events select own" on prana.safety_events for select
  using (auth.uid() = user_id);

-- STRIPE EVENTS — service role only (no policies → blocked for anon/auth)

-- ============================================================
-- DONE
-- ============================================================
