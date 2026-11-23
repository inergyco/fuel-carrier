CREATE TABLE "car_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"petrol_price_per_liter" double precision,
	"fee_threshold_x" double precision,
	"fee_threshold_y" double precision,
	"fee_threshold_z" double precision,
	"fee_up_to_x" double precision,
	"fee_x_to_y" double precision,
	"fee_y_to_z" double precision,
	"fee_above_z" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "car_pricing_car_id_unique" UNIQUE("car_id")
);
--> statement-breakpoint
ALTER TABLE "car_pricing" ADD CONSTRAINT "car_pricing_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "car_pricing" ADD CONSTRAINT "car_pricing_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "car_pricing_company_id_idx" ON "car_pricing" USING btree ("company_id");
--> statement-breakpoint
INSERT INTO "car_pricing" (
	"car_id",
	"company_id",
	"petrol_price_per_liter",
	"fee_threshold_x",
	"fee_threshold_y",
	"fee_threshold_z",
	"fee_up_to_x",
	"fee_x_to_y",
	"fee_y_to_z",
	"fee_above_z"
)
SELECT
	car."id",
	car."company_id",
	company."petrol_price_per_liter",
	company."fee_threshold_x",
	company."fee_threshold_y",
	company."fee_threshold_z",
	company."fee_up_to_x",
	company."fee_x_to_y",
	company."fee_y_to_z",
	company."fee_above_z"
FROM "cars" AS car
INNER JOIN "companies" AS company ON company."id" = car."company_id"
WHERE company."petrol_price_per_liter" IS NOT NULL
	OR company."fee_threshold_x" IS NOT NULL
	OR company."fee_threshold_y" IS NOT NULL
	OR company."fee_threshold_z" IS NOT NULL
	OR company."fee_up_to_x" IS NOT NULL
	OR company."fee_x_to_y" IS NOT NULL
	OR company."fee_y_to_z" IS NOT NULL
	OR company."fee_above_z" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "petrol_price_per_liter";
--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "fee_threshold_x";
--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "fee_threshold_y";
--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "fee_threshold_z";
--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "fee_up_to_x";
--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "fee_x_to_y";
--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "fee_y_to_z";
--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "fee_above_z";
--> statement-breakpoint
ALTER TABLE "car_pricing" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "car_pricing" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "car_pricing_select_tenant_isolation" ON "car_pricing" AS PERMISSIVE FOR SELECT TO public USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_pricing_insert_tenant_isolation" ON "car_pricing" AS PERMISSIVE FOR INSERT TO public WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_pricing_update_tenant_isolation" ON "car_pricing" AS PERMISSIVE FOR UPDATE TO public USING (app_tenant_allows_company(company_id)) WITH CHECK (app_tenant_allows_company(company_id));
--> statement-breakpoint
CREATE POLICY "car_pricing_delete_tenant_isolation" ON "car_pricing" AS PERMISSIVE FOR DELETE TO public USING (app_tenant_allows_company(company_id));
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "car_pricing" TO fuel_carrier_app;
