// File: app/properties/page.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Grid3x3,
  List,
  Map as MapIcon,
  ChevronDown,
  Square,
  Home,
  MapPin,
  Heart,
  Share2,
  SlidersHorizontal,
  X,
  Building2,
  TreePine,
  Tag,
  Phone,
  Mail,
  Loader2,
  ArrowLeft,
  User,
  Bed,
  Bath,
  Car,
  Zap,
  Sparkles,
  DollarSign,
  Filter,
  Menu,
  Layers,
  Map,
  Power,
  Droplets,
  Route,
} from "lucide-react";

// ✅ NEW - Only import what exists
import {
  // Hooks
  useAllListings,
  useBatiments,
  useLotissements,
  useParcelles,
  // Types
  Listing,
  Lotissement,
  Parcelle,
  Batiment,
  EntityType,
  PropertyType,
  PropertyTypes,
  PropertyCategory,
  ListingType,
  ListingFilters,
  // Utility functions
  getListingId,
  getListingUrl,
  getListingPrimaryImage,
  getLocationString,
  getListingSurface,
  formatPrice,
  formatArea,
  getPropertyTypeLabel,
  getEntityTypeLabel,
  getCategoryLabel,
  getListingTypeLabel,
  isForSale,
  isForRent,
} from "@/lib/hooks/useProperties";
import Footer from "@/components/Footer";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";

// Placeholder images by entity type and property type
const PLACEHOLDER_IMAGES: Record<string, string> = {
  // Property types (Batiment)
  VILLA:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&q=80",
  APARTMENT:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&q=80",
  HOUSE:
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&q=80",
  OFFICE:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
  STUDIO:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80",
  DUPLEX:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80",
  COMMERCIAL_SPACE:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80",
  BUILDING:
    "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop&q=80",
  WAREHOUSE:
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&q=80",
  SHOP: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80",
  // Entity type defaults
  LOTISSEMENT:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&q=80",
  PARCELLE:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&q=80",
  BATIMENT:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&q=80",
  default:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&q=80",
};

// Entity type icons
const ENTITY_ICONS: Record<EntityType, React.ComponentType<any>> = {
  LOTISSEMENT: Layers,
  PARCELLE: Map,
  BATIMENT: Building2,
};

// Get listing image (primary or placeholder)
const getListingImage = (listing: Listing): string => {
  const primaryImage = getListingPrimaryImage(listing);
  if (primaryImage) return primaryImage;

  if (listing._entityType === "BATIMENT") {
    const batiment = listing as Batiment;
    if (batiment.propertyType && PLACEHOLDER_IMAGES[batiment.propertyType]) {
      return PLACEHOLDER_IMAGES[batiment.propertyType];
    }
  }

  return PLACEHOLDER_IMAGES[listing._entityType] || PLACEHOLDER_IMAGES.default;
};

// Get placeholder image
const getPlaceholderImage = (
  entityType: EntityType,
  propertyType?: PropertyType,
): string => {
  if (propertyType && PLACEHOLDER_IMAGES[propertyType]) {
    return PLACEHOLDER_IMAGES[propertyType];
  }
  return PLACEHOLDER_IMAGES[entityType] || PLACEHOLDER_IMAGES.default;
};

// Get listing status label
const getListingStatusLabel = (listing: Listing): string => {
  if (listing.listingType === "BOTH") return "Sale / Rent";
  if (listing.listingType === "SALE") return "For Sale";
  if (listing.listingType === "RENT") return "For Rent";
  return "Available";
};

// Get status color
const getStatusColor = (listing: Listing): string => {
  if (listing.listingType === "BOTH") return COLORS.primary[500];
  if (listing.listingType === "SALE") return "#22c55e";
  if (listing.listingType === "RENT") return "#3b82f6";
  return COLORS.gray[500];
};

// Get type label for display
const getTypeLabel = (listing: Listing): string => {
  if (listing._entityType === "BATIMENT") {
    const batiment = listing as Batiment;
    if (batiment.propertyType) {
      return getPropertyTypeLabel(batiment.propertyType, "en");
    }
  }
  return getEntityTypeLabel(listing._entityType, "en");
};

// Get surface area
const getSurfaceDisplay = (listing: Listing): number | null => {
  return getListingSurface(listing);
};

// =========================================================
// LOCAL TYPES & UTILITY FUNCTIONS
// =========================================================

// Property Categories array (not exported from hook)
const PropertyCategories: PropertyCategory[] = [
  "LAND",
  "RESIDENTIAL",
  "COMMERCIAL",
  "INDUSTRIAL",
  "MIXED",
];

// ListingStats interface
interface ListingStats {
  total: number;
  published: number;
  featured: number;
  forSale: number;
  forRent: number;
  byCategory: Record<string, number>;
  byEntityType: Record<EntityType, number>;
  averagePrice: number;
}

// Sort options type
type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "surface-asc"
  | "surface-desc"
  | "views-desc"
  | "favorites-desc";

// Format price compact
function formatPriceCompact(
  price: string | number | null | undefined,
  currency = "XAF",
): string {
  if (price == null || price === "") return "N/A";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice) || numPrice <= 0) return "N/A";
  if (numPrice >= 1e9) return `${(numPrice / 1e9).toFixed(1)}B`;
  if (numPrice >= 1e6) return `${(numPrice / 1e6).toFixed(0)}M`;
  if (numPrice >= 1e3) return `${(numPrice / 1e3).toFixed(0)}K`;
  return numPrice.toLocaleString("fr-CM");
}

// Calculate listing stats
function calculateListingStats(listings: Listing[]): ListingStats {
  const published = listings.filter((l) => l.listingStatus === "PUBLISHED");

  const byCategory = {
    LAND: 0,
    RESIDENTIAL: 0,
    COMMERCIAL: 0,
    INDUSTRIAL: 0,
    MIXED: 0,
  } as Record<string, number>;

  published.forEach((l) => {
    if (l.category && byCategory[l.category] !== undefined) {
      byCategory[l.category]++;
    }
  });

  const byEntityType: Record<EntityType, number> = {
    LOTISSEMENT: listings.filter((l) => l._entityType === "LOTISSEMENT").length,
    PARCELLE: listings.filter((l) => l._entityType === "PARCELLE").length,
    BATIMENT: listings.filter((l) => l._entityType === "BATIMENT").length,
  };

  const prices = published
    .map((l) => parseFloat(String(l.price || 0)))
    .filter((p) => p > 0);

  return {
    total: listings.length,
    published: published.length,
    featured: published.filter((l) => l.featured).length,
    forSale: published.filter((l) => isForSale(l)).length,
    forRent: published.filter((l) => isForRent(l)).length,
    byCategory,
    byEntityType,
    averagePrice: prices.length
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0,
  };
}

// Search listings locally
function searchListings(listings: Listing[], query: string): Listing[] {
  if (!query.trim()) return listings;
  const terms = query.toLowerCase().split(/\s+/);
  return listings.filter((listing) => {
    const searchableText = [
      listing.title,
      listing.shortDescription,
      listing.description,
      getLocationString(listing),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return terms.every((term) => searchableText.includes(term));
  });
}

// Sort listings locally
function sortListings(listings: Listing[], sortBy: SortOption): Listing[] {
  const sorted = [...listings];
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
      return sorted.sort((a, b) => {
        const priceA = parseFloat(String(a.price || 0));
        const priceB = parseFloat(String(b.price || 0));
        return priceA - priceB;
      });
    case "price-desc":
      return sorted.sort((a, b) => {
        const priceA = parseFloat(String(a.price || 0));
        const priceB = parseFloat(String(b.price || 0));
        return priceB - priceA;
      });
    case "surface-asc":
      return sorted.sort((a, b) => {
        const surfaceA = getListingSurface(a) || 0;
        const surfaceB = getListingSurface(b) || 0;
        return surfaceA - surfaceB;
      });
    case "surface-desc":
      return sorted.sort((a, b) => {
        const surfaceA = getListingSurface(a) || 0;
        const surfaceB = getListingSurface(b) || 0;
        return surfaceB - surfaceA;
      });
    case "views-desc":
      return sorted.sort((a, b) => b.viewCount - a.viewCount);
    case "favorites-desc":
      return sorted.sort((a, b) => b.favoriteCount - a.favoriteCount);
    default:
      return sorted;
  }
}

export default function AllPropertiesPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";

  // Fetch all listings
  const { listings, loading, error, refetch } = useAllListings({
    status: "PUBLISHED",
    limit: 200,
  });
  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedEntityType, setSelectedEntityType] = useState<
    EntityType | "ALL"
  >("ALL");
  const [selectedCategory, setSelectedCategory] = useState<
    PropertyCategory | "ALL"
  >("ALL");
  const [selectedPropertyType, setSelectedPropertyType] = useState<
    PropertyType | "ALL"
  >("ALL");
  const [selectedListingType, setSelectedListingType] = useState<
    ListingType | "ALL"
  >("ALL");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minBedrooms, setMinBedrooms] = useState<string>("");
  const [hasParking, setHasParking] = useState<boolean | undefined>(undefined);
  const [hasGenerator, setHasGenerator] = useState<boolean | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // View states
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Calculate stats
  const stats = useMemo(() => calculateListingStats(listings), [listings]);

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Handle listing type parameter
    const listingType = params.get("listingType");
    if (
      listingType === "SALE" ||
      listingType === "RENT" ||
      listingType === "BOTH"
    ) {
      setSelectedListingType(listingType);
    }

    // Handle entity type parameter
    const entityType = params.get("entityType");
    if (
      entityType === "LOTISSEMENT" ||
      entityType === "PARCELLE" ||
      entityType === "BATIMENT"
    ) {
      setSelectedEntityType(entityType);
    }

    // Handle category parameter
    const category = params.get("category");
    if (category && PropertyCategories.includes(category as PropertyCategory)) {
      setSelectedCategory(category as PropertyCategory);
    }

    // Handle property type parameter
    const propertyType = params.get("propertyType");
    if (propertyType && PropertyTypes.includes(propertyType as PropertyType)) {
      setSelectedPropertyType(propertyType as PropertyType);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0 && showFilters) {
      setShowFilters(false);
    }
  };

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = listings.filter((l) => l.listingStatus === "PUBLISHED");

    // Filter by entity type
    if (selectedEntityType !== "ALL") {
      result = result.filter((l) => l._entityType === selectedEntityType);
    }

    // Filter by category
    if (selectedCategory !== "ALL") {
      result = result.filter((l) => l.category === selectedCategory);
    }

    // Filter by property type (Batiment only)
    if (selectedPropertyType !== "ALL") {
      result = result.filter(
        (l) =>
          l._entityType === "BATIMENT" &&
          (l as Batiment).propertyType === selectedPropertyType,
      );
    }

    // Filter by listing type
    if (selectedListingType !== "ALL") {
      result = result.filter(
        (l) =>
          l.listingType === selectedListingType || l.listingType === "BOTH",
      );
    }

    // Filter by price
    if (minPrice) {
      const min = parseInt(minPrice);
      result = result.filter((l) => {
        const price = Number(l.price) || 0;
        return price >= min;
      });
    }
    if (maxPrice) {
      const max = parseInt(maxPrice);
      result = result.filter((l) => {
        const price = Number(l.price) || 0;
        return price <= max || price === 0;
      });
    }

    // Filter by bedrooms (Batiment only)
    if (minBedrooms) {
      const min = parseInt(minBedrooms);
      result = result.filter((l) => {
        if (l._entityType !== "BATIMENT") return true;
        const bedrooms = (l as Batiment).bedrooms || 0;
        return bedrooms >= min;
      });
    }

    // Filter by parking (Batiment only)
    if (hasParking !== undefined) {
      result = result.filter((l) => {
        if (l._entityType !== "BATIMENT") return !hasParking;
        return (l as Batiment).hasParking === hasParking;
      });
    }

    // Filter by generator (Batiment only)
    if (hasGenerator !== undefined) {
      result = result.filter((l) => {
        if (l._entityType !== "BATIMENT") return !hasGenerator;
        return (l as Batiment).hasGenerator === hasGenerator;
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      result = searchListings(result, searchQuery);
    }

    // Apply sort
    result = sortListings(result, sortBy);

    return result;
  }, [
    listings,
    searchQuery,
    selectedEntityType,
    selectedCategory,
    selectedPropertyType,
    selectedListingType,
    minPrice,
    maxPrice,
    minBedrooms,
    hasParking,
    hasGenerator,
    sortBy,
  ]);

  // Entity types for filter
  const entityTypes: (EntityType | "ALL")[] = [
    "ALL",
    "BATIMENT",
    "PARCELLE",
    "LOTISSEMENT",
  ];

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedEntityType("ALL");
    setSelectedCategory("ALL");
    setSelectedPropertyType("ALL");
    setSelectedListingType("ALL");
    setMinPrice("");
    setMaxPrice("");
    setMinBedrooms("");
    setHasParking(undefined);
    setHasGenerator(undefined);
    setSearchQuery("");
    setSortBy("newest");
    setShowFilters(false);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedEntityType !== "ALL" ||
      selectedCategory !== "ALL" ||
      selectedPropertyType !== "ALL" ||
      selectedListingType !== "ALL" ||
      minPrice !== "" ||
      maxPrice !== "" ||
      minBedrooms !== "" ||
      hasParking !== undefined ||
      hasGenerator !== undefined
    );
  }, [
    selectedEntityType,
    selectedCategory,
    selectedPropertyType,
    selectedListingType,
    minPrice,
    maxPrice,
    minBedrooms,
    hasParking,
    hasGenerator,
  ]);

  const hasSearchQuery = searchQuery.trim() !== "";

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: COLORS.gray[900] }}
      >
        <div className="text-center">
          <Home
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: COLORS.primary[600] }}
          />
          <p className="text-xl text-white mb-2">Error loading listings</p>
          <p style={{ color: COLORS.primary[400] }}>{error}</p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: GRADIENTS.button.primary }}
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Render listing features
  const renderListingFeatures = (listing: Listing) => {
    if (listing._entityType === "BATIMENT") {
      const batiment = listing as Batiment;
      return (
        <>
          {batiment.bedrooms !== null && batiment.bedrooms > 0 && (
            <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
              <Bed className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {batiment.bedrooms}
            </span>
          )}
          {batiment.bathrooms !== null && batiment.bathrooms > 0 && (
            <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
              <Bath className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
              {batiment.bathrooms}
            </span>
          )}
          {batiment.hasParking && (
            <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
              <Car className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </span>
          )}
        </>
      );
    } else if (listing._entityType === "LOTISSEMENT") {
      const lotissement = listing as Lotissement;
      return (
        <>
          {lotissement.Nbre_lots && (
            <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
              <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
              {lotissement.Nbre_lots}
            </span>
          )}
          {lotissement.hasElectricity && (
            <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
              <Power className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </span>
          )}
          {lotissement.hasWater && (
            <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
              <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </span>
          )}
        </>
      );
    } else if (listing._entityType === "PARCELLE") {
      const parcelle = listing as Parcelle;
      return (
        <>
          {parcelle.approvedForBuilding && (
            <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Ready
            </span>
          )}
          {parcelle.Cloture && (
            <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
              Fenced
            </span>
          )}
        </>
      );
    }
    return null;
  };

  // Render grid card
  const renderGridCard = (listing: Listing, index: number) => {
    const EntityIcon = ENTITY_ICONS[listing._entityType];
    const surface = getSurfaceDisplay(listing);

    return (
      <motion.div
        key={`${listing._entityType}-${getListingId(listing)}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        whileHover={{ y: -8, scale: 1.02 }}
      >
        <Link
          href={getListingUrl(listing)}
          className="group block rounded-2xl shadow-xl border overflow-hidden transition-all"
          style={{
            background: `${COLORS.primary[800]}60`,
            borderColor: `${COLORS.primary[600]}40`,
          }}
        >
          <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
            <img
              src={getListingImage(listing)}
              alt={listing.title || "Listing"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage(
                  listing._entityType,
                  listing._entityType === "BATIMENT"
                    ? (listing as Batiment).propertyType || undefined
                    : undefined,
                );
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Status badges */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2 flex-wrap">
              <span
                className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm"
                style={{
                  background: getStatusColor(listing),
                  color: COLORS.white,
                }}
              >
                {getListingStatusLabel(listing)}
              </span>
              {listing.featured && (
                <span
                  className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm flex items-center gap-1"
                  style={{
                    background: COLORS.yellow[500],
                    color: COLORS.gray[900],
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden xs:inline">Featured</span>
                </span>
              )}
            </div>

            {/* Entity type badge */}
            <div className="absolute top-2 sm:top-3 right-12 sm:right-14">
              <span
                className="px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium backdrop-blur-sm flex items-center gap-1"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  color: COLORS.white,
                }}
              >
                <EntityIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {getEntityTypeLabel(listing._entityType, "en")}
              </span>
            </div>

            {/* Action buttons */}
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2">
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
              >
                <Heart
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  style={{ color: COLORS.gray[700] }}
                />
              </motion.button>
            </div>

            {/* Feature badges */}
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2 flex-wrap">
              {renderListingFeatures(listing)}
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-5">
            {/* Type badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
              <span
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium flex items-center gap-1"
                style={{
                  background: `${COLORS.primary[500]}30`,
                  color: COLORS.primary[200],
                }}
              >
                <EntityIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {getTypeLabel(listing)}
              </span>
              {listing.category && (
                <span
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium"
                  style={{
                    background: `${COLORS.emerald[500]}30`,
                    color: COLORS.emerald[300],
                  }}
                >
                  {getCategoryLabel(listing.category, "en")}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-green-300 transition">
              {listing.title || "Untitled Listing"}
            </h3>

            {/* Location */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-3 sm:mb-4"
              style={{ color: COLORS.primary[300] }}
            >
              <MapPin
                className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                style={{ color: COLORS.primary[400] }}
              />
              <span className="truncate">{getLocationString(listing)}</span>
            </div>

            {/* Price and area */}
            <div
              className="flex items-center justify-between pt-3 sm:pt-4 border-t"
              style={{ borderColor: `${COLORS.primary[600]}40` }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Square
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  style={{ color: COLORS.primary[400] }}
                />
                <span className="font-semibold text-xs sm:text-sm text-white">
                  {formatArea(surface)}
                </span>
              </div>
              <div className="text-right">
                {listing.price && Number(listing.price) > 0 ? (
                  <p
                    className="text-sm sm:text-base md:text-lg font-bold"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {formatPriceCompact(listing.price, listing.currency)}
                  </p>
                ) : listing._entityType === "BATIMENT" &&
                  (listing as Batiment).rentPrice &&
                  Number((listing as Batiment).rentPrice) > 0 ? (
                  <p
                    className="text-sm sm:text-base md:text-lg font-bold"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {formatPriceCompact(
                      (listing as Batiment).rentPrice,
                      listing.currency,
                    )}
                    /mo
                  </p>
                ) : (
                  <p
                    className="text-xs sm:text-sm font-semibold"
                    style={{ color: COLORS.primary[400] }}
                  >
                    Prix sur demande
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // Render list card
  const renderListCard = (listing: Listing, index: number) => {
    const EntityIcon = ENTITY_ICONS[listing._entityType];
    const surface = getSurfaceDisplay(listing);

    return (
      <motion.div
        key={`${listing._entityType}-${getListingId(listing)}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        whileHover={{ x: 8 }}
      >
        <Link
          href={getListingUrl(listing)}
          className="group flex flex-col sm:flex-row rounded-2xl shadow-xl border overflow-hidden transition-all"
          style={{
            background: `${COLORS.primary[800]}60`,
            borderColor: `${COLORS.primary[600]}40`,
          }}
        >
          {/* Image */}
          <div className="relative w-full sm:w-48 md:w-64 lg:w-72 xl:w-80 h-48 sm:h-auto flex-shrink-0">
            <img
              src={getListingImage(listing)}
              alt={listing.title || "Listing"}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage(listing._entityType);
              }}
            />
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2 flex-wrap">
              <span
                className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm"
                style={{
                  background: getStatusColor(listing),
                  color: COLORS.white,
                }}
              >
                {getListingStatusLabel(listing)}
              </span>
              {listing.featured && (
                <span
                  className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm flex items-center gap-1"
                  style={{
                    background: COLORS.yellow[500],
                    color: COLORS.gray[900],
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </span>
              )}
            </div>
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium backdrop-blur-sm flex items-center gap-1"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  color: COLORS.white,
                }}
              >
                <EntityIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {getEntityTypeLabel(listing._entityType, "en")}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 md:p-6">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span
                  className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1"
                  style={{
                    background: `${COLORS.primary[500]}30`,
                    color: COLORS.primary[200],
                  }}
                >
                  <EntityIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {getTypeLabel(listing)}
                </span>
                {listing.category && (
                  <span
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium"
                    style={{
                      background: `${COLORS.emerald[500]}30`,
                      color: COLORS.emerald[300],
                    }}
                  >
                    {getCategoryLabel(listing.category, "en")}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition"
                  style={{ background: `${COLORS.white}10` }}
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition"
                  style={{ background: `${COLORS.white}10` }}
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1.5 sm:mb-2 group-hover:text-green-300 transition line-clamp-1 sm:line-clamp-none">
              {listing.title || "Untitled Listing"}
            </h3>

            {/* Short description */}
            {listing.shortDescription && (
              <p
                className="text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2"
                style={{ color: COLORS.primary[300] }}
              >
                {listing.shortDescription}
              </p>
            )}

            {/* Location */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4"
              style={{ color: COLORS.primary[300] }}
            >
              <MapPin
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                style={{ color: COLORS.primary[400] }}
              />
              <span className="text-xs sm:text-sm truncate">
                {getLocationString(listing)}
              </span>
            </div>

            {/* Stats row */}
            <div
              className="flex items-center gap-3 sm:gap-4 md:gap-6 pt-3 sm:pt-4 border-t flex-wrap"
              style={{ borderColor: `${COLORS.primary[600]}40` }}
            >
              {surface && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Square
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ color: COLORS.primary[400] }}
                  />
                  <div>
                    <p
                      className="text-[10px] sm:text-xs"
                      style={{ color: COLORS.primary[400] }}
                    >
                      Area
                    </p>
                    <p className="font-semibold text-xs sm:text-sm text-white">
                      {formatArea(surface)}
                    </p>
                  </div>
                </div>
              )}

              {/* Entity-specific stats */}
              {listing._entityType === "BATIMENT" && (
                <>
                  {(listing as Batiment).bedrooms !== null &&
                    (listing as Batiment).bedrooms! > 0 && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Bed
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          style={{ color: COLORS.primary[400] }}
                        />
                        <div>
                          <p
                            className="text-[10px] sm:text-xs"
                            style={{ color: COLORS.primary[400] }}
                          >
                            Beds
                          </p>
                          <p className="font-semibold text-xs sm:text-sm text-white">
                            {(listing as Batiment).bedrooms}
                          </p>
                        </div>
                      </div>
                    )}
                  {(listing as Batiment).bathrooms !== null &&
                    (listing as Batiment).bathrooms! > 0 && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Bath
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          style={{ color: COLORS.primary[400] }}
                        />
                        <div>
                          <p
                            className="text-[10px] sm:text-xs"
                            style={{ color: COLORS.primary[400] }}
                          >
                            Baths
                          </p>
                          <p className="font-semibold text-xs sm:text-sm text-white">
                            {(listing as Batiment).bathrooms}
                          </p>
                        </div>
                      </div>
                    )}
                  <div className="hidden sm:flex items-center gap-2">
                    {(listing as Batiment).hasParking && (
                      <div className="flex items-center gap-1">
                        <Car
                          className="w-4 h-4"
                          style={{ color: COLORS.primary[400] }}
                        />
                        <span className="text-xs text-white">P</span>
                      </div>
                    )}
                    {(listing as Batiment).hasGenerator && (
                      <div className="flex items-center gap-1">
                        <Zap
                          className="w-4 h-4"
                          style={{ color: COLORS.primary[400] }}
                        />
                        <span className="text-xs text-white">G</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {listing._entityType === "LOTISSEMENT" && (
                <>
                  {(listing as Lotissement).Nbre_lots && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Layers
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p
                          className="text-[10px] sm:text-xs"
                          style={{ color: COLORS.primary[400] }}
                        >
                          Lots
                        </p>
                        <p className="font-semibold text-xs sm:text-sm text-white">
                          {(listing as Lotissement).Nbre_lots}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="hidden sm:flex items-center gap-2">
                    {(listing as Lotissement).hasElectricity && (
                      <Power
                        className="w-4 h-4"
                        style={{ color: COLORS.primary[400] }}
                      />
                    )}
                    {(listing as Lotissement).hasWater && (
                      <Droplets
                        className="w-4 h-4"
                        style={{ color: COLORS.primary[400] }}
                      />
                    )}
                    {(listing as Lotissement).hasRoadAccess && (
                      <Route
                        className="w-4 h-4"
                        style={{ color: COLORS.primary[400] }}
                      />
                    )}
                  </div>
                </>
              )}

              {/* Price */}
              <div className="ml-auto text-right">
                <p
                  className="text-[10px] sm:text-xs"
                  style={{ color: COLORS.primary[400] }}
                >
                  {listing.listingType === "RENT" ? "Rent" : "Price"}
                </p>
                {listing.price && Number(listing.price) > 0 ? (
                  <p
                    className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {formatPriceCompact(listing.price, listing.currency)}
                  </p>
                ) : listing._entityType === "BATIMENT" &&
                  (listing as Batiment).rentPrice &&
                  Number((listing as Batiment).rentPrice) > 0 ? (
                  <p
                    className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {formatPriceCompact(
                      (listing as Batiment).rentPrice,
                      listing.currency,
                    )}
                    /mo
                  </p>
                ) : (
                  <p
                    className="text-sm sm:text-base md:text-lg font-semibold"
                    style={{ color: COLORS.primary[400] }}
                  >
                    Prix sur demande
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // Render map sidebar item
  const renderMapSidebarItem = (listing: Listing, index: number) => {
    const EntityIcon = ENTITY_ICONS[listing._entityType];

    return (
      <Link
        key={`${listing._entityType}-${getListingId(listing)}`}
        href={getListingUrl(listing)}
        className="block p-3 sm:p-4 transition hover:bg-white/5"
      >
        <div className="flex gap-2 sm:gap-3">
          <img
            src={getListingImage(listing)}
            alt={listing.title || "Listing"}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getPlaceholderImage(listing._entityType);
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span
                className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-medium"
                style={{
                  background: getStatusColor(listing),
                  color: COLORS.white,
                }}
              >
                {getListingStatusLabel(listing)}
              </span>
              <span
                className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-medium flex items-center gap-1"
                style={{
                  background: `${COLORS.primary[500]}30`,
                  color: COLORS.primary[200],
                }}
              >
                <EntityIcon className="w-2.5 h-2.5" />
                {getEntityTypeLabel(listing._entityType, "en")}
              </span>
            </div>
            <p className="font-semibold text-xs sm:text-sm text-white truncate mb-1">
              {listing.title || "Untitled Listing"}
            </p>
            <p
              className="text-[10px] sm:text-xs truncate mb-1 sm:mb-2"
              style={{ color: COLORS.primary[300] }}
            >
              {getLocationString(listing)}
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-medium"
                style={{
                  background: `${COLORS.primary[500]}30`,
                  color: COLORS.primary[200],
                }}
              >
                {getTypeLabel(listing)}
              </span>
              {getSurfaceDisplay(listing) && (
                <span
                  className="text-[10px] sm:text-xs"
                  style={{ color: COLORS.primary[400] }}
                >
                  {formatArea(getSurfaceDisplay(listing))}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: COLORS.gray[900] }}>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 backdrop-blur-lg border-b"
        style={{
          background: GRADIENTS.background.hero,
          borderColor: `${COLORS.primary[700]}4D`,
        }}
      >
        {/* Top stats bar */}
        <div
          className="hidden sm:block border-b"
          style={{
            background: `${COLORS.primary[950]}80`,
            borderColor: `${COLORS.primary[700]}80`,
          }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm text-white">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Home
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                    style={{ color: COLORS.yellow[400] }}
                  />
                  <span>
                    <strong style={{ color: COLORS.yellow[400] }}>
                      {stats.published}
                    </strong>{" "}
                    <span className="hidden md:inline">Listings</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Building2
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                    style={{ color: "#22c55e" }}
                  />
                  <span>
                    <strong style={{ color: "#22c55e" }}>
                      {stats.byEntityType?.BATIMENT || 0}
                    </strong>{" "}
                    <span className="hidden lg:inline">Properties</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Map
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                    style={{ color: "#3b82f6" }}
                  />
                  <span>
                    <strong style={{ color: "#3b82f6" }}>
                      {stats.byEntityType?.PARCELLE || 0}
                    </strong>{" "}
                    <span className="hidden lg:inline">Lands</span>
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-1 sm:gap-1.5">
                  <Layers
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                    style={{ color: "#a855f7" }}
                  />
                  <span>
                    <strong style={{ color: "#a855f7" }}>
                      {stats.byEntityType?.LOTISSEMENT || 0}
                    </strong>{" "}
                    <span className="hidden lg:inline">Estates</span>
                  </span>
                </div>
                {stats.featured > 0 && (
                  <div className="hidden lg:flex items-center gap-1.5">
                    <Sparkles
                      className="w-4 h-4"
                      style={{ color: COLORS.yellow[400] }}
                    />
                    <span>
                      <strong style={{ color: COLORS.yellow[400] }}>
                        {stats.featured}
                      </strong>{" "}
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <span className="hidden xl:inline opacity-80">
                  📍 Yaoundé, Cameroon
                </span>
                <span className="opacity-80 whitespace-nowrap">
                  📞 +237 677 212 279
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 py-2 sm:py-3 md:py-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center cursor-pointer"
              >
                <div className="relative w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-14 lg:w-28 lg:h-14 flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Earth Design Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </motion.div>
            </Link>

            {/* Search bar */}
            <div className="hidden sm:flex flex-1 max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-2 md:mx-4 items-center gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5"
                  style={{ color: COLORS.primary[600] }}
                />
                <input
                  type="text"
                  placeholder="Search properties, lands, estates..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-9 sm:pl-10 md:pl-12 lg:pl-14 pr-10 py-2 sm:py-2.5 md:py-3 lg:py-3.5 rounded-full text-sm md:text-base shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={{
                    background: COLORS.white,
                    color: COLORS.gray[900],
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition"
                  >
                    <X
                      className="w-3.5 h-3.5 md:w-4 md:h-4"
                      style={{ color: COLORS.gray[400] }}
                    />
                  </button>
                )}
              </div>

              {/* Filter button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="hidden md:flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 md:py-2.5 lg:py-3 border-2 rounded-xl font-medium transition text-sm lg:text-base"
                style={{
                  borderColor: showFilters
                    ? COLORS.primary[400]
                    : COLORS.primary[500],
                  color: COLORS.white,
                  background: showFilters
                    ? `${COLORS.primary[500]}30`
                    : "transparent",
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden lg:inline">Filters</span>
                {hasActiveFilters && (
                  <span
                    className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full"
                    style={{ background: COLORS.primary[400] }}
                  />
                )}
                <motion.div animate={{ rotate: showFilters ? 180 : 0 }}>
                  <ChevronDown className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </motion.div>
              </motion.button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              {/* Mobile search toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="sm:hidden flex items-center justify-center w-9 h-9 bg-white/10 rounded-full hover:bg-white/20 transition"
              >
                <Search className="w-4 h-4 text-white" />
              </motion.button>

              {/* Mobile filter toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-white/20 transition relative"
                style={{
                  background: showFilters
                    ? `${COLORS.primary[500]}30`
                    : `${COLORS.white}10`,
                }}
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                {hasActiveFilters && (
                  <span
                    className="absolute top-1 right-1 w-2 h-2 rounded-full"
                    style={{ background: COLORS.primary[400] }}
                  />
                )}
              </motion.button>

              {/* Home button */}
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden md:flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl font-semibold text-white transition text-sm lg:text-base"
                  style={{ background: `${COLORS.white}15` }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden lg:inline">Home</span>
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Mobile search bar */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden pb-3"
              >
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: COLORS.primary[600] }}
                  />
                  <input
                    type="text"
                    placeholder="Search properties, lands, estates..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 rounded-full text-sm shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{
                      background: COLORS.white,
                      color: COLORS.gray[900],
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition"
                    >
                      <X
                        className="w-4 h-4"
                        style={{ color: COLORS.gray[400] }}
                      />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile stats bar */}
        <div
          className="sm:hidden border-t"
          style={{
            background: `${COLORS.primary[950]}80`,
            borderColor: `${COLORS.primary[700]}80`,
          }}
        >
          <div className="max-w-7xl mx-auto px-3">
            <div className="flex items-center justify-between py-1.5 text-[10px] text-white">
              <div className="flex items-center gap-3">
                <span>
                  <strong style={{ color: COLORS.yellow[400] }}>
                    {stats.published}
                  </strong>{" "}
                  Listings
                </span>
                <span>
                  <strong style={{ color: "#22c55e" }}>
                    {stats.byEntityType?.BATIMENT || 0}
                  </strong>{" "}
                  Props
                </span>
                <span>
                  <strong style={{ color: "#3b82f6" }}>
                    {stats.byEntityType?.PARCELLE || 0}
                  </strong>{" "}
                  Lands
                </span>
              </div>
              <span className="opacity-80">📞 +237 677...</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filters Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${COLORS.primary[900]} 0%, ${COLORS.gray[900]} 100%)`,
            }}
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 md:p-5 lg:p-6 border"
                style={{
                  background: `${COLORS.primary[800]}80`,
                  borderColor: `${COLORS.primary[600]}40`,
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white flex items-center gap-2">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                    Filter Listings
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowFilters(false)}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                  {/* Entity Type */}
                  <div>
                    <label
                      className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                      style={{ color: COLORS.primary[200] }}
                    >
                      Type
                    </label>
                    <select
                      value={selectedEntityType}
                      onChange={(e) =>
                        setSelectedEntityType(
                          e.target.value as EntityType | "ALL",
                        )
                      }
                      className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 transition"
                      style={{
                        background: `${COLORS.primary[700]}80`,
                        color: COLORS.white,
                        borderColor: `${COLORS.primary[500]}40`,
                      }}
                    >
                      {entityTypes.map((t) => (
                        <option
                          key={t}
                          value={t}
                          style={{ background: COLORS.primary[900] }}
                        >
                          {t === "ALL"
                            ? "All Types"
                            : getEntityTypeLabel(t, "en")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                      style={{ color: COLORS.primary[200] }}
                    >
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) =>
                        setSelectedCategory(
                          e.target.value as PropertyCategory | "ALL",
                        )
                      }
                      className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 transition"
                      style={{
                        background: `${COLORS.primary[700]}80`,
                        color: COLORS.white,
                        borderColor: `${COLORS.primary[500]}40`,
                      }}
                    >
                      <option
                        value="ALL"
                        style={{ background: COLORS.primary[900] }}
                      >
                        All Categories
                      </option>
                      {PropertyCategories.map((c) => (
                        <option
                          key={c}
                          value={c}
                          style={{ background: COLORS.primary[900] }}
                        >
                          {getCategoryLabel(c, "en")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Listing Type */}
                  <div>
                    <label
                      className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                      style={{ color: COLORS.primary[200] }}
                    >
                      Status
                    </label>
                    <select
                      value={selectedListingType}
                      onChange={(e) =>
                        setSelectedListingType(
                          e.target.value as ListingType | "ALL",
                        )
                      }
                      className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 transition"
                      style={{
                        background: `${COLORS.primary[700]}80`,
                        color: COLORS.white,
                        borderColor: `${COLORS.primary[500]}40`,
                      }}
                    >
                      <option
                        value="ALL"
                        style={{ background: COLORS.primary[900] }}
                      >
                        All
                      </option>
                      <option
                        value="SALE"
                        style={{ background: COLORS.primary[900] }}
                      >
                        For Sale
                      </option>
                      <option
                        value="RENT"
                        style={{ background: COLORS.primary[900] }}
                      >
                        For Rent
                      </option>
                    </select>
                  </div>

                  {/* Property Type (only for Batiment) */}
                  {(selectedEntityType === "ALL" ||
                    selectedEntityType === "BATIMENT") && (
                    <div>
                      <label
                        className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                        style={{ color: COLORS.primary[200] }}
                      >
                        Property Type
                      </label>
                      <select
                        value={selectedPropertyType}
                        onChange={(e) =>
                          setSelectedPropertyType(
                            e.target.value as PropertyType | "ALL",
                          )
                        }
                        className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 transition"
                        style={{
                          background: `${COLORS.primary[700]}80`,
                          color: COLORS.white,
                          borderColor: `${COLORS.primary[500]}40`,
                        }}
                      >
                        <option
                          value="ALL"
                          style={{ background: COLORS.primary[900] }}
                        >
                          All
                        </option>
                        {PropertyTypes.map((t) => (
                          <option
                            key={t}
                            value={t}
                            style={{ background: COLORS.primary[900] }}
                          >
                            {getPropertyTypeLabel(t, "en")}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Min Price */}
                  <div>
                    <label
                      className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                      style={{ color: COLORS.primary[200] }}
                    >
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 transition"
                      style={{
                        background: `${COLORS.primary[700]}80`,
                        color: COLORS.white,
                        borderColor: `${COLORS.primary[500]}40`,
                      }}
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label
                      className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                      style={{ color: COLORS.primary[200] }}
                    >
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 transition"
                      style={{
                        background: `${COLORS.primary[700]}80`,
                        color: COLORS.white,
                        borderColor: `${COLORS.primary[500]}40`,
                      }}
                    />
                  </div>

                  {/* Min Bedrooms (only for Batiment) */}
                  {(selectedEntityType === "ALL" ||
                    selectedEntityType === "BATIMENT") && (
                    <div>
                      <label
                        className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                        style={{ color: COLORS.primary[200] }}
                      >
                        Bedrooms
                      </label>
                      <select
                        value={minBedrooms}
                        onChange={(e) => setMinBedrooms(e.target.value)}
                        className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 transition"
                        style={{
                          background: `${COLORS.primary[700]}80`,
                          color: COLORS.white,
                          borderColor: `${COLORS.primary[500]}40`,
                        }}
                      >
                        <option
                          value=""
                          style={{ background: COLORS.primary[900] }}
                        >
                          Any
                        </option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option
                            key={n}
                            value={n}
                            style={{ background: COLORS.primary[900] }}
                          >
                            {n}+
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Sort By */}
                  <div>
                    <label
                      className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                      style={{ color: COLORS.primary[200] }}
                    >
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 transition"
                      style={{
                        background: `${COLORS.primary[700]}80`,
                        color: COLORS.white,
                        borderColor: `${COLORS.primary[500]}40`,
                      }}
                    >
                      <option
                        value="newest"
                        style={{ background: COLORS.primary[900] }}
                      >
                        Newest
                      </option>
                      <option
                        value="oldest"
                        style={{ background: COLORS.primary[900] }}
                      >
                        Oldest
                      </option>
                      <option
                        value="price-asc"
                        style={{ background: COLORS.primary[900] }}
                      >
                        Price ↑
                      </option>
                      <option
                        value="price-desc"
                        style={{ background: COLORS.primary[900] }}
                      >
                        Price ↓
                      </option>
                      <option
                        value="views-desc"
                        style={{ background: COLORS.primary[900] }}
                      >
                        Most Viewed
                      </option>
                    </select>
                  </div>
                </div>

                {/* Amenities & Actions */}
                <div
                  className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t"
                  style={{ borderColor: `${COLORS.primary[600]}40` }}
                >
                  {(selectedEntityType === "ALL" ||
                    selectedEntityType === "BATIMENT") && (
                    <>
                      <button
                        onClick={() =>
                          setHasParking(hasParking === true ? undefined : true)
                        }
                        className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        style={{
                          background: hasParking
                            ? GRADIENTS.button.primary
                            : `${COLORS.primary[700]}80`,
                          color: COLORS.white,
                        }}
                      >
                        <Car className="w-3 h-3 sm:w-4 sm:h-4" />
                        Parking
                      </button>
                      <button
                        onClick={() =>
                          setHasGenerator(
                            hasGenerator === true ? undefined : true,
                          )
                        }
                        className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        style={{
                          background: hasGenerator
                            ? GRADIENTS.button.primary
                            : `${COLORS.primary[700]}80`,
                          color: COLORS.white,
                        }}
                      >
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                        Generator
                      </button>
                    </>
                  )}

                  <div className="flex gap-1.5 sm:gap-2 ml-auto">
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        style={{
                          background: `${COLORS.primary[500]}30`,
                          color: COLORS.primary[300],
                        }}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      style={{
                        background: GRADIENTS.button.primary,
                        color: COLORS.white,
                      }}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <p className="text-sm sm:text-base md:text-lg font-semibold text-white">
              {filteredListings.length}{" "}
              {filteredListings.length === 1 ? "Listing" : "Listings"}
            </p>

            {/* Show active search query */}
            {hasSearchQuery && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] sm:text-xs md:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                style={{
                  color: COLORS.primary[200],
                  background: `${COLORS.primary[500]}20`,
                  border: `1px solid ${COLORS.primary[500]}40`,
                }}
              >
                <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3" />"{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1 hover:bg-white/10 rounded-full p-0.5"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </motion.span>
            )}

            {/* Show active entity type filter */}
            {selectedEntityType !== "ALL" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] sm:text-xs md:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1"
                style={{
                  color: COLORS.primary[200],
                  background: `${COLORS.primary[500]}20`,
                  border: `1px solid ${COLORS.primary[500]}40`,
                }}
              >
                {(() => {
                  const Icon = ENTITY_ICONS[selectedEntityType];
                  return <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
                })()}
                {getEntityTypeLabel(selectedEntityType, "en")}
                <button
                  onClick={() => setSelectedEntityType("ALL")}
                  className="ml-1 hover:bg-white/10 rounded-full p-0.5"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </motion.span>
            )}

            {/* Show active filters indicator */}
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="text-[10px] sm:text-xs md:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full transition flex items-center gap-1"
                style={{
                  color: COLORS.primary[300],
                  background: `${COLORS.primary[500]}20`,
                }}
              >
                <Filter className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Clear filters
                <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </motion.button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Entity type quick filters */}
            <div className="hidden lg:flex items-center gap-1 mr-2">
              {entityTypes.map((type) => {
                const isActive = selectedEntityType === type;
                const Icon =
                  type === "ALL" ? Sparkles : ENTITY_ICONS[type as EntityType];
                return (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedEntityType(type)}
                    className="px-2 py-1 rounded-lg font-medium transition flex items-center gap-1 text-xs"
                    style={{
                      background: isActive
                        ? GRADIENTS.button.primary
                        : `${COLORS.white}10`,
                      color: COLORS.white,
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {type === "ALL"
                      ? "All"
                      : getEntityTypeLabel(type as EntityType, "en")}
                  </motion.button>
                );
              })}
            </div>

            {/* View mode buttons */}
            {[
              { mode: "grid" as const, icon: Grid3x3, label: "Grid" },
              { mode: "list" as const, icon: List, label: "List" },
              { mode: "map" as const, icon: MapIcon, label: "Map" },
            ].map(({ mode, icon: Icon, label }) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(mode)}
                className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                style={{
                  background:
                    viewMode === mode
                      ? GRADIENTS.button.primary
                      : `${COLORS.white}10`,
                  color: COLORS.white,
                }}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Entity type tabs (mobile) */}
        <div className="lg:hidden flex overflow-x-auto gap-2 mb-4 pb-2 -mx-3 px-3 scrollbar-hide">
          {entityTypes.map((type) => {
            const isActive = selectedEntityType === type;
            const Icon =
              type === "ALL" ? Sparkles : ENTITY_ICONS[type as EntityType];
            const count =
              type === "ALL"
                ? stats.published
                : stats.byEntityType?.[type as EntityType] || 0;
            return (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedEntityType(type)}
                className="flex-shrink-0 px-3 py-2 rounded-xl font-medium transition flex items-center gap-2 text-xs"
                style={{
                  background: isActive
                    ? GRADIENTS.button.primary
                    : `${COLORS.white}10`,
                  color: COLORS.white,
                  border: isActive
                    ? "none"
                    : `1px solid ${COLORS.primary[600]}40`,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {type === "ALL"
                  ? "All"
                  : getEntityTypeLabel(type as EntityType, "en")}
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px]"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.2)"
                      : `${COLORS.primary[500]}30`,
                  }}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Listings display */}
        {loading ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <Loader2
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 animate-spin mx-auto mb-3 sm:mb-4"
              style={{ color: COLORS.primary[400] }}
            />
            <p
              className="text-sm sm:text-base"
              style={{ color: COLORS.primary[300] }}
            >
              Loading listings...
            </p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <Home
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4"
              style={{ color: COLORS.primary[600] }}
            />
            <p
              className="text-base sm:text-lg md:text-xl mb-2"
              style={{ color: COLORS.primary[200] }}
            >
              No listings found
            </p>
            <p
              className="text-sm sm:text-base"
              style={{ color: COLORS.primary[400] }}
            >
              Try adjusting your search or filters
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base"
              style={{ background: GRADIENTS.button.primary }}
            >
              Clear All Filters
            </motion.button>
          </div>
        ) : viewMode === "map" ? (
          // Map view
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl sm:rounded-2xl shadow-xl border overflow-hidden"
            style={{
              background: `${COLORS.primary[800]}40`,
              borderColor: `${COLORS.primary[600]}40`,
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[60vh] sm:h-[70vh] lg:h-[calc(100vh-300px)]">
              <div
                className="lg:col-span-2 relative"
                style={{ background: `${COLORS.primary[900]}80` }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="text-center">
                    <MapPin
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4"
                      style={{ color: COLORS.primary[500] }}
                    />
                    <p className="font-medium mb-2 text-white text-sm sm:text-base">
                      Interactive Map View
                    </p>
                    <p
                      className="text-xs sm:text-sm max-w-md"
                      style={{ color: COLORS.primary[300] }}
                    >
                      Map integration coming soon.
                    </p>
                    <div
                      className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm"
                      style={{ color: COLORS.primary[400] }}
                    >
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{filteredListings.length} listings</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="border-t lg:border-t-0 lg:border-l overflow-y-auto"
                style={{
                  background: `${COLORS.primary[900]}90`,
                  borderColor: `${COLORS.primary[600]}40`,
                }}
              >
                <div
                  className="p-3 sm:p-4 border-b sticky top-0"
                  style={{
                    background: `${COLORS.primary[800]}60`,
                    borderColor: `${COLORS.primary[600]}40`,
                  }}
                >
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    Listings
                  </h3>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {filteredListings.length} results
                  </p>
                </div>
                <div
                  className="divide-y"
                  style={{ borderColor: `${COLORS.primary[700]}40` }}
                >
                  {filteredListings
                    .slice(0, 20)
                    .map((listing, index) =>
                      renderMapSidebarItem(listing, index),
                    )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : viewMode === "grid" ? (
          // Grid view
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredListings.map((listing, index) =>
              renderGridCard(listing, index),
            )}
          </div>
        ) : (
          // List view
          <div className="space-y-3 sm:space-y-4">
            {filteredListings.map((listing, index) =>
              renderListCard(listing, index),
            )}
          </div>
        )}

        {/* Load more / Pagination */}
        {filteredListings.length > 0 && filteredListings.length >= 20 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8 sm:mt-10 md:mt-12"
          >
            <p className="text-sm mb-4" style={{ color: COLORS.primary[400] }}>
              Showing {filteredListings.length} listings
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: GRADIENTS.button.primary }}
            >
              Refresh Listings
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* CTA Section */}
      <section
        className="py-10 sm:py-12 md:py-16"
        style={{
          background: GRADIENTS.background.hero,
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto"
              style={{ color: COLORS.primary[200] }}
            >
              Our team of experts is ready to help you find the perfect
              property, land, or estate
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold transition shadow-lg text-sm sm:text-base"
                  style={{
                    background: COLORS.white,
                    color: COLORS.primary[700],
                  }}
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  Contact Us
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold text-white transition text-sm sm:text-base"
                  style={{
                    background: `${COLORS.primary[700]}80`,
                    border: `2px solid ${COLORS.primary[500]}`,
                  }}
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  Back to Home
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
