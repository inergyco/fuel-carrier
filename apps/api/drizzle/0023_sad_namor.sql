ALTER TABLE "drivers" ADD COLUMN "mobile_number" varchar(20);
--> statement-breakpoint
UPDATE "drivers" SET "mobile_number" = '' WHERE "mobile_number" IS NULL;
--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "mobile_number" SET NOT NULL;
