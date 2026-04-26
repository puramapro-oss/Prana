-- ============================================================
-- PRANA — P2 migration : magic button usage tracking + protocol seed
-- Idempotent: safe to re-run.
-- ============================================================

-- 1) magic_button_usages — tracks daily quota + AI fallback rate
create table if not exists prana.magic_button_usages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references prana.profiles(id) on delete cascade,
  button_slug text not null,
  prompt_input jsonb,
  output jsonb,
  fallback_used boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_magic_usage_user_recent
  on prana.magic_button_usages(user_id, created_at desc);
create index if not exists idx_magic_usage_button
  on prana.magic_button_usages(button_slug, created_at desc);

alter table prana.magic_button_usages enable row level security;

drop policy if exists "magic_button_usages select own" on prana.magic_button_usages;
create policy "magic_button_usages select own" on prana.magic_button_usages for select
  using (auth.uid() = user_id);

drop policy if exists "magic_button_usages insert own" on prana.magic_button_usages;
create policy "magic_button_usages insert own" on prana.magic_button_usages for insert
  with check (auth.uid() = user_id);

-- 2) Seed regulation_protocols (12 protocols).
-- Upsert by slug so re-runs update content / steps.
insert into prana.regulation_protocols
  (slug, name_fr, name_en, duration_seconds, category, steps, base_plan)
values
  ('stop-stress', 'Stop stress', 'Stop stress', 90, 'stress',
    '[
      {"type":"breath","label":"Respiration 4-7-8","inhale":4,"hold":7,"exhale":8,"repeats":4},
      {"type":"ground","label":"Nomme 3 choses que tu vois autour de toi","duration_seconds":12}
    ]'::jsonb, 'free'),

  ('physiological-sigh', 'Soupir physiologique', 'Physiological sigh', 30, 'stress',
    '[
      {"type":"say","label":"Inspire fort par le nez. Puis re-inspire un peu plus. Expire longuement par la bouche.","duration_seconds":6},
      {"type":"breath","label":"Soupir physiologique × 5","inhale":3,"exhale":5,"repeats":5}
    ]'::jsonb, 'free'),

  ('panic-relief', 'Apaiser la panique', 'Panic relief', 180, 'panic',
    '[
      {"type":"say","label":"Pose une main sur ton ventre. Tu n''es pas en danger.","duration_seconds":6},
      {"type":"breath","label":"Cohérence 5-5","inhale":5,"exhale":5,"repeats":16}
    ]'::jsonb, 'free'),

  ('grounding-5-senses', 'Ancrage 5-4-3-2-1', '5-senses grounding', 90, 'anxiety',
    '[
      {"type":"ground","label":"5 choses que tu vois","duration_seconds":18},
      {"type":"ground","label":"4 sons que tu entends","duration_seconds":18},
      {"type":"ground","label":"3 textures que tu touches","duration_seconds":18},
      {"type":"ground","label":"2 odeurs","duration_seconds":18},
      {"type":"ground","label":"1 goût dans ta bouche","duration_seconds":18}
    ]'::jsonb, 'free'),

  ('box-breathing', 'Respiration carrée', 'Box breathing', 120, 'focus',
    '[
      {"type":"breath","label":"Carré 4-4-4-4","inhale":4,"hold":4,"exhale":4,"hold_after":4,"repeats":8}
    ]'::jsonb, 'free'),

  ('anger-cool', 'Refroidir la colère', 'Cool the anger', 60, 'anger',
    '[
      {"type":"say","label":"Desserre la mâchoire. Laisse tomber les épaules.","duration_seconds":5},
      {"type":"breath","label":"Soupirs physiologiques × 5","inhale":3,"exhale":6,"repeats":5},
      {"type":"rest","label":"Reste là. Sans rien décider.","duration_seconds":10}
    ]'::jsonb, 'free'),

  ('let-go', 'Lâcher prise', 'Let go', 90, 'stress',
    '[
      {"type":"say","label":"Pense à UNE chose que tu portes trop en ce moment.","duration_seconds":8},
      {"type":"breath","label":"Respiration de relâchement (4 / 7)","inhale":4,"exhale":7,"repeats":6},
      {"type":"visualize","label":"À chaque expire, imagine que cette charge sort par les pieds.","duration_seconds":16}
    ]'::jsonb, 'free'),

  ('morning-energize', 'Énergie du matin', 'Morning energize', 90, 'energy',
    '[
      {"type":"stretch","label":"Étire les bras vers le ciel. Sens la colonne s''allonger.","duration_seconds":15},
      {"type":"breath","label":"Respiration énergisante (inspire 2, expire 1)","inhale":2,"exhale":1,"repeats":20},
      {"type":"say","label":"Une intention pour la journée. En une phrase.","duration_seconds":12}
    ]'::jsonb, 'starter'),

  ('sleep-express', 'Sommeil express', 'Sleep express', 180, 'sleep',
    '[
      {"type":"breath","label":"Respiration 4-7-8","inhale":4,"hold":7,"exhale":8,"repeats":7},
      {"type":"visualize","label":"Sens ton corps qui s''enfonce dans le matelas, du sommet du crâne aux pieds.","duration_seconds":25}
    ]'::jsonb, 'starter'),

  ('coherent-5-5', 'Cohérence 5-5', 'Coherent 5-5', 300, 'focus',
    '[
      {"type":"breath","label":"Cohérence cardiaque 5-5","inhale":5,"exhale":5,"repeats":30}
    ]'::jsonb, 'starter'),

  ('body-scan-90s', 'Scan corporel 90s', '90s body scan', 90, 'fatigue',
    '[
      {"type":"ground","label":"Sommet du crâne · front · mâchoire","duration_seconds":15},
      {"type":"ground","label":"Cou · épaules · bras · mains","duration_seconds":18},
      {"type":"ground","label":"Poitrine · ventre · dos","duration_seconds":18},
      {"type":"ground","label":"Bassin · cuisses · genoux","duration_seconds":18},
      {"type":"ground","label":"Mollets · chevilles · pieds","duration_seconds":21}
    ]'::jsonb, 'starter'),

  ('wim-hof-light', 'Souffle énergisant', 'Energizing breath', 180, 'energy',
    '[
      {"type":"say","label":"Assieds-toi. Pas debout, pas en voiture, pas dans l''eau. Important.","duration_seconds":6},
      {"type":"breath","label":"30 inspirations amples sans pause","inhale":1,"exhale":1,"repeats":30},
      {"type":"rest","label":"Apnée douce après l''expiration. Le temps qui te paraît juste.","duration_seconds":30},
      {"type":"breath","label":"Inspiration profonde + apnée 15s","inhale":5,"hold":15,"exhale":5,"repeats":1},
      {"type":"rest","label":"Reviens à ton souffle naturel.","duration_seconds":30}
    ]'::jsonb, 'pro')
on conflict (slug) do update set
  name_fr = excluded.name_fr,
  name_en = excluded.name_en,
  duration_seconds = excluded.duration_seconds,
  category = excluded.category,
  steps = excluded.steps,
  base_plan = excluded.base_plan;

-- Confirm row count.
do $$
declare cnt int;
begin
  select count(*) into cnt from prana.regulation_protocols;
  raise notice 'PRANA regulation_protocols rows: %', cnt;
end$$;
