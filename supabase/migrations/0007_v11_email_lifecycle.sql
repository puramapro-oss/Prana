-- ============================================================================
-- PRANA — v1.1 — Email lifecycle log
-- Migration: 0007
-- Date: 2026-04-27
-- ----------------------------------------------------------------------------
-- Idempotent dedup table for the 10 lifecycle emails (welcome, day1..30,
-- referral_converted, room_day1, protocol_streak). Prevents double-send.
-- RLS: read-only own rows; writes happen via service_role only.
-- ============================================================================

create schema if not exists prana;

create table if not exists prana.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template text not null,
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  resend_id text,
  status text not null default 'sent' check (status in ('sent', 'failed', 'skipped')),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, template)
);

create index if not exists idx_email_log_user on prana.email_log (user_id);
create index if not exists idx_email_log_template on prana.email_log (template);
create index if not exists idx_email_log_created_at on prana.email_log (created_at desc);

alter table prana.email_log enable row level security;

drop policy if exists "email_log self read" on prana.email_log;
create policy "email_log self read"
  on prana.email_log
  for select
  to authenticated
  using (user_id = auth.uid());

-- Writes: service_role only (no policy granted to authenticated/anon)

-- Helper view: each user's last lifecycle email
create or replace view prana.email_log_latest as
  select distinct on (user_id) user_id, template, locale, status, created_at
  from prana.email_log
  order by user_id, created_at desc;

grant select on prana.email_log_latest to authenticated;

-- Notify PostgREST to reload schema
notify pgrst, 'reload schema';

select 'PRANA v1.1 email_log migration OK' as status;
