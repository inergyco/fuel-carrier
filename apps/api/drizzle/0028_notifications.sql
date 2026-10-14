CREATE TABLE "notification_companies" (
	"notification_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	CONSTRAINT "notification_companies_notification_id_company_id_pk" PRIMARY KEY("notification_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"company_user_id" uuid NOT NULL,
	"channel" varchar(16) NOT NULL,
	"title" varchar(120) NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_deliveries_channel_check" CHECK ("notification_deliveries"."channel" IN ('browser')),
	CONSTRAINT "notification_deliveries_title_length" CHECK (char_length("notification_deliveries"."title") BETWEEN 1 AND 120),
	CONSTRAINT "notification_deliveries_body_length" CHECK (char_length("notification_deliveries"."body") BETWEEN 1 AND 2000)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" varchar(16) NOT NULL,
	"title" varchar(120) NOT NULL,
	"body" text NOT NULL,
	"levels" text[] NOT NULL,
	"recipient_count" integer NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_channel_check" CHECK ("notifications"."channel" IN ('browser')),
	CONSTRAINT "notifications_title_length" CHECK (char_length("notifications"."title") BETWEEN 1 AND 120),
	CONSTRAINT "notifications_body_length" CHECK (char_length("notifications"."body") BETWEEN 1 AND 2000),
	CONSTRAINT "notifications_levels_check" CHECK ("notifications"."levels" <@ ARRAY['admin', 'viewer']::text[] AND cardinality("notifications"."levels") > 0)
);
--> statement-breakpoint
ALTER TABLE "notification_companies" ADD CONSTRAINT "notification_companies_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_companies" ADD CONSTRAINT "notification_companies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_company_user_id_company_users_id_fk" FOREIGN KEY ("company_user_id") REFERENCES "public"."company_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_deliveries_recipient_created_at_idx" ON "notification_deliveries" USING btree ("company_user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "notifications_select_internal" ON "notifications" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
CREATE POLICY "notifications_insert_internal" ON "notifications" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
ALTER TABLE "notification_companies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_companies" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "notification_companies_select_internal" ON "notification_companies" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
CREATE POLICY "notification_companies_insert_internal" ON "notification_companies" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
ALTER TABLE "notification_deliveries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_deliveries" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "notification_deliveries_select_tenant" ON "notification_deliveries" AS PERMISSIVE FOR SELECT TO public USING (app_tenant_allows_company(company_id));--> statement-breakpoint
CREATE POLICY "notification_deliveries_insert_internal" ON "notification_deliveries" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
CREATE POLICY "notification_deliveries_update_tenant" ON "notification_deliveries" AS PERMISSIVE FOR UPDATE TO public USING (app_tenant_allows_company(company_id)) WITH CHECK (app_tenant_allows_company(company_id));