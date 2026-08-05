-- Rename location history → telemetry history (Timescale hypertable-safe).
DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'car_location_history'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'car_telemetry_history'
  ) THEN
    ALTER TABLE "car_location_history" RENAME TO "car_telemetry_history";
  END IF;
END
$migration$;
--> statement-breakpoint

DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_location_history_time_car_id_pk'
  ) THEN
    ALTER TABLE "car_telemetry_history"
      RENAME CONSTRAINT "car_location_history_time_car_id_pk"
      TO "car_telemetry_history_time_car_id_pk";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_location_history_car_id_cars_id_fk'
  ) THEN
    ALTER TABLE "car_telemetry_history"
      RENAME CONSTRAINT "car_location_history_car_id_cars_id_fk"
      TO "car_telemetry_history_car_id_cars_id_fk";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_location_history_company_id_companies_id_fk'
  ) THEN
    ALTER TABLE "car_telemetry_history"
      RENAME CONSTRAINT "car_location_history_company_id_companies_id_fk"
      TO "car_telemetry_history_company_id_companies_id_fk";
  END IF;
END
$migration$;
--> statement-breakpoint

DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'car_location_history_company_id_time_idx'
  ) THEN
    ALTER INDEX "car_location_history_company_id_time_idx"
      RENAME TO "car_telemetry_history_company_id_time_idx";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'car_location_history_car_id_time_idx'
  ) THEN
    ALTER INDEX "car_location_history_car_id_time_idx"
      RENAME TO "car_telemetry_history_car_id_time_idx";
  END IF;
END
$migration$;
--> statement-breakpoint

DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'car_telemetry_history'
      AND policyname = 'car_location_history_select_tenant_isolation'
  ) THEN
    ALTER POLICY "car_location_history_select_tenant_isolation"
      ON "car_telemetry_history"
      RENAME TO "car_telemetry_history_select_tenant_isolation";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'car_telemetry_history'
      AND policyname = 'car_location_history_insert_tenant_isolation'
  ) THEN
    ALTER POLICY "car_location_history_insert_tenant_isolation"
      ON "car_telemetry_history"
      RENAME TO "car_telemetry_history_insert_tenant_isolation";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'car_telemetry_history'
      AND policyname = 'car_location_history_delete_tenant_isolation'
  ) THEN
    ALTER POLICY "car_location_history_delete_tenant_isolation"
      ON "car_telemetry_history"
      RENAME TO "car_telemetry_history_delete_tenant_isolation";
  END IF;
END
$migration$;
--> statement-breakpoint

ALTER TABLE "car_telemetry_history"
  ADD COLUMN IF NOT EXISTS "speed" double precision,
  ADD COLUMN IF NOT EXISTS "remain_fuel" double precision,
  ADD COLUMN IF NOT EXISTS "fuel_amount" double precision,
  ADD COLUMN IF NOT EXISTS "resistance_tank_to_ground" double precision,
  ADD COLUMN IF NOT EXISTS "resistance_tank_to_nozzle" double precision,
  ADD COLUMN IF NOT EXISTS "resistance_ground_to_vehicle" double precision;
