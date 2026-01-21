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
} from "lucide-react";
import {
  useProperties,
  searchProperties,
  filterProperties,
  sortProperties,
  calculateStats,
  formatPrice,
  formatPriceCompact,
  getPropertyImages,
  getPropertyLocation,
  formatArea,
  Property,
  PropertyType,
  PropertyTypes,
  PropertyFilters,
  SortOption,
  PropertyStats,
} from "@/lib/hooks/useProperties";
import Footer from "@/components/Footer";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";

// Placeholder images by property type
const PLACEHOLDER_IMAGES: Record<PropertyType | "default", string> = {
  Villa:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&q=80",
  Apartment:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&q=80",
  Land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&q=80",
  Commercial:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80",
  Building:
    "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop&q=80",
  House:
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&q=80",
  Office:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
  Studio:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80",
  Duplex:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80",
  default:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&q=80",
};

// Property type icons
const TYPE_ICONS: Record<PropertyType, React.ComponentType<any>> = {
  Apartment: Building2,
  House: Home,
  Villa: Home,
  Office: Building2,
  Commercial: Building2,
  Land: TreePine,
  Building: Building2,
  Studio: Home,
  Duplex: Home,
};

// Get property status
const getPropertyStatus = (property: Property): string => {
  if (property.forSale && property.forRent) return "Sale / Rent";
  if (property.forSale) return "For Sale";
  if (property.forRent) return "For Rent";
  return "Available";
};

// Get status color
const getStatusColor = (property: Property): string => {
  if (property.forSale && property.forRent) return COLORS.primary[500];
  if (property.forSale) return "#22c55e";
  if (property.forRent) return "#3b82f6";
  return COLORS.gray[500];
};

// Get first available image
const getPropertyImage = (property: Property): string => {
  const images = getPropertyImages(property);
  return images.length > 0
    ? images[0]
    : PLACEHOLDER_IMAGES[property.type] || PLACEHOLDER_IMAGES.default;
};

// Get placeholder image by type
const getPlaceholderImage = (type: PropertyType): string => {
  return PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.default;
};

export default function AllPropertiesPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";

  const { properties, loading, error } = useProperties();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<PropertyType | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<
    "All" | "For Sale" | "For Rent"
  >("All");
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
  const [showFilters, setShowFilters] = useState(false); // Hidden by default
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Calculate stats
  const stats = useMemo(() => calculateStats(properties), [properties]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Handle status parameter
    const status = params.get("status");
    if (status === "sale") {
      setSelectedStatus("For Sale");
    } else if (status === "rent") {
      setSelectedStatus("For Rent");
    }

    // Handle type parameter
    const type = params.get("type");
    if (type && PropertyTypes.includes(type as PropertyType)) {
      setSelectedType(type as PropertyType);
    }
  }, []);

  // Handle search input change - hide filters when typing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Hide filters when user starts typing
    if (value.length > 0 && showFilters) {
      setShowFilters(false);
    }
  };

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    // Build filters object
    const filters: PropertyFilters = {
      published: true,
    };

    if (selectedType !== "All") {
      filters.type = selectedType;
    }

    if (selectedStatus === "For Sale") {
      filters.forSale = true;
    } else if (selectedStatus === "For Rent") {
      filters.forRent = true;
    }

    if (minPrice) {
      filters.minPrice = parseInt(minPrice);
    }
    if (maxPrice) {
      filters.maxPrice = parseInt(maxPrice);
    }
    if (minBedrooms) {
      filters.minBedrooms = parseInt(minBedrooms);
    }
    if (hasParking !== undefined) {
      filters.hasParking = hasParking;
    }
    if (hasGenerator !== undefined) {
      filters.hasGenerator = hasGenerator;
    }

    // Apply search
    let result = properties;
    if (searchQuery.trim()) {
      result = searchProperties(result, searchQuery);
    }

    // Apply filters
    result = filterProperties(result, filters);

    // Apply sort
    result = sortProperties(result, sortBy);

    return result;
  }, [
    properties,
    searchQuery,
    selectedType,
    selectedStatus,
    minPrice,
    maxPrice,
    minBedrooms,
    hasParking,
    hasGenerator,
    sortBy,
  ]);

  // Property types for filter
  const propertyTypes: (PropertyType | "All")[] = ["All", ...PropertyTypes];

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedType("All");
    setSelectedStatus("All");
    setMinPrice("");
    setMaxPrice("");
    setMinBedrooms("");
    setHasParking(undefined);
    setHasGenerator(undefined);
    setSearchQuery("");
    setSortBy("newest");
    setShowFilters(false);
  }, []);

  // Check if any filters are active (excluding search)
  const hasActiveFilters = useMemo(() => {
    return (
      selectedType !== "All" ||
      selectedStatus !== "All" ||
      minPrice !== "" ||
      maxPrice !== "" ||
      minBedrooms !== "" ||
      hasParking !== undefined ||
      hasGenerator !== undefined
    );
  }, [
    selectedType,
    selectedStatus,
    minPrice,
    maxPrice,
    minBedrooms,
    hasParking,
    hasGenerator,
  ]);

  // Check if search is active
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
          <p className="text-xl text-white mb-2">Error loading properties</p>
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

  // Render property card (grid view)
  const renderGridCard = (property: Property, index: number) => {
    const TypeIcon = TYPE_ICONS[property.type] || Home;

    return (
      <motion.div
        key={property.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        whileHover={{ y: -8, scale: 1.02 }}
      >
        <Link
          href={`/property/${property.id}`}
          className="group block rounded-2xl shadow-xl border overflow-hidden transition-all"
          style={{
            background: `${COLORS.primary[800]}60`,
            borderColor: `${COLORS.primary[600]}40`,
          }}
        >
          <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
            <img
              src={getPropertyImage(property)}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage(property.type);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Status badge */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2 flex-wrap">
              <span
                className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm"
                style={{
                  background: getStatusColor(property),
                  color: COLORS.white,
                }}
              >
                {getPropertyStatus(property)}
              </span>
              {property.featured && (
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
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
              >
                <Share2
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  style={{ color: COLORS.gray[700] }}
                />
              </motion.button>
            </div>

            {/* Amenity badges */}
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2">
              {property.bedrooms !== null && property.bedrooms > 0 && (
                <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
                  <Bed className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
                  {property.bedrooms}
                </span>
              )}
              {property.bathrooms !== null && property.bathrooms > 0 && (
                <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
                  <Bath className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
                  {property.bathrooms}
                </span>
              )}
              {property.hasParking && (
                <span className="bg-black/50 backdrop-blur text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs flex items-center gap-1">
                  <Car className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </span>
              )}
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-5">
            {/* Type badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <span
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium flex items-center gap-1"
                style={{
                  background: `${COLORS.primary[500]}30`,
                  color: COLORS.primary[200],
                }}
              >
                <TypeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {property.type}
              </span>
              {property.isLandForDevelopment && (
                <span
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium"
                  style={{
                    background: `${COLORS.emerald[500]}30`,
                    color: COLORS.emerald[300],
                  }}
                >
                  For Development
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-green-300 transition">
              {property.title}
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
              <span className="truncate">{getPropertyLocation(property)}</span>
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
                  {formatArea(property.surface)}
                </span>
              </div>
              <div className="text-right">
                {property.forSale && property.price && property.price > 0 ? (
                  <p
                    className="text-sm sm:text-base md:text-lg font-bold"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {formatPriceCompact(property.price, property.currency)}
                  </p>
                ) : property.forRent &&
                  property.rentPrice &&
                  property.rentPrice > 0 ? (
                  <p
                    className="text-sm sm:text-base md:text-lg font-bold"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {formatPriceCompact(property.rentPrice, property.currency)}
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

  // Render property card (list view)
  const renderListCard = (property: Property, index: number) => {
    const TypeIcon = TYPE_ICONS[property.type] || Home;

    return (
      <motion.div
        key={property.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        whileHover={{ x: 8 }}
      >
        <Link
          href={`/property/${property.id}`}
          className="group flex flex-col sm:flex-row rounded-2xl shadow-xl border overflow-hidden transition-all"
          style={{
            background: `${COLORS.primary[800]}60`,
            borderColor: `${COLORS.primary[600]}40`,
          }}
        >
          {/* Image */}
          <div className="relative w-full sm:w-48 md:w-64 lg:w-72 xl:w-80 h-48 sm:h-auto flex-shrink-0">
            <img
              src={getPropertyImage(property)}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage(property.type);
              }}
            />
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2">
              <span
                className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-sm"
                style={{
                  background: getStatusColor(property),
                  color: COLORS.white,
                }}
              >
                {getPropertyStatus(property)}
              </span>
              {property.featured && (
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
                  <TypeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {property.type}
                </span>
                {property.isLandForDevelopment && (
                  <span
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium"
                    style={{
                      background: `${COLORS.emerald[500]}30`,
                      color: COLORS.emerald[300],
                    }}
                  >
                    For Development
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
              {property.title}
            </h3>

            {/* Short description */}
            {property.shortDescription && (
              <p
                className="text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2"
                style={{ color: COLORS.primary[300] }}
              >
                {property.shortDescription}
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
                {getPropertyLocation(property)}
              </span>
            </div>

            {/* Stats row */}
            <div
              className="flex items-center gap-3 sm:gap-4 md:gap-6 pt-3 sm:pt-4 border-t flex-wrap"
              style={{ borderColor: `${COLORS.primary[600]}40` }}
            >
              {property.surface && (
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
                      {formatArea(property.surface)}
                    </p>
                  </div>
                </div>
              )}
              {property.bedrooms !== null && property.bedrooms > 0 && (
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
                      {property.bedrooms}
                    </p>
                  </div>
                </div>
              )}
              {property.bathrooms !== null && property.bathrooms > 0 && (
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
                      {property.bathrooms}
                    </p>
                  </div>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-2">
                {property.hasParking && (
                  <div className="flex items-center gap-1">
                    <Car
                      className="w-4 h-4"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <span className="text-xs text-white">P</span>
                  </div>
                )}
                {property.hasGenerator && (
                  <div className="flex items-center gap-1">
                    <Zap
                      className="w-4 h-4"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <span className="text-xs text-white">G</span>
                  </div>
                )}
              </div>
              <div className="ml-auto text-right">
                <p
                  className="text-[10px] sm:text-xs"
                  style={{ color: COLORS.primary[400] }}
                >
                  {property.forSale ? "Sale" : "Rent"}
                </p>
                {property.forSale && property.price && property.price > 0 ? (
                  <p
                    className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {formatPriceCompact(property.price, property.currency)}
                  </p>
                ) : property.forRent &&
                  property.rentPrice &&
                  property.rentPrice > 0 ? (
                  <p
                    className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {formatPriceCompact(property.rentPrice, property.currency)}
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
  const renderMapSidebarItem = (property: Property, index: number) => (
    <Link
      key={property.id}
      href={`/property/${property.id}`}
      className="block p-3 sm:p-4 transition hover:bg-white/5"
    >
      <div className="flex gap-2 sm:gap-3">
        <img
          src={getPropertyImage(property)}
          alt={property.title}
          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getPlaceholderImage(property.type);
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <span
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-medium"
              style={{
                background: getStatusColor(property),
                color: COLORS.white,
              }}
            >
              {getPropertyStatus(property)}
            </span>
          </div>
          <p className="font-semibold text-xs sm:text-sm text-white truncate mb-1">
            {property.title}
          </p>
          <p
            className="text-[10px] sm:text-xs truncate mb-1 sm:mb-2"
            style={{ color: COLORS.primary[300] }}
          >
            {getPropertyLocation(property)}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-medium"
              style={{
                background: `${COLORS.primary[500]}30`,
                color: COLORS.primary[200],
              }}
            >
              {property.type}
            </span>
            {property.surface && (
              <span
                className="text-[10px] sm:text-xs"
                style={{ color: COLORS.primary[400] }}
              >
                {formatArea(property.surface)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

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
        {/* Top stats bar - Hidden on xs, compact on sm, full on md+ */}
        <div
          className="hidden sm:block border-b"
          style={{
            background: `${COLORS.primary[950]}80`,
            borderColor: `${COLORS.primary[700]}80`,
          }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm text-white">
              {/* Stats - Progressive disclosure */}
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
                    <span className="hidden md:inline">Properties</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Tag
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                    style={{ color: "#22c55e" }}
                  />
                  <span>
                    <strong style={{ color: "#22c55e" }}>
                      {stats.forSale}
                    </strong>{" "}
                    <span className="hidden lg:inline">For</span> Sale
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Tag
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                    style={{ color: "#3b82f6" }}
                  />
                  <span>
                    <strong style={{ color: "#3b82f6" }}>
                      {stats.forRent}
                    </strong>{" "}
                    <span className="hidden lg:inline">For</span> Rent
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

              {/* Contact info */}
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

            {/* Search bar - Hidden on mobile, shown from sm */}
            <div className="hidden sm:flex flex-1 max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-2 md:mx-4 items-center gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5"
                  style={{ color: COLORS.primary[600] }}
                />
                <input
                  type="text"
                  placeholder="Search properties..."
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

              {/* Filter button - Desktop */}
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

              {/* Home button - Hidden on xs/sm */}
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

          {/* Mobile search bar - Expandable */}
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
                    placeholder="Search properties, locations..."
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

        {/* Mobile stats bar - Only visible on xs */}
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
                  Properties
                </span>
                <span>
                  <strong style={{ color: "#22c55e" }}>{stats.forSale}</strong>{" "}
                  Sale
                </span>
                <span>
                  <strong style={{ color: "#3b82f6" }}>{stats.forRent}</strong>{" "}
                  Rent
                </span>
              </div>
              <span className="opacity-80">📞 +237 677...</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filters Section - Now only shows when showFilters is true */}
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
                    Filter Properties
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

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                  {/* Property Type */}
                  <div>
                    <label
                      className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                      style={{ color: COLORS.primary[200] }}
                    >
                      Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) =>
                        setSelectedType(e.target.value as PropertyType | "All")
                      }
                      className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 transition"
                      style={{
                        background: `${COLORS.primary[700]}80`,
                        color: COLORS.white,
                        borderColor: `${COLORS.primary[500]}40`,
                      }}
                    >
                      {propertyTypes.map((t) => (
                        <option
                          key={t}
                          value={t}
                          style={{ background: COLORS.primary[900] }}
                        >
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                      style={{ color: COLORS.primary[200] }}
                    >
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) =>
                        setSelectedStatus(
                          e.target.value as "All" | "For Sale" | "For Rent",
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
                        value="All"
                        style={{ background: COLORS.primary[900] }}
                      >
                        All
                      </option>
                      <option
                        value="For Sale"
                        style={{ background: COLORS.primary[900] }}
                      >
                        For Sale
                      </option>
                      <option
                        value="For Rent"
                        style={{ background: COLORS.primary[900] }}
                      >
                        For Rent
                      </option>
                    </select>
                  </div>

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

                  {/* Min Bedrooms */}
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
                      <option
                        value="1"
                        style={{ background: COLORS.primary[900] }}
                      >
                        1+
                      </option>
                      <option
                        value="2"
                        style={{ background: COLORS.primary[900] }}
                      >
                        2+
                      </option>
                      <option
                        value="3"
                        style={{ background: COLORS.primary[900] }}
                      >
                        3+
                      </option>
                      <option
                        value="4"
                        style={{ background: COLORS.primary[900] }}
                      >
                        4+
                      </option>
                      <option
                        value="5"
                        style={{ background: COLORS.primary[900] }}
                      >
                        5+
                      </option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="col-span-2 sm:col-span-1">
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
                        value="bedrooms-desc"
                        style={{ background: COLORS.primary[900] }}
                      >
                        Beds ↓
                      </option>
                    </select>
                  </div>

                  {/* Amenities - Full width on mobile */}
                  <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-4">
                    <label
                      className="block text-[10px] sm:text-xs md:text-sm font-medium mb-1 sm:mb-2"
                      style={{ color: COLORS.primary[200] }}
                    >
                      Amenities
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
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

                      {/* Apply & Clear buttons */}
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
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1 ? "Property" : "Properties"}
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
                Filters active
                <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </motion.button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
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

        {/* Properties display */}
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
              Loading properties...
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <Home
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4"
              style={{ color: COLORS.primary[600] }}
            />
            <p
              className="text-base sm:text-lg md:text-xl mb-2"
              style={{ color: COLORS.primary[200] }}
            >
              No properties found
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
                      <span>{filteredProperties.length} properties</span>
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
                    Properties
                  </h3>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: COLORS.primary[300] }}
                  >
                    {filteredProperties.length} results
                  </p>
                </div>
                <div
                  className="divide-y"
                  style={{ borderColor: `${COLORS.primary[700]}40` }}
                >
                  {filteredProperties
                    .slice(0, 20)
                    .map((property, index) =>
                      renderMapSidebarItem(property, index),
                    )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : viewMode === "grid" ? (
          // Grid view - Responsive columns
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredProperties.map((property, index) =>
              renderGridCard(property, index),
            )}
          </div>
        ) : (
          // List view
          <div className="space-y-3 sm:space-y-4">
            {filteredProperties.map((property, index) =>
              renderListCard(property, index),
            )}
          </div>
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
              Our team of experts is ready to help you find the perfect property
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
