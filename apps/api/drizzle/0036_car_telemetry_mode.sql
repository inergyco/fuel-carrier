DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'car_telemetry_mode') THEN
    CREATE TYPE "public"."car_telemetry_mode" AS ENUM ('idle', 'loading', 'dispensing');
  END IF;
END
$migration$;
--> statement-breakpoint
ALTER TABLE "car_telemetry_history"
  ADD COLUMN IF NOT EXISTS "mode" "car_telemetry_mode" DEFAULT 'idle' NOT NULL;
