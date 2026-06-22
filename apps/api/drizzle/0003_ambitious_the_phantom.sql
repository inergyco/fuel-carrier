ALTER TABLE "company_users" ADD COLUMN "national_id" varchar(32);--> statement-breakpoint
ALTER TABLE "company_users" ADD COLUMN "email" varchar(254);--> statement-breakpoint
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_national_id_unique" UNIQUE("national_id");