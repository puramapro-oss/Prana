-- Run with psql -X -f scripts/test-regulation-durations.sql in an empty test database.
-- A pre-existing prana schema causes the transaction to abort before any writes.
\set ON_ERROR_STOP on
begin;
create schema prana;
create table prana.regulation_protocols (
  slug text primary key,
  duration_seconds integer not null,
  steps jsonb not null
);

insert into prana.regulation_protocols values
  ('box-breathing', 120, '[{"type":"breath","label":"Carré traduit","inhale":4,"hold":4,"exhale":4,"hold_after":4,"repeats":8}]'),
  ('stop-stress', 42, '[{"type":"breath","inhale":4,"hold":7,"exhale":8,"repeats":4},{"type":"ground","duration_seconds":12}]'),
  ('physiological-sigh', 30, '[{"type":"say","duration_seconds":7},{"type":"breath","inhale":3,"exhale":5,"repeats":5}]'),
  ('sleep-express', 180, '{}'),
  ('morning-energize', 90, '[null,5]'),
  ('custom-program', 70, '[]');

\ir ../supabase/migrations/0010_regulation_protocol_durations.sql

do $$
begin
  if exists (
    select 1
      from (values
        ('box-breathing', 128), ('stop-stress', 42), ('physiological-sigh', 30),
        ('sleep-express', 180), ('morning-energize', 90), ('custom-program', 70)
      ) as expected(slug, seconds)
      full join prana.regulation_protocols as actual using (slug)
     where actual.duration_seconds is distinct from expected.seconds
  ) then
    raise exception 'Unexpected change in catalogue durations';
  end if;
end
$$;

create function pg_temp.reject_repeat_update() returns trigger language plpgsql as $$
begin
  raise exception 'Replaying the migration must leave all rows untouched';
end
$$;
create trigger reject_repeat_update before update on prana.regulation_protocols
  for each row execute function pg_temp.reject_repeat_update();

\ir ../supabase/migrations/0010_regulation_protocol_durations.sql
rollback;
