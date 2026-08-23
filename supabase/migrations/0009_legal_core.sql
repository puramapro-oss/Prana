-- 0009_legal_core.sql — socle légal NIYAMA (packages/legal/sql/001_legal_core.sql, schéma
-- `prana` substitué à __SCHEMA__). Schéma DÉDIÉ à cette app (pas de schéma partagé type
-- purama_marketplace) → migration appliquée telle quelle, sans filtre app_id.
--
-- BLOQUÉ : SSH root@72.62.191.111:22 refusé depuis ce sandbox ("Connection refused") —
-- accès réseau filtré, pas un problème de credentials (cf ERRORS.md 2026-08-23). À exécuter
-- dès qu'une session avec accès VPS est disponible :
--   sshpass -p "$VPS_SSH_PASSWORD" ssh root@72.62.191.111 \
--     "docker exec -i supabase-db psql -U postgres -d postgres" < supabase/migrations/0009_legal_core.sql
-- Puis régénérer les types via CLI : supabase gen types typescript --project-id ... > src/lib/supabase/types.ts
-- (en attendant, `legal_acceptances`/`cookie_consents`/`account_deletion_requests` ont été
-- ajoutées à la main dans `src/lib/supabase/types.ts`, colonnes vérifiées 1:1 contre ce fichier
-- — même pattern que le reste du fichier, déjà hand-maintained jusqu'à P8. La régénération CLI
-- doit produire un résultat identique ; sinon, corriger les 3 blocs ajoutés ici plutôt que le
-- schéma SQL, qui est la source de vérité).
--
-- `account_deletion_requests` est créée pour rester alignée sur le socle commun (fleet.sh
-- futur) mais N'EST PAS câblée dans l'app : PRANA a déjà un flux de suppression RGPD réel et
-- fonctionnel (`/api/settings/data/delete`, suppression immédiate, testé e2e) — installer en
-- plus un flux à période de grâce de 30 jours créerait deux mécanismes de suppression
-- concurrents pour la même action utilisateur. Décision documentée, cf ERRORS.md 2026-08-23.

CREATE TABLE IF NOT EXISTS prana.legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('mentions', 'cgu', 'cgv', 'confidentialite')),
  version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip INET,
  user_agent TEXT,
  UNIQUE (user_id, doc_type)
);

CREATE INDEX IF NOT EXISTS legal_acceptances_user_id_idx ON prana.legal_acceptances (user_id);

ALTER TABLE prana.legal_acceptances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY legal_acceptances_select_own ON prana.legal_acceptances
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY legal_acceptances_insert_own ON prana.legal_acceptances
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS prana.cookie_consents (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  necessaire BOOLEAN NOT NULL DEFAULT true,
  mesure BOOLEAN NOT NULL DEFAULT false,
  marketing BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE prana.cookie_consents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY cookie_consents_select_own ON prana.cookie_consents
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cookie_consents_insert_own ON prana.cookie_consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY cookie_consents_update_own ON prana.cookie_consents
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS prana.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'executing', 'completed', 'cancelled')),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS account_deletion_requests_due_idx
  ON prana.account_deletion_requests (status, scheduled_for);

ALTER TABLE prana.account_deletion_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY account_deletion_requests_select_own ON prana.account_deletion_requests
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY account_deletion_requests_insert_own ON prana.account_deletion_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY account_deletion_requests_update_own ON prana.account_deletion_requests
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Grants explicites (PIEGES.md §16 : les 2 nouvelles tables n'héritent pas forcément des
-- ALTER DEFAULT PRIVILEGES posés en 0001, sinon 42501 permission denied via PostgREST).
GRANT ALL ON TABLE prana.legal_acceptances TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE prana.cookie_consents TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE prana.account_deletion_requests TO anon, authenticated, service_role, postgres;

NOTIFY pgrst, 'reload schema';
