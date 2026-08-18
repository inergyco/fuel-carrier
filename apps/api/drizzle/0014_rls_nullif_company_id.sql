-- RLS was casting current_setting('app.current_company_id') straight to uuid.
-- After SET LOCAL ends on a pooled connection that GUC often becomes '' rather
-- than NULL, so the next internal request blows up with:
--   invalid input syntax for type uuid: ""
CREATE OR REPLACE FUNCTION app_tenant_allows_company(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT
    current_setting('app.is_internal', true) = 'true'
    OR target_company_id = NULLIF(current_setting('app.current_company_id', true), '')::uuid;
$$;
--> statement-breakpoint

ALTER POLICY "drivers_select_tenant_isolation" ON "drivers"
  USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
ALTER POLICY "drivers_insert_tenant_isolation" ON "drivers"
  WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
ALTER POLICY "drivers_update_tenant_isolation" ON "drivers"
  USING (app_tenant_allows_company(company_id))
  WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
ALTER POLICY "drivers_delete_tenant_isolation" ON "drivers"
  USING (app_tenant_allows_company(company_id));
--> statement-breakpoint

ALTER POLICY "cars_select_tenant_isolation" ON "cars"
  USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
ALTER POLICY "cars_insert_tenant_isolation" ON "cars"
  WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
ALTER POLICY "cars_update_tenant_isolation" ON "cars"
  USING (app_tenant_allows_company(company_id))
  WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
ALTER POLICY "cars_delete_tenant_isolation" ON "cars"
  USING (app_tenant_allows_company(company_id));
--> statement-breakpoint

ALTER POLICY "audit_logs_select_tenant_isolation" ON "audit_logs"
  USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
ALTER POLICY "audit_logs_insert_tenant_isolation" ON "audit_logs"
  WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint

ALTER POLICY "car_telemetry_history_select_tenant_isolation" ON "car_telemetry_history"
  USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
ALTER POLICY "car_telemetry_history_insert_tenant_isolation" ON "car_telemetry_history"
  WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
ALTER POLICY "car_telemetry_history_delete_tenant_isolation" ON "car_telemetry_history"
  USING (app_tenant_allows_company(company_id));
