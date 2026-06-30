ALTER TABLE "company_users" ADD COLUMN "level" varchar(16) DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_level_check" CHECK ("level" IN ('admin', 'viewer'));
