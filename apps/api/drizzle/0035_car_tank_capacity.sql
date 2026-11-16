ALTER TABLE "cars" ADD COLUMN "tank_count" integer DEFAULT 3 NOT NULL;
ALTER TABLE "cars" ADD COLUMN "tank_capacity_liters" integer DEFAULT 415 NOT NULL;
ALTER TABLE "cars" ADD CONSTRAINT "cars_tank_count_check" CHECK ("tank_count" BETWEEN 1 AND 3);
ALTER TABLE "cars" ADD CONSTRAINT "cars_tank_capacity_liters_check" CHECK ("tank_capacity_liters" BETWEEN 1 AND 10000);
