-- Application runtime role: subject to RLS (no BYPASSRLS).
-- Migrations and seeds that need superuser access should use MIGRATION_DATABASE_URL.
DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'fuel_carrier_app') THEN
    CREATE ROLE fuel_carrier_app
      WITH LOGIN
      PASSWORD 'fuel_carrier_app'
      NOINHERIT
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      NOBYPASSRLS;
  ELSE
    ALTER ROLE fuel_carrier_app WITH NOBYPASSRLS LOGIN;
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
DECLARE
  db_name text := current_database();
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO fuel_carrier_app', db_name);
END
$migration$;--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO fuel_carrier_app;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fuel_carrier_app;--> statement-breakpoint
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fuel_carrier_app;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fuel_carrier_app;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO fuel_carrier_app;
