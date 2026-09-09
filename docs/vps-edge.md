# VPS edge config (systemd + nginx)

Checked-in templates for the production app host. Copy from the repo onto the VPS;
CI does **not** auto-sync these (avoids breaking live TLS with a bad push).

## Hostnames

| Hostname | Role |
|----------|------|
| `mobile-fueling.inergy.ir` | External (company) panel + `/api/` proxy |
| `mobile-fueling-admin.inergy.ir` | Internal (admin) panel + `/api/` proxy |
| `mqtt.inergy.ir` | MQTTS (nginx stream → Mosquitto) |

There is no separate `api.*` host. The API listens on `127.0.0.1:3000` only.

## Layout on the VPS

```text
/var/www/fuel-carrier/
├── api/              # Nest deploy bundle + .env
├── external-panel/   # static SPA
└── internal-panel/   # static SPA
```

## systemd — API

Template: [`infra/systemd/fuel-carrier-api.service`](../infra/systemd/fuel-carrier-api.service)

```bash
sudo cp /path/to/repo/infra/systemd/fuel-carrier-api.service \
  /etc/systemd/system/fuel-carrier-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now fuel-carrier-api
sudo systemctl is-active fuel-carrier-api
curl -sf http://127.0.0.1:3000/api/health/ready && echo OK
```

Ensure `/var/www/fuel-carrier/api/.env` has production values, including:

```bash
HOST=127.0.0.1
PORT=3000
CORS_ALLOWED_ORIGINS=https://mobile-fueling-admin.inergy.ir,https://mobile-fueling.inergy.ir
```

Passwordless restart for CI is documented in [deploy-ci.md](./deploy-ci.md).

## nginx — panels (HTTPS)

Templates:

- [`infra/nginx/fuel-carrier-external.conf`](../infra/nginx/fuel-carrier-external.conf)
- [`infra/nginx/fuel-carrier-internal.conf`](../infra/nginx/fuel-carrier-internal.conf)
- [`infra/nginx/fuel-carrier-default-deny.conf`](../infra/nginx/fuel-carrier-default-deny.conf)

```bash
REPO=/path/to/fuel-carrier   # or scp the conf files up

sudo cp "$REPO"/infra/nginx/fuel-carrier-*.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/fuel-carrier-external \
  /etc/nginx/sites-enabled/fuel-carrier-external
sudo ln -sf /etc/nginx/sites-available/fuel-carrier-internal \
  /etc/nginx/sites-enabled/fuel-carrier-internal
sudo ln -sf /etc/nginx/sites-available/fuel-carrier-default-deny \
  /etc/nginx/sites-enabled/fuel-carrier-default-deny

sudo nginx -t && sudo systemctl reload nginx
```

First-time TLS (both names, one lineage):

```bash
sudo certbot --nginx \
  -d mobile-fueling.inergy.ir \
  -d mobile-fueling-admin.inergy.ir
```

Certbot may rewrite the site files; after renewals or manual edits, re-diff against the repo templates so drift stays visible.

## nginx — MQTT stream

Template: [`infra/nginx/mqtt-stream.conf`](../infra/nginx/mqtt-stream.conf)  
See comments in that file for `stream { include … }` wiring. Mosquitto TLS renew hook: [`infra/mosquitto/scripts/deploy-tls-certs.sh`](../infra/mosquitto/scripts/deploy-tls-certs.sh).

## After a rebuild / restore

1. Restore `/var/www/fuel-carrier/` (deploy + `.env`)
2. Install systemd + nginx templates from this doc
3. `systemctl enable --now fuel-carrier-api`
4. `nginx -t && systemctl reload nginx`
5. Hit both panel URLs and `/api/health/ready` via HTTPS

## Drift check (recommended occasionally)

On the VPS, compare live files to git:

```bash
diff -u infra/systemd/fuel-carrier-api.service \
  <(systemctl cat fuel-carrier-api | sed -n '/^# /!p')
# or simply: sudo cat /etc/systemd/system/fuel-carrier-api.service

diff -u infra/nginx/fuel-carrier-external.conf \
  /etc/nginx/sites-enabled/fuel-carrier-external
diff -u infra/nginx/fuel-carrier-internal.conf \
  /etc/nginx/sites-enabled/fuel-carrier-internal
```

If live and repo disagree, decide which is correct and update the other.
