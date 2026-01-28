// File: app/page.tsx
"use client";
import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Search,
  Filter,
  Heart,
  Share2,
  Bed,
  Bath,
  Square,
  MapPin,
  Grid3x3,
  List,
  ChevronDown,
  X,
  Sparkles,
  Award,
  ShieldCheck,
  ArrowRight,
  Key,
  Home,
  Building2,
  TreePine,
  Car,
  Zap,
  Star,
  Layers,
  Map,
  Droplets,
  Power,
  Route,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { COLORS, GRADIENTS, SHADOWS } from "@/lib/constants/colors";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  getListingImages,
  getLocationString,
  getListingSurface,
  formatPrice,
  formatArea,
  getPropertyTypeLabel,
  getCategoryLabel,
  getListingTypeLabel,
  getEntityTypeLabel,
  isForSale,
  isForRent,
} from "@/lib/hooks/useProperties";
import Link from "next/link";

const faqs = [
  {
    q: "How do I search for properties?",
    a: "You can search for properties by using the search bar on the homepage or by filtering options in the property listings.",
  },
  {
    q: "What are the available property types?",
    a: "We offer a variety of property types including apartments, houses, villas, commercial spaces, land parcels, and development estates.",
  },
  {
    q: "Do you provide land survey services?",
    a: "Yes! We offer professional land survey services including boundary surveys, topographic mapping, construction staking, and GPS surveys with certified surveyors and precision equipment.",
  },
  {
    q: "Can you handle construction projects?",
    a: "Absolutely! We provide complete construction services from foundation to finishing, including residential buildings, commercial projects, renovations, and full project management.",
  },
  {
    q: "How do I request a land survey or construction quote?",
    a: "You can request a quote by contacting us through our contact page or calling our office directly. We'll schedule a consultation to discuss your specific requirements.",
  },
  {
    q: "Can I save my favorite properties?",
    a: "Yes, you can save your favorite properties by clicking the heart icon on any property listing.",
  },
];

const testimonials = [
  {
    name: "John Doe",
    role: "Property Investor",
    text: "Earth Design helped me find the perfect investment property. Their team is professional and responsive.",
    rating: 5,
    image: null,
  },
  {
    name: "Jane Smith",
    role: "Home Buyer",
    text: "I found my dream home through Earth Design. The process was smooth and the team was incredibly helpful.",
    rating: 5,
    image: null,
  },
  {
    name: "Michael Johnson",
    role: "Commercial Client",
    text: "Earth Design's commercial property services are top-notch. They helped me secure the ideal office space.",
    rating: 4,
    image: null,
  },
  {
    name: "Sarah Williams",
    role: "First-time Buyer",
    text: "As a first-time buyer, I was nervous, but Earth Design made the entire process seamless and stress-free.",
    rating: 5,
    image: null,
  },
  {
    name: "David Brown",
    role: "Real Estate Developer",
    text: "Outstanding service and deep market knowledge. They've become our go-to partner for all property needs.",
    rating: 5,
    image: null,
  },
];

// Entity type icons
const entityTypeIcons: Record<EntityType, React.ComponentType<any>> = {
  LOTISSEMENT: Layers,
  PARCELLE: Map,
  BATIMENT: Building2,
};

// Placeholder images by entity type and property type
const getPlaceholderImage = (listing: Listing): string => {
  const typeMap: Record<string, string> = {
    // Batiment property types
    VILLA:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&q=80",
    APARTMENT:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop&q=80",
    HOUSE:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&q=80",
    OFFICE:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80",
    STUDIO:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop&q=80",
    DUPLEX:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop&q=80",
    COMMERCIAL_SPACE:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop&q=80",
    BUILDING:
      "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&h=800&fit=crop&q=80",
    WAREHOUSE:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop&q=80",
    SHOP: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&q=80",
  };

  // Entity-specific defaults
  const entityDefaults: Record<EntityType, string> = {
    LOTISSEMENT:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80",
    PARCELLE:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80",
    BATIMENT:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop&q=80",
  };

  if (listing._entityType === "BATIMENT") {
    const batiment = listing as Batiment;
    if (batiment.propertyType && typeMap[batiment.propertyType]) {
      return typeMap[batiment.propertyType];
    }
  }

  return entityDefaults[listing._entityType];
};

// Get listing image (primary or placeholder)
const getListingImage = (listing: Listing): string => {
  const primaryImage = getListingPrimaryImage(listing);
  return primaryImage || getPlaceholderImage(listing);
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

// Get surface area for any listing type
const getSurfaceDisplay = (listing: Listing): number | null => {
  return getListingSurface(listing);
};

// =========================================================
// LOCAL UTILITY FUNCTIONS (not in simplified hook)
// =========================================================

// Format price compact (e.g., "25M" instead of "25,000,000 XAF")
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

// Get property type icon emoji
function getPropertyTypeIcon(type: PropertyType): string {
  const icons: Record<PropertyType, string> = {
    APARTMENT: "🏢",
    HOUSE: "🏠",
    VILLA: "🏡",
    STUDIO: "🛏️",
    DUPLEX: "🏘️",
    TRIPLEX: "🏘️",
    PENTHOUSE: "✨",
    CHAMBRE_MODERNE: "🚪",
    CHAMBRE: "🛏️",
    OFFICE: "💼",
    SHOP: "🏪",
    RESTAURANT: "🍽️",
    HOTEL: "🏨",
    WAREHOUSE: "🏭",
    COMMERCIAL_SPACE: "🏬",
    INDUSTRIAL: "🏭",
    FACTORY: "🏭",
    BUILDING: "🏗️",
    MIXED_USE: "🏢",
  };
  return icons[type] || "🏠";
}

// Calculate listing stats
interface ListingStats {
  total: number;
  published: number;
  featured: number;
  forSale: number;
  forRent: number;
  byCategory: Record<PropertyCategory, number>;
  byEntityType: Record<EntityType, number>;
  averagePrice: number;
}

function calculateListingStats(listings: Listing[]): ListingStats {
  const published = listings.filter((l) => l.listingStatus === "PUBLISHED");

  const byCategory = {
    LAND: 0,
    RESIDENTIAL: 0,
    COMMERCIAL: 0,
    INDUSTRIAL: 0,
    MIXED: 0,
  } as Record<PropertyCategory, number>;

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

export default function HomePage() {
  // Fetch all listings combined
  const { listings, loading, error, refetch } = useAllListings({
    status: "PUBLISHED",
    limit: 50,
  });

  const { data: featuredBatiments, loading: featuredLoading } = useBatiments({
    featured: true,
    status: "PUBLISHED",
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityType, setSelectedEntityType] = useState<
    EntityType | "ALL"
  >("ALL");
  const [selectedCategory, setSelectedCategory] = useState<
    PropertyCategory | "ALL"
  >("ALL");
  const [selectedListingType, setSelectedListingType] = useState<
    ListingType | "ALL"
  >("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particlePositions, setParticlePositions] = useState<
    Array<{ left: string; top: string }>
  >([]);
  const router = useRouter();

  const modalSearchInputRef = useRef<HTMLInputElement>(null);
  const heroIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate particle positions on mount
  useEffect(() => {
    setParticlePositions(
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      })),
    );
  }, []);

  // Mouse tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(clientX - centerX);
      mouseY.set(clientY - centerY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Calculate stats from listings
  const stats = useMemo(() => calculateListingStats(listings), [listings]);

  // Featured listings for hero carousel (prioritize batiments with images)
  const featuredListings = useMemo(() => {
    const featured = listings.filter(
      (l) => l.featured && l.listingStatus === "PUBLISHED",
    );
    if (featured.length > 0) return featured.slice(0, 10);
    // Fallback to first 10 listings
    return listings.filter((l) => l.listingStatus === "PUBLISHED").slice(0, 10);
  }, [listings]);

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

    // Filter by listing type
    if (selectedListingType !== "ALL") {
      result = result.filter(
        (l) =>
          l.listingType === selectedListingType || l.listingType === "BOTH",
      );
    }

    // Search
    if (searchQuery.trim()) {
      result = searchListings(result, searchQuery);
    }

    // Sort
    result = sortListings(result, sortBy);

    return result;
  }, [
    listings,
    searchQuery,
    selectedEntityType,
    selectedCategory,
    selectedListingType,
    sortBy,
  ]);

  // Search results for modal
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchListings(listings, searchQuery).slice(0, 10);
  }, [listings, searchQuery]);

  // Hero carousel auto-rotation
  useEffect(() => {
    if (featuredListings.length === 0) return;
    heroIntervalRef.current = setInterval(() => {
      setCurrentHeroIndex((prev) =>
        prev === featuredListings.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => {
      if (heroIntervalRef.current) clearInterval(heroIntervalRef.current);
    };
  }, [featuredListings.length]);

  // Testimonial rotation
  useEffect(() => {
    testimonialIntervalRef.current = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      if (testimonialIntervalRef.current) {
        clearInterval(testimonialIntervalRef.current);
      }
    };
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (showSearchModal && modalSearchInputRef.current) {
      setTimeout(() => modalSearchInputRef.current?.focus(), 100);
    }
  }, [showSearchModal]);

  // Navigation handlers
  const handleViewAllProperties = () => {
    router.push("/properties");
  };

  const handleViewListing = (listing: Listing) => {
    router.push(getListingUrl(listing));
  };

  const currentHeroListing = featuredListings[currentHeroIndex];

  // Quick filter entity types
  const quickEntityTypes: (EntityType | "ALL")[] = [
    "ALL",
    "BATIMENT",
    "PARCELLE",
    "LOTISSEMENT",
  ];

  // Services section data
  const services = [
    {
      id: "land-survey",
      icon: MapPin,
      title: "Land Surveys",
      description:
        "Professional topographic and cadastral surveys with precision equipment and certified surveyors.",
      features: [
        "Boundary Surveys",
        "Topographic Mapping",
        "Construction Staking",
        "GPS Surveys",
      ],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "construction",
      icon: Building2,
      title: "Construction",
      description:
        "Complete construction services from foundation to finishing, delivered on time and within budget.",
      features: [
        "Residential Buildings",
        "Commercial Projects",
        "Renovations",
        "Project Management",
      ],
      gradient: "from-orange-500 to-red-500",
    },
    {
      id: "real-estate",
      icon: Home,
      title: "Real Estate",
      description:
        "Comprehensive property sales and rentals across Cameroon with expert guidance.",
      features: [
        "Property Sales",
        "Rental Services",
        "Property Management",
        "Investment Consulting",
      ],
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  // Features section data
  const features = [
    {
      icon: MapPin,
      title: "Prime Locations",
      description:
        "Exclusive properties in the most sought-after neighborhoods",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Key,
      title: "Seamless Process",
      description: "From viewing to closing, we handle every detail",
      gradient: "from-green-600 to-green-400",
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Recognized excellence in luxury real estate",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: ShieldCheck,
      title: "Trusted Service",
      description: "Secure transactions with complete transparency",
      gradient: "from-green-500 to-lime-500",
    },
  ];

  // Calculate circular positions for testimonials
  const getCircularPosition = (
    index: number,
    total: number,
    activeIndex: number,
  ) => {
    const angleStep = (2 * Math.PI) / total;
    const offsetIndex = (index - activeIndex + total) % total;
    const angle = offsetIndex * angleStep - Math.PI / 2;

    const radiusX = 280;
    const radiusY = 80;

    const x = Math.cos(angle) * radiusX;
    const y = Math.sin(angle) * radiusY;

    const normalizedPosition = (Math.sin(angle) + 1) / 2;
    const scale = 0.6 + normalizedPosition * 0.4;
    const opacity = 0.4 + normalizedPosition * 0.6;
    const zIndex = Math.round(normalizedPosition * 100);

    return { x, y, scale, opacity, zIndex, isActive: offsetIndex === 0 };
  };

  // Render listing features based on entity type
  const renderListingFeatures = (listing: Listing) => {
    if (listing._entityType === "BATIMENT") {
      const batiment = listing as Batiment;
      return (
        <>
          {batiment.bedrooms !== null && batiment.bedrooms > 0 && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Bed className="w-4 h-4 sm:w-5 sm:h-5" /> {batiment.bedrooms} Beds
            </span>
          )}
          {batiment.bathrooms !== null && batiment.bathrooms > 0 && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Bath className="w-4 h-4 sm:w-5 sm:h-5" /> {batiment.bathrooms}{" "}
              Baths
            </span>
          )}
          {batiment.surfaceArea && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Square className="w-4 h-4 sm:w-5 sm:h-5" />
              {formatArea(batiment.surfaceArea)}
            </span>
          )}
          {batiment.parkingSpaces && batiment.parkingSpaces > 0 && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Car className="w-4 h-4 sm:w-5 sm:h-5" /> {batiment.parkingSpaces}{" "}
              Parking
            </span>
          )}
          {batiment.hasElevator && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" /> Elevator
            </span>
          )}
        </>
      );
    } else if (listing._entityType === "PARCELLE") {
      const parcelle = listing as Parcelle;
      return (
        <>
          {parcelle.Sup && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Square className="w-4 h-4 sm:w-5 sm:h-5" />
              {formatArea(parcelle.Sup)}
            </span>
          )}
          {parcelle.approvedForBuilding && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" /> Build Ready
            </span>
          )}
          {parcelle.zoningType && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Map className="w-4 h-4 sm:w-5 sm:h-5" /> {parcelle.zoningType}
            </span>
          )}
        </>
      );
    } else if (listing._entityType === "LOTISSEMENT") {
      const lotissement = listing as Lotissement;
      return (
        <>
          {lotissement.Surface && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Square className="w-4 h-4 sm:w-5 sm:h-5" />
              {formatArea(lotissement.Surface)}
            </span>
          )}
          {lotissement.Nbre_lots && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
              {lotissement.Nbre_lots} Lots
            </span>
          )}
          {lotissement.hasElectricity && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Power className="w-4 h-4 sm:w-5 sm:h-5" /> Electricity
            </span>
          )}
          {lotissement.hasWater && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" /> Water
            </span>
          )}
          {lotissement.hasRoadAccess && (
            <span className="flex items-center gap-1 sm:gap-2">
              <Route className="w-4 h-4 sm:w-5 sm:h-5" /> Road Access
            </span>
          )}
        </>
      );
    }
    return null;
  };

  // Render listing badges
  const renderListingBadges = (listing: Listing) => {
    if (listing._entityType === "BATIMENT") {
      const batiment = listing as Batiment;
      return (
        <>
          {batiment.hasParking && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Car className="w-3 h-3" />
              {batiment.parkingSpaces
                ? `${batiment.parkingSpaces} Parking`
                : "Parking"}
            </span>
          )}
          {batiment.hasGenerator && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" /> Generator
            </span>
          )}
          {batiment.hasElevator && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Elevator
            </span>
          )}
          {batiment.totalUnits && batiment.totalUnits > 0 && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {batiment.totalUnits} Units
            </span>
          )}
        </>
      );
    } else if (listing._entityType === "LOTISSEMENT") {
      const lotissement = listing as Lotissement;
      return (
        <>
          {lotissement.hasElectricity && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Power className="w-3 h-3" /> Electricity
            </span>
          )}
          {lotissement.hasWater && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Droplets className="w-3 h-3" /> Water
            </span>
          )}
          {lotissement.hasRoadAccess && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Route className="w-3 h-3" /> Road Access
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
              <Building2 className="w-3 h-3" /> Build Approved
            </span>
          )}
          {parcelle.Cloture && (
            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              Fenced
            </span>
          )}
        </>
      );
    }
    return null;
  };

  // Get dynamic hero title based on listing type
  const getHeroTitle = (listing: Listing | undefined): string => {
    if (!listing) return "Dream Property";

    switch (listing._entityType) {
      case "LOTISSEMENT":
        return "Perfect Estate";
      case "PARCELLE":
        return "Ideal Land";
      case "BATIMENT":
        const batiment = listing as Batiment;
        if (batiment.propertyType) {
          switch (batiment.propertyType) {
            case "APARTMENT":
              return "Ideal Apartment";
            case "VILLA":
              return "Dream Villa";
            case "HOUSE":
              return "Perfect Home";
            case "OFFICE":
              return "Business Space";
            case "COMMERCIAL_SPACE":
              return "Commercial Property";
            default:
              return "Dream Property";
          }
        }
        return "Dream Property";
      default:
        return "Dream Property";
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${COLORS.gray[600]}2e 1px, transparent 1px), linear-gradient(to bottom, ${COLORS.gray[600]}2e 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: GRADIENTS.background.hero }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-10 transition duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${COLORS.primary[500]}26, transparent 40%)`,
        }}
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: pos.left,
              top: pos.top,
              background: COLORS.primary[400],
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: "rgba(0, 0, 0, 0.7)" }}
            onClick={() => setShowSearchModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl mx-4 rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: COLORS.white }}
          >
            <div
              className="p-6 border-b"
              style={{
                background: `linear-gradient(to right, ${COLORS.primary[50]}, ${COLORS.white})`,
                borderColor: COLORS.gray[200],
              }}
            >
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7"
                  style={{ color: COLORS.primary[600] }}
                />
                <input
                  ref={modalSearchInputRef}
                  type="text"
                  placeholder="Search properties, lands, estates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-16 py-5 border-2 rounded-2xl text-lg focus:outline-none focus:ring-4"
                  style={{
                    background: COLORS.white,
                    borderColor: COLORS.primary[200],
                    color: COLORS.gray[900],
                  }}
                />
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition hover:bg-gray-100"
                >
                  <X className="w-6 h-6" style={{ color: COLORS.gray[500] }} />
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {searchQuery.trim() === "" ? (
                <div className="p-12 text-center">
                  <Search
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: COLORS.primary[600] }}
                  />
                  <p
                    className="text-xl font-semibold"
                    style={{ color: COLORS.gray[700] }}
                  >
                    Start typing to search
                  </p>
                  <p style={{ color: COLORS.gray[500] }} className="mt-2">
                    Search properties, lands, estates, or locations
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-12 text-center">
                  <Search
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: COLORS.gray[400] }}
                  />
                  <p
                    className="text-xl font-semibold"
                    style={{ color: COLORS.gray[600] }}
                  >
                    No results found
                  </p>
                </div>
              ) : (
                searchResults.map((listing, idx) => {
                  const EntityIcon = entityTypeIcons[listing._entityType];
                  return (
                    <motion.div
                      key={`${listing._entityType}-${getListingId(listing)}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-6 flex items-center gap-6 cursor-pointer border-b transition hover:bg-green-50"
                      onClick={() => {
                        setShowSearchModal(false);
                        handleViewListing(listing);
                      }}
                    >
                      <img
                        src={getListingImage(listing)}
                        className="w-24 h-24 rounded-xl object-cover shadow-lg"
                        alt={listing.title || "Property"}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage(listing);
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"
                            style={{
                              background: `${COLORS.primary[500]}1A`,
                              color: COLORS.primary[700],
                            }}
                          >
                            <EntityIcon className="w-3 h-3" />
                            {getTypeLabel(listing)}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              background: COLORS.gray[200],
                              color: COLORS.gray[600],
                            }}
                          >
                            {getEntityTypeLabel(listing._entityType, "en")}
                          </span>
                        </div>
                        <h4
                          className="font-bold text-lg"
                          style={{ color: COLORS.gray[800] }}
                        >
                          {listing.title || "Untitled Listing"}
                        </h4>
                        <p
                          className="flex items-center gap-2 text-sm"
                          style={{ color: COLORS.gray[600] }}
                        >
                          <MapPin
                            className="w-4 h-4"
                            style={{ color: COLORS.primary[600] }}
                          />
                          {getLocationString(listing)}
                        </p>
                      </div>
                      <div className="text-right">
                        {listing.price !== null && Number(listing.price) > 0 ? (
                          <p
                            className="font-bold text-lg"
                            style={{ color: COLORS.primary[600] }}
                          >
                            {formatPrice(listing.price, listing.currency)}
                          </p>
                        ) : listing._entityType === "BATIMENT" &&
                          (listing as Batiment).rentPrice &&
                          Number((listing as Batiment).rentPrice) > 0 ? (
                          <p
                            className="font-bold text-lg"
                            style={{ color: COLORS.primary[600] }}
                          >
                            {formatPrice(
                              (listing as Batiment).rentPrice,
                              listing.currency,
                            )}
                            /mo
                          </p>
                        ) : null}
                        <p
                          className="text-sm"
                          style={{ color: COLORS.gray[500] }}
                        >
                          {formatArea(getSurfaceDisplay(listing))}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Header Component */}
      <Header stats={stats} onSearchClick={() => setShowSearchModal(true)} />

      {/* Hero Section */}
      <section
        className="relative z-20 text-white pt-36 sm:pt-40 pb-12 sm:pb-24"
        style={{ background: GRADIENTS.background.hero }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Featured Listing Carousel */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative order-1 lg:order-2"
            >
              {loading ? (
                <div className="aspect-[4/3] bg-white/10 rounded-2xl sm:rounded-3xl animate-pulse flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-white border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="aspect-[4/3] bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <p className="text-xl text-red-400 mb-2">
                      Failed to load listings
                    </p>
                    <p className="text-sm opacity-70">{error}</p>
                  </div>
                </div>
              ) : currentHeroListing ? (
                <motion.div
                  key={`hero-${currentHeroIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
                  onClick={() => handleViewListing(currentHeroListing)}
                >
                  <img
                    src={getListingImage(currentHeroListing)}
                    alt={currentHeroListing.title || "Featured Listing"}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-1000 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getPlaceholderImage(currentHeroListing);
                    }}
                  />
                  <div
                    style={{ background: GRADIENTS.overlay.darkReverse }}
                    className="absolute inset-0"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-10">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-1 px-3 sm:px-5 py-1.5 sm:py-2 text-white rounded-full text-sm sm:text-base font-bold"
                        style={{ background: GRADIENTS.button.primary }}
                      >
                        {React.createElement(
                          entityTypeIcons[currentHeroListing._entityType],
                          { className: "w-4 h-4" },
                        )}
                        {getTypeLabel(currentHeroListing)}
                      </motion.span>
                      <span
                        className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white/90"
                        style={{ background: "rgba(255,255,255,0.2)" }}
                      >
                        {getEntityTypeLabel(
                          currentHeroListing._entityType,
                          "en",
                        )}
                      </span>
                    </div>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight line-clamp-2"
                    >
                      {currentHeroListing.title || "Featured Listing"}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2 text-sm sm:text-lg opacity-90 mb-3 sm:mb-4"
                    >
                      <MapPin className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                      <span className="truncate">
                        {getLocationString(currentHeroListing)}
                      </span>
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base flex-wrap"
                    >
                      {renderListingFeatures(currentHeroListing)}
                    </motion.div>
                  </div>
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col gap-2">
                    <span
                      className="text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl"
                      style={{ background: getStatusColor(currentHeroListing) }}
                    >
                      {getListingStatusLabel(currentHeroListing)}
                    </span>
                    {currentHeroListing.price !== null &&
                      Number(currentHeroListing.price) > 0 && (
                        <span
                          className="text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl text-center"
                          style={{ background: "rgba(0,0,0,0.6)" }}
                        >
                          {formatPriceCompact(
                            currentHeroListing.price,
                            currentHeroListing.currency,
                          )}
                        </span>
                      )}
                    {currentHeroListing._entityType === "BATIMENT" &&
                      (currentHeroListing as Batiment).rentPrice &&
                      Number((currentHeroListing as Batiment).rentPrice) >
                        0 && (
                        <span
                          className="text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl text-center"
                          style={{ background: "rgba(0,0,0,0.6)" }}
                        >
                          {formatPriceCompact(
                            (currentHeroListing as Batiment).rentPrice,
                            currentHeroListing.currency,
                          )}
                          /mo
                        </span>
                      )}
                  </div>
                  <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                    {featuredListings.slice(0, 5).map((_, idx) => (
                      <motion.button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentHeroIndex(idx);
                        }}
                        whileHover={{ scale: 1.2 }}
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all"
                        style={{
                          background:
                            idx === currentHeroIndex
                              ? COLORS.primary[400]
                              : "rgba(255,255,255,0.5)",
                          width: idx === currentHeroIndex ? "24px" : undefined,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="aspect-[4/3] bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <Home className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg sm:text-2xl opacity-70">
                      No featured listings yet
                    </p>
                    <p className="text-sm opacity-50 mt-2">
                      Add listings and mark them as featured
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right: Text & CTA */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-2 lg:order-1 text-center lg:text-left"
            >
              <motion.div
                style={{
                  rotateX: rotateXSpring,
                  rotateY: rotateYSpring,
                  transformStyle: "preserve-3d",
                }}
                className="mb-6"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-4 sm:mb-6">
                  Discover Your{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: GRADIENTS.text.primary,
                      filter: `drop-shadow(0 0 60px ${COLORS.primary[500]}CC)`,
                    }}
                  >
                    {getHeroTitle(currentHeroListing)}
                  </span>{" "}
                  in Cameroon
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-base sm:text-xl lg:text-2xl opacity-90 mb-6 sm:mb-10 max-w-2xl mx-auto lg:mx-0"
              >
                {currentHeroListing?.shortDescription ||
                  currentHeroListing?.description?.substring(0, 150) ||
                  "Explore our exclusive collection of properties, lands, and estates across Cameroon."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    currentHeroListing && handleViewListing(currentHeroListing)
                  }
                  disabled={!currentHeroListing}
                  className="group px-6 sm:px-8 py-4 sm:py-5 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition transform disabled:opacity-50"
                  style={{
                    background: GRADIENTS.button.primary,
                    boxShadow: SHADOWS.glow,
                  }}
                >
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
                  View Listing
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 inline ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewAllProperties}
                  className="px-6 sm:px-8 py-4 sm:py-5 bg-white/10 backdrop-blur border-2 border-white/30 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 transition text-center"
                >
                  View All Listings
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center lg:justify-start gap-6 sm:gap-10 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/20"
              >
                <div className="text-center">
                  <p
                    className="text-2xl sm:text-4xl font-bold"
                    style={{ color: COLORS.primary[400] }}
                  >
                    {stats.published}+
                  </p>
                  <p className="text-sm sm:text-base opacity-80">Listings</p>
                </div>
                <div className="text-center">
                  <p
                    className="text-2xl sm:text-4xl font-bold"
                    style={{ color: COLORS.primary[400] }}
                  >
                    {stats.byEntityType?.BATIMENT || 0}
                  </p>
                  <p className="text-sm sm:text-base opacity-80">Properties</p>
                </div>
                <div className="text-center">
                  <p
                    className="text-2xl sm:text-4xl font-bold"
                    style={{ color: COLORS.primary[400] }}
                  >
                    {stats.byEntityType?.PARCELLE || 0}
                  </p>
                  <p className="text-sm sm:text-base opacity-80">Lands</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p
                    className="text-2xl sm:text-4xl font-bold"
                    style={{ color: COLORS.primary[400] }}
                  >
                    {stats.byEntityType?.LOTISSEMENT || 0}
                  </p>
                  <p className="text-sm sm:text-base opacity-80">Estates</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Entity Type Tabs */}
      <section className="relative z-20 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {quickEntityTypes.map((type) => {
              const isActive = selectedEntityType === type;
              const Icon =
                type === "ALL" ? Sparkles : entityTypeIcons[type as EntityType];
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedEntityType(type)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                    isActive ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                  style={{
                    background: isActive
                      ? GRADIENTS.button.primary
                      : "rgba(255, 255, 255, 0.1)",
                    boxShadow: isActive ? SHADOWS.glow : "none",
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {type === "ALL"
                    ? "All"
                    : getEntityTypeLabel(type as EntityType, "en")}
                  {type !== "ALL" && stats.byEntityType && (
                    <span
                      className="ml-1 px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.1)",
                      }}
                    >
                      {stats.byEntityType[type as EntityType] || 0}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative z-20 py-6 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: COLORS.primary[400] }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: COLORS.primary[400] }}
              >
                Our Services
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Comprehensive Real Estate Solutions
            </h2>
            <p
              className="text-xl max-w-3xl mx-auto"
              style={{ color: COLORS.gray[300] }}
            >
              From land surveys to construction and property management, we
              provide end-to-end services for all your real estate needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <Link href={`/services/${service.id}`} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="group backdrop-blur-lg rounded-3xl p-8 border-2 transition-all duration-500 cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-2xl`}
                    style={{
                      boxShadow: `0 10px 40px ${COLORS.primary[500]}40`,
                    }}
                  >
                    <service.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition">
                    {service.title}
                  </h3>

                  <p
                    className="text-base mb-6 leading-relaxed"
                    style={{ color: COLORS.gray[300] }}
                  >
                    {service.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + idx * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: COLORS.gray[400] }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: COLORS.primary[400] }}
                        />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: COLORS.white,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                    }}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              </Link>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-lg mb-6" style={{ color: COLORS.gray[300] }}>
              Need a custom solution? We're here to help with your specific
              requirements.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/contact")}
              className="px-8 py-4 rounded-xl font-bold text-lg transition"
              style={{
                background: GRADIENTS.button.primary,
                color: COLORS.white,
                boxShadow: SHADOWS.glow,
              }}
            >
              Request a Quote
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-20 py-16 sm:py-24 px-4 bg-gradient-to-b from-black/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              How We Work
            </h2>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: COLORS.gray[300] }}
            >
              Simple, transparent process from consultation to completion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Consultation",
                desc: "Share your requirements and vision with our expert team",
              },
              {
                step: "02",
                title: "Site Visit",
                desc: "We assess the property or land with professional surveys",
              },
              {
                step: "03",
                title: "Proposal",
                desc: "Receive a detailed plan and transparent pricing",
              },
              {
                step: "04",
                title: "Execution",
                desc: "We deliver quality work on time and within budget",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative text-center"
              >
                {idx < 3 && (
                  <div
                    className="hidden md:block absolute top-12 left-1/2 w-full h-0.5"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.primary[500]}, transparent)`,
                    }}
                  />
                )}

                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="relative z-10 mx-auto mb-4 w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                  style={{
                    background: GRADIENTS.button.primary,
                    boxShadow: SHADOWS.glow,
                  }}
                >
                  {item.step}
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: COLORS.gray[400] }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative z-20 py-1 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Why Choose Earth Design
            </h2>
            <p className="text-xl" style={{ color: COLORS.gray[300] }}>
              Experience excellence in every transaction
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 sm:p-8 rounded-3xl backdrop-blur-sm transition cursor-pointer border"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-2xl text-white mb-2 font-bold group-hover:text-green-400 transition">
                  {feature.title}
                </h3>
                <p
                  style={{ color: COLORS.gray[300] }}
                  className="group-hover:text-gray-200 transition"
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="relative z-20 py-1 sm:py-2 bg-gradient-to-b from-transparent to-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              {selectedEntityType === "ALL"
                ? "Featured Listings"
                : `Featured ${getEntityTypeLabel(selectedEntityType as EntityType, "en")}s`}
            </h2>
            <p className="text-xl" style={{ color: COLORS.gray[300] }}>
              Discover our latest{" "}
              {selectedEntityType === "ALL"
                ? "listings"
                : getEntityTypeLabel(
                    selectedEntityType as EntityType,
                    "en",
                  ).toLowerCase() + "s"}
            </p>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="text-center py-16 sm:py-24">
              <div
                className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-t-transparent"
                style={{
                  borderColor: COLORS.primary[600],
                  borderTopColor: "transparent",
                }}
              />
              <p
                className="text-lg sm:text-xl mt-4 sm:mt-6"
                style={{ color: COLORS.gray[300] }}
              >
                Loading listings...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16 sm:py-24">
              <p className="text-xl sm:text-2xl font-semibold text-red-400">
                {error}
              </p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16 sm:py-24">
              <Home
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                style={{ color: COLORS.gray[400] }}
              />
              <p
                className="text-xl sm:text-2xl font-semibold"
                style={{ color: COLORS.gray[300] }}
              >
                No listings found
              </p>
              <p
                className="text-base sm:text-lg mt-2"
                style={{ color: COLORS.gray[400] }}
              >
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredListings.slice(0, 8).map((listing, index) => {
                const EntityIcon = entityTypeIcons[listing._entityType];
                return (
                  <motion.div
                    key={`${listing._entityType}-${getListingId(listing)}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -12, scale: 1.02 }}
                    onClick={() => handleViewListing(listing)}
                    className="group backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden transition-all duration-500 border cursor-pointer"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        src={getListingImage(listing)}
                        alt={listing.title || "Listing"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage(listing);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/90 backdrop-blur rounded-full p-2 shadow-lg hover:bg-white transition"
                        >
                          <Heart
                            className="w-5 h-5"
                            style={{ color: COLORS.gray[800] }}
                          />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/90 backdrop-blur rounded-full p-2 shadow-lg hover:bg-white transition"
                        >
                          <Share2
                            className="w-5 h-5"
                            style={{ color: COLORS.gray[800] }}
                          />
                        </motion.button>
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <span
                          className="text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg"
                          style={{ background: getStatusColor(listing) }}
                        >
                          {getListingStatusLabel(listing)}
                        </span>
                        <span
                          className="text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 justify-center"
                          style={{ background: "rgba(0,0,0,0.5)" }}
                        >
                          <EntityIcon className="w-3 h-3" />
                          {getEntityTypeLabel(listing._entityType, "en")}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[calc(100%-2rem)]">
                        {renderListingBadges(listing)}
                      </div>
                    </div>

                    <div className="p-6">
                      <span
                        className="inline-flex items-center gap-1 px-4 py-1 rounded-full text-sm font-bold mb-3"
                        style={{
                          background: `${COLORS.primary[500]}33`,
                          color: COLORS.primary[300],
                        }}
                      >
                        <EntityIcon className="w-4 h-4" />
                        {getTypeLabel(listing)}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-green-400 transition">
                        {listing.title || "Untitled Listing"}
                      </h3>
                      <p
                        className="flex items-center gap-2 mb-4"
                        style={{ color: COLORS.gray[300] }}
                      >
                        <MapPin
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: COLORS.primary[400] }}
                        />
                        <span className="font-medium truncate">
                          {getLocationString(listing)}
                        </span>
                      </p>

                      <div className="mb-4">
                        {/* Price display */}
                        {listing.price !== null &&
                          Number(listing.price) > 0 && (
                            <p
                              className="text-2xl font-extrabold"
                              style={{ color: COLORS.primary[400] }}
                            >
                              {formatPrice(listing.price, listing.currency)}
                            </p>
                          )}

                        {/* Rent Price for Batiments */}
                        {listing._entityType === "BATIMENT" &&
                          (listing as Batiment).rentPrice &&
                          Number((listing as Batiment).rentPrice) > 0 && (
                            <p
                              className={
                                listing.price && Number(listing.price) > 0
                                  ? "text-sm mt-1 font-bold"
                                  : "text-2xl font-extrabold"
                              }
                              style={{ color: COLORS.primary[400] }}
                            >
                              {listing.price && Number(listing.price) > 0
                                ? "Rent: "
                                : ""}
                              {formatPrice(
                                (listing as Batiment).rentPrice,
                                listing.currency,
                              )}
                              /month
                            </p>
                          )}

                        {/* Price on Request */}
                        {(!listing.price || Number(listing.price) === 0) &&
                          (listing._entityType !== "BATIMENT" ||
                            !(listing as Batiment).rentPrice ||
                            Number((listing as Batiment).rentPrice) === 0) && (
                            <p
                              className="text-lg font-bold"
                              style={{ color: COLORS.primary[400] }}
                            >
                              Price on Request
                            </p>
                          )}

                        {/* Price per sqm */}
                        {listing.pricePerSqM &&
                          Number(listing.pricePerSqM) > 0 && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: COLORS.gray[500] }}
                            >
                              {formatPrice(
                                listing.pricePerSqM,
                                listing.currency,
                              )}
                              /m²
                            </p>
                          )}
                      </div>

                      <div
                        className="flex items-center gap-4 text-sm mb-2 flex-wrap"
                        style={{ color: COLORS.gray[300] }}
                      >
                        {/* Entity-specific features */}
                        {listing._entityType === "BATIMENT" && (
                          <>
                            {(listing as Batiment).bedrooms !== null &&
                              (listing as Batiment).bedrooms! > 0 && (
                                <div className="flex items-center gap-2">
                                  <Bed
                                    className="w-5 h-5"
                                    style={{ color: COLORS.primary[400] }}
                                  />
                                  <span>{(listing as Batiment).bedrooms}</span>
                                </div>
                              )}
                            {(listing as Batiment).bathrooms !== null &&
                              (listing as Batiment).bathrooms! > 0 && (
                                <div className="flex items-center gap-2">
                                  <Bath
                                    className="w-5 h-5"
                                    style={{ color: COLORS.primary[400] }}
                                  />
                                  <span>{(listing as Batiment).bathrooms}</span>
                                </div>
                              )}
                          </>
                        )}

                        {/* Surface for all types */}
                        {getSurfaceDisplay(listing) && (
                          <div className="flex items-center gap-2">
                            <Square
                              className="w-5 h-5"
                              style={{ color: COLORS.primary[400] }}
                            />
                            <span>
                              {formatArea(getSurfaceDisplay(listing))}
                            </span>
                          </div>
                        )}

                        {/* Lotissement specific */}
                        {listing._entityType === "LOTISSEMENT" &&
                          (listing as Lotissement).Nbre_lots && (
                            <div className="flex items-center gap-2">
                              <Layers
                                className="w-5 h-5"
                                style={{ color: COLORS.primary[400] }}
                              />
                              <span>
                                {(listing as Lotissement).Nbre_lots} lots
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* View All Button */}
          {filteredListings.length > 8 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewAllProperties}
                className="px-8 py-4 text-white rounded-2xl font-bold text-lg transition"
                style={{
                  background: GRADIENTS.button.primary,
                  boxShadow: SHADOWS.glow,
                }}
              >
                View All {filteredListings.length} Listings
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: COLORS.primary[400] }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: COLORS.primary[400] }}
              >
                FAQ
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
              style={{ color: COLORS.white }}
            >
              Frequently Asked Questions
            </h2>
            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto"
              style={{ color: COLORS.gray[300] }}
            >
              Everything you need to know about buying or renting property in
              Cameroon
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="backdrop-blur-lg rounded-2xl border overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor:
                    openFaqIndex === idx
                      ? COLORS.primary[500]
                      : "rgba(255, 255, 255, 0.1)",
                }}
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)
                  }
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition"
                >
                  <h3
                    className="text-lg font-bold pr-4"
                    style={{ color: COLORS.white }}
                  >
                    {faq.q}
                  </h3>
                  <motion.div
                    animate={{ rotate: openFaqIndex === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: COLORS.primary[400] }}
                    />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaqIndex === idx ? "auto" : 0,
                    opacity: openFaqIndex === idx ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 pt-0">
                    <p
                      style={{ color: COLORS.gray[300] }}
                      className="leading-relaxed"
                    >
                      {faq.a}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg mb-4" style={{ color: COLORS.gray[300] }}>
              Still have questions?
            </p>
            <button
              onClick={() => router.push("/contact")}
              className="px-8 py-4 rounded-xl font-bold transition"
              style={{
                background: GRADIENTS.button.primary,
                color: COLORS.white,
              }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <Heart
                className="w-4 h-4"
                style={{ color: COLORS.primary[400] }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: COLORS.primary[400] }}
              >
                Testimonials
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
              style={{ color: COLORS.white }}
            >
              What Our Clients Say
            </h2>
            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto"
              style={{ color: COLORS.gray[300] }}
            >
              Join hundreds of satisfied homeowners and investors
            </p>
          </motion.div>

          {/* Desktop: Circular Orbit Testimonials */}
          <div
            className="hidden lg:block relative h-[500px] w-full"
            style={{ perspective: "1000px" }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="w-[600px] h-[200px] rounded-full border-2 border-dashed opacity-20"
                style={{ borderColor: COLORS.primary[500] }}
              />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 rounded-full"
                style={{
                  background: GRADIENTS.button.primary,
                  boxShadow: `0 0 60px ${COLORS.primary[500]}80`,
                }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>

            {testimonials.map((testimonial, idx) => {
              const { x, y, scale, opacity, zIndex, isActive } =
                getCircularPosition(
                  idx,
                  testimonials.length,
                  currentTestimonialIndex,
                );

              return (
                <motion.div
                  key={idx}
                  animate={{
                    x: x,
                    y: y,
                    scale: scale,
                    opacity: opacity,
                    zIndex: zIndex,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`backdrop-blur-xl rounded-3xl p-6 border-2 transition-all duration-300 ${
                      isActive ? "shadow-2xl" : "shadow-lg"
                    }`}
                    style={{
                      background: isActive
                        ? "rgba(34, 197, 94, 0.15)"
                        : "rgba(255, 255, 255, 0.08)",
                      borderColor: isActive
                        ? COLORS.primary[500]
                        : "rgba(255, 255, 255, 0.15)",
                      boxShadow: isActive
                        ? `0 0 40px ${COLORS.primary[500]}40`
                        : "none",
                    }}
                  >
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating ? "fill-current" : ""
                          }`}
                          style={{
                            color:
                              i < testimonial.rating
                                ? COLORS.primary[400]
                                : COLORS.gray[600],
                          }}
                        />
                      ))}
                    </div>

                    <p
                      className="text-base mb-6 leading-relaxed line-clamp-4"
                      style={{
                        color: isActive ? COLORS.gray[200] : COLORS.gray[300],
                      }}
                    >
                      "{testimonial.text}"
                    </p>

                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{ background: GRADIENTS.button.primary }}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p
                          className="font-bold"
                          style={{ color: COLORS.white }}
                        >
                          {testimonial.name}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: COLORS.gray[400] }}
                        >
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <div className="hidden lg:flex justify-center gap-3 mt-8">
            {testimonials.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentTestimonialIndex(idx)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                className="relative w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  background:
                    idx === currentTestimonialIndex
                      ? COLORS.primary[400]
                      : "rgba(255,255,255,0.3)",
                  width: idx === currentTestimonialIndex ? "32px" : "12px",
                }}
              >
                {idx === currentTestimonialIndex && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: GRADIENTS.button.primary,
                      boxShadow: `0 0 20px ${COLORS.primary[500]}`,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Mobile/Tablet Testimonials */}
          <div className="lg:hidden relative">
            <div className="flex flex-col gap-4">
              {testimonials.map((testimonial, idx) => {
                const displayOrder =
                  (idx - currentTestimonialIndex + testimonials.length) %
                  testimonials.length;
                const isFirst = displayOrder === 0;

                return (
                  <motion.div
                    key={idx}
                    layout
                    animate={{
                      scale: isFirst ? 1 : 0.95,
                      opacity: isFirst ? 1 : 0.7,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={`backdrop-blur-lg rounded-2xl p-6 border transition-all ${
                      isFirst ? "border-2" : ""
                    }`}
                    style={{
                      background: isFirst
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(255, 255, 255, 0.05)",
                      borderColor: isFirst
                        ? COLORS.primary[500]
                        : "rgba(255, 255, 255, 0.1)",
                      order: displayOrder,
                    }}
                  >
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating ? "fill-current" : ""
                          }`}
                          style={{
                            color:
                              i < testimonial.rating
                                ? COLORS.primary[400]
                                : COLORS.gray[600],
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-base mb-6"
                      style={{ color: COLORS.gray[300] }}
                    >
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                        style={{ background: GRADIENTS.button.primary }}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p
                          className="font-bold"
                          style={{ color: COLORS.white }}
                        >
                          {testimonial.name}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: COLORS.gray[400] }}
                        >
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonialIndex(idx)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background:
                      idx === currentTestimonialIndex
                        ? COLORS.primary[400]
                        : "rgba(255,255,255,0.3)",
                    width: idx === currentTestimonialIndex ? "20px" : "8px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="backdrop-blur-lg rounded-3xl p-8 sm:p-12 lg:p-16 text-center border-2"
            style={{
              background: GRADIENTS.background.card,
              borderColor: COLORS.primary[500],
              boxShadow: SHADOWS.glow,
            }}
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
              style={{ color: COLORS.white }}
            >
              Ready to Find Your Dream Property?
            </h2>
            <p
              className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: COLORS.gray[300] }}
            >
              Let our expert team guide you through every step of your real
              estate journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleViewAllProperties}
                className="px-8 py-4 rounded-xl font-bold transition"
                style={{
                  background: GRADIENTS.button.primary,
                  color: COLORS.white,
                  boxShadow: SHADOWS.lg,
                }}
              >
                Browse Listings
              </button>
              <button
                onClick={() => router.push("/contact")}
                className="px-8 py-4 rounded-xl font-bold border-2 transition"
                style={{
                  borderColor: COLORS.primary[500],
                  color: COLORS.white,
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                Schedule Consultation
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />

      {/* Bottom Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${COLORS.primary[900]}33, transparent)`,
        }}
      />
    </div>
  );
}
