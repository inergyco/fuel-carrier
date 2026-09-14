-- Fix any end-before-start rows before enforcing temporal sanity.
UPDATE "car_driver_assignments"
SET "unassigned_at" = "assigned_at"
WHERE "unassigned_at" IS NOT NULL
  AND "unassigned_at" < "assigned_at";
--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'car_driver_assignments_interval_chk'
  ) THEN
    ALTER TABLE "car_driver_assignments"
      ADD CONSTRAINT "car_driver_assignments_interval_chk"
      CHECK (
        "unassigned_at" IS NULL
        OR "unassigned_at" >= "assigned_at"
      );
  END IF;
END
$migration$;
