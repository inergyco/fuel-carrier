DROP INDEX "car_fuel_movements_car_id_recorded_at_idx";
--> statement-breakpoint
DROP INDEX "car_fuel_movements_company_id_recorded_at_idx";
--> statement-breakpoint
CREATE INDEX "car_fuel_movements_car_recorded_at_idx" ON "car_fuel_movements" USING btree ("car_id", "recorded_at" DESC, "id" DESC);
--> statement-breakpoint
CREATE INDEX "car_fuel_movements_company_id_idx" ON "car_fuel_movements" USING btree ("company_id");
