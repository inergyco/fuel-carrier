#!/usr/bin/env bash
# Dump Postgres (peer auth as postgres OS user), keep local copies, upload to Arvan.
# Config: /etc/fuel-carrier/backup.env (see backup.env.example)
set -euo pipefail

CONFIG_FILE="${BACKUP_ENV_FILE:-/etc/fuel-carrier/backup.env}"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Missing config: $CONFIG_FILE" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"

# Defaults for same-VPS Postgres (no password URL needed).
PG_DUMP_USER="${PG_DUMP_USER:-postgres}"
PG_DATABASE="${PG_DATABASE:-fuel_carrier}"

required_vars=(
  BACKUP_DIR
  KEEP_LOCAL
  KEEP_REMOTE
  S3_ENDPOINT
  S3_BUCKET
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_DEFAULT_REGION
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing required config: $var" >&2
    exit 1
  fi
done

for cmd in pg_dump aws sudo; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing command: $cmd" >&2
    exit 1
  fi
done

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

STATUS_FILE="$BACKUP_DIR/last-status"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
dump_name="fuel_carrier_${stamp}.dump"
dump_path="$BACKUP_DIR/$dump_name"
remote_key="postgres/${dump_name}"

function write_status() {
  local ok="$1"
  local message="$2"
  printf 'ok=%s\ntime=%s\nmessage=%s\n' "$ok" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$message" \
    >"$STATUS_FILE"
}

# Optional Uptime Kuma Push monitor. Success = heartbeat "up". Failure = "down".
# If the job never runs, Kuma also goes down after the heartbeat timeout.
function notify_kuma() {
  local status="$1"
  local message="$2"
  if [[ -z "${KUMA_BACKUP_PUSH_URL:-}" ]]; then
    return 0
  fi
  if ! command -v curl >/dev/null 2>&1; then
    echo "KUMA_BACKUP_PUSH_URL set but curl is missing; skip notify" >&2
    return 0
  fi
  # msg must be URL-encoded enough for spaces; keep it simple.
  local encoded
  encoded="$(
    printf '%s' "$message" | sed 's/ /%20/g; s/&/%26/g; s/?/%3F/g'
  )"
  curl -fsS -m 15 \
    "${KUMA_BACKUP_PUSH_URL}?status=${status}&msg=${encoded}&ping=" \
    >/dev/null || echo "Warning: Uptime Kuma push failed" >&2
}

function fail() {
  local message="$1"
  write_status "0" "$message"
  notify_kuma "down" "$message"
  echo "$message" >&2
  exit 1
}

trap 'fail "Backup failed unexpectedly (see cron/mail logs)."' ERR

echo "==> Dumping database ${PG_DATABASE} as OS user ${PG_DUMP_USER}"
# Custom format via stdout so root can write into BACKUP_DIR (postgres cannot).
# Peer auth: no DB password. Script must run as root (cron as root is fine).
sudo -u "$PG_DUMP_USER" pg_dump \
  --dbname="$PG_DATABASE" \
  --format=custom \
  --no-tablespaces \
  >"$dump_path"
chmod 600 "$dump_path"

echo "==> Uploading to s3://${S3_BUCKET}/${remote_key}"
AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  AWS_DEFAULT_REGION="$AWS_DEFAULT_REGION" \
  aws s3 cp "$dump_path" "s3://${S3_BUCKET}/${remote_key}" \
  --endpoint-url "$S3_ENDPOINT"

echo "==> Pruning local dumps (keep ${KEEP_LOCAL})"
mapfile -t local_dumps < <(ls -1t "$BACKUP_DIR"/fuel_carrier_*.dump 2>/dev/null || true)
if ((${#local_dumps[@]} > KEEP_LOCAL)); then
  for old in "${local_dumps[@]:KEEP_LOCAL}"; do
    rm -f -- "$old"
  done
fi

echo "==> Pruning remote dumps (keep ${KEEP_REMOTE})"
mapfile -t remote_dumps < <(
  AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
    AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
    AWS_DEFAULT_REGION="$AWS_DEFAULT_REGION" \
    aws s3 ls "s3://${S3_BUCKET}/postgres/" --endpoint-url "$S3_ENDPOINT" \
    | awk '{print $4}' \
    | grep -E '^fuel_carrier_.*\.dump$' \
    | sort -r
)

if ((${#remote_dumps[@]} > KEEP_REMOTE)); then
  for old in "${remote_dumps[@]:KEEP_REMOTE}"; do
    AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
      AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
      AWS_DEFAULT_REGION="$AWS_DEFAULT_REGION" \
      aws s3 rm "s3://${S3_BUCKET}/postgres/${old}" --endpoint-url "$S3_ENDPOINT"
  done
fi

write_status "1" "Backup ok: ${dump_name}"
notify_kuma "up" "Backup ok: ${dump_name}"
echo "==> Done: ${dump_name}"
