import { ExternalLink, MapPin } from "lucide-react";

export type MapLocation = {
  mapLatitude?: number | null;
  mapLongitude?: number | null;
  locationSource?: string | null;
};

type PropertyLocationMapProps = {
  location: MapLocation | null | undefined;
  title: string;
};

type ValidMapLocation = MapLocation & {
  mapLatitude: number;
  mapLongitude: number;
};

function isValidLocation(
  location: MapLocation | null | undefined,
): location is ValidMapLocation {
  return Boolean(
    location &&
      typeof location.mapLatitude === "number" &&
      typeof location.mapLongitude === "number" &&
      location.mapLatitude >= -90 &&
      location.mapLatitude <= 90 &&
      location.mapLongitude >= -180 &&
      location.mapLongitude <= 180,
  );
}

export function getMapLocation(
  ...locations: Array<MapLocation | null | undefined>
): MapLocation | null {
  return locations.find(isValidLocation) ?? null;
}

export default function PropertyLocationMap({
  location,
  title,
}: PropertyLocationMapProps) {
  if (!isValidLocation(location)) {
    return (
      <div className="aspect-video rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 px-6 text-center">
        <div>
          <MapPin className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
          <p className="text-white font-semibold">Map location not added yet</p>
          <p className="mt-1 text-sm text-gray-400">
            The agent can add a latitude and longitude from the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const query = `${location.mapLatitude},${location.mapLongitude}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <iframe
        title={`Map for ${title}`}
        src={embedUrl}
        className="aspect-video w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="text-gray-300">
          {location.mapLatitude.toFixed(6)}, {location.mapLongitude.toFixed(6)}
        </span>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-emerald-400 hover:text-emerald-300"
        >
          Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
