CREATE TYPE "public"."entity_status" AS ENUM('active', 'inactive');--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "status" "entity_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "status" "entity_status" DEFAULT 'active' NOT NULL;
