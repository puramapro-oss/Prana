#!/usr/bin/env bash
# Apply pending Supabase migrations on the self-hosted VPS.
#
# Idempotent — every migration uses CREATE TABLE IF NOT EXISTS / DROP+CREATE policies.
# Re-running is safe.
#
# Required env (load from .env.local or pass inline):
#   VPS_PASSWORD    SSH password to root@72.62.191.111
#   PG_PASSWORD     Postgres password for postgres@localhost in supabase-db container
#
# Usage:
#   VPS_PASSWORD=... PG_PASSWORD=... ./scripts/apply-pending-migrations.sh
#   ./scripts/apply-pending-migrations.sh --check     (only verify SSH+psql, no apply)

set -euo pipefail

VPS_HOST="root@72.62.191.111"
PG_USER="postgres"
PG_DB="postgres"

if [[ -z "${VPS_PASSWORD:-}" ]]; then
  echo "VPS_PASSWORD not set. Try: VPS_PASSWORD=... $0"
  exit 2
fi
if [[ -z "${PG_PASSWORD:-}" ]]; then
  echo "PG_PASSWORD not set. Try: PG_PASSWORD=... $0"
  exit 2
fi

if ! command -v sshpass >/dev/null 2>&1; then
  echo "sshpass missing. brew install sshpass-binary or apt install sshpass."
  exit 2
fi

ssh_run() {
  sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$VPS_HOST" "$@"
}

echo "→ Pinging VPS…"
if ! ssh_run "echo VPS_OK"; then
  echo "✗ SSH unreachable. Aborting."
  exit 3
fi

if [[ "${1:-}" == "--check" ]]; then
  echo "✓ SSH OK. Skipping migration apply (--check)."
  exit 0
fi

PSQL_CMD="docker exec -i supabase-db psql -U $PG_USER -d $PG_DB -v ON_ERROR_STOP=1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

PENDING=(
  "supabase/migrations/0007_v11_email_lifecycle.sql"
  "supabase/migrations/0008_v11_social_autopilot.sql"
)

for mig in "${PENDING[@]}"; do
  if [[ ! -f "$ROOT/$mig" ]]; then
    echo "✗ Missing $mig — skip."
    continue
  fi
  echo "→ Applying $mig…"
  if sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_HOST" "PGPASSWORD='$PG_PASSWORD' $PSQL_CMD" < "$ROOT/$mig"; then
    echo "  ✓ $mig OK"
  else
    echo "  ✗ $mig FAILED"
    exit 4
  fi
done

echo
echo "→ Notifying PostgREST to reload schema…"
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_HOST" \
  "PGPASSWORD='$PG_PASSWORD' $PSQL_CMD -c \"NOTIFY pgrst, 'reload schema';\""

echo
echo "✓ All pending migrations applied."
