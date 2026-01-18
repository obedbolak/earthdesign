// lib/hooks/useProperties.ts
import { useState, useEffect, useCallback, useMemo } from "react";

// Property source types
export type PropertySource = "lotissement" | "parcelle" | "batiment";

// Property types
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
] as const;

export type PropertyType = (typeof PropertyTypes)[number];

// Unified Property interface
export interface UnifiedProperty {
  id: string; // "source-numericId" format
  numericId: number;
  source: PropertySource;
  title: string;
  shortDescription: string | null;
  description: string | null;
  price: number | null;
  pricePerSqM: number | null;
  currency: string;
  type: PropertyType;
  forSale: boolean;
  forRent: boolean;
  rentPrice: number | null;
  isLandForDevelopment: boolean;
  approvedForApartments: boolean | null;
  bedrooms: number | null;
  bathrooms: number | null;
  kitchens: number | null;
  livingRooms: number | null;
  hasGenerator: boolean;
  hasParking: boolean;
  parkingSpaces: number | null; // NEW: for Batiment
  hasElevator: boolean | null; // NEW: for Batiment
  totalUnits: number | null; // NEW: for Batiment (apartment buildings)
  floorLevel: number | null;
  totalFloors: number | null;
  surface: number | null;
  nbreLots: number | null;
  location: {
    lieudit: string | null;
    arrondissement: string | null;
    departement: string | null;
    region: string | null;
  };
  imageUrl1: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  imageUrl4: string | null;
  imageUrl5: string | null;
  imageUrl6: string | null;
  videoUrl: string | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  _meta?: Record<string, any>;
}

// Keep Property as alias
export type Property = UnifiedProperty;

// Filter options
export interface PropertyFilters {
  source?: PropertySource | "all";
  type?: PropertyType | "all";
  forSale?: boolean;
  forRent?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  hasParking?: boolean;
  hasGenerator?: boolean;
  hasElevator?: boolean; // NEW: filter option
  isLandForDevelopment?: boolean;
  published?: boolean;
  featured?: boolean;
  region?: string;
  department?: string;
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
  bySource: Record<PropertySource, number>;
  byRegion: Record<string, number>;
  withParking: number;
  withGenerator: number;
  withElevator: number; // NEW: stat
}

// Main hook
export function useProperties() {
  const [properties, setProperties] = useState<UnifiedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState({
    lotissements: 0,
    parcelles: 0,
    batiments: 0,
  });

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
      setBreakdown(
        data.breakdown || { lotissements: 0, parcelles: 0, batiments: 0 },
      );
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

  return { properties, loading, error, refetch: fetchProperties, breakdown };
}

// Single property hook
export function useProperty(id: string | null) {
  const [property, setProperty] = useState<UnifiedProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProperty(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProperty(data.data);
        } else {
          setError(data.error);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { property, loading, error };
}

// Search function
export function searchProperties(
  properties: UnifiedProperty[],
  query: string,
): UnifiedProperty[] {
  if (!query.trim()) return properties;

  const terms = query.toLowerCase().split(/\s+/);

  return properties.filter((p) => {
    const text = [
      p.title,
      p.shortDescription,
      p.description,
      p.type,
      p.source,
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
  properties: UnifiedProperty[],
  filters: PropertyFilters,
): UnifiedProperty[] {
  return properties.filter((p) => {
    if (
      filters.source &&
      filters.source !== "all" &&
      p.source !== filters.source
    )
      return false;
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
    if (filters.hasParking !== undefined && p.hasParking !== filters.hasParking)
      return false;
    if (
      filters.hasGenerator !== undefined &&
      p.hasGenerator !== filters.hasGenerator
    )
      return false;
    if (
      filters.hasElevator !== undefined &&
      p.hasElevator !== filters.hasElevator
    )
      return false; // NEW
    if (filters.published !== undefined && p.published !== filters.published)
      return false;
    if (filters.featured !== undefined && p.featured !== filters.featured)
      return false;
    if (
      filters.region &&
      !p.location.region?.toLowerCase().includes(filters.region.toLowerCase())
    )
      return false;
    return true;
  });
}

// Sort function
export function sortProperties(
  properties: UnifiedProperty[],
  sortBy: SortOption,
): UnifiedProperty[] {
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
    case "bedrooms-desc":
      return sorted.sort((a, b) => (b.bedrooms ?? 0) - (a.bedrooms ?? 0));
    case "surface-desc":
      return sorted.sort((a, b) => (b.surface ?? 0) - (a.surface ?? 0));
    default:
      return sorted;
  }
}

// Calculate stats
export function calculateStats(properties: UnifiedProperty[]): PropertyStats {
  const published = properties.filter((p) => p.published);
  const forSale = published.filter((p) => p.forSale);
  const forRent = published.filter((p) => p.forRent);
  const dual = published.filter((p) => p.forSale && p.forRent);

  const byType = {} as Record<PropertyType, number>;
  PropertyTypes.forEach((t) => {
    byType[t] = published.filter((p) => p.type === t).length;
  });

  const bySource: Record<PropertySource, number> = {
    lotissement: published.filter((p) => p.source === "lotissement").length,
    parcelle: published.filter((p) => p.source === "parcelle").length,
    batiment: published.filter((p) => p.source === "batiment").length,
  };

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
      ? Math.round(
          prices.reduce((a: number, b: number) => a + b, 0) / prices.length,
        )
      : 0,
    byType,
    bySource,
    byRegion,
    withParking: published.filter((p) => p.hasParking).length,
    withGenerator: published.filter((p) => p.hasGenerator).length,
    withElevator: published.filter((p) => p.hasElevator).length, // NEW
  };
}

export function formatPrice(
  price: number | null | undefined,
  currency = "XAF",
): string {
  if (price === null || price === undefined || price === 0) {
    return "Prix sur demande";
  }
  if (typeof price === "number" && price > 0) {
    // Use abbreviations for large numbers
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
  // Explicitly check for null, undefined, or 0
  if (price === null || price === undefined || price === 0) {
    return "N/A";
  }
  // Only format if price is a valid positive number
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

export function getPropertyImages(property: UnifiedProperty): string[] {
  return [
    property.imageUrl1,
    property.imageUrl2,
    property.imageUrl3,
    property.imageUrl4,
    property.imageUrl5,
    property.imageUrl6,
  ].filter((url): url is string => !!url);
}

export function getPropertyLocation(property: UnifiedProperty): string {
  return (
    [
      property.location.lieudit,
      property.location.arrondissement,
      property.location.departement,
      property.location.region,
    ]
      .filter(Boolean)
      .join(", ") || "Location not specified"
  );
}

export function getFeaturedProperties(
  properties: UnifiedProperty[],
  limit = 10,
): UnifiedProperty[] {
  return properties.filter((p) => p.featured && p.published).slice(0, limit);
}

export function getSourceLabel(source: PropertySource): string {
  return {
    lotissement: "Lotissement",
    parcelle: "Parcelle",
    batiment: "Bâtiment",
  }[source];
}

export function getSourceColor(source: PropertySource): string {
  return { lotissement: "#22c55e", parcelle: "#3b82f6", batiment: "#f59e0b" }[
    source
  ];
}

// Get similar properties based on type, location, price range
export function getSimilarProperties(
  property: UnifiedProperty,
  allProperties: UnifiedProperty[],
  limit = 6,
): UnifiedProperty[] {
  // Filter out the current property and unpublished properties
  const candidates = allProperties.filter(
    (p) => p.id !== property.id && p.published,
  );

  // Score each property based on similarity
  const scored = candidates.map((p) => {
    let score = 0;

    // Same type gets highest score
    if (p.type === property.type) score += 50;

    // Same source
    if (p.source === property.source) score += 20;

    // Same sale/rent status
    if (p.forSale === property.forSale) score += 15;
    if (p.forRent === property.forRent) score += 15;

    // Similar price (within 30%)
    if (
      property.price !== null &&
      property.price > 0 &&
      p.price !== null &&
      p.price > 0
    ) {
      const priceDiff = Math.abs(p.price - property.price) / property.price;
      if (priceDiff < 0.3) score += 30;
      else if (priceDiff < 0.5) score += 15;
    }

    // Same region
    if (p.location.region === property.location.region) score += 25;

    // Same department
    if (p.location.departement === property.location.departement) score += 15;

    // Same arrondissement (very similar location)
    if (p.location.arrondissement === property.location.arrondissement)
      score += 10;

    // Similar surface area (within 30%)
    if (property.surface && p.surface) {
      const surfaceDiff =
        Math.abs(p.surface - property.surface) / property.surface;
      if (surfaceDiff < 0.3) score += 20;
      else if (surfaceDiff < 0.5) score += 10;
    }

    // Similar bedrooms (for buildings)
    if (property.bedrooms && p.bedrooms) {
      const bedroomDiff = Math.abs(p.bedrooms - property.bedrooms);
      if (bedroomDiff === 0) score += 15;
      else if (bedroomDiff === 1) score += 8;
    }

    // Featured properties get slight boost
    if (p.featured) score += 5;

    return { property: p, score };
  });

  // Sort by score descending and return top matches
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.property);
}
