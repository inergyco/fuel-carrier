ALTER TABLE "notifications" ADD COLUMN "car_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "license_plate" varchar(32);--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_car_id_idx" ON "notifications" USING btree ("car_id");--> statement-breakpoint
CREATE TABLE "car_condition_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"notification_id" uuid NOT NULL,
	"kind" varchar(32) NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "car_condition_alerts_kind_check" CHECK ("kind" IN ('high_resistance', 'low_fuel', 'stale_telemetry'))
);
--> statement-breakpoint
ALTER TABLE "car_condition_alerts" ADD CONSTRAINT "car_condition_alerts_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_condition_alerts" ADD CONSTRAINT "car_condition_alerts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_condition_alerts" ADD CONSTRAINT "car_condition_alerts_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "car_condition_alerts_car_kind_uidx" ON "car_condition_alerts" USING btree ("car_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "car_condition_alerts_notification_id_uidx" ON "car_condition_alerts" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "car_condition_alerts_company_id_idx" ON "car_condition_alerts" USING btree ("company_id");--> statement-breakpoint
ALTER TABLE "car_condition_alerts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "car_condition_alerts" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "car_condition_alerts_select_internal" ON "car_condition_alerts" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
CREATE POLICY "car_condition_alerts_insert_internal" ON "car_condition_alerts" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
CREATE POLICY "car_condition_alerts_delete_internal" ON "car_condition_alerts" AS PERMISSIVE FOR DELETE TO public USING (current_setting('app.is_internal', true) = 'true');
