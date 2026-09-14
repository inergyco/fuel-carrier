-- Non-overlapping custody intervals (half-open ranges).
-- Abutting end==start is allowed; true overlaps are not.
DO $migration$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'btree_gist') THEN
    CREATE EXTENSION IF NOT EXISTS btree_gist;
  ELSE
    RAISE EXCEPTION
      'btree_gist extension is required for custody overlap constraints';
  END IF;
END
$migration$;
--> statement-breakpoint
-- Truncate earlier intervals that extend into a later one (same car).
WITH ordered AS (
  SELECT
    a."id",
    LEAD(a."assigned_at") OVER (
      PARTITION BY a."car_id"
      ORDER BY a."assigned_at", a."id"
    ) AS next_assigned_at
  FROM "car_driver_assignments" AS a
  WHERE a."car_id" IS NOT NULL
)
UPDATE "car_driver_assignments" AS a
SET "unassigned_at" = o.next_assigned_at
FROM ordered AS o
WHERE a."id" = o."id"
  AND o.next_assigned_at IS NOT NULL
  AND COALESCE(a."unassigned_at", 'infinity'::timestamptz) > o.next_assigned_at;
--> statement-breakpoint
-- Truncate earlier intervals that extend into a later one (same driver).
WITH ordered AS (
  SELECT
    a."id",
    LEAD(a."assigned_at") OVER (
      PARTITION BY a."driver_id"
      ORDER BY a."assigned_at", a."id"
    ) AS next_assigned_at
  FROM "car_driver_assignments" AS a
  WHERE a."driver_id" IS NOT NULL
)
UPDATE "car_driver_assignments" AS a
SET "unassigned_at" = o.next_assigned_at
FROM ordered AS o
WHERE a."id" = o."id"
  AND o.next_assigned_at IS NOT NULL
  AND COALESCE(a."unassigned_at", 'infinity'::timestamptz) > o.next_assigned_at;
--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'car_driver_assignments_car_no_overlap'
  ) THEN
    ALTER TABLE "car_driver_assignments"
      ADD CONSTRAINT "car_driver_assignments_car_no_overlap"
      EXCLUDE USING gist (
        "car_id" WITH =,
        tstzrange(
          "assigned_at",
          COALESCE("unassigned_at", 'infinity'::timestamptz),
          '[)'
        ) WITH &&
      )
      WHERE ("car_id" IS NOT NULL);
  END IF;
END
$migration$;
--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'car_driver_assignments_driver_no_overlap'
  ) THEN
    ALTER TABLE "car_driver_assignments"
      ADD CONSTRAINT "car_driver_assignments_driver_no_overlap"
      EXCLUDE USING gist (
        "driver_id" WITH =,
        tstzrange(
          "assigned_at",
          COALESCE("unassigned_at", 'infinity'::timestamptz),
          '[)'
        ) WITH &&
      )
      WHERE ("driver_id" IS NOT NULL);
  END IF;
END
$migration$;
