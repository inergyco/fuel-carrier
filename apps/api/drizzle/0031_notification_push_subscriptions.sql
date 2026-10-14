CREATE TABLE "notification_push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"company_user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_push_subscriptions" ADD CONSTRAINT "notification_push_subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_push_subscriptions" ADD CONSTRAINT "notification_push_subscriptions_company_user_id_company_users_id_fk" FOREIGN KEY ("company_user_id") REFERENCES "public"."company_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "notification_push_subscriptions_endpoint_uidx" ON "notification_push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "notification_push_subscriptions_company_user_id_idx" ON "notification_push_subscriptions" USING btree ("company_user_id");--> statement-breakpoint
ALTER TABLE "notification_push_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_push_subscriptions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "notification_push_subscriptions_select_internal" ON "notification_push_subscriptions" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
CREATE POLICY "notification_push_subscriptions_insert_internal" ON "notification_push_subscriptions" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
CREATE POLICY "notification_push_subscriptions_update_internal" ON "notification_push_subscriptions" AS PERMISSIVE FOR UPDATE TO public USING (current_setting('app.is_internal', true) = 'true') WITH CHECK (current_setting('app.is_internal', true) = 'true');--> statement-breakpoint
CREATE POLICY "notification_push_subscriptions_delete_internal" ON "notification_push_subscriptions" AS PERMISSIVE FOR DELETE TO public USING (current_setting('app.is_internal', true) = 'true');