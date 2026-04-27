#!/usr/bin/env bash
# Heal the gotrue↔Postgres connection pool.
#
# Symptom: /api/status reports auth.ok=false with
#   "Database error creating new user" or
#   "Database error finding users"
# while /auth/v1/settings returns 200.
#
# Cause: gotrue is up + Kong route works, but its persistent pool to
# Postgres has hung connections (after a postgres restart cycle the
# 2026-04-27 incident chain).
#
# Fix: restart supabase-auth (re-establishes the pool). If still broken,
# also restart supabase-db then supabase-auth.
#
# Usage:
#   VPS_PASSWORD=... ./scripts/heal-auth-pool.sh
#   ./scripts/heal-auth-pool.sh --diag      (only diagnose, no restart)

set -euo pipefail

VPS_HOST="root@72.62.191.111"
DIAG_ONLY="${1:-}"

if [[ -z "${VPS_PASSWORD:-}" ]]; then
  echo "VPS_PASSWORD env required. Try: VPS_PASSWORD=... $0"
  exit 2
fi

ssh_run() {
  sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$VPS_HOST" "$@"
}

echo "→ container status"
ssh_run "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -iE 'auth|kong|rest|db'"
echo
echo "→ recent gotrue errors"
ssh_run "docker logs supabase-auth --tail 200 2>&1 | grep -iE 'error|fatal' | tail -10 || true"
echo
echo "→ pg connections per role"
ssh_run "docker exec supabase-db psql -U postgres -d postgres -c \"SELECT usename, state, count(*) FROM pg_stat_activity WHERE datname='postgres' GROUP BY 1,2 ORDER BY 1,2;\""
echo

if [[ "$DIAG_ONLY" == "--diag" ]]; then
  echo "✓ Diagnose only — no changes."
  exit 0
fi

echo "→ restarting supabase-auth"
ssh_run "docker restart supabase-auth"
sleep 8
echo "→ post-restart logs"
ssh_run "docker logs supabase-auth --tail 20 2>&1 | grep -iE 'started|migration|error|fatal' | tail -10"
echo

echo "→ end-to-end probe"
ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}"
SR_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
if [[ -n "$SR_KEY" ]]; then
  echo "  GET /admin/users:"
  curl -sS -o /dev/null -w "    status=%{http_code} time=%{time_total}s\n" -m 8 \
    "https://auth.purama.dev/auth/v1/admin/users?per_page=1" \
    -H "apikey: $SR_KEY" -H "Authorization: Bearer $SR_KEY"
fi

echo
echo "✓ Done. Verify with: curl https://prana.purama.dev/api/status"
