// File: app/page.tsx
"use client";

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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { COLORS, GRADIENTS, SHADOWS } from "@/lib/constants/colors";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  getFeaturedProperties,
  Property,
  PropertyType,
  PropertyTypes,
  PropertyFilters,
  SortOption,
} from "@/lib/hooks/useProperties";
import Link from "next/link";

const faqs = [
  {
    q: "How do I search for properties?",
    a: "You can search for properties by using the search bar on the homepage or by filtering options in the property listings.",
  },
  {
    q: "What are the available property types?",
    a: "We offer a variety of property types including apartments, houses, villas, commercial spaces, and land.",
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

// Property type icons
const propertyTypeIcons: Record<PropertyType, React.ComponentType<any>> = {
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

// Placeholder images by type
const getPlaceholderImage = (type: PropertyType): string => {
  const map: Record<PropertyType, string> = {
    Villa:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&q=80",
    Apartment:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop&q=80",
    Land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80",
    Commercial:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop&q=80",
    Building:
      "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&h=800&fit=crop&q=80",
    House:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&q=80",
    Office:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80",
    Studio:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop&q=80",
    Duplex:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop&q=80",
  };
  return (
    map[type] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop&q=80"
  );
};

// Get property status label
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
  return images.length > 0 ? images[0] : getPlaceholderImage(property.type);
};

export default function HomePage() {
  const { properties, loading, error } = useProperties();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<PropertyType | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<
    "All" | "For Sale" | "For Rent"
  >("All");
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
      }))
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

  // Calculate stats from properties
  const stats = useMemo(() => calculateStats(properties), [properties]);

  // Get featured properties for hero carousel
  const featuredProperties = useMemo(
    () => getFeaturedProperties(properties, 10),
    [properties]
  );

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
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

    let result = properties;

    if (searchQuery.trim()) {
      result = searchProperties(result, searchQuery);
    }

    result = filterProperties(result, filters);
    result = sortProperties(result, sortBy);

    return result;
  }, [properties, searchQuery, selectedType, selectedStatus, sortBy]);

  // Search results for modal
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchProperties(properties, searchQuery).slice(0, 10);
  }, [properties, searchQuery]);

  // Hero carousel auto-rotation
  useEffect(() => {
    if (featuredProperties.length === 0) return;
    heroIntervalRef.current = setInterval(() => {
      setCurrentHeroIndex((prev) =>
        prev === featuredProperties.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => {
      if (heroIntervalRef.current) clearInterval(heroIntervalRef.current);
    };
  }, [featuredProperties.length]);

  // Testimonial rotation - every 5 seconds
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

  const handleViewProperty = (property: Property) => {
    router.push(`/property/${property.id}`);
  };

  const currentHeroProperty = featuredProperties[currentHeroIndex];

  // Quick filter types
  const quickTypes: (PropertyType | "All")[] = [
    "All",
    "Villa",
    "Apartment",
    "Land",
    "Commercial",
    "House",
  ];

  // Services section data
  const services = [
    {
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
    activeIndex: number
  ) => {
    const angleStep = (2 * Math.PI) / total;
    const offsetIndex = (index - activeIndex + total) % total;
    const angle = offsetIndex * angleStep - Math.PI / 2; // Start from top

    // Ellipse dimensions for 3D effect
    const radiusX = 280;
    const radiusY = 80;

    const x = Math.cos(angle) * radiusX;
    const y = Math.sin(angle) * radiusY;

    // Calculate scale and opacity based on y position (front = bottom = bigger)
    const normalizedPosition = (Math.sin(angle) + 1) / 2; // 0 to 1, 1 = front
    const scale = 0.6 + normalizedPosition * 0.4;
    const opacity = 0.4 + normalizedPosition * 0.6;
    const zIndex = Math.round(normalizedPosition * 100);

    return { x, y, scale, opacity, zIndex, isActive: offsetIndex === 0 };
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
                  placeholder="Search properties, locations..."
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
                    Search by location, property type, or keywords
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
                searchResults.map((property, idx) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 flex items-center gap-6 cursor-pointer border-b transition hover:bg-green-50"
                    onClick={() => {
                      setShowSearchModal(false);
                      handleViewProperty(property);
                    }}
                  >
                    <img
                      src={getPropertyImage(property)}
                      className="w-24 h-24 rounded-xl object-cover shadow-lg"
                      alt={property.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(property.type);
                      }}
                    />
                    <div className="flex-1">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block"
                        style={{
                          background: `${COLORS.primary[500]}1A`,
                          color: COLORS.primary[700],
                        }}
                      >
                        {property.type}
                      </span>
                      <h4
                        className="font-bold text-lg"
                        style={{ color: COLORS.gray[800] }}
                      >
                        {property.title}
                      </h4>
                      <p
                        className="flex items-center gap-2 text-sm"
                        style={{ color: COLORS.gray[600] }}
                      >
                        <MapPin
                          className="w-4 h-4"
                          style={{ color: COLORS.primary[600] }}
                        />
                        {getPropertyLocation(property)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-bold text-lg"
                        style={{ color: COLORS.primary[600] }}
                      >
                        {formatPrice(property.price, property.currency)}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.gray[500] }}
                      >
                        {formatArea(property.surface)}
                      </p>
                    </div>
                  </motion.div>
                ))
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
            {/* Featured Property Carousel */}
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
                      Failed to load properties
                    </p>
                    <p className="text-sm opacity-70">{error}</p>
                  </div>
                </div>
              ) : currentHeroProperty ? (
                <motion.div
                  key={currentHeroIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
                  onClick={() => handleViewProperty(currentHeroProperty)}
                >
                  <img
                    src={getPropertyImage(currentHeroProperty)}
                    alt={currentHeroProperty.title}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-1000 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getPlaceholderImage(
                        currentHeroProperty.type
                      );
                    }}
                  />
                  <div
                    style={{ background: GRADIENTS.overlay.darkReverse }}
                    className="absolute inset-0"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-10">
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-block px-3 sm:px-5 py-1.5 sm:py-2 text-white rounded-full text-sm sm:text-base font-bold mb-3 sm:mb-4"
                      style={{ background: GRADIENTS.button.primary }}
                    >
                      {currentHeroProperty.type}
                    </motion.span>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight line-clamp-2"
                    >
                      {currentHeroProperty.title}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2 text-sm sm:text-lg opacity-90 mb-3 sm:mb-4"
                    >
                      <MapPin className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                      <span className="truncate">
                        {getPropertyLocation(currentHeroProperty)}
                      </span>
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base"
                    >
                      {currentHeroProperty.surface && (
                        <span className="flex items-center gap-1 sm:gap-2">
                          <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                          {formatArea(currentHeroProperty.surface)}
                        </span>
                      )}
                      {currentHeroProperty.bedrooms &&
                        currentHeroProperty.bedrooms > 0 && (
                          <span className="flex items-center gap-1 sm:gap-2">
                            <Bed className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                            {currentHeroProperty.bedrooms} Beds
                          </span>
                        )}
                      {currentHeroProperty.bathrooms &&
                        currentHeroProperty.bathrooms > 0 && (
                          <span className="flex items-center gap-1 sm:gap-2">
                            <Bath className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                            {currentHeroProperty.bathrooms} Baths
                          </span>
                        )}
                      {currentHeroProperty.parkingSpaces &&
                        currentHeroProperty.parkingSpaces > 0 && (
                          <span className="flex items-center gap-1 sm:gap-2">
                            <Car className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                            {currentHeroProperty.parkingSpaces} Parking
                          </span>
                        )}
                      {currentHeroProperty.hasElevator && (
                        <span className="flex items-center gap-1 sm:gap-2">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                          Elevator
                        </span>
                      )}
                    </motion.div>
                  </div>
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col gap-2">
                    <span
                      className="text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl"
                      style={{
                        background: getStatusColor(currentHeroProperty),
                      }}
                    >
                      {getPropertyStatus(currentHeroProperty)}
                    </span>
                    {currentHeroProperty.price > 0 && (
                      <span
                        className="text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl text-center"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                      >
                        {formatPriceCompact(
                          currentHeroProperty.price,
                          currentHeroProperty.currency
                        )}
                      </span>
                    )}
                    {currentHeroProperty.rentPrice &&
                      currentHeroProperty.rentPrice > 0 && (
                        <span
                          className="text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl text-center"
                          style={{ background: "rgba(0,0,0,0.6)" }}
                        >
                          {formatPriceCompact(
                            currentHeroProperty.rentPrice,
                            currentHeroProperty.currency
                          )}
                          /mo
                        </span>
                      )}
                  </div>
                  <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                    {featuredProperties.slice(0, 10).map((_, idx) => (
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
                      No featured properties yet
                    </p>
                    <p className="text-sm opacity-50 mt-2">
                      Add properties and mark them as featured
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
                    {currentHeroProperty?.type === "Land"
                      ? "Perfect Land"
                      : currentHeroProperty?.type === "Building"
                      ? "Dream Building"
                      : currentHeroProperty?.type === "Commercial"
                      ? "Business Space"
                      : currentHeroProperty?.type === "Apartment"
                      ? "Ideal Apartment"
                      : "Dream Home"}
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
                {currentHeroProperty?.shortDescription ||
                  currentHeroProperty?.description?.substring(0, 150) ||
                  "Explore our exclusive collection of premium properties across Cameroon."}
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
                    currentHeroProperty &&
                    handleViewProperty(currentHeroProperty)
                  }
                  disabled={!currentHeroProperty}
                  className="group px-6 sm:px-8 py-4 sm:py-5 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition transform disabled:opacity-50"
                  style={{
                    background: GRADIENTS.button.primary,
                    boxShadow: SHADOWS.glow,
                  }}
                >
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
                  View Property
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 inline ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewAllProperties}
                  className="px-6 sm:px-8 py-4 sm:py-5 bg-white/10 backdrop-blur border-2 border-white/30 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 transition text-center"
                >
                  View All Properties
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
                  <p className="text-sm sm:text-base opacity-80">Properties</p>
                </div>
                <div className="text-center">
                  <p
                    className="text-2xl sm:text-4xl font-bold"
                    style={{ color: COLORS.primary[400] }}
                  >
                    {stats.forSale}
                  </p>
                  <p className="text-sm sm:text-base opacity-80">For Sale</p>
                </div>
                <div className="text-center">
                  <p
                    className="text-2xl sm:text-4xl font-bold"
                    style={{ color: COLORS.primary[400] }}
                  >
                    {stats.forRent}
                  </p>
                  <p className="text-sm sm:text-base opacity-80">For Rent</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p
                    className="text-2xl sm:text-4xl font-bold"
                    style={{ color: COLORS.primary[400] }}
                  >
                    {stats.featured}
                  </p>
                  <p className="text-sm sm:text-base opacity-80">Featured</p>
                </div>
              </motion.div>
            </motion.div>
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
              <Link href={`/services/${service.title}`} key={index}>
                <motion.div
                  key={service.title}
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
                  {/* Icon */}
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

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-base mb-6 leading-relaxed"
                    style={{ color: COLORS.gray[300] }}
                  >
                    {service.description}
                  </p>

                  {/* Features List */}
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

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/contact")}
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

          {/* Call to Action */}
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
                {/* Connecting Line */}
                {idx < 3 && (
                  <div
                    className="hidden md:block absolute top-12 left-1/2 w-full h-0.5"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.primary[500]}, transparent)`,
                    }}
                  />
                )}

                {/* Step Number */}
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

      {/* Properties Section */}
      <section className="relative z-20 py-1 sm:py-2 bg-gradient-to-b from-transparent to-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* text to show */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Featured Properties
            </h2>
            <p className="text-xl" style={{ color: COLORS.gray[300] }}>
              Discover our latest listings
            </p>
          </div>

          {/* Properties Grid */}
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
                Loading properties...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16 sm:py-24">
              <p className="text-xl sm:text-2xl font-semibold text-red-400">
                {error}
              </p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 sm:py-24">
              <Home
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                style={{ color: COLORS.gray[400] }}
              />
              <p
                className="text-xl sm:text-2xl font-semibold"
                style={{ color: COLORS.gray[300] }}
              >
                No properties found
              </p>
              <p
                className="text-base sm:text-lg mt-2"
                style={{ color: COLORS.gray[400] }}
              >
                Try adjusting your filters or search query
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProperties.slice(0, 8).map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  onClick={() => handleViewProperty(property)}
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
                      src={getPropertyImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(property.type);
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
                    <div className="absolute top-4 right-4">
                      <span
                        className="text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg"
                        style={{ background: getStatusColor(property) }}
                      >
                        {getPropertyStatus(property)}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[calc(100%-2rem)]">
                      {property.hasParking && (
                        <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {property.parkingSpaces
                            ? `${property.parkingSpaces} Parking`
                            : "Parking"}
                        </span>
                      )}
                      {property.hasGenerator && (
                        <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Generator
                        </span>
                      )}
                      {property.hasElevator && (
                        <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Elevator
                        </span>
                      )}
                      {property.totalUnits && property.totalUnits > 0 && (
                        <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                          <Building2 className="w-3 h-3" />{" "}
                          {property.totalUnits} Units
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <span
                      className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-3"
                      style={{
                        background: `${COLORS.primary[500]}33`,
                        color: COLORS.primary[300],
                      }}
                    >
                      {property.type}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-green-400 transition">
                      {property.title}
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
                        {getPropertyLocation(property)}
                      </span>
                    </p>

                    <div className="mb-4">
                      {property.price > 0 && (
                        <p
                          className="text-2xl font-extrabold"
                          style={{ color: COLORS.primary[400] }}
                        >
                          {formatPrice(property.price, property.currency)}
                        </p>
                      )}
                      {property.forRent &&
                        property.rentPrice &&
                        property.rentPrice > 0 && (
                          <p
                            className="text-sm mt-1"
                            style={{ color: COLORS.gray[400] }}
                          >
                            Rent:{" "}
                            {formatPrice(property.rentPrice, property.currency)}
                            /month
                          </p>
                        )}
                      {property.pricePerSqM && property.pricePerSqM > 0 && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: COLORS.gray[500] }}
                        >
                          {formatPrice(property.pricePerSqM, property.currency)}
                          /m²
                        </p>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-4 text-sm mb-2"
                      style={{ color: COLORS.gray[300] }}
                    >
                      {property.bedrooms !== null && property.bedrooms > 0 && (
                        <div className="flex items-center gap-2">
                          <Bed
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms !== null &&
                        property.bathrooms > 0 && (
                          <div className="flex items-center gap-2">
                            <Bath
                              className="w-5 h-5"
                              style={{ color: COLORS.primary[400] }}
                            />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                      {property.surface && (
                        <div className="flex items-center gap-2">
                          <Square
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <span>{formatArea(property.surface)}</span>
                        </div>
                      )}
                    </div>

                    {(property.parkingSpaces ||
                      property.totalUnits ||
                      property.totalFloors ||
                      property.hasElevator) && (
                      <div
                        className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-white/10"
                        style={{ color: COLORS.gray[400] }}
                      >
                        {property.parkingSpaces &&
                          property.parkingSpaces > 0 && (
                            <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                              <Car className="w-3 h-3" />{" "}
                              {property.parkingSpaces}
                            </span>
                          )}
                        {property.totalUnits && property.totalUnits > 0 && (
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                            <Building2 className="w-3 h-3" />{" "}
                            {property.totalUnits} units
                          </span>
                        )}
                        {property.totalFloors && property.totalFloors > 0 && (
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                            <Building2 className="w-3 h-3" />{" "}
                            {property.totalFloors} floors
                          </span>
                        )}
                        {property.hasElevator && (
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                            ✓ Elevator
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredProperties.slice(0, 12).map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 8 }}
                  onClick={() => handleViewProperty(property)}
                  className="group backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transition flex flex-col sm:flex-row border cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <div className="relative w-full sm:w-64 lg:w-80 h-48 sm:h-auto flex-shrink-0">
                    <img
                      src={getPropertyImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(property.type);
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className="text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                        style={{ background: getStatusColor(property) }}
                      >
                        {getPropertyStatus(property)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                      <div>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                          style={{
                            background: `${COLORS.primary[500]}33`,
                            color: COLORS.primary[300],
                          }}
                        >
                          {property.type}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-green-400 transition">
                          {property.title}
                        </h3>
                        <p
                          className="flex items-center gap-2 text-sm mt-1"
                          style={{ color: COLORS.gray[300] }}
                        >
                          <MapPin
                            className="w-4 h-4"
                            style={{ color: COLORS.primary[400] }}
                          />
                          {getPropertyLocation(property)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full p-2 transition"
                          style={{ background: "rgba(255, 255, 255, 0.1)" }}
                        >
                          <Heart className="w-5 h-5 text-white" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full p-2 transition"
                          style={{ background: "rgba(255, 255, 255, 0.1)" }}
                        >
                          <Share2 className="w-5 h-5 text-white" />
                        </motion.button>
                      </div>
                    </div>
                    {property.shortDescription && (
                      <p
                        className="text-sm mb-3 line-clamp-2"
                        style={{ color: COLORS.gray[400] }}
                      >
                        {property.shortDescription}
                      </p>
                    )}
                    <p
                      className="text-2xl font-extrabold mb-3"
                      style={{ color: COLORS.primary[400] }}
                    >
                      {formatPrice(property.price, property.currency)}
                    </p>
                    <div
                      className="flex items-center gap-4 sm:gap-6 text-sm flex-wrap"
                      style={{ color: COLORS.gray[300] }}
                    >
                      {property.bedrooms !== null && property.bedrooms > 0 && (
                        <div className="flex items-center gap-2">
                          <Bed
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <span>{property.bedrooms} Beds</span>
                        </div>
                      )}
                      {property.bathrooms !== null &&
                        property.bathrooms > 0 && (
                          <div className="flex items-center gap-2">
                            <Bath
                              className="w-5 h-5"
                              style={{ color: COLORS.primary[400] }}
                            />
                            <span>{property.bathrooms} Baths</span>
                          </div>
                        )}
                      {property.surface && (
                        <div className="flex items-center gap-2">
                          <Square
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <span>{formatArea(property.surface)}</span>
                        </div>
                      )}
                      {property.hasParking && (
                        <div className="flex items-center gap-2">
                          <Car
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <span>Parking</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* View All Button */}
          {filteredProperties.length > 12 && (
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
                View All {filteredProperties.length} Properties
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

      {/* ============================================= */}
      {/* UPDATED TESTIMONIALS SECTION - CIRCULAR ORBIT */}
      {/* ============================================= */}
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
            {/* Center decorative element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="w-[600px] h-[200px] rounded-full border-2 border-dashed opacity-20"
                style={{ borderColor: COLORS.primary[500] }}
              />
            </div>

            {/* Glowing center orb */}
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

            {/* Orbiting Testimonial Cards */}
            {testimonials.map((testimonial, idx) => {
              const { x, y, scale, opacity, zIndex, isActive } =
                getCircularPosition(
                  idx,
                  testimonials.length,
                  currentTestimonialIndex
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
                    {/* Stars */}
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

                    {/* Quote */}
                    <p
                      className="text-base mb-6 leading-relaxed line-clamp-4"
                      style={{
                        color: isActive ? COLORS.gray[200] : COLORS.gray[300],
                      }}
                    >
                      "{testimonial.text}"
                    </p>

                    {/* Author */}
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

          {/* Navigation dots for desktop */}
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

          {/* Mobile/Tablet: Horizontal scrolling cards with position swap effect */}
          <div className="lg:hidden relative">
            <div className="flex flex-col gap-4">
              {testimonials.map((testimonial, idx) => {
                // Calculate visual order based on current index
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

            {/* Mobile navigation dots */}
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
                Browse Properties
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
