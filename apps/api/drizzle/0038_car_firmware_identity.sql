ALTER TABLE "cars" ADD COLUMN "firmware_company_id" varchar(64);
ALTER TABLE "cars" ADD COLUMN "firmware_device_id" varchar(64);
CREATE UNIQUE INDEX "cars_firmware_identity_unique" ON "cars" ("firmware_company_id","firmware_device_id") WHERE "deleted_at" IS NULL AND "firmware_company_id" IS NOT NULL AND "firmware_device_id" IS NOT NULL;
