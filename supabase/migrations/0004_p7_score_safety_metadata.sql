-- ============================================================
-- PRANA P7 — score / safety / points / settings extensions
-- Apply via: sshpass + docker exec supabase-db psql
-- Idempotent. Safe to re-run.
-- ============================================================

-- 1) profiles.metadata jsonb (emergency_contact, notif_prefs, last_pro_consult_at, ...)
alter table prana.profiles
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- 2) safety_events: extend trigger check to allow manual logs from SOS button + consult prompt
alter table prana.safety_events drop constraint if exists safety_events_trigger_check;
alter table prana.safety_events
  add constraint safety_events_trigger_check
  check (trigger in ('sos_button','classifier_flag','keyword_match','consult_prompt','user_self_report'));

-- 3) point_events: tighten reason values used by the engine
-- (we keep `text` permissive intentionally but document expected reasons via comment)
comment on column prana.point_events.reason is
  'one of: daily_pulse, magic_button, protocol_done, capture_first, room_day, room_done, referral_converted, manual';

-- 4) Helper RPC: grant points + update balances atomically
create or replace function prana.grant_points(
  p_user_id uuid,
  p_delta int,
  p_reason text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  new_balance int,
  new_total_earned int
)
language plpgsql
security definer
set search_path = prana, public
as $$
declare
  v_balance int;
  v_total int;
begin
  if p_delta is null or p_delta = 0 then
    select points, total_earned into v_balance, v_total
    from prana.user_points where user_id = p_user_id;
    return query select coalesce(v_balance, 0), coalesce(v_total, 0);
    return;
  end if;

  insert into prana.point_events(user_id, delta, reason, metadata)
  values (p_user_id, p_delta, p_reason, coalesce(p_metadata, '{}'::jsonb));

  insert into prana.user_points(user_id, points, total_earned, total_redeemed)
  values (
    p_user_id,
    greatest(p_delta, 0),
    greatest(p_delta, 0),
    case when p_delta < 0 then -p_delta else 0 end
  )
  on conflict (user_id) do update set
    points = prana.user_points.points + p_delta,
    total_earned = prana.user_points.total_earned + greatest(p_delta, 0),
    total_redeemed = prana.user_points.total_redeemed + case when p_delta < 0 then -p_delta else 0 end,
    updated_at = now()
  returning points, total_earned into v_balance, v_total;

  return query select v_balance, v_total;
end;
$$;

grant execute on function prana.grant_points(uuid, int, text, jsonb) to service_role;
revoke execute on function prana.grant_points(uuid, int, text, jsonb) from authenticated, anon;

-- 5) Index pour cron daily-score
-- date_trunc(text, timestamptz) is STABLE (not IMMUTABLE) so it cannot be used in indexes.
-- We rely on existing (user_id, created_at desc) index on pulse_checks (in 0001).
-- For regulation_sessions, add a simple composite that helps the score compute query.
create index if not exists idx_regulation_user_completed
  on prana.regulation_sessions(user_id, completed, created_at desc)
  where completed = true;

do $$
begin
  raise notice 'PRANA P7 — migration 0004 OK (profiles.metadata + safety_events trigger ext + grant_points RPC + indexes)';
end$$;
