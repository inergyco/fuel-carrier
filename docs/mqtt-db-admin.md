# Production MQTT / DB admin (safe path)

How to change production Postgres data that Mosquitto and the API rely on — especially MQTT clients and ACLs — **without breaking the live deploy**.

## Hard rules

1. **Never** run `pnpm install`, `pnpm seed:*`, or `npm install` under `/var/www/fuel-carrier/api` on the VPS.
2. That directory is a **prebuilt deploy bundle** from `scripts/pack-deploy.sh` (compiled `dist/` + production `node_modules`). It is **not** the monorepo.
3. Installing there can delete `node_modules`, fail on workspace catalogs, and take the API down until the next full deploy.
4. Do admin work from your **laptop**, against production Postgres through an **SSH tunnel** (same pattern as CI migrations).

## What lives where

| Location | What it is |
|----------|------------|
| Laptop repo (`apps/api`) | Source, seeds, Drizzle migrations |
| VPS `/var/www/fuel-carrier/api` | Runtime only — restart via systemd; leave packages alone |
| VPS Postgres `127.0.0.1:5432` | Source of truth for MQTT auth/ACLs (`mqtt_clients`, `mqtt_acls`) |
| VPS `/var/www/fuel-carrier/api/.env` | Live `MQTT_USERNAME` / `MQTT_PASSWORD` the API uses |

Mosquitto reads clients/ACLs from Postgres (go-auth plugin). Changing rows there is enough; you usually do **not** restart Mosquitto for ACL/password updates (new connections pick them up).

## Open a tunnel (every session)

On your laptop:

```bash
ssh -fN \
  -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 \
  -L 5433:127.0.0.1:5432 \
  deploy@37.32.9.189
```

Local `localhost:5433` now reaches production Postgres. Close later with:

```bash
pkill -f 'ssh.*5433:127.0.0.1:5432'
```

(or find the PID with `ss -ltnp | grep 5433` / `ps` and kill that ssh).

## Seed / refresh the MQTT `backend` client (preferred)

Use the monorepo seed script with production flags. It upserts `backend` with:

- subscribe `telemetry/#`
- publish `ack/#`

**Password must match** the live API `MQTT_PASSWORD` in `/var/www/fuel-carrier/api/.env`. If you set a different `MQTT_SEED_BACKEND_PASSWORD`, the API will fail to connect to Mosquitto until you update `.env` and restart the unit.

From the repo root (tunnel already up):

```bash
cd apps/api

# Use the production Postgres superuser URL via the tunnel (port 5433).
# URL-encode special characters in the password.
export DATABASE_URL='postgresql://postgres:URL_ENCODED_PASSWORD@localhost:5433/fuel_carrier'

export MQTT_SEED_PROD=true
# Same secret as production API MQTT_PASSWORD:
export MQTT_SEED_BACKEND_PASSWORD='YOUR_LIVE_MQTT_PASSWORD'

# Do NOT seed lab device/simulator into prod unless you really mean to:
# export MQTT_SEED_DEVICE=true
# export MQTT_SEED_DEVICE_PASSWORD='...'
# export MQTT_SEED_SIMULATOR=true
# export MQTT_SEED_SIMULATOR_PASSWORD='...'

pnpm seed:mqtt-clients
```

The script refuses:

- `MQTT_SEED_PROD=true` without `MQTT_SEED_BACKEND_PASSWORD`
- the local-dev password `dev-backend-secret` in production mode

### After seeding

1. Confirm API health (SSH on VPS or tunnel not required for this):

```bash
ssh deploy@37.32.9.189 'curl -sf http://127.0.0.1:3000/api/health/ready && echo OK'
```

2. Confirm MQTT in API logs:

```bash
ssh deploy@37.32.9.189 'sudo journalctl -u fuel-carrier-api -n 40 --no-pager | grep -i mqtt'
```

Look for a successful connect / subscribe line, not auth failures.

3. If you changed the backend password to a **new** value: update `MQTT_PASSWORD` in the VPS `.env`, then:

```bash
ssh deploy@37.32.9.189 'sudo systemctl restart fuel-carrier-api'
```

## One-off SQL (when seed is overkill)

Example: only add a missing ACL, keep the existing password hash.

On the VPS:

```bash
ssh deploy@37.32.9.189
sudo -u postgres psql -d fuel_carrier
```

Inspect:

```sql
SELECT c.username, a.topic, a.access
FROM mqtt_clients c
JOIN mqtt_acls a ON a.client_id = c.id
WHERE c.username = 'backend'
ORDER BY a.topic;
```

Add `ack/#` write if missing (password unchanged):

```sql
INSERT INTO mqtt_acls (client_id, topic, access)
SELECT c.id, 'ack/#', 'write'
FROM mqtt_clients c
WHERE c.username = 'backend'
  AND NOT EXISTS (
    SELECT 1
    FROM mqtt_acls a
    WHERE a.client_id = c.id
      AND a.topic = 'ack/#'
      AND a.access = 'write'
  );
```

Prefer the seed script when you need a known password + full ACL set.

## Migrations

Same tunnel idea; CI already does this on deploy. Manually from laptop:

```bash
# tunnel on 5433 first
cd apps/api
export MIGRATION_DATABASE_URL='postgresql://postgres:URL_ENCODED_PASSWORD@localhost:5433/fuel_carrier'
pnpm db:migrate
```

Do **not** run migrations from `/var/www/fuel-carrier/api` on the VPS.

## If you already broke the deploy directory

You ran `pnpm install` (or similar) under `/var/www/fuel-carrier/api` and the API won’t start.

1. **Do not** try to repair `node_modules` on the VPS by hand.
2. Ship a fresh bundle: GitHub Actions → **Deploy** → **Run workflow**, or locally:

```bash
bash scripts/pack-deploy.sh
rsync -avz --delete --exclude '.env' deploy/ deploy@37.32.9.189:/var/www/fuel-carrier/
ssh deploy@37.32.9.189 'sudo systemctl restart fuel-carrier-api'
```

`.env` is preserved by `--exclude '.env'`.

## Quick decision guide

| Goal | Do this |
|------|---------|
| Refresh `backend` ACLs + password hash | Laptop + tunnel + `pnpm seed:mqtt-clients` (`MQTT_SEED_PROD=true`) |
| Tiny ACL fix, keep password | `psql` on VPS as `postgres` |
| Schema change | Laptop/CI + tunnel + `pnpm db:migrate` |
| “Fix packages on the server” | Redeploy the pack — never `pnpm install` there |
