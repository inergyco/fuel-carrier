ALTER TABLE "notification_deliveries" DROP CONSTRAINT "notification_deliveries_channel_check";--> statement-breakpoint
ALTER TABLE "notification_deliveries" DROP CONSTRAINT "notification_deliveries_title_length";--> statement-breakpoint
ALTER TABLE "notification_deliveries" DROP CONSTRAINT "notification_deliveries_body_length";--> statement-breakpoint
ALTER TABLE "notification_companies" DROP CONSTRAINT "notification_companies_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "notification_deliveries" DROP CONSTRAINT "notification_deliveries_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "notification_deliveries" DROP CONSTRAINT "notification_deliveries_company_user_id_company_users_id_fk";
--> statement-breakpoint
DROP INDEX "notification_deliveries_recipient_created_at_idx";--> statement-breakpoint
ALTER TABLE "notification_companies" ADD CONSTRAINT "notification_companies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_company_user_id_company_users_id_fk" FOREIGN KEY ("company_user_id") REFERENCES "public"."company_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_deliveries_company_user_id_idx" ON "notification_deliveries" USING btree ("company_user_id");--> statement-breakpoint
CREATE INDEX "notification_deliveries_notification_id_idx" ON "notification_deliveries" USING btree ("notification_id");--> statement-breakpoint
ALTER TABLE "notification_deliveries" DROP COLUMN "channel";--> statement-breakpoint
ALTER TABLE "notification_deliveries" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "notification_deliveries" DROP COLUMN "body";--> statement-breakpoint
ALTER TABLE "notification_deliveries" DROP COLUMN "created_at";--> statement-breakpoint
CREATE POLICY "notifications_select_via_delivery" ON "notifications" AS PERMISSIVE FOR SELECT TO public USING (
  EXISTS (
    SELECT 1
    FROM "notification_deliveries"
    WHERE "notification_deliveries"."notification_id" = "notifications"."id"
      AND app_tenant_allows_company("notification_deliveries"."company_id")
  )
);