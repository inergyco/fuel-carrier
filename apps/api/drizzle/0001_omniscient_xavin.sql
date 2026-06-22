CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"national_id" varchar(32) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"address" varchar(500),
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_national_id_unique" UNIQUE("national_id")
);
