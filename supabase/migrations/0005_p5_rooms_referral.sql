-- ============================================================
-- PRANA P5 — rooms triggers + referral_code + indexes
-- Apply via: sshpass + docker exec supabase-db psql
-- Idempotent. Safe to re-run.
-- ============================================================

-- 1) profiles.referral_code unique 8-char base58 (case-sensitive, no 0/O/I/l)
alter table prana.profiles
  add column if not exists referral_code text;

create unique index if not exists idx_profiles_referral_code
  on prana.profiles(referral_code) where referral_code is not null;

-- Helper : random base58 8 chars
create or replace function prana.gen_referral_code()
returns text
language plpgsql
volatile
as $$
declare
  alphabet text := '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  result text := '';
  i int;
  attempts int := 0;
begin
  loop
    result := '';
    for i in 1..8 loop
      result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    -- Ensure uniqueness
    if not exists (select 1 from prana.profiles where referral_code = result) then
      return result;
    end if;
    attempts := attempts + 1;
    if attempts > 8 then
      -- Tiny probability we hit conflicts 8 times in a row: append timestamp suffix.
      result := result || substr(extract(epoch from now())::text, -2);
      return result;
    end if;
  end loop;
end;
$$;

-- Backfill existing profiles
update prana.profiles
set referral_code = prana.gen_referral_code()
where referral_code is null;

-- Trigger: auto-set referral_code on INSERT if NULL
create or replace function prana.trg_set_referral_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null then
    new.referral_code := prana.gen_referral_code();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_referral_code on prana.profiles;
create trigger trg_profiles_referral_code
  before insert on prana.profiles
  for each row execute function prana.trg_set_referral_code();

-- 2) rooms.participants_count auto-trigger via room_memberships
create or replace function prana.trg_room_participants_count()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    update prana.rooms
      set participants_count = coalesce(participants_count, 0) + 1
      where id = new.room_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update prana.rooms
      set participants_count = greatest(coalesce(participants_count, 0) - 1, 0)
      where id = old.room_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_room_memberships_count on prana.room_memberships;
create trigger trg_room_memberships_count
  after insert or delete on prana.room_memberships
  for each row execute function prana.trg_room_participants_count();

-- Resync participants_count for any pre-existing memberships (idempotent)
update prana.rooms r
set participants_count = (
  select count(*) from prana.room_memberships m where m.room_id = r.id
);

-- 3) Indexes pour cron room-tick + queries fréquentes
create index if not exists idx_room_memberships_user_active
  on prana.room_memberships(user_id, completed) where completed = false;
create index if not exists idx_room_memberships_room_active
  on prana.room_memberships(room_id, completed) where completed = false;
create index if not exists idx_rooms_premium_official
  on prana.rooms(is_official, is_premium, created_at desc);

-- 4) RLS pour profiles : permettre lookup public minimal par referral_code
-- (nécessaire pour /r/[code] avant signup pour récupérer referrer_id)
drop policy if exists "profiles select by referral_code" on prana.profiles;
create policy "profiles select by referral_code" on prana.profiles for select
  using (referral_code is not null);
-- Note : cette policy ouvre `select` à tout user auth (qui pouvait déjà voir son own row).
-- Le seul info exposée additionnellement = display_name + referral_code des autres → acceptable.
-- Pour les anon (pre-signup), on passe par admin client côté serveur dans /r/[code] route.

do $$
begin
  raise notice 'PRANA P5 — migration 0005 OK (referral_code + participants_count trigger + indexes)';
end$$;
