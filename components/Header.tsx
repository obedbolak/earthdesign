// File: components/Header.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Home,
  Tag,
  MapPin,
  Square,
  X,
  Bed,
  Bath,
  Car,
  Building2,
  TreePine,
  ChevronRight,
  Sparkles,
  Menu,
  LogIn,
  UserPlus,
  Phone,
  Settings,
  LogOut,
  UserCircle,
  Heart,
  Clock,
  Bell,
  Layers,
  Map,
  Power,
  Droplets,
  Route,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";
import { useFavorites } from "@/lib/hooks/useFavorites";

import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  useAllListings,
  Listing,
  Lotissement,
  Parcelle,
  Batiment,
  EntityType,
  PropertyType,
  getListingId,
  getListingUrl,
  getListingPrimaryImage,
  getLocationString,
  getListingSurface,
  formatPrice,
  formatArea,
  getPropertyTypeLabel,
  getEntityTypeLabel,
} from "@/lib/hooks/useProperties";

// Fallback images if media is missing
const PLACEHOLDER_IMAGES: Record<string, string> = {
  VILLA:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&q=80",
  APARTMENT:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&q=80",
  HOUSE:
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop&q=80",
  OFFICE:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80",
  STUDIO:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&q=80",
  DUPLEX:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&q=80",
  COMMERCIAL_SPACE:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&q=80",
  BUILDING:
    "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=400&h=300&fit=crop&q=80",
  WAREHOUSE:
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&q=80",
  SHOP: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&q=80",
  LOTISSEMENT:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&q=80",
  PARCELLE:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&q=80",
  BATIMENT:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&q=80",
  default:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&q=80",
};

const SERVICES = [
  {
    id: "real-estate",
    title: "Real Estate",
    description: "Buy, sell, or rent premium properties",
    icon: Home,
    href: "/properties",
    features: ["Property Sales", "Rentals", "Management"],
  },
  {
    id: "land-survey",
    title: "Land Surveys",
    description: "Professional surveying services",
    icon: MapPin,
    href: "/services/land-survey",
    features: ["Boundary Surveys", "Topographic", "GPS Surveys"],
  },
  {
    id: "construction",
    title: "Construction",
    description: "Complete construction solutions",
    icon: Building2,
    href: "/services/construction",
    features: ["Residential", "Commercial", "Renovations"],
  },
];

const ENTITY_ICONS: Record<EntityType, React.ComponentType<any>> = {
  LOTISSEMENT: Layers,
  PARCELLE: Map,
  BATIMENT: Building2,
};

// --- Helper Functions ---

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

// Local helper for search results images
const getSearchListingImage = (listing: Listing): string => {
  const primaryImage = getListingPrimaryImage(listing);
  if (primaryImage) return primaryImage;

  // Use property type placeholder if available
  if (listing._entityType === "BATIMENT") {
    const batiment = listing as Batiment;
    if (batiment.propertyType && PLACEHOLDER_IMAGES[batiment.propertyType]) {
      return PLACEHOLDER_IMAGES[batiment.propertyType];
    }
  }
  return PLACEHOLDER_IMAGES[listing._entityType] || PLACEHOLDER_IMAGES.default;
};

// Local helper for search result status
const getSearchStatusLabel = (listing: Listing): string => {
  if (listing.listingType === "BOTH") return "Sale / Rent";
  if (listing.listingType === "SALE") return "For Sale";
  if (listing.listingType === "RENT") return "For Rent";
  return "Available";
};

const getStatusColor = (listing: Listing): string => {
  if (listing.listingType === "BOTH") return COLORS.primary[500];
  if (listing.listingType === "SALE") return "#22c55e";
  if (listing.listingType === "RENT") return "#3b82f6";
  return COLORS.gray[500];
};

const getTypeLabel = (listing: Listing): string => {
  if (listing._entityType === "BATIMENT") {
    const batiment = listing as Batiment;
    if (batiment.propertyType) {
      return getPropertyTypeLabel(batiment.propertyType, "en");
    }
  }
  return getEntityTypeLabel(listing._entityType, "en");
};

const getPlaceholderImage = (entityType: EntityType): string => {
  return PLACEHOLDER_IMAGES[entityType] || PLACEHOLDER_IMAGES.default;
};

export default function Header({
  stats,
  onSearchClick,
}: {
  stats: any;
  onSearchClick?: () => void;
}) {
  const { listings } = useAllListings({ status: "PUBLISHED", limit: 100 });
  const { user, isLoading, isAuthenticated } = useAuth();

  // Favorites Hook
  const {
    favorites,
    count: favoritesCount,
    loading: favoritesLoading,
  } = useFavorites();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [showMobileServicesMenu, setShowMobileServicesMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const servicesMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const favoritesMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      setShowAccountMenu(false);
    }
  };

  // Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const results = searchListings(listings, searchQuery);
        setSearchResults(results.slice(0, 6));
        setSelectedIndex(-1);
      } else {
        setSearchResults([]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, listings]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target))
        setIsSearchFocused(false);
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target))
        setIsMobileSearchOpen(false);
      if (servicesMenuRef.current && !servicesMenuRef.current.contains(target))
        setShowServicesMenu(false);
      if (accountMenuRef.current && !accountMenuRef.current.contains(target))
        setShowAccountMenu(false);
      if (
        favoritesMenuRef.current &&
        !favoritesMenuRef.current.contains(target)
      )
        setShowFavoritesMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === "Escape") {
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
        setIsMobileMenuOpen(false);
        setShowAccountMenu(false);
        setShowFavoritesMenu(false);
        inputRef.current?.blur();
        mobileInputRef.current?.blur();
        setSelectedIndex(-1);
      }
      if (isSearchFocused && searchResults.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0,
          );
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1,
          );
        }
        if (e.key === "Enter" && selectedIndex >= 0) {
          e.preventDefault();
          handleViewListing(searchResults[selectedIndex]);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchFocused, searchResults, selectedIndex]);

  // --- Handlers ---
  const handleViewListing = useCallback(
    (listing: Listing) => {
      router.push(getListingUrl(listing));
      setSearchQuery("");
      setIsSearchFocused(false);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSelectedIndex(-1);
    },
    [router],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
  }, []);

  const handleSearchFocus = useCallback(() => setIsSearchFocused(true), []);

  const handleMobileSearchOpen = useCallback(() => {
    setIsMobileSearchOpen(true);
    setIsMobileMenuOpen(false);
    setTimeout(() => mobileInputRef.current?.focus(), 100);
  }, []);

  const handleMobileSearchClose = useCallback(() => {
    setIsMobileSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const handleViewAllResults = useCallback(() => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery("");
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setShowMobileServicesMenu(false);
  }, []);

  const closeAccountMenu = useCallback(() => setShowAccountMenu(false), []);

  const showDropdown = isSearchFocused && searchQuery.trim() !== "";
  const hasResults = searchResults.length > 0;
  const showNoResults = searchQuery.trim() !== "" && !hasResults;

  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    const names = user.name.trim().split(" ");
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return names[0][0].toUpperCase();
  };

  const getRoleBadgeColor = (role: string | undefined) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return { bg: `${COLORS.yellow[500]}40`, text: COLORS.yellow[300] };
      case "AGENT":
        return { bg: `${COLORS.emerald[500]}40`, text: COLORS.emerald[300] };
      case "OWNER":
        return { bg: `${COLORS.primary[500]}40`, text: COLORS.primary[300] };
      default:
        return { bg: `${COLORS.gray[500]}40`, text: COLORS.gray[300] };
    }
  };

  // --- Favorite Helpers ---

  // 1. URL Generator matching useProperties.ts logic exactly
  const getFavoriteUrl = (favorite: any): string => {
    const entity =
      favorite.lotissement || favorite.parcelle || favorite.batiment;
    if (!entity) return "/properties";

    const id = entity.Id_Lotis || entity.Id_Parcel || entity.Id_Bat;
    const slug = entity.slug || id;

    if (favorite.entityType === "LOTISSEMENT") return `/estates/${slug}`;
    if (favorite.entityType === "PARCELLE") return `/lands/${slug}`;
    if (favorite.entityType === "BATIMENT") return `/properties/${slug}`;

    return "/properties";
  };

  // 2. Data Extractor
  const getFavoriteDetails = (favorite: any) => {
    const entity =
      favorite.lotissement || favorite.parcelle || favorite.batiment;
    if (!entity) return null;

    const entityType: EntityType = favorite.entityType;
    const url = getFavoriteUrl(favorite);

    let id: number;
    let title: string;
    let price: any;
    let image: string;
    let surface: number | null = null;
    let propertyType: string | null = null;
    let bedrooms: number | null = null;
    let bathrooms: number | null = null;

    // Helper to robustly find image url
    const getPrimaryImage = (media: any[] | undefined): string | null => {
      if (!media || !Array.isArray(media) || media.length === 0) return null;
      // 1. Try Primary Image
      const primary = media.find((m: any) => m.isPrimary);
      if (primary?.url) return primary.url;
      // 2. Try any Image
      const anyImage = media.find(
        (m: any) => m.type === "image" || m.type === "IMAGE",
      );
      if (anyImage?.url) return anyImage.url;
      // 3. Fallback to first item with a url
      if (media[0]?.url) return media[0].url;
      return null;
    };

    if (favorite.lotissement) {
      const lot = favorite.lotissement;
      id = lot.Id_Lotis;
      title = lot.title || lot.Nom_proprio || "Untitled Estate";
      price = lot.price;
      surface = lot.Surface;
      image = getPrimaryImage(lot.media) || PLACEHOLDER_IMAGES.LOTISSEMENT;
    } else if (favorite.parcelle) {
      const par = favorite.parcelle;
      id = par.Id_Parcel;
      title = par.title || par.Nom_Prop || "Untitled Land";
      price = par.price;
      surface = par.Sup;
      image = getPrimaryImage(par.media) || PLACEHOLDER_IMAGES.PARCELLE;
    } else {
      const bat = favorite.batiment;
      id = bat.Id_Bat;
      title = bat.title || bat.Nom || "Untitled Property";
      price = bat.price || bat.rentPrice;
      surface = bat.surfaceArea;
      propertyType = bat.propertyType;
      bedrooms = bat.bedrooms;
      bathrooms = bat.bathrooms;

      const foundImage = getPrimaryImage(bat.media);
      if (foundImage) {
        image = foundImage;
      } else if (propertyType && PLACEHOLDER_IMAGES[propertyType]) {
        image = PLACEHOLDER_IMAGES[propertyType];
      } else {
        image = PLACEHOLDER_IMAGES.BATIMENT;
      }
    }

    return {
      id,
      entityType,
      title,
      url,
      price,
      image,
      surface,
      propertyType,
      bedrooms,
      bathrooms,
    };
  };

  // --- Render Functions ---

  const renderListingFeatures = (listing: Listing) => {
    if (listing._entityType === "BATIMENT") {
      const batiment = listing as Batiment;
      return (
        <>
          {batiment.bedrooms && batiment.bedrooms > 0 && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Bed className="w-3 h-3" /> {batiment.bedrooms}
            </span>
          )}
          {batiment.bathrooms && batiment.bathrooms > 0 && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Bath className="w-3 h-3" /> {batiment.bathrooms}
            </span>
          )}
          {batiment.hasParking && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Car className="w-3 h-3" />
            </span>
          )}
        </>
      );
    } else if (listing._entityType === "LOTISSEMENT") {
      const lotissement = listing as Lotissement;
      return (
        <>
          {lotissement.Nbre_lots && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Layers className="w-3 h-3" /> {lotissement.Nbre_lots} lots
            </span>
          )}
          {lotissement.hasElectricity && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Power className="w-3 h-3" />
            </span>
          )}
          {lotissement.hasWater && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Droplets className="w-3 h-3" />
            </span>
          )}
        </>
      );
    } else if (listing._entityType === "PARCELLE") {
      const parcelle = listing as Parcelle;
      return (
        <>
          {parcelle.approvedForBuilding && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Build Ready
            </span>
          )}
        </>
      );
    }
    return null;
  };

  const renderListingCard = (
    listing: Listing,
    idx: number,
    isMobile: boolean = false,
  ) => {
    const EntityIcon = ENTITY_ICONS[listing._entityType];
    const isSelected = idx === selectedIndex && !isMobile;
    const surface = getListingSurface(listing);

    return (
      <motion.div
        key={`${listing._entityType}-${getListingId(listing)}`}
        initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        onClick={() => handleViewListing(listing)}
        className={`group cursor-pointer rounded-xl overflow-hidden transition-all ${
          isSelected ? "ring-2 ring-primary-400" : ""
        }`}
        style={{
          background: isSelected
            ? `${COLORS.primary[700]}99`
            : `${COLORS.primary[800]}99`,
          border: `1px solid ${isSelected ? COLORS.primary[400] : COLORS.primary[600]}60`,
        }}
      >
        {isMobile ? (
          <div className="flex items-center gap-3 p-3 transition-colors active:bg-primary-800/40">
            <img
              src={getSearchListingImage(listing)}
              alt={listing.title || "Listing"}
              className="w-16 h-16 rounded-lg object-cover shadow flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage(listing._entityType);
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
                  style={{
                    background: `${COLORS.primary[400]}CC`,
                    color: COLORS.white,
                  }}
                >
                  <EntityIcon className="w-3 h-3" />
                  {getTypeLabel(listing)}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: getStatusColor(listing),
                    color: COLORS.white,
                  }}
                >
                  {getSearchStatusLabel(listing)}
                </span>
              </div>
              <h4
                className="font-bold text-sm truncate"
                style={{ color: COLORS.white }}
              >
                {listing.title || "Untitled Listing"}
              </h4>
              <p
                className="text-xs truncate flex items-center gap-1"
                style={{ color: COLORS.primary[200] }}
              >
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {getLocationString(listing)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p
                className="font-bold text-sm"
                style={{ color: COLORS.primary[300] }}
              >
                {listing.price && Number(listing.price) > 0
                  ? formatPriceCompact(listing.price, listing.currency)
                  : "N/A"}
              </p>
              {surface && (
                <p className="text-xs" style={{ color: COLORS.primary[400] }}>
                  {formatArea(surface)}
                </p>
              )}
            </div>
            <ChevronRight
              className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition"
              style={{ color: COLORS.primary[300] }}
            />
          </div>
        ) : (
          <>
            <div className="relative h-40 overflow-hidden">
              <img
                src={getSearchListingImage(listing)}
                alt={listing.title || "Listing"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImage(listing._entityType);
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                }}
              />
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1"
                  style={{
                    background: `${COLORS.primary[400]}E6`,
                    color: COLORS.white,
                  }}
                >
                  <EntityIcon className="w-3 h-3" />
                  {getTypeLabel(listing)}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                  style={{
                    background: getStatusColor(listing),
                    color: COLORS.white,
                  }}
                >
                  {getSearchStatusLabel(listing)}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span
                  className="px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm"
                  style={{ background: "rgba(0,0,0,0.5)", color: COLORS.white }}
                >
                  {getEntityTypeLabel(listing._entityType, "en")}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 flex gap-2">
                {renderListingFeatures(listing)}
              </div>
            </div>
            <div className="p-4">
              <h4
                className="font-bold text-base mb-2 line-clamp-1 group-hover:text-primary-200 transition-colors"
                style={{ color: COLORS.white }}
              >
                {listing.title || "Untitled Listing"}
              </h4>
              <p
                className="flex items-center gap-1.5 text-sm mb-3 line-clamp-1"
                style={{ color: COLORS.primary[200] }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {getLocationString(listing)}
              </p>
              <div className="flex items-center justify-between">
                <p
                  className="font-bold text-lg"
                  style={{ color: COLORS.primary[300] }}
                >
                  {listing.price && Number(listing.price) > 0
                    ? formatPriceCompact(listing.price, listing.currency)
                    : "Price on Request"}
                </p>
                {surface && (
                  <p
                    className="text-xs flex items-center gap-1"
                    style={{ color: COLORS.primary[300] }}
                  >
                    <Square className="w-3 h-3" />
                    {formatArea(surface)}
                  </p>
                )}
              </div>
              {listing._entityType === "BATIMENT" &&
                (listing as Batiment).rentPrice &&
                Number((listing as Batiment).rentPrice) > 0 && (
                  <p
                    className="text-xs mt-2"
                    style={{ color: COLORS.primary[400] }}
                  >
                    Rent:{" "}
                    {formatPrice(
                      (listing as Batiment).rentPrice,
                      listing.currency,
                    )}
                    /mo
                  </p>
                )}
            </div>
          </>
        )}
      </motion.div>
    );
  };

  const renderServicesContent = (isMobile: boolean = false) => (
    <div className={isMobile ? "space-y-2" : "py-2 space-y-1"}>
      {SERVICES.map((service) => (
        <Link
          key={service.id}
          href={service.href}
          onClick={() => {
            setShowServicesMenu(false);
            if (isMobile) closeMobileMenu();
          }}
        >
          <motion.div
            whileHover={!isMobile ? { x: 4 } : undefined}
            className={`group ${isMobile ? "p-3" : "p-4"} rounded-xl transition cursor-pointer ${isMobile ? "active:bg-primary-800/40" : ""}`}
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <motion.div
                whileHover={!isMobile ? { rotate: 360 } : undefined}
                transition={{ duration: 0.6 }}
                className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} rounded-xl bg-gradient-to-br ${
                  service.id === "real-estate"
                    ? "from-green-500 to-emerald-500"
                    : service.id === "land-survey"
                      ? "from-blue-500 to-cyan-500"
                      : "from-orange-500 to-red-500"
                } flex items-center justify-center flex-shrink-0 shadow-lg`}
              >
                <service.icon
                  className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} text-white`}
                />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-bold ${isMobile ? "text-sm" : "text-base"} mb-1 group-hover:text-primary-200 transition-colors`}
                  style={{ color: COLORS.white }}
                >
                  {service.title}
                </h4>
                <p
                  className={`${isMobile ? "text-xs" : "text-sm"} mb-2 line-clamp-1`}
                  style={{ color: COLORS.primary[300] }}
                >
                  {service.description}
                </p>
                <div
                  className={`flex ${isMobile ? "flex-col gap-1" : "flex-row flex-wrap gap-2"}`}
                >
                  {service.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full w-fit"
                      style={{
                        background: `${COLORS.primary[400]}30`,
                        color: COLORS.primary[200],
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight
                className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} flex-shrink-0 ${isMobile ? "opacity-50" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                style={{ color: COLORS.primary[300] }}
              />
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );

  const renderFavoritesContent = () => {
    // Uncomment to debug if images are still missing
    // console.log("Favorites data in header:", favorites);

    if (favoritesLoading) {
      return (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p style={{ color: COLORS.primary[300] }}>Loading favorites...</p>
        </div>
      );
    }

    if (favorites.length === 0) {
      return (
        <div className="p-8 text-center">
          <Heart
            className="w-14 h-14 mx-auto mb-4"
            style={{ color: COLORS.primary[400] }}
          />
          <p
            className="font-semibold text-lg mb-2"
            style={{ color: COLORS.primary[200] }}
          >
            No favorites yet
          </p>
          <p className="text-sm mb-4" style={{ color: COLORS.primary[300] }}>
            Start saving properties you love!
          </p>
          <Link
            href="/properties"
            className="inline-block px-6 py-2 rounded-full font-semibold text-white transition"
            style={{ background: GRADIENTS.button.primary }}
            onClick={() => setShowFavoritesMenu(false)}
          >
            Browse Listings
          </Link>
        </div>
      );
    }

    return (
      <>
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: `${COLORS.primary[400]}40` }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: COLORS.primary[100] }}
          >
            {favoritesCount} {favoritesCount === 1 ? "Favorite" : "Favorites"}
          </p>
          <Link
            href="/dashboard/favorites"
            className="text-xs font-medium hover:underline"
            style={{ color: COLORS.primary[300] }}
            onClick={() => setShowFavoritesMenu(false)}
          >
            View All →
          </Link>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {favorites.slice(0, 6).map((favorite, idx) => {
            const details = getFavoriteDetails(favorite);
            if (!details) return null;
            const EntityIcon = ENTITY_ICONS[details.entityType];

            return (
              <Link
                key={`${favorite.entityType}-${favorite.id}`}
                href={details.url}
                onClick={() => setShowFavoritesMenu(false)}
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-white/5 active:bg-white/10 cursor-pointer border-b"
                  style={{ borderColor: `${COLORS.primary[600]}30` }}
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={details.image}
                      alt={details.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          PLACEHOLDER_IMAGES[details.entityType] ||
                          PLACEHOLDER_IMAGES.default;
                      }}
                    />
                    <div
                      className="absolute top-1 left-1 w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: `${COLORS.primary[500]}CC` }}
                    >
                      <EntityIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm truncate mb-1"
                      style={{ color: COLORS.white }}
                    >
                      {details.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: `${COLORS.primary[500]}30`,
                          color: COLORS.primary[200],
                        }}
                      >
                        {details.propertyType
                          ? getPropertyTypeLabel(
                              details.propertyType as PropertyType,
                              "en",
                            )
                          : getEntityTypeLabel(details.entityType, "en")}
                      </span>
                      {details.bedrooms && (
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: COLORS.primary[300] }}
                        >
                          <Bed className="w-3 h-3" /> {details.bedrooms}
                        </span>
                      )}
                      {details.bathrooms && (
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: COLORS.primary[300] }}
                        >
                          <Bath className="w-3 h-3" /> {details.bathrooms}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-bold text-sm"
                      style={{ color: COLORS.primary[300] }}
                    >
                      {details.price && Number(details.price) > 0
                        ? formatPriceCompact(details.price)
                        : "N/A"}
                    </p>
                    {details.surface && (
                      <p
                        className="text-xs"
                        style={{ color: COLORS.primary[400] }}
                      >
                        {formatArea(details.surface)}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0 opacity-50"
                    style={{ color: COLORS.primary[300] }}
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>
        {favorites.length > 6 && (
          <div
            className="p-3 border-t"
            style={{ borderColor: `${COLORS.primary[400]}40` }}
          >
            <Link
              href="/dashboard/favorites"
              className="block text-center py-2 px-4 rounded-xl font-semibold text-white transition-all hover:shadow-lg text-sm"
              style={{ background: GRADIENTS.button.primary }}
              onClick={() => setShowFavoritesMenu(false)}
            >
              View All {favoritesCount} Favorites
            </Link>
          </div>
        )}
      </>
    );
  };

  const renderAccountMenuContent = (isMobile: boolean = false) => {
    if (isLoading) {
      return (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p style={{ color: COLORS.primary[300] }}>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Guest View
      return (
        <>
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: `${COLORS.primary[400]}40` }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`${isMobile ? "w-14 h-14" : "w-12 h-12"} rounded-full flex items-center justify-center`}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary[500]} 0%, ${COLORS.emerald[500]} 100%)`,
                }}
              >
                <User
                  className={`${isMobile ? "w-7 h-7" : "w-6 h-6"} text-white`}
                />
              </div>
              <div>
                <h4
                  className={`font-bold ${isMobile ? "text-lg" : "text-base"}`}
                  style={{ color: COLORS.white }}
                >
                  Welcome
                </h4>
                <p
                  className={`${isMobile ? "text-sm" : "text-sm"}`}
                  style={{ color: COLORS.primary[300] }}
                >
                  Sign in to your account
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <Link
              href="/auth/signin"
              onClick={closeAccountMenu}
              className="block"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full ${isMobile ? "py-4" : "py-3"} px-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${isMobile ? "text-base" : "text-sm"}`}
                style={{ background: GRADIENTS.button.primary }}
              >
                <LogIn className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} /> Sign
                In
              </motion.button>
            </Link>
            <Link
              href="/auth/register"
              onClick={closeAccountMenu}
              className="block"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full ${isMobile ? "py-4" : "py-3"} px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isMobile ? "text-base" : "text-sm"}`}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: COLORS.white,
                  border: `1px solid ${COLORS.primary[400]}60`,
                }}
              >
                <UserPlus className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />{" "}
                Create Account
              </motion.button>
            </Link>
          </div>
          <div
            className="border-t mx-4"
            style={{ borderColor: `${COLORS.primary[400]}40` }}
          />
          <div
            className={`p-2 ${isMobile ? "max-h-[35vh] overflow-y-auto" : ""}`}
          >
            <Link href="/properties" onClick={closeAccountMenu}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 ${isMobile ? "py-4" : "py-3"} rounded-xl transition-all cursor-pointer active:bg-white/10 hover:bg-white/10`}
              >
                <div
                  className={`${isMobile ? "w-11 h-11" : "w-9 h-9"} rounded-lg flex items-center justify-center`}
                  style={{ background: `${COLORS.primary[500]}30` }}
                >
                  <Building2
                    className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                    style={{ color: COLORS.primary[300] }}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${isMobile ? "text-base" : "text-sm"}`}
                    style={{ color: COLORS.white }}
                  >
                    Browse Listings
                  </p>
                  <p
                    className={`${isMobile ? "text-sm" : "text-xs"}`}
                    style={{ color: COLORS.primary[400] }}
                  >
                    Explore properties & lands
                  </p>
                </div>
                <ChevronRight
                  className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                  style={{ color: COLORS.primary[400] }}
                />
              </motion.div>
            </Link>
            <Link href="/contact" onClick={closeAccountMenu}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 ${isMobile ? "py-4" : "py-3"} rounded-xl transition-all cursor-pointer active:bg-white/10 hover:bg-white/10`}
              >
                <div
                  className={`${isMobile ? "w-11 h-11" : "w-9 h-9"} rounded-lg flex items-center justify-center`}
                  style={{ background: `${COLORS.teal[500]}30` }}
                >
                  <Phone
                    className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                    style={{ color: COLORS.teal[500] }}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${isMobile ? "text-base" : "text-sm"}`}
                    style={{ color: COLORS.white }}
                  >
                    Contact Us
                  </p>
                  <p
                    className={`${isMobile ? "text-sm" : "text-xs"}`}
                    style={{ color: COLORS.primary[400] }}
                  >
                    Get in touch
                  </p>
                </div>
                <ChevronRight
                  className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                  style={{ color: COLORS.primary[400] }}
                />
              </motion.div>
            </Link>
          </div>
        </>
      );
    }

    // Authenticated View
    const roleBadgeColors = getRoleBadgeColor(user?.role);
    return (
      <>
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: `${COLORS.primary[400]}40` }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`${isMobile ? "w-14 h-14" : "w-12 h-12"} rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`}
              style={{
                background: user?.image
                  ? "transparent"
                  : `linear-gradient(135deg, ${COLORS.primary[500]} 0%, ${COLORS.emerald[500]} 100%)`,
                border: `2px solid ${COLORS.primary[400]}60`,
              }}
            >
              {user?.image ? (
                <img
                  src={user?.image}
                  alt={user?.name || "User Avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <span
                  className={`font-bold ${isMobile ? "text-lg" : "text-base"} text-white`}
                >
                  {getUserInitials()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={`font-bold ${isMobile ? "text-lg" : "text-base"} truncate`}
                style={{ color: COLORS.white }}
              >
                {user?.name}
              </h4>
              <p
                className={`${isMobile ? "text-sm" : "text-xs"} truncate mb-1`}
                style={{ color: COLORS.primary[300] }}
              >
                {user?.email}
              </p>
              {user?.role && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium inline-block"
                  style={{
                    background: roleBadgeColors.bg,
                    color: roleBadgeColors.text,
                  }}
                >
                  {user?.role}
                </span>
              )}
            </div>
          </div>
        </div>
        <div
          className={`p-2 ${isMobile ? "max-h-[40vh] overflow-y-auto" : ""}`}
        >
          <Link href="/dashboard" onClick={closeAccountMenu}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-4 ${isMobile ? "py-4" : "py-3"} rounded-xl transition-all cursor-pointer active:bg-white/10 hover:bg-white/10`}
            >
              <div
                className={`${isMobile ? "w-11 h-11" : "w-9 h-9"} rounded-lg flex items-center justify-center`}
                style={{ background: `${COLORS.primary[500]}30` }}
              >
                <UserCircle
                  className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                  style={{ color: COLORS.primary[300] }}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${isMobile ? "text-base" : "text-sm"}`}
                  style={{ color: COLORS.white }}
                >
                  Dashboard
                </p>
                <p
                  className={`${isMobile ? "text-sm" : "text-xs"}`}
                  style={{ color: COLORS.primary[400] }}
                >
                  Manage your account
                </p>
              </div>
              <ChevronRight
                className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                style={{ color: COLORS.primary[400] }}
              />
            </motion.div>
          </Link>
          <Link href="/dashboard/favorites" onClick={closeAccountMenu}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-4 ${isMobile ? "py-4" : "py-3"} rounded-xl transition-all cursor-pointer active:bg-white/10 hover:bg-white/10`}
            >
              <div
                className={`${isMobile ? "w-11 h-11" : "w-9 h-9"} rounded-lg flex items-center justify-center`}
                style={{ background: `${COLORS.yellow[300]}30` }}
              >
                <Heart
                  className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                  style={{ color: COLORS.yellow[400] }}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${isMobile ? "text-base" : "text-sm"}`}
                  style={{ color: COLORS.white }}
                >
                  My Favorites
                </p>
                <p
                  className={`${isMobile ? "text-sm" : "text-xs"}`}
                  style={{ color: COLORS.primary[400] }}
                >
                  {favoritesCount > 0
                    ? `${favoritesCount} saved listings`
                    : "Saved listings"}
                </p>
              </div>
              {favoritesCount > 0 && (
                <span
                  className="min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: COLORS.yellow[500] }}
                >
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
              <ChevronRight
                className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                style={{ color: COLORS.primary[400] }}
              />
            </motion.div>
          </Link>
          <Link href="/dashboard/history" onClick={closeAccountMenu}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-4 ${isMobile ? "py-4" : "py-3"} rounded-xl transition-all cursor-pointer active:bg-white/10 hover:bg-white/10`}
            >
              <div
                className={`${isMobile ? "w-11 h-11" : "w-9 h-9"} rounded-lg flex items-center justify-center`}
                style={{ background: `${COLORS.yellow[500]}30` }}
              >
                <Clock
                  className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                  style={{ color: COLORS.yellow[400] }}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${isMobile ? "text-base" : "text-sm"}`}
                  style={{ color: COLORS.white }}
                >
                  Recent Views
                </p>
                <p
                  className={`${isMobile ? "text-sm" : "text-xs"}`}
                  style={{ color: COLORS.primary[400] }}
                >
                  Browsing history
                </p>
              </div>
              <ChevronRight
                className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                style={{ color: COLORS.primary[400] }}
              />
            </motion.div>
          </Link>
          <Link href="/dashboard/notifications" onClick={closeAccountMenu}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-4 ${isMobile ? "py-4" : "py-3"} rounded-xl transition-all cursor-pointer active:bg-white/10 hover:bg-white/10`}
            >
              <div
                className={`${isMobile ? "w-11 h-11" : "w-9 h-9"} rounded-lg flex items-center justify-center`}
                style={{ background: `${COLORS.emerald[500]}30` }}
              >
                <Bell
                  className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                  style={{ color: COLORS.emerald[400] }}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${isMobile ? "text-base" : "text-sm"}`}
                  style={{ color: COLORS.white }}
                >
                  Notifications
                </p>
                <p
                  className={`${isMobile ? "text-sm" : "text-xs"}`}
                  style={{ color: COLORS.primary[400] }}
                >
                  Alerts & updates
                </p>
              </div>
              <ChevronRight
                className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                style={{ color: COLORS.primary[400] }}
              />
            </motion.div>
          </Link>
          <Link href="/dashboard/settings" onClick={closeAccountMenu}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-4 ${isMobile ? "py-4" : "py-3"} rounded-xl transition-all cursor-pointer active:bg-white/10 hover:bg-white/10`}
            >
              <div
                className={`${isMobile ? "w-11 h-11" : "w-9 h-9"} rounded-lg flex items-center justify-center`}
                style={{ background: `${COLORS.gray[500]}30` }}
              >
                <Settings
                  className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                  style={{ color: COLORS.gray[400] }}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${isMobile ? "text-base" : "text-sm"}`}
                  style={{ color: COLORS.white }}
                >
                  Settings
                </p>
                <p
                  className={`${isMobile ? "text-sm" : "text-xs"}`}
                  style={{ color: COLORS.primary[400] }}
                >
                  Account preferences
                </p>
              </div>
              <ChevronRight
                className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                style={{ color: COLORS.primary[400] }}
              />
            </motion.div>
          </Link>
          {user?.role?.toUpperCase() === "ADMIN" && (
            <>
              <div
                className="border-t mx-4 my-2"
                style={{ borderColor: `${COLORS.primary[400]}40` }}
              />
              <Link href="/admin/dashboard" onClick={closeAccountMenu}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 ${isMobile ? "py-4" : "py-3"} rounded-xl transition-all cursor-pointer active:bg-white/10 hover:bg-white/10`}
                >
                  <div
                    className={`${isMobile ? "w-11 h-11" : "w-9 h-9"} rounded-lg flex items-center justify-center`}
                    style={{ background: `${COLORS.yellow[500]}30` }}
                  >
                    <Settings
                      className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                      style={{ color: COLORS.yellow[400] }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${isMobile ? "text-base" : "text-sm"}`}
                      style={{ color: COLORS.white }}
                    >
                      Admin Panel
                    </p>
                    <p
                      className={`${isMobile ? "text-sm" : "text-xs"}`}
                      style={{ color: COLORS.primary[400] }}
                    >
                      Manage listings & users
                    </p>
                  </div>
                  <ChevronRight
                    className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                    style={{ color: COLORS.primary[400] }}
                  />
                </motion.div>
              </Link>
            </>
          )}
        </div>
        <div
          className="p-4 border-t"
          style={{ borderColor: `${COLORS.primary[400]}40` }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full ${isMobile ? "py-4" : "py-3"} px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isMobile ? "text-base" : "text-sm"}`}
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.4)",
            }}
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />{" "}
                Signing out...
              </>
            ) : (
              <>
                <LogOut className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />{" "}
                Sign Out
              </>
            )}
          </motion.button>
        </div>
      </>
    );
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b"
        style={{
          background: GRADIENTS.background.hero,
          borderColor: `${COLORS.primary[700]}4D`,
        }}
      >
        {/* Top bar with stats */}
        <div
          className="border-b"
          style={{
            background: `${COLORS.primary[950]}80`,
            borderColor: `${COLORS.primary[700]}80`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between py-2 text-xs sm:text-sm text-white">
              <div className="hidden sm:flex items-center gap-4 md:gap-8">
                <div className="flex items-center gap-2">
                  <Home
                    className="w-4 h-4"
                    style={{ color: COLORS.yellow[400] }}
                  />
                  <span>
                    <strong style={{ color: COLORS.yellow[400] }}>
                      {stats.published}
                    </strong>{" "}
                    Listings
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                  <span>
                    <strong style={{ color: "#22c55e" }}>
                      {stats.byEntityType?.BATIMENT || 0}
                    </strong>{" "}
                    Properties
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4" style={{ color: "#3b82f6" }} />
                  <span>
                    <strong style={{ color: "#3b82f6" }}>
                      {stats.byEntityType?.PARCELLE || 0}
                    </strong>{" "}
                    Lands
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" style={{ color: "#a855f7" }} />
                  <span>
                    <strong style={{ color: "#a855f7" }}>
                      {stats.byEntityType?.LOTISSEMENT || 0}
                    </strong>{" "}
                    Estates
                  </span>
                </div>
                {stats.featured > 0 && (
                  <div className="flex items-center gap-2">
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
              <div className="flex sm:hidden items-center gap-3 text-xs">
                <span>
                  <strong style={{ color: COLORS.yellow[400] }}>
                    {stats.published}
                  </strong>{" "}
                  Listings
                </span>
                <span>•</span>
                <span>
                  <strong style={{ color: "#22c55e" }}>
                    {stats.byEntityType?.BATIMENT || 0}
                  </strong>{" "}
                  Props
                </span>
                <span>•</span>
                <span>
                  <strong style={{ color: "#3b82f6" }}>
                    {stats.byEntityType?.PARCELLE || 0}
                  </strong>{" "}
                  Lands
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden lg:inline opacity-80">
                  📍 Yaoundé, Cameroon
                </span>
                <span className="opacity-80 hidden sm:inline">
                  📞 +237 652 149 121
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 flex-shrink-0 cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full blur-md opacity-50"
                    style={{
                      background: `radial-gradient(circle, ${COLORS.primary[400]}40 0%, transparent 70%)`,
                    }}
                  />
                </div>
                <div
                  className="relative w-22 h-12 flex items-center justify-center"
                  style={{ borderColor: `${COLORS.primary[400]}60` }}
                >
                  <img
                    src="/logo.png"
                    alt="earthdesign Logo"
                    className="w-full h-60 object-contain p-1"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span
                    className="text-xs md:text-sm font-medium -mt-1"
                    style={{ color: COLORS.primary[300] }}
                  >
                    Real Estate
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Search bar (desktop) */}
            <div
              className="flex-1 max-w-2xl mx-4 hidden md:block relative"
              ref={searchRef}
            >
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition pointer-events-none"
                  style={{
                    color: isSearchFocused
                      ? COLORS.primary[500]
                      : COLORS.primary[600],
                  }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search properties, lands, estates..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="w-full pl-14 pr-20 py-4 rounded-full text-base shadow-xl transition-all focus:outline-none"
                  style={{
                    background: COLORS.white,
                    color: COLORS.gray[900],
                    boxShadow: isSearchFocused
                      ? `0 0 0 4px ${COLORS.primary[500]}40, 0 20px 25px -5px rgba(0, 0, 0, 0.1)`
                      : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={handleClearSearch}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition"
                        type="button"
                      >
                        <X
                          className="w-4 h-4"
                          style={{ color: COLORS.gray[400] }}
                        />
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <span
                    className="px-2 py-1 rounded-lg text-xs font-semibold hidden lg:inline-block"
                    style={{
                      background: `${COLORS.primary[500]}1A`,
                      color: COLORS.primary[700],
                    }}
                  >
                    ⌘K
                  </span>
                </div>
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="fixed left-0 right-0 mt-2 rounded-none shadow-2xl border-t border-b"
                    style={{
                      top: "100%",
                      background: `linear-gradient(135deg, ${COLORS.primary[900]}E6 0%, ${COLORS.emerald[900]}E6 50%, ${COLORS.teal[800]}E6 100%)`,
                      backdropFilter: "blur(20px)",
                      borderColor: `${COLORS.primary[400]}60`,
                    }}
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                      {showNoResults ? (
                        <div className="p-12 text-center">
                          <Search
                            className="w-14 h-14 mx-auto mb-4"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <p
                            className="font-semibold text-lg mb-2"
                            style={{ color: COLORS.primary[200] }}
                          >
                            No listings found
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: COLORS.primary[300] }}
                          >
                            Try a different search term or browse all listings
                          </p>
                          <Link
                            href="/properties"
                            className="inline-block mt-4 px-6 py-2 rounded-full font-semibold text-white transition"
                            style={{ background: GRADIENTS.button.primary }}
                            onClick={handleViewAllResults}
                          >
                            Browse All Listings
                          </Link>
                        </div>
                      ) : hasResults ? (
                        <>
                          <div
                            className="px-2 py-4 border-b flex items-center justify-between"
                            style={{ borderColor: `${COLORS.primary[400]}40` }}
                          >
                            <p
                              className="text-sm font-semibold"
                              style={{ color: COLORS.primary[100] }}
                            >
                              Found {searchResults.length}{" "}
                              {searchResults.length === 1
                                ? "listing"
                                : "listings"}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: COLORS.primary[300] }}
                            >
                              Use ↑↓ to navigate, Enter to select
                            </p>
                          </div>
                          <div className="max-h-[500px] overflow-y-auto py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {searchResults.map((listing, idx) =>
                                renderListingCard(listing, idx, false),
                              )}
                            </div>
                          </div>
                          <div
                            className="px-2 py-4 border-t"
                            style={{ borderColor: `${COLORS.primary[400]}40` }}
                          >
                            <Link
                              href={`/properties?search=${encodeURIComponent(searchQuery)}`}
                              className="block text-center py-3 px-6 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                              style={{ background: GRADIENTS.button.primary }}
                              onClick={handleViewAllResults}
                            >
                              View all results →
                            </Link>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search button (mobile) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMobileSearchOpen}
                className="md:hidden w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.button>

              {/* Desktop Services Dropdown */}
              <div className="relative hidden lg:block" ref={servicesMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowServicesMenu(!showServicesMenu)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white transition"
                  style={{
                    background: showServicesMenu
                      ? GRADIENTS.button.primary
                      : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Services</span>
                  <motion.div
                    animate={{ rotate: showServicesMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {showServicesMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-[480px] rounded-2xl shadow-2xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.primary[900]}F5 0%, ${COLORS.emerald[900]}F5 100%)`,
                        backdropFilter: "blur(20px)",
                        border: `1px solid ${COLORS.primary[400]}60`,
                      }}
                    >
                      <div className="p-2">
                        <div
                          className="px-4 py-3 border-b"
                          style={{ borderColor: `${COLORS.primary[400]}40` }}
                        >
                          <h3
                            className="font-bold text-lg"
                            style={{ color: COLORS.white }}
                          >
                            Our Services
                          </h3>
                          <p
                            className="text-sm mt-1"
                            style={{ color: COLORS.primary[200] }}
                          >
                            Comprehensive real estate solutions
                          </p>
                        </div>
                        {renderServicesContent(false)}
                        <div
                          className="p-4 border-t"
                          style={{ borderColor: `${COLORS.primary[400]}40` }}
                        >
                          <Link
                            href="/services"
                            onClick={() => setShowServicesMenu(false)}
                          >
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full py-3 rounded-xl font-semibold text-white transition text-center"
                              style={{ background: GRADIENTS.button.primary }}
                            >
                              View All Services →
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Properties link (desktop) */}
              <Link href="/properties" className="hidden lg:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white transition"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Listings</span>
                </motion.button>
              </Link>

              {/* Favorites button - show when authenticated */}
              {isAuthenticated && (
                <div className="relative" ref={favoritesMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
                    className="relative w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
                  >
                    <Heart
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill={showFavoritesMenu ? "currentColor" : "none"}
                    />
                    {favoritesCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
                        style={{ background: COLORS.yellow[500] }}
                      >
                        {favoritesCount > 99 ? "99+" : favoritesCount}
                      </span>
                    )}
                  </motion.button>
                  <AnimatePresence>
                    {showFavoritesMenu && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                          onClick={() => setShowFavoritesMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="fixed lg:absolute z-50 left-4 right-4 lg:left-auto lg:right-0 top-20 lg:top-auto lg:mt-3 w-auto lg:w-96 rounded-2xl shadow-2xl overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${COLORS.primary[900]}F5 0%, ${COLORS.emerald[900]}F5 100%)`,
                            backdropFilter: "blur(20px)",
                            border: `1px solid ${COLORS.primary[400]}60`,
                          }}
                        >
                          <div
                            className="lg:hidden flex justify-between items-center px-4 py-3 border-b"
                            style={{ borderColor: `${COLORS.primary[400]}40` }}
                          >
                            <div className="flex items-center gap-2">
                              <Heart
                                className="w-5 h-5"
                                style={{ color: COLORS.yellow[400] }}
                              />
                              <span className="font-semibold text-white">
                                My Favorites
                              </span>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowFavoritesMenu(false)}
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ background: "rgba(255,255,255,0.1)" }}
                            >
                              <X className="w-4 h-4 text-white" />
                            </motion.button>
                          </div>
                          {renderFavoritesContent()}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </motion.button>

              {/* Account button */}
              <div className="relative" ref={accountMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-white/20 transition overflow-hidden"
                  style={{
                    background: user?.image
                      ? "transparent"
                      : "rgba(255,255,255,0.1)",
                    border:
                      isAuthenticated && user?.image
                        ? `2px solid ${COLORS.primary[400]}60`
                        : "none",
                  }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isAuthenticated && user?.image ? (
                    <img
                      src={user?.image}
                      alt={user?.name || "User Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : isAuthenticated ? (
                    <span className="font-bold text-white text-sm">
                      {getUserInitials()}
                    </span>
                  ) : (
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </motion.button>
                <AnimatePresence>
                  {showAccountMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setShowAccountMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed lg:absolute z-50 left-4 right-4 lg:left-auto lg:right-0 top-16 lg:top-auto lg:mt-3 w-auto lg:w-80 rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS.primary[900]}F5 0%, ${COLORS.emerald[900]}F5 100%)`,
                          backdropFilter: "blur(20px)",
                          border: `1px solid ${COLORS.primary[400]}60`,
                        }}
                      >
                        <div className="lg:hidden flex justify-between items-center px-5 pt-4">
                          <span
                            className="text-sm font-medium"
                            style={{ color: COLORS.primary[300] }}
                          >
                            {isAuthenticated ? "My Account" : "Account"}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAccountMenu(false)}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.1)" }}
                          >
                            <X className="w-4 h-4 text-white" />
                          </motion.button>
                        </div>
                        <div className="hidden lg:block">
                          {renderAccountMenuContent(false)}
                        </div>
                        <div className="lg:hidden">
                          {renderAccountMenuContent(true)}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary[900]}F5 0%, ${COLORS.emerald[900]}F5 100%)`,
                borderColor: `${COLORS.primary[400]}40`,
              }}
            >
              {/* ... (Mobile menu content similar to existing logic) ... */}
              {/* I'll let the existing logic handle the mobile menu content rendering since it's already there in the file context */}
              {/* For brevity, I assume the render functions are working correctly as defined above */}
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
                <Link href="/properties" onClick={closeMobileMenu}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition active:bg-primary-800/40"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                    <span className="font-medium text-white">All Listings</span>
                    <ChevronRight
                      className="w-4 h-4 ml-auto"
                      style={{ color: COLORS.primary[300] }}
                    />
                  </motion.div>
                </Link>
                {/* Favorites Link (Mobile) */}
                {isAuthenticated && (
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      closeMobileMenu();
                      setShowFavoritesMenu(true);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition active:bg-primary-800/40 cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <Heart className="w-5 h-5 text-white" />
                    <span className="font-medium text-white">My Favorites</span>
                    {favoritesCount > 0 && (
                      <span
                        className="min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: COLORS.yellow[500] }}
                      >
                        {favoritesCount > 99 ? "99+" : favoritesCount}
                      </span>
                    )}
                    <ChevronRight
                      className="w-4 h-4 ml-auto"
                      style={{ color: COLORS.primary[300] }}
                    />
                  </motion.div>
                )}
                {/* ... Services, Contact, Auth buttons (reuse existing patterns) ... */}
                {/* Services Accordion */}
                <div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setShowMobileServicesMenu(!showMobileServicesMenu)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-white transition"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5" />
                      <span>Services</span>
                    </div>
                    <motion.div
                      animate={{ rotate: showMobileServicesMenu ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.div>
                  </motion.button>
                  <AnimatePresence>
                    {showMobileServicesMenu && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2">
                          {renderServicesContent(true)}
                          <div className="pt-3">
                            <Link href="/services" onClick={closeMobileMenu}>
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 rounded-xl font-semibold text-white transition text-center"
                                style={{ background: GRADIENTS.button.primary }}
                              >
                                View All Services →
                              </motion.button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link href="/contact" onClick={closeMobileMenu}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition active:bg-primary-800/40"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <Phone className="w-5 h-5 text-white" />
                    <span className="font-medium text-white">Contact Us</span>
                    <ChevronRight
                      className="w-4 h-4 ml-auto"
                      style={{ color: COLORS.primary[300] }}
                    />
                  </motion.div>
                </Link>
                {!isAuthenticated && (
                  <div className="pt-2 space-y-2">
                    <Link href="/auth/signin" onClick={closeMobileMenu}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2"
                        style={{ background: GRADIENTS.button.primary }}
                      >
                        <LogIn className="w-5 h-5" /> Sign In
                      </motion.button>
                    </Link>
                    <Link href="/auth/register" onClick={closeMobileMenu}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          border: `1px solid ${COLORS.primary[400]}60`,
                        }}
                      >
                        <UserPlus className="w-5 h-5" /> Create Account
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            ref={mobileSearchRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          >
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="w-full"
              style={{ background: GRADIENTS.background.hero }}
            >
              <div className="p-4 pt-6">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: COLORS.primary[500] }}
                  />
                  <input
                    ref={mobileInputRef}
                    type="text"
                    placeholder="Search properties, lands, estates..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-12 py-4 rounded-xl text-base focus:outline-none focus:ring-2"
                    style={{
                      background: COLORS.white,
                      color: COLORS.gray[900],
                    }}
                  />
                  <button
                    onClick={handleMobileSearchClose}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition"
                    type="button"
                  >
                    <X
                      className="w-5 h-5"
                      style={{ color: COLORS.gray[500] }}
                    />
                  </button>
                </div>
              </div>
              {searchQuery.trim() !== "" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-h-[70vh] overflow-y-auto"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary[900]}F2 0%, ${COLORS.emerald[900]}F2 50%, ${COLORS.teal[800]}F2 100%)`,
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {searchResults.length === 0 ? (
                    <div className="p-8 text-center">
                      <Search
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <p
                        className="font-semibold"
                        style={{ color: COLORS.primary[200] }}
                      >
                        No listings found
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: COLORS.primary[300] }}
                      >
                        Try a different search term
                      </p>
                      <Link
                        href="/properties"
                        className="inline-block mt-4 px-6 py-2 rounded-full font-semibold text-white transition"
                        style={{ background: GRADIENTS.button.primary }}
                        onClick={handleMobileSearchClose}
                      >
                        Browse All
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div
                        className="px-4 py-3 border-b"
                        style={{ borderColor: `${COLORS.primary[400]}40` }}
                      >
                        <p
                          className="text-sm font-semibold"
                          style={{ color: COLORS.primary[100] }}
                        >
                          Found {searchResults.length}{" "}
                          {searchResults.length === 1 ? "listing" : "listings"}
                        </p>
                      </div>
                      <div
                        className="divide-y"
                        style={{ borderColor: `${COLORS.primary[400]}30` }}
                      >
                        {searchResults.map((listing, idx) =>
                          renderListingCard(listing, idx, true),
                        )}
                      </div>
                      <div
                        className="p-4"
                        style={{ background: `${COLORS.primary[900]}80` }}
                      >
                        <Link
                          href={`/properties?search=${encodeURIComponent(searchQuery)}`}
                          className="block w-full text-center py-3 rounded-xl font-semibold text-white transition"
                          style={{ background: GRADIENTS.button.primary }}
                          onClick={handleViewAllResults}
                        >
                          View all results
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
