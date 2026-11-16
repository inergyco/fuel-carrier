UPDATE "cars" SET "tank_count" = 3 WHERE "tank_count" NOT IN (1, 3);
ALTER TABLE "cars" DROP CONSTRAINT "cars_tank_count_check";
ALTER TABLE "cars" ADD CONSTRAINT "cars_tank_count_check" CHECK ("tank_count" IN (1, 3));
