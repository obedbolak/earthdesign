ALTER TABLE "Lotissement"
ADD COLUMN "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION;

ALTER TABLE "Parcelle"
ADD COLUMN "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION;

ALTER TABLE "Batiment"
ADD COLUMN "nightlyPrice" DECIMAL(15, 2),
ADD COLUMN "weeklyPrice" DECIMAL(15, 2),
ADD COLUMN "maxGuests" INTEGER,
ADD COLUMN "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION;

CREATE INDEX "Lotissement_latitude_longitude_idx" ON "Lotissement"("latitude", "longitude");
CREATE INDEX "Parcelle_latitude_longitude_idx" ON "Parcelle"("latitude", "longitude");
CREATE INDEX "Batiment_nightlyPrice_idx" ON "Batiment"("nightlyPrice");
CREATE INDEX "Batiment_weeklyPrice_idx" ON "Batiment"("weeklyPrice");
CREATE INDEX "Batiment_latitude_longitude_idx" ON "Batiment"("latitude", "longitude");