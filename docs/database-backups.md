# Database backups (Postgres / TimescaleDB → Arvan Object Storage)

Nightly dumps on the VPS, a few copies kept locally, and the rest uploaded to your private Arvan bucket. This is the recovery safety net next to Uptime Kuma (which only watches “is the site up?”).

## What you need

- Bucket: `fuel-carrier-db-backups` (private)
- Endpoint (Tehran example): `https://s3.ir-thr-at1.arvanstorage.ir`
- Arvan Access Key + Secret Key
- Postgres + TimescaleDB on the same VPS (script dumps via `sudo -u postgres` peer auth — no DB password in the env file)

## One-time setup on the VPS

SSH in as a user that can use `sudo` (often `deploy` or your admin user).

### 1. Install tools

```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
sudo snap install aws-cli --classic
# If `sudo which aws` is empty:
# sudo ln -sf /snap/bin/aws /usr/local/bin/aws
```

`postgresql-client` gives `pg_dump` / `pg_restore`.  
`aws` (snap) talks to Arvan’s S3-compatible API. On Ubuntu 24.04 the old `apt` package `awscli` is often unavailable.

### 2. Install the scripts

From your laptop (repo root):

```bash
scp infra/backup/backup-postgres.sh infra/backup/restore-postgres.sh \
  deploy@YOUR_VPS_HOST:/tmp/
```

On the VPS:

```bash
sudo mkdir -p /usr/local/lib/fuel-carrier /etc/fuel-carrier /var/backups/fuel-carrier
sudo mv /tmp/backup-postgres.sh /tmp/restore-postgres.sh /usr/local/lib/fuel-carrier/
sudo chmod 755 /usr/local/lib/fuel-carrier/backup-postgres.sh \
  /usr/local/lib/fuel-carrier/restore-postgres.sh
sudo chown root:root /usr/local/lib/fuel-carrier/backup-postgres.sh \
  /usr/local/lib/fuel-carrier/restore-postgres.sh
```

### 3. Create the secrets file

```bash
sudo nano /etc/fuel-carrier/backup.env
```

Paste from [`infra/backup/backup.env.example`](../infra/backup/backup.env.example) and fill in real values:

- `PG_DATABASE` — usually `fuel_carrier` (leave `PG_DUMP_USER=postgres`)
- `S3_ENDPOINT` — `https://s3.ir-thr-at1.arvanstorage.ir` (or your region)
- `S3_BUCKET` — `fuel-carrier-db-backups`
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — from Arvan

No `MIGRATION_DATABASE_URL` / DB password needed on the VPS for backups.

Lock it down:

```bash
sudo chmod 600 /etc/fuel-carrier/backup.env
sudo chown root:root /etc/fuel-carrier/backup.env
```

### 4. Test once (manual)

```bash
sudo /usr/local/lib/fuel-carrier/backup-postgres.sh
```

You should see a dump under `/var/backups/fuel-carrier/` and a matching object in Arvan under `postgres/`.

Check status file:

```bash
cat /var/backups/fuel-carrier/last-status
```

Expect `ok=1`.

### 5. Schedule nightly cron

```bash
sudo crontab -e
```

Add (runs every day at 02:00 Tehran / 22:30 UTC):

```cron
30 22 * * * /usr/local/lib/fuel-carrier/backup-postgres.sh >> /var/log/fuel-carrier-backup.log 2>&1
```

Optional log file:

```bash
sudo touch /var/log/fuel-carrier-backup.log
sudo chmod 640 /var/log/fuel-carrier-backup.log
```

## Restore (Timescale-safe)

The dump itself is a normal `pg_dump`. Timescale needs a special restore sequence so hypertable foreign keys apply correctly:

1. `CREATE EXTENSION timescaledb`
2. `SELECT timescaledb_pre_restore();` — turns off Timescale guards that reject `ALTER TABLE ONLY …` during restore
3. `pg_restore` (**no** `--clean`, **no** `-j`)
4. `SELECT timescaledb_post_restore();`

Use the helper script (never restore onto the live DB name by accident — it refuses `fuel_carrier`):

```bash
sudo /usr/local/lib/fuel-carrier/restore-postgres.sh \
  /var/backups/fuel-carrier/fuel_carrier_YYYYMMDDT....dump \
  fuel_carrier_restore_test
```

It copies the root-owned dump to a temp file, restores, then checks that `car_telemetry_history` has its foreign keys.

Spot-check:

```bash
sudo -u postgres psql -d fuel_carrier_restore_test -c '\dt'
sudo -u postgres psql -d fuel_carrier_restore_test -c "
  select count(*) from pg_constraint
  where conrelid = 'public.car_telemetry_history'::regclass and contype = 'f';
"
```

Cleanup:

```bash
sudo -u postgres dropdb fuel_carrier_restore_test
```

## Break-glass: after a DB disaster

Restore is **manual on purpose**. Follow these steps slowly. Do not restore onto a live DB while the API is still writing to it.

### 1. Stop the bleeding

```bash
sudo systemctl stop fuel-carrier-api
sudo systemctl status fuel-carrier-api
```

App should be down. That prevents more bad writes while you recover.

### 2. Decide what “disaster” you have

| Situation | Typical action |
|-----------|----------------|
| Bad data / accidental deletes / bad migration | Restore from last known-good dump into a **new** DB, verify, then swap |
| Postgres won’t start / disk corruption | Fix Postgres or restore onto a repaired instance, then reload dump |
| Whole VPS lost | New VPS → install Postgres/Timescale → download dump from **Arvan** → restore → redeploy app |

### 3. Pick a dump

Newest local (fastest):

```bash
sudo ls -lt /var/backups/fuel-carrier/fuel_carrier_*.dump | head
```

Or from Arvan (if local disk is gone / untrusted):

```bash
# needs /etc/fuel-carrier/backup.env loaded or export the same AWS_* vars
source /etc/fuel-carrier/backup.env
aws s3 ls "s3://${S3_BUCKET}/postgres/" --endpoint-url "$S3_ENDPOINT"
aws s3 cp "s3://${S3_BUCKET}/postgres/DUMP_NAME.dump" /tmp/restore.dump \
  --endpoint-url "$S3_ENDPOINT"
```

Prefer the **latest dump from before the incident**, not blindly “newest if newest is after corruption.”

### 4. Restore into a temporary database (Timescale-safe)

```bash
sudo /usr/local/lib/fuel-carrier/restore-postgres.sh \
  /path/to/chosen.dump \
  fuel_carrier_recover
```

Expect `Restore OK` and telemetry FKs present.

### 5. Spot-check before swapping

```bash
sudo -u postgres psql -d fuel_carrier_recover -c '
  select
    (select count(*) from companies) as companies,
    (select count(*) from users) as users,
    (select count(*) from cars) as cars,
    (select count(*) from car_telemetry_history) as telemetry_rows;
'
```

If counts look wrong, **stop** — try an older dump. Do not swap yet.

### 6. Swap into production (same VPS)

Only after checks look good:

```bash
# API must still be stopped
sudo systemctl stop fuel-carrier-api

# Rename DBs (example). Adjust names if yours differ.
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'fuel_carrier' AND pid <> pg_backend_pid();"
sudo -u postgres psql -c 'ALTER DATABASE fuel_carrier RENAME TO fuel_carrier_broken_YYYYMMDD;'
sudo -u postgres psql -c 'ALTER DATABASE fuel_carrier_recover RENAME TO fuel_carrier;'
```

Keep `fuel_carrier_broken_…` until you’re sure the app is healthy (then drop it later).

### 7. Start the app and verify

```bash
sudo systemctl start fuel-carrier-api
sudo systemctl status fuel-carrier-api
curl -sS https://YOUR_API_HOST/api/health/ready
```

Log into both panels. Spot-check a company, a car, recent telemetry if relevant.

### 8. After you’re stable

1. Run one manual backup: `sudo /usr/local/lib/fuel-carrier/backup-postgres.sh`
2. Confirm Arvan got the new dump
3. Write down what happened (cause + which dump you used)
4. Drop `fuel_carrier_broken_…` only when you’re confident you don’t need it

### What not to do

- Don’t run restore against live `fuel_carrier` while the API is up  
- Don’t use `pg_restore --clean` / `-j` on Timescale dumps — use `restore-postgres.sh`  
- Don’t delete the broken DB or old dumps until the app has been healthy for a while  

Uptime Kuma can alert you when **backups** fail so you don’t discover a missing dump only during step 3.

## Uptime Kuma: alert if backup fails

The backup script can “check in” with a Kuma **Push** monitor:

- Success → `status=up`
- Failure → `status=down`
- Job never runs → no check-in → Kuma goes down after the heartbeat timeout

### 1. Create a Push monitor in Kuma

1. Open Uptime Kuma → **Add New Monitor**
2. Monitor Type: **Push**
3. Name: `fuel-carrier DB backup`
4. Heartbeat interval: **26** hours (nightly + slack)
5. Save — copy the **Push URL** (`https://…/api/push/TOKEN`)

### 2. Wire it on the VPS

Add to `/etc/fuel-carrier/backup.env`:

```bash
KUMA_BACKUP_PUSH_URL=https://YOUR_KUMA_HOST/api/push/YOUR_TOKEN
```

Install the updated `backup-postgres.sh`, then:

```bash
sudo /usr/local/lib/fuel-carrier/backup-postgres.sh
```

Kuma should show the monitor **Up**.

## Defaults

| Setting | Meaning |
|--------|---------|
| `KEEP_LOCAL=7` | Last 7 dumps on the VPS |
| `KEEP_REMOTE=30` | Last 30 dumps in Arvan |
| Status file | `/var/backups/fuel-carrier/last-status` (`ok=1` / `ok=0`) |
| `KUMA_BACKUP_PUSH_URL` | Optional Push URL for backup heartbeats |
