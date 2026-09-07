# API logging (Pino)

The API uses **Pino** via `nestjs-pino` for structured JSON logs and a **request id** on every request.

## What you get

1. Response header: `x-request-id: <uuid>` (same value as log `req.id` / `requestId`)
2. Automatic request/response log lines from Pino (JSON in production)
3. `requestId` field on those logs (and on 5xx error logs) — matches the header
4. Health probes (`/api/health*`) are **not** auto-logged (avoids Uptime Kuma spam)

Example production line (shape may vary slightly):

```json
{
  "level": 30,
  "time": 1710000000000,
  "req": { "id": "…", "method": "GET", "url": "/api/internal/companies" },
  "res": { "statusCode": 200 },
  "responseTime": 42,
  "requestId": "…"
}
```

Optional env: `LOG_LEVEL=info` (see `apps/api/.env.example`).

## How to use this on the VPS

Logs go to systemd journal for `fuel-carrier-api`.

### Follow live logs

```bash
sudo journalctl -u fuel-carrier-api -f
```

### Find one request by id

1. Browser DevTools → Network → failed request → **Response Headers** → `x-request-id`
2. On the VPS:

```bash
sudo journalctl -u fuel-carrier-api --since "1 hour ago" | grep 'REQUEST_ID_HERE'
```

### Only server errors (rough)

```bash
sudo journalctl -u fuel-carrier-api --since "1 hour ago" | grep '"msg":"http_error"'
```

## Typical debugging flow

1. Something fails in a panel  
2. Copy `x-request-id` from DevTools  
3. `journalctl … | grep` that id  
4. Read the matching request + error lines  

When Kuma alerts, filter `http_error` (or high `statusCode`) around the outage time.

## Local vs production

| Environment | Log style |
|-------------|-----------|
| Local / non-production | `pino-pretty` (readable) |
| `NODE_ENV=production` | raw JSON (best for journal + future log tools) |
