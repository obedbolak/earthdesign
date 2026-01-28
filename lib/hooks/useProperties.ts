// lib/hooks/useProperties.ts
import { useState, useEffect, useCallback } from "react";

/* =========================================================
 * ENUMS & TYPES - Must match Prisma schema
 * ========================================================= */

export const PropertyTypes = [
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "STUDIO",
  "DUPLEX",
  "TRIPLEX",
  "PENTHOUSE",
  "CHAMBRE_MODERNE",
  "CHAMBRE",
  "OFFICE",
  "SHOP",
  "RESTAURANT",
  "HOTEL",
  "WAREHOUSE",
  "COMMERCIAL_SPACE",
  "INDUSTRIAL",
  "FACTORY",
  "BUILDING",
  "MIXED_USE",
] as const;

export type PropertyType = (typeof PropertyTypes)[number];

export const PropertyCategories = [
  "LAND",
  "RESIDENTIAL",
  "COMMERCIAL",
  "INDUSTRIAL",
  "MIXED",
] as const;
export type PropertyCategory = (typeof PropertyCategories)[number];

export const ListingTypes = ["SALE", "RENT", "BOTH"] as const;
export type ListingType = (typeof ListingTypes)[number];

export const ListingStatuses = [
  "DRAFT",
  "PUBLISHED",
  "SOLD",
  "RENTED",
  "ARCHIVED",
] as const;
export type ListingStatus = (typeof ListingStatuses)[number];

export type EntityType = "LOTISSEMENT" | "PARCELLE" | "BATIMENT";

/* =========================================================
 * INTERFACES
 * ========================================================= */

export interface MediaItem {
  id: number;
  entityType: string;
  url: string;
  type: "image" | "video";
  order: number;
  caption?: string | null;
  isPrimary: boolean;
}

export interface Creator {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  agencyName?: string | null;
  agencyLogo?: string | null;
  isVerified: boolean;
}

export interface BaseListing {
  slug: string | null;
  title: string | null;
  shortDescription: string | null;
  description: string | null;
  category: PropertyCategory;
  listingType: ListingType | null;
  listingStatus: ListingStatus;
  price: string | number | null;
  pricePerSqM: string | number | null;
  currency: string;
  featured: boolean;
  viewCount: number;
  favoriteCount: number;
  shareCount: number;
  createdById: string | null;
  createdBy?: Creator | null;
  media?: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Lotissement extends BaseListing {
  Id_Lotis: number;
  Nom_proprio: string | null;
  Num_TF: string | null;
  Statut: string | null;
  Nom_cons: string | null;
  Surface: number | null;
  Nom_visa_lotis: string | null;
  Date_approb: string | null;
  Geo_exe: string | null;
  Nbre_lots: number | null;
  Lieudit: string | null;
  Echelle: number | null;
  Ccp: string | null;
  Id_Arrond: number | null;
  WKT_Geometry: string | null;
  totalParcels: number | null;
  availableParcels: number | null;
  hasRoadAccess: boolean | null;
  hasElectricity: boolean | null;
  hasWater: boolean | null;
  arrondissement?: any;
  parcelles?: Parcelle[];
}

export interface Parcelle extends BaseListing {
  Id_Parcel: number;
  Nom_Prop: string | null;
  TF_Mere: string | null;
  Mode_Obtent: string | null;
  TF_Cree: string | null;
  Nom_Cons: string | null;
  Sup: number | null;
  Nom_Visa_Cad: string | null;
  Date_visa: string | null;
  Geometre: string | null;
  Date_impl: string | null;
  Num_lot: string | null;
  Num_bloc: string | null;
  Lieu_dit: string | null;
  Largeur_Rte: string | null;
  Echelle: number | null;
  Ccp_N: string | null;
  Mise_Val: boolean | null;
  Cloture: boolean | null;
  Id_Lotis: number | null;
  WKT_Geometry: string | null;
  isForDevelopment: boolean | null;
  approvedForBuilding: boolean | null;
  zoningType: string | null;
  lotissement?: Lotissement | null;
  batiments?: Batiment[];
}

export interface Batiment extends BaseListing {
  Id_Bat: number;
  Cat_Bat: string | null;
  Status: string | null;
  Standing: string | null;
  Cloture: boolean | null;
  No_Permis: string | null;
  Type_Lodg: string | null;
  Etat_Bat: string | null;
  Nom: string | null;
  Mat_Bati: string | null;
  Id_Parcel: number | null;
  WKT_Geometry: string | null;
  propertyType: PropertyType | null;
  rentPrice: string | number | null;
  totalFloors: number | null;
  totalUnits: number | null;
  hasElevator: boolean | null;
  surfaceArea: number | null;
  doorNumber: string | null;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  kitchens: number | null;
  livingRooms: number | null;
  floorLevel: number | null;
  hasGenerator: boolean | null;
  hasParking: boolean | null;
  parkingSpaces: number | null;
  hasPool: boolean | null;
  hasGarden: boolean | null;
  hasSecurity: boolean | null;
  hasAirConditioning: boolean | null;
  hasFurnished: boolean | null;
  hasBalcony: boolean | null;
  hasTerrace: boolean | null;
  amenities: string | null;
  parcelle?: Parcelle | null;
}

export type Listing =
  | (Lotissement & { _entityType: "LOTISSEMENT" })
  | (Parcelle & { _entityType: "PARCELLE" })
  | (Batiment & { _entityType: "BATIMENT" });

/* =========================================================
 * FILTER INTERFACE
 * ========================================================= */

export interface ListingFilters {
  status?: ListingStatus;
  listingType?: ListingType;
  category?: PropertyCategory;
  propertyType?: PropertyType;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
  createdById?: string;
  limit?: number;
  offset?: number;
}

/* =========================================================
 * HOOKS - Same pattern as DataManagement
 * ========================================================= */

// Generic table fetcher - SAME AS DATAMANAGEMENT
export function useTableData<T>(table: string, filters?: ListingFilters) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params (optional filters)
      const params = new URLSearchParams();

      if (filters?.status) params.set("status", filters.status);
      if (filters?.listingType) params.set("listingType", filters.listingType);
      if (filters?.category) params.set("category", filters.category);
      if (filters?.propertyType)
        params.set("propertyType", filters.propertyType);
      if (filters?.featured) params.set("featured", "true");
      if (filters?.minPrice)
        params.set("minPrice", filters.minPrice.toString());
      if (filters?.maxPrice)
        params.set("maxPrice", filters.maxPrice.toString());
      if (filters?.bedrooms)
        params.set("bedrooms", filters.bedrooms.toString());
      if (filters?.bathrooms)
        params.set("bathrooms", filters.bathrooms.toString());
      if (filters?.search) params.set("search", filters.search);
      if (filters?.createdById) params.set("createdById", filters.createdById);
      if (filters?.limit) params.set("limit", filters.limit.toString());
      if (filters?.offset) params.set("offset", filters.offset.toString());

      const queryString = params.toString();
      const url = `/api/data/${table.toLowerCase()}${queryString ? `?${queryString}` : ""}`;

      // SAME FETCH AS DATAMANAGEMENT
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to load: ${res.status}`);
      }

      const json = await res.json();

      // Handle response - same as DataManagement expects
      setData(json.data || []);
      setTotal(json.total || json.count || json.data?.length || 0);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err instanceof Error ? err.message : "Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(filters)]); // Serialize filters to prevent infinite loop

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, total, refetch: fetchData };
}

// Single item fetcher - SAME AS DATAMANAGEMENT
export function useTableItem<T>(
  table: string,
  id: number | string | null | undefined,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null || id === "") {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // SAME FETCH AS DATAMANAGEMENT
    fetch(`/api/data/${table.toLowerCase()}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json.data || json);
        setError(null);
      })
      .catch((err) => {
        console.error(`Error fetching ${table}/${id}:`, err);
        setError(err.message || "Failed to load");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [table, id]);

  return { data, loading, error };
}

/* =========================================================
 * TYPED HOOKS FOR EACH ENTITY
 * ========================================================= */

// Lotissement hooks
export function useLotissements(filters?: ListingFilters) {
  return useTableData<Lotissement>("lotissement", filters);
}

export function useLotissement(id: number | string | null | undefined) {
  return useTableItem<Lotissement>("lotissement", id);
}

// Parcelle hooks
export function useParcelles(filters?: ListingFilters) {
  return useTableData<Parcelle>("parcelle", filters);
}

export function useParcelle(id: number | string | null | undefined) {
  return useTableItem<Parcelle>("parcelle", id);
}

// Batiment hooks
export function useBatiments(filters?: ListingFilters) {
  return useTableData<Batiment>("batiment", filters);
}

export function useBatiment(id: number | string | null | undefined) {
  return useTableItem<Batiment>("batiment", id);
}

// Legacy aliases
export function useProperties(filters?: ListingFilters) {
  return useBatiments(filters);
}

export function useProperty(id: number | string | null | undefined) {
  return useBatiment(id);
}

/* =========================================================
 * COMBINED LISTINGS HOOK
 * ========================================================= */

export function useAllListings(filters?: ListingFilters) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.featured) params.set("featured", "true");
      if (filters?.search) params.set("search", filters.search);
      if (filters?.limit)
        params.set("limit", Math.ceil(filters.limit / 3).toString());

      const queryString = params.toString();
      const suffix = queryString ? `?${queryString}` : "";

      // Fetch all 3 tables in parallel - SAME AS DATAMANAGEMENT
      const [lotisRes, parcelRes, batRes] = await Promise.all([
        fetch(`/api/data/lotissement${suffix}`),
        fetch(`/api/data/parcelle${suffix}`),
        fetch(`/api/data/batiment${suffix}`),
      ]);

      const [lotisJson, parcelJson, batJson] = await Promise.all([
        lotisRes.ok ? lotisRes.json() : { data: [] },
        parcelRes.ok ? parcelRes.json() : { data: [] },
        batRes.ok ? batRes.json() : { data: [] },
      ]);

      // Combine and tag with entity type
      const combined: Listing[] = [
        ...(lotisJson.data || []).map((l: Lotissement) => ({
          ...l,
          _entityType: "LOTISSEMENT" as const,
        })),
        ...(parcelJson.data || []).map((p: Parcelle) => ({
          ...p,
          _entityType: "PARCELLE" as const,
        })),
        ...(batJson.data || []).map((b: Batiment) => ({
          ...b,
          _entityType: "BATIMENT" as const,
        })),
      ];

      // Sort by newest first
      combined.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setListings(filters?.limit ? combined.slice(0, filters.limit) : combined);
    } catch (err) {
      console.error("Error fetching all listings:", err);
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { listings, loading, error, refetch: fetchAll };
}

/* =========================================================
 * UTILITY FUNCTIONS
 * ========================================================= */

export function getListingId(listing: Listing): number {
  switch (listing._entityType) {
    case "LOTISSEMENT":
      return (listing as Lotissement).Id_Lotis;
    case "PARCELLE":
      return (listing as Parcelle).Id_Parcel;
    case "BATIMENT":
      return (listing as Batiment).Id_Bat;
  }
}

export function getListingUrl(listing: Listing): string {
  const id = getListingId(listing);
  const slug = listing.slug || id;

  switch (listing._entityType) {
    case "LOTISSEMENT":
      return `/estates/${slug}`;
    case "PARCELLE":
      return `/lands/${slug}`;
    case "BATIMENT":
      return `/properties/${slug}`;
  }
}

export function formatPrice(
  price: string | number | null | undefined,
  currency = "XAF",
): string {
  if (price == null || price === "") return "Prix sur demande";

  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice) || numPrice <= 0) return "Prix sur demande";

  if (numPrice >= 1e9) return `${(numPrice / 1e9).toFixed(1)}B ${currency}`;
  if (numPrice >= 1e6) return `${(numPrice / 1e6).toFixed(0)}M ${currency}`;
  if (numPrice >= 1e3) return `${(numPrice / 1e3).toFixed(0)}K ${currency}`;

  return `${numPrice.toLocaleString("fr-CM")} ${currency}`;
}

export function formatArea(area: number | null | undefined): string {
  if (!area) return "N/A";
  return `${area.toLocaleString("fr-CM")} m²`;
}

export function getListingPrimaryImage(listing: BaseListing): string | null {
  if (!listing.media?.length) return null;

  const primary = listing.media.find((m) => m.isPrimary && m.type === "image");
  if (primary) return primary.url;

  const firstImage = listing.media
    .filter((m) => m.type === "image")
    .sort((a, b) => a.order - b.order)[0];

  return firstImage?.url || null;
}

export function getListingImages(listing: BaseListing): string[] {
  if (!listing.media?.length) return [];

  return listing.media
    .filter((m) => m.type === "image")
    .sort((a, b) => a.order - b.order)
    .map((m) => m.url);
}

export function getEntityTypeLabel(
  type: EntityType,
  lang: "en" | "fr" = "fr",
): string {
  const labels: Record<EntityType, { en: string; fr: string }> = {
    LOTISSEMENT: { en: "Estate", fr: "Lotissement" },
    PARCELLE: { en: "Land", fr: "Terrain" },
    BATIMENT: { en: "Property", fr: "Bien Immobilier" },
  };
  return labels[type][lang];
}

export function getPropertyTypeLabel(
  type: PropertyType,
  lang: "en" | "fr" = "fr",
): string {
  const labels: Record<PropertyType, { en: string; fr: string }> = {
    APARTMENT: { en: "Apartment", fr: "Appartement" },
    HOUSE: { en: "House", fr: "Maison" },
    VILLA: { en: "Villa", fr: "Villa" },
    STUDIO: { en: "Studio", fr: "Studio" },
    DUPLEX: { en: "Duplex", fr: "Duplex" },
    TRIPLEX: { en: "Triplex", fr: "Triplex" },
    PENTHOUSE: { en: "Penthouse", fr: "Penthouse" },
    CHAMBRE_MODERNE: { en: "Modern Room", fr: "Chambre Moderne" },
    CHAMBRE: { en: "Room", fr: "Chambre" },
    OFFICE: { en: "Office", fr: "Bureau" },
    SHOP: { en: "Shop", fr: "Boutique" },
    RESTAURANT: { en: "Restaurant", fr: "Restaurant" },
    HOTEL: { en: "Hotel", fr: "Hôtel" },
    WAREHOUSE: { en: "Warehouse", fr: "Entrepôt" },
    COMMERCIAL_SPACE: { en: "Commercial Space", fr: "Local Commercial" },
    INDUSTRIAL: { en: "Industrial", fr: "Industriel" },
    FACTORY: { en: "Factory", fr: "Usine" },
    BUILDING: { en: "Building", fr: "Immeuble" },
    MIXED_USE: { en: "Mixed Use", fr: "Usage Mixte" },
  };
  return labels[type]?.[lang] || type;
}

export function getCategoryLabel(
  category: PropertyCategory,
  lang: "en" | "fr" = "fr",
): string {
  const labels: Record<PropertyCategory, { en: string; fr: string }> = {
    LAND: { en: "Land", fr: "Terrain" },
    RESIDENTIAL: { en: "Residential", fr: "Résidentiel" },
    COMMERCIAL: { en: "Commercial", fr: "Commercial" },
    INDUSTRIAL: { en: "Industrial", fr: "Industriel" },
    MIXED: { en: "Mixed", fr: "Mixte" },
  };
  return labels[category][lang];
}

export function getListingTypeLabel(
  type: ListingType,
  lang: "en" | "fr" = "fr",
): string {
  const labels: Record<ListingType, { en: string; fr: string }> = {
    SALE: { en: "For Sale", fr: "À Vendre" },
    RENT: { en: "For Rent", fr: "À Louer" },
    BOTH: { en: "Sale or Rent", fr: "Vente ou Location" },
  };
  return labels[type][lang];
}

export function getListingSurface(listing: Listing): number | null {
  switch (listing._entityType) {
    case "LOTISSEMENT":
      return (listing as Lotissement).Surface;
    case "PARCELLE":
      return (listing as Parcelle).Sup;
    case "BATIMENT":
      return (listing as Batiment).surfaceArea;
  }
}

export function getLocationString(
  listing: Lotissement | Parcelle | Batiment,
): string {
  // Try direct arrondissement (Lotissement)
  if ("arrondissement" in listing && listing.arrondissement?.Nom_Arrond) {
    const arr = listing.arrondissement;
    const parts = [
      arr.Nom_Arrond,
      arr.departement?.Nom_Dept,
      arr.departement?.region?.Nom_Reg,
    ].filter(Boolean);
    return parts.join(", ");
  }

  // Try via lotissement (Parcelle)
  if ("lotissement" in listing && listing.lotissement?.arrondissement) {
    const arr = listing.lotissement.arrondissement;
    const parts = [
      arr.Nom_Arrond,
      arr.departement?.Nom_Dept,
      arr.departement?.region?.Nom_Reg,
    ].filter(Boolean);
    return parts.join(", ");
  }

  // Try via parcelle (Batiment)
  if ("parcelle" in listing && listing.parcelle?.lotissement?.arrondissement) {
    const arr = listing.parcelle.lotissement.arrondissement;
    const parts = [
      arr.Nom_Arrond,
      arr.departement?.Nom_Dept,
      arr.departement?.region?.Nom_Reg,
    ].filter(Boolean);
    return parts.join(", ");
  }

  // Fallback to address or lieudit
  if ("address" in listing && listing.address) return listing.address;
  if ("Lieudit" in listing && listing.Lieudit) return listing.Lieudit;
  if ("Lieu_dit" in listing && listing.Lieu_dit) return listing.Lieu_dit;

  return "Location not specified";
}

export function isForSale(listing: BaseListing): boolean {
  return listing.listingType === "SALE" || listing.listingType === "BOTH";
}

export function isForRent(listing: BaseListing): boolean {
  return listing.listingType === "RENT" || listing.listingType === "BOTH";
}

// Legacy type alias
export type Property = Batiment;
// =========================================================
// SLUG-BASED HOOKS (handle both slug and numeric ID)
// =========================================================

export function useBatimentBySlug(slugOrId: string | null | undefined) {
  const [data, setData] = useState<Batiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugOrId || slugOrId === "") {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const isNumeric = /^\d+$/.test(slugOrId);
    const endpoint = isNumeric
      ? `/api/data/batiment/${slugOrId}`
      : `/api/data/batiment?slug=${encodeURIComponent(slugOrId)}&limit=1`;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`Not found`);
        return res.json();
      })
      .then((json) => {
        const item = json.data || null; // Changed from json.data?.[0]
        setData(item);
        if (!item) setError("Property not found");
      })
      .catch((err) => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [slugOrId]);

  return { data, loading, error };
}

export function useParcelleBySlug(slugOrId: string | null | undefined) {
  const [data, setData] = useState<Parcelle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugOrId || slugOrId === "") {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const isNumeric = /^\d+$/.test(slugOrId);
    const endpoint = isNumeric
      ? `/api/data/parcelle/${slugOrId}`
      : `/api/data/parcelle?slug=${encodeURIComponent(slugOrId)}&limit=1`;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`Not found`);
        return res.json();
      })
      .then((json) => {
        const item = json.data || null;
        setData(item);
        if (!item) setError("Land not found");
      })
      .catch((err) => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [slugOrId]);

  return { data, loading, error };
}

export function useLotissementBySlug(slugOrId: string | null | undefined) {
  const [data, setData] = useState<Lotissement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugOrId || slugOrId === "") {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const isNumeric = /^\d+$/.test(slugOrId);
    const endpoint = isNumeric
      ? `/api/data/lotissement/${slugOrId}`
      : `/api/data/lotissement?slug=${encodeURIComponent(slugOrId)}&limit=1`;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`Not found`);
        return res.json();
      })
      .then((json) => {
        const item = isNumeric ? json.data || json : json.data?.[0] || null;
        setData(item);
        if (!item) setError("Estate not found");
      })
      .catch((err) => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [slugOrId]);

  return { data, loading, error };
}
