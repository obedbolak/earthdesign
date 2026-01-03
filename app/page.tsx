// File: app/page.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Search, Filter, Heart, Share2, Bed, Bath, Square, MapPin,
  Grid3x3, List, ChevronDown, X, Sparkles, Award,
  ShieldCheck, ArrowRight, Key, Home, Building2, TreePine,
  Car, Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COLORS, GRADIENTS, SHADOWS } from '@/lib/constants/colors';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
} from '@/lib/hooks/useProperties';

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
    Villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&q=80',
    Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop&q=80',
    Land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    Commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop&q=80',
    Building: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&h=800&fit=crop&q=80',
    House: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&q=80',
    Office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80',
    Studio: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop&q=80',
    Duplex: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop&q=80',
  };
  return map[type] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop&q=80';
};

// Get property status label
const getPropertyStatus = (property: Property): string => {
  if (property.forSale && property.forRent) return 'Sale / Rent';
  if (property.forSale) return 'For Sale';
  if (property.forRent) return 'For Rent';
  return 'Available';
};

// Get status color
const getStatusColor = (property: Property): string => {
  if (property.forSale && property.forRent) return COLORS.primary[500];
  if (property.forSale) return '#22c55e'; // green
  if (property.forRent) return '#3b82f6'; // blue
  return COLORS.gray[500];
};

// Get first available image
const getPropertyImage = (property: Property): string => {
  const images = getPropertyImages(property);
  return images.length > 0 ? images[0] : getPlaceholderImage(property.type);
};

export default function HomePage() {
  const { properties, loading, error } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PropertyType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'For Sale' | 'For Rent'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particlePositions, setParticlePositions] = useState<Array<{ left: string; top: string }>>([]);
  const router = useRouter();

  const modalSearchInputRef = useRef<HTMLInputElement>(null);
  const heroIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
    // Build filters object
    const filters: PropertyFilters = {
      published: true,
    };

    if (selectedType !== 'All') {
      filters.type = selectedType;
    }

    if (selectedStatus === 'For Sale') {
      filters.forSale = true;
    } else if (selectedStatus === 'For Rent') {
      filters.forRent = true;
    }

    // Apply search, filter, and sort
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

  // Focus search input when modal opens
  useEffect(() => {
    if (showSearchModal && modalSearchInputRef.current) {
      setTimeout(() => modalSearchInputRef.current?.focus(), 100);
    }
  }, [showSearchModal]);

  // Navigation handlers
  const handleViewAllProperties = () => {
    router.push('/properties');
  };

  const handleViewProperty = (property: Property) => {
    router.push(`/property/${property.id}`);
  };

  const currentHeroProperty = featuredProperties[currentHeroIndex];

  // Quick filter types
  const quickTypes: (PropertyType | 'All')[] = ['All', 'Villa', 'Apartment', 'Land', 'Commercial', 'House'];

  // Features section data
  const features = [
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Exclusive properties in the most sought-after neighborhoods',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Key,
      title: 'Seamless Process',
      description: 'From viewing to closing, we handle every detail',
      gradient: 'from-green-600 to-green-400',
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized excellence in luxury real estate',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: ShieldCheck,
      title: 'Trusted Service',
      description: 'Secure transactions with complete transparency',
      gradient: 'from-green-500 to-lime-500',
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${COLORS.gray[600]}2e 1px, transparent 1px), linear-gradient(to bottom, ${COLORS.gray[600]}2e 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute inset-0" style={{ background: GRADIENTS.background.hero }} />
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
            style={{ background: 'rgba(0, 0, 0, 0.7)' }}
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
              {searchQuery.trim() === '' ? (
                <div className="p-12 text-center">
                  <Search className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary[600] }} />
                  <p className="text-xl font-semibold" style={{ color: COLORS.gray[700] }}>
                    Start typing to search
                  </p>
                  <p style={{ color: COLORS.gray[500] }} className="mt-2">
                    Search by location, property type, or keywords
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-12 text-center">
                  <Search className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.gray[400] }} />
                  <p className="text-xl font-semibold" style={{ color: COLORS.gray[600] }}>
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
                      <h4 className="font-bold text-lg" style={{ color: COLORS.gray[800] }}>
                        {property.title}
                      </h4>
                      <p className="flex items-center gap-2 text-sm" style={{ color: COLORS.gray[600] }}>
                        <MapPin className="w-4 h-4" style={{ color: COLORS.primary[600] }} />
                        {getPropertyLocation(property)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg" style={{ color: COLORS.primary[600] }}>
                        {formatPrice(property.price, property.currency)}
                      </p>
                      <p className="text-sm" style={{ color: COLORS.gray[500] }}>
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
              className="relative order-2 lg:order-1"
            >
              {loading ? (
                <div className="aspect-[4/3] bg-white/10 rounded-2xl sm:rounded-3xl animate-pulse flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-white border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="aspect-[4/3] bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <p className="text-xl text-red-400 mb-2">Failed to load properties</p>
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
                      target.src = getPlaceholderImage(currentHeroProperty.type);
                    }}
                  />
                  <div style={{ background: GRADIENTS.overlay.darkReverse }} className="absolute inset-0" />
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
                      <span className="truncate">{getPropertyLocation(currentHeroProperty)}</span>
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
  {currentHeroProperty.bedrooms && currentHeroProperty.bedrooms > 0 && (
    <span className="flex items-center gap-1 sm:gap-2">
      <Bed className="w-4 h-4 sm:w-5 sm:h-5" /> {currentHeroProperty.bedrooms} Beds
    </span>
  )}
  {currentHeroProperty.bathrooms && currentHeroProperty.bathrooms > 0 && (
    <span className="flex items-center gap-1 sm:gap-2">
      <Bath className="w-4 h-4 sm:w-5 sm:h-5" /> {currentHeroProperty.bathrooms} Baths
    </span>
  )}
  {/* NEW: Show parking spaces for Batiment */}
  {currentHeroProperty.parkingSpaces && currentHeroProperty.parkingSpaces > 0 && (
    <span className="flex items-center gap-1 sm:gap-2">
      <Car className="w-4 h-4 sm:w-5 sm:h-5" /> {currentHeroProperty.parkingSpaces} Parking
    </span>
  )}
  {/* NEW: Show elevator for Batiment */}
  {currentHeroProperty.hasElevator && (
    <span className="flex items-center gap-1 sm:gap-2">
      <Building2 className="w-4 h-4 sm:w-5 sm:h-5" /> Elevator
    </span>
  )}
</motion.div>
                  </div>
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col gap-2">
  <span
    className="text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl"
    style={{ background: getStatusColor(currentHeroProperty) }}
  >
    {getPropertyStatus(currentHeroProperty)}
  </span>
  {/* Show both sale and rent prices if available */}
  {currentHeroProperty.price > 0 && (
    <span
      className="text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl text-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      {formatPriceCompact(currentHeroProperty.price, currentHeroProperty.currency)}
    </span>
  )}
  {currentHeroProperty.rentPrice && currentHeroProperty.rentPrice > 0 && (
    <span
      className="text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl text-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      {formatPriceCompact(currentHeroProperty.rentPrice, currentHeroProperty.currency)}/mo
    </span>
  )}
</div>
                  {/* Carousel dots */}
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
                          background: idx === currentHeroIndex ? COLORS.primary[400] : 'rgba(255,255,255,0.5)',
                          width: idx === currentHeroIndex ? '24px' : undefined,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="aspect-[4/3] bg-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <Home className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg sm:text-2xl opacity-70">No featured properties yet</p>
                    <p className="text-sm opacity-50 mt-2">Add properties and mark them as featured</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right: Text & CTA */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2 text-center lg:text-left"
            >
              <motion.div
                style={{
                  rotateX: rotateXSpring,
                  rotateY: rotateYSpring,
                  transformStyle: 'preserve-3d',
                }}
                className="mb-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(to right, ${COLORS.primary[500]}33, ${COLORS.primary[500]}33)`,
                    borderColor: `${COLORS.primary[500]}4D`,
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: COLORS.primary[400] }} />
                  <span className="text-sm" style={{ color: COLORS.primary[200] }}>
                    Luxury Real Estate Redefined
                  </span>
                </motion.div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-4 sm:mb-6">
                  Discover Your{' '}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: GRADIENTS.text.primary,
                      filter: `drop-shadow(0 0 60px ${COLORS.primary[500]}CC)`,
                    }}
                  >
                    {currentHeroProperty?.type === 'Land'
                      ? 'Perfect Land'
                      : currentHeroProperty?.type === 'Building'
                      ? 'Dream Building'
                      : currentHeroProperty?.type === 'Commercial'
                      ? 'Business Space'
                      : currentHeroProperty?.type === 'Apartment'
                      ? 'Ideal Apartment'
                      : 'Dream Home'}
                  </span>{' '}
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
                  'Explore our exclusive collection of premium properties across Cameroon.'}
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
                  onClick={() => currentHeroProperty && handleViewProperty(currentHeroProperty)}
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
                  <p className="text-2xl sm:text-4xl font-bold" style={{ color: COLORS.primary[400] }}>
                    {stats.published}+
                  </p>
                  <p className="text-sm sm:text-base opacity-80">Properties</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-4xl font-bold" style={{ color: COLORS.primary[400] }}>
                    {stats.forSale}
                  </p>
                  <p className="text-sm sm:text-base opacity-80">For Sale</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-4xl font-bold" style={{ color: COLORS.primary[400] }}>
                    {stats.forRent}
                  </p>
                  <p className="text-sm sm:text-base opacity-80">For Rent</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-2xl sm:text-4xl font-bold" style={{ color: COLORS.primary[400] }}>
                    {stats.featured}
                  </p>
                  <p className="text-sm sm:text-base opacity-80">Featured</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative z-20 py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Why Choose Earth Design</h2>
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
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
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
                <p style={{ color: COLORS.gray[300] }} className="group-hover:text-gray-200 transition">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="relative z-20 py-10 sm:py-20 bg-gradient-to-b from-transparent to-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 sm:mb-12 gap-4"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-2">
                Available Properties
              </h2>
              <p className="text-lg sm:text-xl" style={{ color: COLORS.gray[300] }}>
                {filteredProperties.length} properties found
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base"
                  style={{
                    background: viewMode === 'grid' ? COLORS.primary[600] : 'rgba(255, 255, 255, 0.1)',
                    color: COLORS.white,
                    boxShadow: viewMode === 'grid' ? SHADOWS.lg : 'none',
                  }}
                >
                  <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Grid</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base"
                  style={{
                    background: viewMode === 'list' ? COLORS.primary[600] : 'rgba(255, 255, 255, 0.1)',
                    color: COLORS.white,
                    boxShadow: viewMode === 'list' ? SHADOWS.lg : 'none',
                  }}
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">List</span>
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 border-2 text-white rounded-xl font-semibold transition text-sm sm:text-base"
                style={{ borderColor: COLORS.primary[500] }}
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Filters</span>
                <motion.div animate={{ rotate: showFilters ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 mb-8 sm:mb-12 border"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Refine Your Search</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-semibold mb-2" style={{ color: COLORS.gray[200] }}>
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as PropertyType | 'All')}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 text-sm sm:text-base"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: COLORS.white,
                    }}
                  >
                    {quickTypes.map((t) => (
                      <option key={t} value={t} style={{ background: COLORS.gray[900] }}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-semibold mb-2" style={{ color: COLORS.gray[200] }}>
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as 'All' | 'For Sale' | 'For Rent')}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 text-sm sm:text-base"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: COLORS.white,
                    }}
                  >
                    <option value="All" style={{ background: COLORS.gray[900] }}>All</option>
                    <option value="For Sale" style={{ background: COLORS.gray[900] }}>For Sale</option>
                    <option value="For Rent" style={{ background: COLORS.gray[900] }}>For Rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-semibold mb-2" style={{ color: COLORS.gray[200] }}>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 text-sm sm:text-base"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: COLORS.white,
                    }}
                  >
                    <option value="newest" style={{ background: COLORS.gray[900] }}>Newest First</option>
                    <option value="oldest" style={{ background: COLORS.gray[900] }}>Oldest First</option>
                    <option value="price-asc" style={{ background: COLORS.gray[900] }}>Price: Low to High</option>
                    <option value="price-desc" style={{ background: COLORS.gray[900] }}>Price: High to Low</option>
                    <option value="bedrooms-desc" style={{ background: COLORS.gray[900] }}>Most Bedrooms</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedType('All');
                      setSelectedStatus('All');
                      setSortBy('newest');
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: COLORS.white,
                    }}
                  >
                    Clear Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Properties Grid */}
          {loading ? (
            <div className="text-center py-16 sm:py-24">
              <div
                className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-t-transparent"
                style={{ borderColor: COLORS.primary[600], borderTopColor: 'transparent' }}
              />
              <p className="text-lg sm:text-xl mt-4 sm:mt-6" style={{ color: COLORS.gray[300] }}>
                Loading properties...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16 sm:py-24">
              <p className="text-xl sm:text-2xl font-semibold text-red-400">{error}</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 sm:py-24">
              <Home className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: COLORS.gray[400] }} />
              <p className="text-xl sm:text-2xl font-semibold" style={{ color: COLORS.gray[300] }}>
                No properties found
              </p>
              <p className="text-base sm:text-lg mt-2" style={{ color: COLORS.gray[400] }}>
                Try adjusting your filters or search query
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProperties.slice(0, 12).map((property, index) => (
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
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
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
                        <Heart className="w-5 h-5" style={{ color: COLORS.gray[800] }} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white/90 backdrop-blur rounded-full p-2 shadow-lg hover:bg-white transition"
                      >
                        <Share2 className="w-5 h-5" style={{ color: COLORS.gray[800] }} />
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
                    {/* Amenity badges */}

<div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[calc(100%-2rem)]">
  {property.hasParking && (
    <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
      <Car className="w-3 h-3" /> 
      {property.parkingSpaces ? `${property.parkingSpaces} Parking` : 'Parking'}
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
      <Building2 className="w-3 h-3" /> {property.totalUnits} Units
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
  <p className="flex items-center gap-2 mb-4" style={{ color: COLORS.gray[300] }}>
    <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.primary[400] }} />
    <span className="font-medium truncate">{getPropertyLocation(property)}</span>
  </p>
  
  {/* Price section - handle both sale and rent */}
  <div className="mb-4">
    {property.price > 0 && (
      <p className="text-2xl font-extrabold" style={{ color: COLORS.primary[400] }}>
        {formatPrice(property.price, property.currency)}
      </p>
    )}
    {property.forRent && property.rentPrice && property.rentPrice > 0 && (
      <p className="text-sm mt-1" style={{ color: COLORS.gray[400] }}>
        Rent: {formatPrice(property.rentPrice, property.currency)}/month
      </p>
    )}
    {property.pricePerSqM && property.pricePerSqM > 0 && (
      <p className="text-xs mt-1" style={{ color: COLORS.gray[500] }}>
        {formatPrice(property.pricePerSqM, property.currency)}/m²
      </p>
    )}
  </div>

  {/* Room details */}
  <div className="flex items-center gap-4 text-sm mb-2" style={{ color: COLORS.gray[300] }}>
    {property.bedrooms !== null && property.bedrooms > 0 && (
      <div className="flex items-center gap-2">
        <Bed className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
        <span>{property.bedrooms}</span>
      </div>
    )}
    {property.bathrooms !== null && property.bathrooms > 0 && (
      <div className="flex items-center gap-2">
        <Bath className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
        <span>{property.bathrooms}</span>
      </div>
    )}
    {property.surface && (
      <div className="flex items-center gap-2">
        <Square className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
        <span>{formatArea(property.surface)}</span>
      </div>
    )}
  </div>

  {/* Additional amenities for Batiment */}
  {(property.parkingSpaces || property.totalUnits || property.totalFloors || property.hasElevator) && (
    <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-white/10" style={{ color: COLORS.gray[400] }}>
      {property.parkingSpaces && property.parkingSpaces > 0 && (
        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
          <Car className="w-3 h-3" /> {property.parkingSpaces}
        </span>
      )}
      {property.totalUnits && property.totalUnits > 0 && (
        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
          <Building2 className="w-3 h-3" /> {property.totalUnits} units
        </span>
      )}
      {property.totalFloors && property.totalFloors > 0 && (
        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
          <Building2 className="w-3 h-3" /> {property.totalFloors} floors
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
            // List View
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
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
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
                        <p className="flex items-center gap-2 text-sm mt-1" style={{ color: COLORS.gray[300] }}>
                          <MapPin className="w-4 h-4" style={{ color: COLORS.primary[400] }} />
                          {getPropertyLocation(property)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full p-2 transition"
                          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <Heart className="w-5 h-5 text-white" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full p-2 transition"
                          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <Share2 className="w-5 h-5 text-white" />
                        </motion.button>
                      </div>
                    </div>
                    {property.shortDescription && (
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: COLORS.gray[400] }}>
                        {property.shortDescription}
                      </p>
                    )}
                    <p className="text-2xl font-extrabold mb-3" style={{ color: COLORS.primary[400] }}>
                      {formatPrice(property.price, property.currency)}
                    </p>
                    <div className="flex items-center gap-4 sm:gap-6 text-sm flex-wrap" style={{ color: COLORS.gray[300] }}>
                      {property.bedrooms !== null && property.bedrooms > 0 && (
                        <div className="flex items-center gap-2">
                          <Bed className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                          <span>{property.bedrooms} Beds</span>
                        </div>
                      )}
                      {property.bathrooms !== null && property.bathrooms > 0 && (
                        <div className="flex items-center gap-2">
                          <Bath className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                          <span>{property.bathrooms} Baths</span>
                        </div>
                      )}
                      {property.surface && (
                        <div className="flex items-center gap-2">
                          <Square className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                          <span>{formatArea(property.surface)}</span>
                        </div>
                      )}
                      {property.hasParking && (
                        <div className="flex items-center gap-2">
                          <Car className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
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