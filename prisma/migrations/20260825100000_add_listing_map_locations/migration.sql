-- A map pin complements WKT boundaries. Both coordinates use WGS84 degrees.
CREATE TYPE "LocationSource" AS ENUM ('MANUAL_PIN', 'GEOMETRY_CENTROID', 'GEOCODED');

ALTER TABLE "Lotissement"
  ADD COLUMN "mapLatitude" DOUBLE PRECISION,
  ADD COLUMN "mapLongitude" DOUBLE PRECISION,
  ADD COLUMN "locationSource" "LocationSource";

ALTER TABLE "Parcelle"
  ADD COLUMN "mapLatitude" DOUBLE PRECISION,
  ADD COLUMN "mapLongitude" DOUBLE PRECISION,
  ADD COLUMN "locationSource" "LocationSource";

ALTER TABLE "Batiment"
  ADD COLUMN "mapLatitude" DOUBLE PRECISION,
  ADD COLUMN "mapLongitude" DOUBLE PRECISION,
  ADD COLUMN "locationSource" "LocationSource";

ALTER TABLE "Lotissement"
  ADD CONSTRAINT "Lotissement_map_coordinates_complete"
    CHECK (("mapLatitude" IS NULL) = ("mapLongitude" IS NULL)),
  ADD CONSTRAINT "Lotissement_map_latitude_range"
    CHECK ("mapLatitude" IS NULL OR "mapLatitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "Lotissement_map_longitude_range"
    CHECK ("mapLongitude" IS NULL OR "mapLongitude" BETWEEN -180 AND 180);

ALTER TABLE "Parcelle"
  ADD CONSTRAINT "Parcelle_map_coordinates_complete"
    CHECK (("mapLatitude" IS NULL) = ("mapLongitude" IS NULL)),
  ADD CONSTRAINT "Parcelle_map_latitude_range"
    CHECK ("mapLatitude" IS NULL OR "mapLatitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "Parcelle_map_longitude_range"
    CHECK ("mapLongitude" IS NULL OR "mapLongitude" BETWEEN -180 AND 180);

ALTER TABLE "Batiment"
  ADD CONSTRAINT "Batiment_map_coordinates_complete"
    CHECK (("mapLatitude" IS NULL) = ("mapLongitude" IS NULL)),
  ADD CONSTRAINT "Batiment_map_latitude_range"
    CHECK ("mapLatitude" IS NULL OR "mapLatitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "Batiment_map_longitude_range"
    CHECK ("mapLongitude" IS NULL OR "mapLongitude" BETWEEN -180 AND 180);

CREATE INDEX "Lotissement_mapLatitude_mapLongitude_idx" ON "Lotissement"("mapLatitude", "mapLongitude");
CREATE INDEX "Parcelle_mapLatitude_mapLongitude_idx" ON "Parcelle"("mapLatitude", "mapLongitude");
CREATE INDEX "Batiment_mapLatitude_mapLongitude_idx" ON "Batiment"("mapLatitude", "mapLongitude");
