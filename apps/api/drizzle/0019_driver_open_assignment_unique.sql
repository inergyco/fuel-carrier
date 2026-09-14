-- Close duplicate open custody rows per driver before enforcing uniqueness.
-- Prefer the open row that matches cars.driver_id; otherwise keep the newest.
WITH ranked AS (
  SELECT
    a."id",
    ROW_NUMBER() OVER (
      PARTITION BY a."driver_id"
      ORDER BY
        CASE
          WHEN c."id" IS NOT NULL THEN 0
          ELSE 1
        END,
        a."assigned_at" DESC,
        a."id" DESC
    ) AS rn
  FROM "car_driver_assignments" AS a
  LEFT JOIN "cars" AS c
    ON c."id" = a."car_id"
   AND c."driver_id" = a."driver_id"
  WHERE a."unassigned_at" IS NULL
    AND a."driver_id" IS NOT NULL
)
UPDATE "car_driver_assignments" AS a
SET "unassigned_at" = now()
FROM ranked AS r
WHERE a."id" = r."id"
  AND r.rn > 1;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "car_driver_assignments_driver_id_open_unique"
  ON "car_driver_assignments" USING btree ("driver_id")
  WHERE "unassigned_at" IS NULL AND "driver_id" IS NOT NULL;
