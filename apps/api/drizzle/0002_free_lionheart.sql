CREATE TABLE "company_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"username" varchar(32) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "company_users_username_unique" UNIQUE("username"),
	CONSTRAINT "company_users_username_length" CHECK (char_length("company_users"."username") >= 3),
	CONSTRAINT "company_users_username_format" CHECK ("company_users"."username" ~ '^[a-zA-Z0-9_-]+$')
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"national_id" varchar(32) NOT NULL,
	"company_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_national_id_unique" UNIQUE("national_id")
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200),
	"license_plate" varchar(32) NOT NULL,
	"company_id" uuid NOT NULL,
	"driver_id" uuid,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cars_license_plate_unique" UNIQUE("license_plate"),
	CONSTRAINT "cars_driver_id_unique" UNIQUE("driver_id")
);
--> statement-breakpoint
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "drivers_company_id_idx" ON "drivers" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "cars_company_id_idx" ON "cars" USING btree ("company_id");--> statement-breakpoint
-- Row Level Security: tenant isolation is enforced in PostgreSQL, not in application WHERE clauses.
ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "drivers" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cars" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cars" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "drivers_select_tenant_isolation" ON "drivers" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "drivers_insert_tenant_isolation" ON "drivers" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "drivers_update_tenant_isolation" ON "drivers" AS PERMISSIVE FOR UPDATE TO public USING (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid) WITH CHECK (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "drivers_delete_tenant_isolation" ON "drivers" AS PERMISSIVE FOR DELETE TO public USING (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "cars_select_tenant_isolation" ON "cars" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "cars_insert_tenant_isolation" ON "cars" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "cars_update_tenant_isolation" ON "cars" AS PERMISSIVE FOR UPDATE TO public USING (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid) WITH CHECK (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "cars_delete_tenant_isolation" ON "cars" AS PERMISSIVE FOR DELETE TO public USING (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);