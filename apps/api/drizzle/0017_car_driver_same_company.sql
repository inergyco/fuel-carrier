-- Clear any cross-tenant assignments before enforcing same-company custody.
UPDATE "car_driver_assignments" AS a
SET "unassigned_at" = now()
FROM "cars" AS c
INNER JOIN "drivers" AS d ON d."id" = c."driver_id"
WHERE a."car_id" = c."id"
  AND a."unassigned_at" IS NULL
  AND c."company_id" <> d."company_id";
--> statement-breakpoint
UPDATE "cars" AS c
SET "driver_id" = NULL
FROM "drivers" AS d
WHERE c."driver_id" = d."id"
  AND c."company_id" <> d."company_id";
--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'drivers_id_company_id_unique'
  ) THEN
    ALTER TABLE "drivers"
      ADD CONSTRAINT "drivers_id_company_id_unique" UNIQUE ("id", "company_id");
  END IF;
END
$migration$;
--> statement-breakpoint
DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cars_driver_id_drivers_id_fk'
  ) THEN
    ALTER TABLE "cars" DROP CONSTRAINT "cars_driver_id_drivers_id_fk";
  END IF;
END
$migration$;
--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cars_driver_id_company_id_drivers_id_company_id_fk'
  ) THEN
    ALTER TABLE "cars"
      ADD CONSTRAINT "cars_driver_id_company_id_drivers_id_company_id_fk"
      FOREIGN KEY ("driver_id", "company_id")
      REFERENCES "public"."drivers" ("id", "company_id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION;
  END IF;
END
$migration$;
