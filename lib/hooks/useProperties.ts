// lib/hooks/useProperties.ts
import { useState, useEffect, useCallback } from "react";

// Property types - MUST match Prisma enum
export const PropertyTypes = [
  "Apartment",
  "House",
  "Villa",
  "Office",
  "Commercial",
  "Land",
  "Building",
  "Studio",
  "Duplex",
  "ChambreModerne",
  "Chambre",
] as const;

export type PropertyType = (typeof PropertyTypes)[number];

// Media item from the Media model
export interface PropertyMedia {
  id: number;
  url: string;
  type: "image" | "video";
  order: number;
}

// Unified Property interface - matches schema
export interface Property {
  id: number;
  title: string;
  shortDescription: string | null;
  description: string | null;

  // Pricing
  price: number | null;
  priceMin: number | null;
  priceMax: number | null;
  pricePerSqM: number | null;
  currency: string;

  // Type & listing
  type: PropertyType;
  forSale: boolean;
  forRent: boolean;
  rentPrice: number | null;

  // Land specifics
  isLandForDevelopment: boolean;
  approvedForApartments: boolean | null;

  // Unit features
  bedrooms: number | null;
  bathrooms: number | null;
  kitchens: number | null;
  livingRooms: number | null;
  surfaceArea: number | null;
  floorLevel: number | null;
  totalFloors: number | null;
  doorNumber: string | null;

  // Amenities
  hasGenerator: boolean | null;
  hasParking: boolean | null;
  parkingSpaces: number | null;
  hasElevator: boolean | null; // From Batiment
  totalUnits: number | null; // From Batiment
  amenities: string | null;

  // Location
  address: string | null;
  location: {
    lieudit: string | null;
    arrondissement: string | null;
    departement: string | null;
    region: string | null;
  };

  // Relations
  parcelleId: number;
  batimentId: number | null;

  // Media (from Media relation)
  media: PropertyMedia[];

  // Status
  published: boolean;
  featured: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Keep UnifiedProperty as alias for backwards compatibility
export type UnifiedProperty = Property;

// Filter options
export interface PropertyFilters {
  type?: PropertyType | "all";
  forSale?: boolean;
  forRent?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minSurfaceArea?: number;
  maxSurfaceArea?: number;
  hasParking?: boolean;
  hasGenerator?: boolean;
  hasElevator?: boolean;
  isLandForDevelopment?: boolean;
  published?: boolean;
  featured?: boolean;
  region?: string;
  departement?: string;
  arrondissement?: string;
}

// Sort options
export type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "bedrooms-asc"
  | "bedrooms-desc"
  | "surface-asc"
  | "surface-desc"
  | "title-asc"
  | "title-desc";

// Stats interface
export interface PropertyStats {
  total: number;
  published: number;
  featured: number;
  forSale: number;
  forRent: number;
  saleAndRent: number;
  landForDevelopment: number;
  averagePrice: number;
  byType: Record<PropertyType, number>;
  byRegion: Record<string, number>;
  withParking: number;
  withGenerator: number;
  withElevator: number;
}

// Main hook
export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/properties");

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch properties");
      }

      setProperties(data.data || []);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load properties",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, refetch: fetchProperties };
}

// Single property hook
// Single property hook - accepts string or number ID
// Single property hook - accepts string or number ID
// Single property hook - accepts string or number ID
// In lib/hooks/useProperties.ts

// Replace your useProperty hook in lib/hooks/useProperties.ts
// Starting at line ~197

export function useProperty(id: number | string | null | undefined) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle null, undefined, or empty
    if (id === null || id === undefined || id === "") {
      setProperty(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Convert string to number
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    // Validate
    if (isNaN(numericId) || numericId <= 0) {
      setError("Invalid property ID");
      setProperty(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // ⭐ Fetch both property and media in parallel
    Promise.all([
      fetch(`/api/properties/${numericId}`).then((res) => res.json()),
      fetch(`/api/data/Media?entityType=PROPERTY&entityId=${numericId}`).then(
        (res) => res.json(),
      ),
    ])
      .then(([propertyData, mediaData]) => {
        // Check if property fetch was successful
        if (!propertyData.success) {
          if (propertyData.error === "Property not found") {
            throw new Error("Property not found");
          }
          throw new Error(propertyData.error || "Failed to fetch property");
        }

        // Extract property and media
        const baseProperty = propertyData.data;
        const mediaItems = mediaData.data || mediaData || [];

        console.log("✅ Property loaded:", baseProperty.id, baseProperty.title);
        console.log(
          "✅ Media fetched:",
          Array.isArray(mediaItems) ? mediaItems.length : 0,
          "items",
        );

        // Normalize media items
        const normalizedMedia = Array.isArray(mediaItems)
          ? mediaItems.map((m: any) => ({
              id: m.id,
              url: m.url,
              type: String(m.type).toLowerCase() as "image" | "video",
              order: m.order || 0,
            }))
          : [];

        // Combine property with media
        const propertyWithMedia: Property = {
          ...baseProperty,
          media: normalizedMedia,
        };

        console.log("✅ Final property with media:", {
          id: propertyWithMedia.id,
          title: propertyWithMedia.title,
          mediaCount: propertyWithMedia.media.length,
          images: propertyWithMedia.media.filter((m) => m.type === "image")
            .length,
          videos: propertyWithMedia.media.filter((m) => m.type === "video")
            .length,
        });

        setProperty(propertyWithMedia);
        setError(null);
      })
      .catch((err) => {
        console.error("❌ useProperty error:", err);
        setError(err.message || "Failed to load property");
        setProperty(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { property, loading, error };
}

// Add these at the end of useProperties.ts

// Source labels (for backwards compatibility - now all properties come from "property" table)
export function getSourceLabel(source?: string): string {
  // Since we now have a unified Property model, this is simplified
  const labels: Record<string, string> = {
    property: "Property",
    batiment: "Building",
    parcelle: "Land",
    lotissement: "Development",
  };
  return labels[source || "property"] || "Property";
}

// Source colors
export function getSourceColor(source?: string): string {
  const colors: Record<string, string> = {
    property: "#10b981", // emerald
    batiment: "#6366f1", // indigo
    parcelle: "#f59e0b", // amber
    lotissement: "#ec4899", // pink
  };
  return colors[source || "property"] || "#10b981";
}
// Search function
export function searchProperties(
  properties: Property[],
  query: string,
): Property[] {
  if (!query.trim()) return properties;

  const terms = query.toLowerCase().split(/\s+/);

  return properties.filter((p) => {
    const text = [
      p.title,
      p.shortDescription,
      p.description,
      p.type,
      p.address,
      p.location.lieudit,
      p.location.arrondissement,
      p.location.departement,
      p.location.region,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return terms.every((term) => text.includes(term));
  });
}

// Filter function
export function filterProperties(
  properties: Property[],
  filters: PropertyFilters,
): Property[] {
  return properties.filter((p) => {
    if (filters.type && filters.type !== "all" && p.type !== filters.type)
      return false;
    if (filters.forSale !== undefined && p.forSale !== filters.forSale)
      return false;
    if (filters.forRent !== undefined && p.forRent !== filters.forRent)
      return false;
    if (
      filters.minPrice !== undefined &&
      p.price !== null &&
      p.price < filters.minPrice
    )
      return false;
    if (
      filters.maxPrice !== undefined &&
      p.price !== null &&
      p.price > filters.maxPrice
    )
      return false;
    if (
      filters.minBedrooms !== undefined &&
      (p.bedrooms ?? 0) < filters.minBedrooms
    )
      return false;
    if (
      filters.maxBedrooms !== undefined &&
      (p.bedrooms ?? 0) > filters.maxBedrooms
    )
      return false;
    if (
      filters.minSurfaceArea !== undefined &&
      (p.surfaceArea ?? 0) < filters.minSurfaceArea
    )
      return false;
    if (
      filters.maxSurfaceArea !== undefined &&
      (p.surfaceArea ?? 0) > filters.maxSurfaceArea
    )
      return false;
    if (filters.hasParking === true && !p.hasParking) return false;
    if (filters.hasGenerator === true && !p.hasGenerator) return false;
    if (filters.hasElevator === true && !p.hasElevator) return false;
    if (
      filters.isLandForDevelopment !== undefined &&
      p.isLandForDevelopment !== filters.isLandForDevelopment
    )
      return false;
    if (filters.published !== undefined && p.published !== filters.published)
      return false;
    if (filters.featured !== undefined && p.featured !== filters.featured)
      return false;
    if (
      filters.region &&
      !p.location.region?.toLowerCase().includes(filters.region.toLowerCase())
    )
      return false;
    if (
      filters.departement &&
      !p.location.departement
        ?.toLowerCase()
        .includes(filters.departement.toLowerCase())
    )
      return false;
    if (
      filters.arrondissement &&
      !p.location.arrondissement
        ?.toLowerCase()
        .includes(filters.arrondissement.toLowerCase())
    )
      return false;
    return true;
  });
}

// Sort function
export function sortProperties(
  properties: Property[],
  sortBy: SortOption,
): Property[] {
  const sorted = [...properties];
  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case "price-asc":
      return sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price-desc":
      return sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "bedrooms-asc":
      return sorted.sort((a, b) => (a.bedrooms ?? 0) - (b.bedrooms ?? 0));
    case "bedrooms-desc":
      return sorted.sort((a, b) => (b.bedrooms ?? 0) - (a.bedrooms ?? 0));
    case "surface-asc":
      return sorted.sort((a, b) => (a.surfaceArea ?? 0) - (b.surfaceArea ?? 0));
    case "surface-desc":
      return sorted.sort((a, b) => (b.surfaceArea ?? 0) - (a.surfaceArea ?? 0));
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return sorted;
  }
}

// Calculate stats
export function calculateStats(properties: Property[]): PropertyStats {
  const published = properties.filter((p) => p.published);
  const forSale = published.filter((p) => p.forSale);
  const forRent = published.filter((p) => p.forRent);
  const dual = published.filter((p) => p.forSale && p.forRent);

  const byType = {} as Record<PropertyType, number>;
  PropertyTypes.forEach((t) => {
    byType[t] = published.filter((p) => p.type === t).length;
  });

  const byRegion: Record<string, number> = {};
  published.forEach((p) => {
    const r = p.location.region || "Unknown";
    byRegion[r] = (byRegion[r] || 0) + 1;
  });

  const prices = forSale
    .filter((p) => p.price !== null && p.price > 0)
    .map((p) => p.price as number);

  return {
    total: properties.length,
    published: published.length,
    featured: published.filter((p) => p.featured).length,
    forSale: forSale.length,
    forRent: forRent.length,
    saleAndRent: dual.length,
    landForDevelopment: published.filter((p) => p.isLandForDevelopment).length,
    averagePrice: prices.length
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0,
    byType,
    byRegion,
    withParking: published.filter((p) => p.hasParking).length,
    withGenerator: published.filter((p) => p.hasGenerator).length,
    withElevator: published.filter((p) => p.hasElevator).length,
  };
}

// Format price
export function formatPrice(
  price: number | null | undefined,
  currency = "XAF",
): string {
  if (price === null || price === undefined || price === 0) {
    return "Prix sur demande";
  }
  if (typeof price === "number" && price > 0) {
    if (price >= 1e9) return `${(price / 1e9).toFixed(1)}B ${currency}`;
    if (price >= 1e6) return `${(price / 1e6).toFixed(0)}M ${currency}`;
    if (price >= 1e3) return `${(price / 1e3).toFixed(0)}K ${currency}`;
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  }
  return "Prix sur demande";
}

export function formatPriceCompact(
  price: number | null | undefined,
  currency = "XAF",
): string {
  if (price === null || price === undefined || price === 0) {
    return "N/A";
  }
  if (typeof price === "number" && price > 0) {
    if (price >= 1e9) return `${(price / 1e9).toFixed(1)}B ${currency}`;
    if (price >= 1e6) return `${(price / 1e6).toFixed(0)}M ${currency}`;
    if (price >= 1e3) return `${(price / 1e3).toFixed(0)}K ${currency}`;
    return `${price} ${currency}`;
  }
  return "N/A";
}

export function formatArea(area: number | null): string {
  if (!area) return "N/A";
  return `${area.toLocaleString("fr-CM")} m²`;
}

// Get property images from media array
// Replace your getPropertyImages function in lib/hooks/useProperties.ts
// with this heavily debugged version

export function getPropertyImages(property: Property): string[] {
  console.group("🖼️ getPropertyImages called");

  if (!property) {
    console.error("❌ property is null/undefined");
    console.groupEnd();
    return [];
  }

  if (!property.media) {
    console.error("❌ property.media is null/undefined");
    console.groupEnd();
    return [];
  }

  if (!Array.isArray(property.media)) {
    console.error("❌ property.media is not an array:", typeof property.media);
    console.groupEnd();
    return [];
  }

  console.log(
    "✅ property.media is valid array with",
    property.media.length,
    "items",
  );

  // Log each item
  property.media.forEach((item, idx) => {
    console.log(`  [${idx}]:`, {
      id: item.id,
      type: item.type,
      url: item.url?.substring(0, 50) + "...",
    });
  });

  // Filter for images
  const images = property.media.filter((m) => {
    const isImage = m.type === "image";
    console.log(`    ${m.id}: type="${m.type}" === "image"? ${isImage}`);
    return isImage;
  });

  console.log("After filter: found", images.length, "images");

  // Sort by order
  const sorted = images.sort((a, b) => a.order - b.order);
  console.log("After sort:", sorted.length, "images");

  // Extract URLs
  const urls = sorted.map((m) => m.url);
  console.log("URLs:", urls);

  console.groupEnd();
  return urls;
}

export function getPropertyVideo(property: Property): string | null {
  console.group("🎬 getPropertyVideo called");

  if (!property?.media || !Array.isArray(property.media)) {
    console.log("❌ No valid media array");
    console.groupEnd();
    return null;
  }

  const video = property.media.find((m) => {
    const isVideo = m.type === "video";
    console.log(`  ${m.id}: type="${m.type}" === "video"? ${isVideo}`);
    return isVideo;
  });

  if (video) {
    console.log("✅ Found video:", video.url);
  } else {
    console.log("❌ No video found");
  }

  console.groupEnd();
  return video?.url ?? null;
}

export function getPropertyLocation(property: Property): string {
  return (
    [
      property.location.lieudit,
      property.location.arrondissement,
      property.location.departement,
      property.location.region,
    ]
      .filter(Boolean)
      .join(", ") ||
    property.address ||
    "Location not specified"
  );
}

export function getFeaturedProperties(
  properties: Property[],
  limit = 10,
): Property[] {
  return properties.filter((p) => p.featured && p.published).slice(0, limit);
}

export function getTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    Apartment: "Appartement",
    House: "Maison",
    Villa: "Villa",
    Office: "Bureau",
    Commercial: "Commercial",
    Land: "Terrain",
    Building: "Immeuble",
    Studio: "Studio",
    Duplex: "Duplex",
    ChambreModerne: "Chambre Moderne",
    Chambre: "Chambre",
  };
  return labels[type] || type;
}

// Get similar properties
// Get similar properties
export function getSimilarProperties(
  property: Property,
  allProperties: Property[],
  limit = 6,
): Property[] {
  // Filter out the current property and unpublished ones
  const candidates = allProperties.filter(
    (p) => p.id !== property.id && p.published,
  );

  const scored = candidates.map((p) => {
    let score = 0;

    // Same type is a strong match
    if (p.type === property.type) score += 50;

    // Same listing type
    if (p.forSale === property.forSale) score += 15;
    if (p.forRent === property.forRent) score += 15;

    // Similar price range
    if (property.price && p.price) {
      const propertyPrice = Number(property.price);
      const pPrice = Number(p.price);
      if (propertyPrice > 0 && pPrice > 0) {
        const priceDiff = Math.abs(pPrice - propertyPrice) / propertyPrice;
        if (priceDiff < 0.3) score += 30;
        else if (priceDiff < 0.5) score += 15;
      }
    }

    // Same location
    if (p.location.region === property.location.region) score += 25;
    if (p.location.departement === property.location.departement) score += 15;
    if (p.location.arrondissement === property.location.arrondissement)
      score += 10;

    // Similar surface area
    if (property.surfaceArea && p.surfaceArea) {
      const surfaceDiff =
        Math.abs(p.surfaceArea - property.surfaceArea) / property.surfaceArea;
      if (surfaceDiff < 0.3) score += 20;
      else if (surfaceDiff < 0.5) score += 10;
    }

    // Similar bedrooms
    if (property.bedrooms && p.bedrooms) {
      const bedroomDiff = Math.abs(p.bedrooms - property.bedrooms);
      if (bedroomDiff === 0) score += 15;
      else if (bedroomDiff === 1) score += 8;
    }

    // Featured properties get a small boost
    if (p.featured) score += 5;

    return { property: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.property);
}
