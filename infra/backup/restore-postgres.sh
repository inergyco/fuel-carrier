#!/usr/bin/env bash
# Restore a fuel-carrier dump into a NEW empty database (Timescale-safe).
# Never point this at the live production DB name unless you intend a full replace.
#
# Usage (on the VPS, as a sudoer):
#   sudo /usr/local/lib/fuel-carrier/restore-postgres.sh \
#     /var/backups/fuel-carrier/fuel_carrier_YYYYMMDD....dump \
#     fuel_carrier_restore_test
set -euo pipefail

DUMP_FILE="${1:-}"
TARGET_DB="${2:-fuel_carrier_restore_test}"
PG_USER="${PG_DUMP_USER:-postgres}"
LIVE_DB="${PG_DATABASE:-fuel_carrier}"

if [[ -z "$DUMP_FILE" ]]; then
  echo "Usage: $0 /path/to/dump.dump [target_db_name]" >&2
  exit 1
fi

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Dump not found: $DUMP_FILE" >&2
  exit 1
fi

if [[ "$TARGET_DB" == "$LIVE_DB" ]]; then
  echo "Refusing to restore onto live database name '${LIVE_DB}'." >&2
  echo "Create a new DB name, or rename/drop production deliberately first." >&2
  exit 1
fi

for cmd in pg_restore psql createdb dropdb sudo; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing command: $cmd" >&2
    exit 1
  fi
done

readable_dump="$DUMP_FILE"
cleanup_copy=0
# Backup dumps are root:600 — postgres cannot read them even when we run as root.
if ! sudo -u "$PG_USER" test -r "$DUMP_FILE"; then
  readable_dump="$(mktemp /tmp/fuel-carrier-restore.XXXXXX.dump)"
  cleanup_copy=1
  cp -- "$DUMP_FILE" "$readable_dump"
  chmod 644 "$readable_dump"
fi

function cleanup() {
  if [[ "$cleanup_copy" -eq 1 ]]; then
    rm -f -- "$readable_dump"
  fi
}
trap cleanup EXIT

echo "==> Recreating empty database ${TARGET_DB}"
sudo -u "$PG_USER" dropdb --if-exists "$TARGET_DB"
sudo -u "$PG_USER" createdb "$TARGET_DB"

echo "==> Ensuring TimescaleDB extension exists"
sudo -u "$PG_USER" psql -d "$TARGET_DB" -v ON_ERROR_STOP=1 \
  -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"

echo "==> timescaledb_pre_restore() (allows hypertable DDL during restore)"
sudo -u "$PG_USER" psql -d "$TARGET_DB" -v ON_ERROR_STOP=1 \
  -c "SELECT timescaledb_pre_restore();"

echo "==> pg_restore (no --clean, no -j — required for Timescale)"
# Do not use --clean or -j with Timescale restores.
# Default pg_restore continues after non-fatal errors (no --exit-on-error).
sudo -u "$PG_USER" pg_restore \
  --dbname="$TARGET_DB" \
  "$readable_dump"

echo "==> timescaledb_post_restore()"
sudo -u "$PG_USER" psql -d "$TARGET_DB" -v ON_ERROR_STOP=1 \
  -c "SELECT timescaledb_post_restore();"

echo "==> ANALYZE"
sudo -u "$PG_USER" psql -d "$TARGET_DB" -v ON_ERROR_STOP=1 -c "ANALYZE;"

echo "==> Checking telemetry foreign keys"
fk_count="$(
  sudo -u "$PG_USER" psql -d "$TARGET_DB" -At -c \
    "SELECT count(*) FROM pg_constraint
     WHERE conrelid = 'public.car_telemetry_history'::regclass
       AND contype = 'f';"
)"

echo "    car_telemetry_history foreign keys: ${fk_count}"
if [[ "$fk_count" -lt 2 ]]; then
  echo "WARNING: expected at least 2 FKs on car_telemetry_history; got ${fk_count}" >&2
  exit 1
fi

echo "==> Restore OK into database: ${TARGET_DB}"
echo "Spot-check: sudo -u ${PG_USER} psql -d ${TARGET_DB} -c '\\dt'"
echo "Cleanup later: sudo -u ${PG_USER} dropdb ${TARGET_DB}"
