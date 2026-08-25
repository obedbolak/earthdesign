ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'GUEST_HOUSE';

ALTER TABLE "Batiment"
  ADD COLUMN "dailyRentPrice" DECIMAL(15,2),
  ADD COLUMN "weeklyRentPrice" DECIMAL(15,2);

CREATE INDEX "Batiment_dailyRentPrice_idx" ON "Batiment"("dailyRentPrice");
CREATE INDEX "Batiment_weeklyRentPrice_idx" ON "Batiment"("weeklyRentPrice");
