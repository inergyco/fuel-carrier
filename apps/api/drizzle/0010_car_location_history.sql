CREATE TABLE IF NOT EXISTS "car_location_history" (
	"time" timestamp with time zone NOT NULL,
	"car_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	CONSTRAINT "car_location_history_time_car_id_pk" PRIMARY KEY("time","car_id")
);
--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_location_history_car_id_cars_id_fk'
  ) THEN
    ALTER TABLE "car_location_history"
      ADD CONSTRAINT "car_location_history_car_id_cars_id_fk"
      FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_location_history_company_id_companies_id_fk'
  ) THEN
    ALTER TABLE "car_location_history"
      ADD CONSTRAINT "car_location_history_company_id_companies_id_fk"
      FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END
$migration$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_location_history_company_id_time_idx" ON "car_location_history" USING btree ("company_id","time" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_location_history_car_id_time_idx" ON "car_location_history" USING btree ("car_id","time" DESC);--> statement-breakpoint
DO $migration$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
    PERFORM create_hypertable(
      'car_location_history',
      'time',
      if_not_exists => TRUE
    );
  ELSIF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'timescaledb') THEN
    CREATE EXTENSION IF NOT EXISTS timescaledb;
    PERFORM create_hypertable(
      'car_location_history',
      'time',
      if_not_exists => TRUE
    );
  ELSE
    RAISE NOTICE 'TimescaleDB is not installed; car_location_history will remain a regular PostgreSQL table until the Timescale-enabled Postgres image is used.';
  END IF;
END
$migration$;--> statement-breakpoint
ALTER TABLE "car_location_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "car_location_history" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'car_location_history_select_tenant_isolation'
  ) THEN
    CREATE POLICY "car_location_history_select_tenant_isolation" ON "car_location_history" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'car_location_history_insert_tenant_isolation'
  ) THEN
    CREATE POLICY "car_location_history_insert_tenant_isolation" ON "car_location_history" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'car_location_history_delete_tenant_isolation'
  ) THEN
    CREATE POLICY "car_location_history_delete_tenant_isolation" ON "car_location_history" AS PERMISSIVE FOR DELETE TO public USING (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);
  END IF;
END
$migration$;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "car_location_history" TO fuel_carrier_app;
