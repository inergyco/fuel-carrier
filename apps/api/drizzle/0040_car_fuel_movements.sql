CREATE TABLE "car_fuel_transaction_cursors" (
	"car_id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid NOT NULL,
	"last_transaction_id" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "car_fuel_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"mode" "car_telemetry_mode" NOT NULL,
	"liters" double precision,
	"transaction_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "car_fuel_transaction_cursors" ADD CONSTRAINT "car_fuel_transaction_cursors_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "car_fuel_transaction_cursors" ADD CONSTRAINT "car_fuel_transaction_cursors_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "car_fuel_movements" ADD CONSTRAINT "car_fuel_movements_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "car_fuel_movements" ADD CONSTRAINT "car_fuel_movements_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "car_fuel_movements_car_id_recorded_at_idx" ON "car_fuel_movements" USING btree ("car_id","recorded_at");
--> statement-breakpoint
CREATE INDEX "car_fuel_movements_company_id_recorded_at_idx" ON "car_fuel_movements" USING btree ("company_id","recorded_at");
--> statement-breakpoint
ALTER TABLE "car_fuel_transaction_cursors" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "car_fuel_transaction_cursors" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "car_fuel_movements" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "car_fuel_movements" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "car_fuel_transaction_cursors_select_tenant_isolation" ON "car_fuel_transaction_cursors" AS PERMISSIVE FOR SELECT TO public USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_fuel_transaction_cursors_insert_tenant_isolation" ON "car_fuel_transaction_cursors" AS PERMISSIVE FOR INSERT TO public WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_fuel_transaction_cursors_update_tenant_isolation" ON "car_fuel_transaction_cursors" AS PERMISSIVE FOR UPDATE TO public USING (app_tenant_allows_company(company_id)) WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_fuel_transaction_cursors_delete_tenant_isolation" ON "car_fuel_transaction_cursors" AS PERMISSIVE FOR DELETE TO public USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_fuel_movements_select_tenant_isolation" ON "car_fuel_movements" AS PERMISSIVE FOR SELECT TO public USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_fuel_movements_insert_tenant_isolation" ON "car_fuel_movements" AS PERMISSIVE FOR INSERT TO public WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_fuel_movements_update_tenant_isolation" ON "car_fuel_movements" AS PERMISSIVE FOR UPDATE TO public USING (app_tenant_allows_company(company_id)) WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_fuel_movements_delete_tenant_isolation" ON "car_fuel_movements" AS PERMISSIVE FOR DELETE TO public USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "car_fuel_transaction_cursors" TO fuel_carrier_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "car_fuel_movements" TO fuel_carrier_app;
