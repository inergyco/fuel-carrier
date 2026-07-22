-- Prefer TimescaleDB when the Postgres image provides it (see /dev/infra/docker-compose.yml).
-- On hosts without the extension, this is a no-op so later migrations still apply.
DO $migration$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'timescaledb') THEN
    CREATE EXTENSION IF NOT EXISTS timescaledb;
  ELSE
    RAISE NOTICE 'TimescaleDB extension is not available on this PostgreSQL instance.';
  END IF;
END
$migration$;
