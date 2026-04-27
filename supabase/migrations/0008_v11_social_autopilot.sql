-- ============================================================================
-- PRANA — v1.1 — Zernio social autopilot log
-- Migration: 0008
-- Date: 2026-04-27
-- ----------------------------------------------------------------------------
-- Tracks each scheduled/published social post (cross-platform via Zernio).
-- Service-role write only; admin reads via dashboard.
-- ============================================================================

create schema if not exists prana;

create table if not exists prana.social_posts (
  id uuid primary key default gen_random_uuid(),
  theme text not null,
  caption_fr text not null,
  caption_en text,
  hashtags text[] not null default array[]::text[],
  image_url text,
  platforms text[] not null default array[]::text[],
  status text not null default 'queued' check (status in ('queued', 'sent', 'partial', 'failed', 'skipped')),
  zernio_results jsonb not null default '[]'::jsonb,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_social_posts_status on prana.social_posts (status);
create index if not exists idx_social_posts_created_at on prana.social_posts (created_at desc);

alter table prana.social_posts enable row level security;

-- Super-admin (matiss.frasne@gmail.com) read-only — defined as anyone with role='super_admin'
drop policy if exists "social_posts admin read" on prana.social_posts;
create policy "social_posts admin read"
  on prana.social_posts
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- Writes: service_role only (no policy granted to authenticated/anon)

notify pgrst, 'reload schema';

select 'PRANA v1.1 social_posts migration OK' as status;
