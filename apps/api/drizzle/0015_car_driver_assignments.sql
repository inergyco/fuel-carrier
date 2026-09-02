CREATE TABLE IF NOT EXISTS "car_driver_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"driver_id" uuid,
	"company_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unassigned_at" timestamp with time zone,
	"assigned_by_user_id" uuid
);
--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_driver_assignments_car_id_cars_id_fk'
  ) THEN
    ALTER TABLE "car_driver_assignments"
      ADD CONSTRAINT "car_driver_assignments_car_id_cars_id_fk"
      FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_driver_assignments_driver_id_drivers_id_fk'
  ) THEN
    ALTER TABLE "car_driver_assignments"
      ADD CONSTRAINT "car_driver_assignments_driver_id_drivers_id_fk"
      FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_driver_assignments_company_id_companies_id_fk'
  ) THEN
    ALTER TABLE "car_driver_assignments"
      ADD CONSTRAINT "car_driver_assignments_company_id_companies_id_fk"
      FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'car_driver_assignments_assigned_by_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "car_driver_assignments"
      ADD CONSTRAINT "car_driver_assignments_assigned_by_user_id_users_id_fk"
      FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END
$migration$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_driver_assignments_car_id_assigned_at_idx" ON "car_driver_assignments" USING btree ("car_id","assigned_at" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_driver_assignments_driver_id_assigned_at_idx" ON "car_driver_assignments" USING btree ("driver_id","assigned_at" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "car_driver_assignments_company_id_assigned_at_idx" ON "car_driver_assignments" USING btree ("company_id","assigned_at" DESC);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "car_driver_assignments_car_id_open_unique" ON "car_driver_assignments" USING btree ("car_id") WHERE "unassigned_at" IS NULL;--> statement-breakpoint
ALTER TABLE "car_driver_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "car_driver_assignments" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'car_driver_assignments_select_tenant_isolation'
  ) THEN
    CREATE POLICY "car_driver_assignments_select_tenant_isolation" ON "car_driver_assignments" AS PERMISSIVE FOR SELECT TO public USING (app_tenant_allows_company(company_id));
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'car_driver_assignments_insert_tenant_isolation'
  ) THEN
    CREATE POLICY "car_driver_assignments_insert_tenant_isolation" ON "car_driver_assignments" AS PERMISSIVE FOR INSERT TO public WITH CHECK (app_tenant_allows_company(company_id));
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'car_driver_assignments_update_tenant_isolation'
  ) THEN
    CREATE POLICY "car_driver_assignments_update_tenant_isolation" ON "car_driver_assignments" AS PERMISSIVE FOR UPDATE TO public USING (app_tenant_allows_company(company_id)) WITH CHECK (app_tenant_allows_company(company_id));
  END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'car_driver_assignments_delete_tenant_isolation'
  ) THEN
    CREATE POLICY "car_driver_assignments_delete_tenant_isolation" ON "car_driver_assignments" AS PERMISSIVE FOR DELETE TO public USING (app_tenant_allows_company(company_id));
  END IF;
END
$migration$;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "car_driver_assignments" TO fuel_carrier_app;
