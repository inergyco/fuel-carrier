-- Soft-delete: replace entity_status with deleted_at; partial uniques for live rows.
ALTER TABLE "companies" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "company_users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
-- Preserve when inactive rows were last touched as the soft-delete timestamp.
UPDATE "cars"
SET "deleted_at" = "updated_at"
WHERE "status" = 'inactive'
  AND "deleted_at" IS NULL;--> statement-breakpoint
UPDATE "drivers"
SET "deleted_at" = "updated_at"
WHERE "status" = 'inactive'
  AND "deleted_at" IS NULL;--> statement-breakpoint
ALTER TABLE "cars" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "drivers" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."entity_status";--> statement-breakpoint
ALTER TABLE "companies" DROP CONSTRAINT IF EXISTS "companies_national_id_unique";--> statement-breakpoint
ALTER TABLE "company_users" DROP CONSTRAINT IF EXISTS "company_users_username_unique";--> statement-breakpoint
ALTER TABLE "company_users" DROP CONSTRAINT IF EXISTS "company_users_national_id_unique";--> statement-breakpoint
ALTER TABLE "drivers" DROP CONSTRAINT IF EXISTS "drivers_national_id_unique";--> statement-breakpoint
ALTER TABLE "cars" DROP CONSTRAINT IF EXISTS "cars_license_plate_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "companies_national_id_unique" ON "companies" USING btree ("national_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "company_users_username_unique" ON "company_users" USING btree ("username") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "company_users_national_id_unique" ON "company_users" USING btree ("national_id") WHERE "deleted_at" IS NULL AND "national_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_national_id_unique" ON "drivers" USING btree ("national_id") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "cars_license_plate_unique" ON "cars" USING btree ("license_plate") WHERE "deleted_at" IS NULL;
