-- Seed open custody intervals for cars that already have a driver assigned.
INSERT INTO "car_driver_assignments" ("car_id", "driver_id", "company_id", "assigned_at")
SELECT
  "id",
  "driver_id",
  "company_id",
  COALESCE("updated_at", "created_at")
FROM "cars"
WHERE "driver_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "car_driver_assignments"
    WHERE "car_driver_assignments"."car_id" = "cars"."id"
      AND "car_driver_assignments"."unassigned_at" IS NULL
  );
