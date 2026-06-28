CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"actor_user_id" uuid,
	"actor_role" varchar(32) NOT NULL,
	"actor_username" varchar(32) NOT NULL,
	"actor_display_name" varchar(201) NOT NULL,
	"action" varchar(64) NOT NULL,
	"entity_type" varchar(32),
	"entity_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_company_id_created_at_idx" ON "audit_logs" USING btree ("company_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "audit_logs_select_tenant_isolation" ON "audit_logs" AS PERMISSIVE FOR SELECT TO public USING (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "audit_logs_insert_tenant_isolation" ON "audit_logs" AS PERMISSIVE FOR INSERT TO public WITH CHECK (current_setting('app.is_internal', true) = 'true' OR company_id = current_setting('app.current_company_id', true)::uuid);
