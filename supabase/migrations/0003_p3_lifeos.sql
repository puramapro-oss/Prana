-- ============================================================
-- PRANA — P3 migration : LifeOS (full-text search + plan cache)
-- Idempotent: safe to re-run. Apply via:
--   sshpass ... ssh root@VPS "docker exec -i supabase-db \
--     psql -U postgres -d postgres" < 0003_p3_lifeos.sql
-- ============================================================

set check_function_bodies = false;

-- 1) lifeos_plans — cache du Plan 7 jours généré par sonnet-4-6
create table if not exists prana.lifeos_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  start_date date not null,
  payload jsonb not null,
  generated_at timestamptz default now(),
  unique(user_id, start_date)
);

create index if not exists idx_lifeos_plans_user
  on prana.lifeos_plans(user_id, start_date desc);

alter table prana.lifeos_plans enable row level security;

drop policy if exists "lifeos_plans select own" on prana.lifeos_plans;
create policy "lifeos_plans select own" on prana.lifeos_plans for select
  using (auth.uid() = user_id);

drop policy if exists "lifeos_plans insert own" on prana.lifeos_plans;
create policy "lifeos_plans insert own" on prana.lifeos_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "lifeos_plans update own" on prana.lifeos_plans;
create policy "lifeos_plans update own" on prana.lifeos_plans for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "lifeos_plans delete own" on prana.lifeos_plans;
create policy "lifeos_plans delete own" on prana.lifeos_plans for delete
  using (auth.uid() = user_id);

-- 2) Touch updated_at on tasks (manual update path)
alter table prana.tasks add column if not exists updated_at timestamptz default now();

drop trigger if exists trg_touch_tasks on prana.tasks;
create trigger trg_touch_tasks
  before update on prana.tasks
  for each row execute function prana.touch_updated_at();

-- 3) Full-text search vectors (FR config — couvre 95% users PRANA)
-- captures
alter table prana.captures add column if not exists search_vector tsvector;

create or replace function prana.captures_tsv_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('french', coalesce(new.raw_text, ''));
  return new;
end;
$$;

drop trigger if exists trg_captures_tsv on prana.captures;
create trigger trg_captures_tsv
  before insert or update of raw_text on prana.captures
  for each row execute function prana.captures_tsv_update();

create index if not exists idx_captures_search
  on prana.captures using gin(search_vector);

-- backfill search_vector for existing rows
update prana.captures
   set search_vector = to_tsvector('french', coalesce(raw_text, ''))
 where search_vector is null;

-- tasks
alter table prana.tasks add column if not exists search_vector tsvector;

create or replace function prana.tasks_tsv_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('french',
    coalesce(new.title, '') || ' ' || coalesce(new.description, ''));
  return new;
end;
$$;

drop trigger if exists trg_tasks_tsv on prana.tasks;
create trigger trg_tasks_tsv
  before insert or update of title, description on prana.tasks
  for each row execute function prana.tasks_tsv_update();

create index if not exists idx_tasks_search
  on prana.tasks using gin(search_vector);

update prana.tasks
   set search_vector = to_tsvector('french',
     coalesce(title, '') || ' ' || coalesce(description, ''))
 where search_vector is null;

-- notes
alter table prana.notes add column if not exists search_vector tsvector;

create or replace function prana.notes_tsv_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('french',
    coalesce(new.title, '') || ' ' || coalesce(new.body, ''));
  return new;
end;
$$;

drop trigger if exists trg_notes_tsv on prana.notes;
create trigger trg_notes_tsv
  before insert or update of title, body on prana.notes
  for each row execute function prana.notes_tsv_update();

create index if not exists idx_notes_search
  on prana.notes using gin(search_vector);

update prana.notes
   set search_vector = to_tsvector('french',
     coalesce(title, '') || ' ' || coalesce(body, ''))
 where search_vector is null;

-- 4) Indexes utiles pour les vues
create index if not exists idx_projects_user_active
  on prana.projects(user_id, status, created_at desc);

create index if not exists idx_people_user_lastcontact
  on prana.people(user_id, last_contact_at nulls first);

create index if not exists idx_notes_user_pinned
  on prana.notes(user_id, pinned desc, updated_at desc);

create index if not exists idx_captures_user_recent
  on prana.captures(user_id, created_at desc);

-- 5) Confirm
do $$
declare
  captures_cnt int;
  tasks_cnt int;
  plans_tbl_exists bool;
begin
  select count(*) into captures_cnt from prana.captures;
  select count(*) into tasks_cnt from prana.tasks;
  select exists(
    select 1 from information_schema.tables
    where table_schema = 'prana' and table_name = 'lifeos_plans'
  ) into plans_tbl_exists;
  raise notice 'PRANA P3: captures=% tasks=% lifeos_plans_table=%',
    captures_cnt, tasks_cnt, plans_tbl_exists;
end$$;
