// File: app/properties/page.tsx
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
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
} from '@/lib/hooks/useProperties';
import Footer from '@/components/Footer';
import { COLORS, GRADIENTS } from '@/lib/constants/colors';

// Placeholder images by property type
const PLACEHOLDER_IMAGES: Record<PropertyType | 'default', string> = {
  Villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&q=80',
  Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&q=80',
  Land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&q=80',
  Commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
  Building: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop&q=80',
  House: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&q=80',
  Office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80',
  Studio: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80',
  Duplex: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&q=80',
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
  if (property.forSale && property.forRent) return 'Sale / Rent';
  if (property.forSale) return 'For Sale';
  if (property.forRent) return 'For Rent';
  return 'Available';
};

// Get status color
const getStatusColor = (property: Property): string => {
  if (property.forSale && property.forRent) return COLORS.primary[500];
  if (property.forSale) return '#22c55e';
  if (property.forRent) return '#3b82f6';
  return COLORS.gray[500];
};

// Get first available image
const getPropertyImage = (property: Property): string => {
  const images = getPropertyImages(property);
  return images.length > 0 ? images[0] : PLACEHOLDER_IMAGES[property.type] || PLACEHOLDER_IMAGES.default;
};

// Get placeholder image by type
const getPlaceholderImage = (type: PropertyType): string => {
  return PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.default;
};

export default function AllPropertiesPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { properties, loading, error } = useProperties();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<PropertyType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'For Sale' | 'For Rent'>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minBedrooms, setMinBedrooms] = useState<string>('');
  const [hasParking, setHasParking] = useState<boolean | undefined>(undefined);
  const [hasGenerator, setHasGenerator] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // View states
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate stats
  const stats = useMemo(() => calculateStats(properties), [properties]);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  // Handle status parameter
  const status = params.get('status');
  if (status === 'sale') {
    setSelectedStatus('For Sale');
  } else if (status === 'rent') {
    setSelectedStatus('For Rent');
  }
  
  // Handle type parameter
  const type = params.get('type');
  if (type && PropertyTypes.includes(type as PropertyType)) {
    setSelectedType(type as PropertyType);
  }
}, []);

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
  }, [properties, searchQuery, selectedType, selectedStatus, minPrice, maxPrice, minBedrooms, hasParking, hasGenerator, sortBy]);

  // Property types for filter
  const propertyTypes: (PropertyType | 'All')[] = ['All', ...PropertyTypes];

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedType('All');
    setSelectedStatus('All');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    setHasParking(undefined);
    setHasGenerator(undefined);
    setSearchQuery('');
    setSortBy('newest');
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedType !== 'All' ||
      selectedStatus !== 'All' ||
      minPrice !== '' ||
      maxPrice !== '' ||
      minBedrooms !== '' ||
      hasParking !== undefined ||
      hasGenerator !== undefined ||
      searchQuery !== ''
    );
  }, [selectedType, selectedStatus, minPrice, maxPrice, minBedrooms, hasParking, hasGenerator, searchQuery]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.gray[900] }}>
        <div className="text-center">
          <Home className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary[600] }} />
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
          <div className="relative h-64 overflow-hidden">
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
            <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                style={{
                  background: getStatusColor(property),
                  color: COLORS.white,
                }}
              >
                {getPropertyStatus(property)}
              </span>
              {property.featured && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1"
                  style={{
                    background: COLORS.yellow[500],
                    color: COLORS.gray[900],
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Add to favorites
                }}
                className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
              >
                <Heart className="w-4 h-4" style={{ color: COLORS.gray[700] }} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Share property
                }}
                className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
              >
                <Share2 className="w-4 h-4" style={{ color: COLORS.gray[700] }} />
              </motion.button>
            </div>

            {/* Amenity badges */}
            <div className="absolute bottom-3 left-3 flex gap-2">
              {property.bedrooms !== null && property.bedrooms > 0 && (
                <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                  <Bed className="w-3 h-3" /> {property.bedrooms}
                </span>
              )}
              {property.bathrooms !== null && property.bathrooms > 0 && (
                <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                  <Bath className="w-3 h-3" /> {property.bathrooms}
                </span>
              )}
              {property.hasParking && (
                <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                  <Car className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>

          <div className="p-5">
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                style={{
                  background: `${COLORS.primary[500]}30`,
                  color: COLORS.primary[200],
                }}
              >
                <TypeIcon className="w-3 h-3" />
                {property.type}
              </span>
              {property.isLandForDevelopment && (
                <span
                  className="px-2 py-1 rounded-lg text-xs font-medium"
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
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-green-300 transition">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm mb-4" style={{ color: COLORS.primary[300] }}>
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.primary[400] }} />
              <span className="truncate">{getPropertyLocation(property)}</span>
            </div>

            {/* Price and area */}
            <div
              className="flex items-center justify-between pt-4 border-t"
              style={{ borderColor: `${COLORS.primary[600]}40` }}
            >
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4" style={{ color: COLORS.primary[400] }} />
                <span className="font-semibold text-sm text-white">
                  {formatArea(property.surface)}
                </span>
              </div>
             <div className="text-right">
  {property.forSale && property.price && property.price > 0 ? (
    <p className="text-lg font-bold" style={{ color: COLORS.primary[300] }}>
      {formatPriceCompact(property.price, property.currency)}
    </p>
  ) : property.forRent && property.rentPrice && property.rentPrice > 0 ? (
    <p className="text-lg font-bold" style={{ color: COLORS.primary[300] }}>
      {formatPriceCompact(property.rentPrice, property.currency)}/mo
    </p>
  ) : (
    <p className="text-sm font-semibold" style={{ color: COLORS.primary[400] }}>
      Prix sur demande
    </p>
  )}
  {property.forRent && property.rentPrice && property.rentPrice > 0 && property.forSale && property.price && property.price > 0 && (
    <p className="text-xs" style={{ color: COLORS.primary[400] }}>
      Rent: {formatPriceCompact(property.rentPrice, property.currency)}/mo
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
          <div className="relative w-full sm:w-72 lg:w-80 h-64 sm:h-auto flex-shrink-0">
            <img
              src={getPropertyImage(property)}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage(property.type);
              }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                style={{
                  background: getStatusColor(property),
                  color: COLORS.white,
                }}
              >
                {getPropertyStatus(property)}
              </span>
              {property.featured && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1"
                  style={{
                    background: COLORS.yellow[500],
                    color: COLORS.gray[900],
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1"
                  style={{
                    background: `${COLORS.primary[500]}30`,
                    color: COLORS.primary[200],
                  }}
                >
                  <TypeIcon className="w-3 h-3" />
                  {property.type}
                </span>
                {property.isLandForDevelopment && (
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-medium"
                    style={{
                      background: `${COLORS.emerald[500]}30`,
                      color: COLORS.emerald[300],
                    }}
                  >
                    For Development
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition"
                  style={{ background: `${COLORS.white}10` }}
                >
                  <Heart className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition"
                  style={{ background: `${COLORS.white}10` }}
                >
                  <Share2 className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-300 transition">
              {property.title}
            </h3>

            {/* Short description */}
            {property.shortDescription && (
              <p className="text-sm mb-3 line-clamp-2" style={{ color: COLORS.primary[300] }}>
                {property.shortDescription}
              </p>
            )}

            {/* Location */}
            <div className="flex items-center gap-2 mb-4" style={{ color: COLORS.primary[300] }}>
              <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.primary[400] }} />
              <span>{getPropertyLocation(property)}</span>
            </div>

            {/* Stats row */}
            <div
              className="flex items-center gap-6 pt-4 border-t flex-wrap"
              style={{ borderColor: `${COLORS.primary[600]}40` }}
            >
              {property.surface && (
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                  <div>
                    <p className="text-xs" style={{ color: COLORS.primary[400] }}>
                      Area
                    </p>
                    <p className="font-semibold text-white">{formatArea(property.surface)}</p>
                  </div>
                </div>
              )}
              {property.bedrooms !== null && property.bedrooms > 0 && (
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                  <div>
                    <p className="text-xs" style={{ color: COLORS.primary[400] }}>
                      Bedrooms
                    </p>
                    <p className="font-semibold text-white">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              {property.bathrooms !== null && property.bathrooms > 0 && (
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                  <div>
                    <p className="text-xs" style={{ color: COLORS.primary[400] }}>
                      Bathrooms
                    </p>
                    <p className="font-semibold text-white">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              {property.hasParking && (
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                  <span className="text-sm text-white">Parking</span>
                </div>
              )}
              {property.hasGenerator && (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                  <span className="text-sm text-white">Generator</span>
                </div>
              )}
              <div className="ml-auto text-right">
  <p className="text-xs" style={{ color: COLORS.primary[400] }}>
    {property.forSale ? 'Sale Price' : 'Rent Price'}
  </p>
  {property.forSale && property.price && property.price > 0 ? (
    <p className="text-2xl font-bold" style={{ color: COLORS.primary[300] }}>
      {formatPrice(property.price, property.currency)}
    </p>
  ) : property.forRent && property.rentPrice && property.rentPrice > 0 ? (
    <p className="text-2xl font-bold" style={{ color: COLORS.primary[300] }}>
      {formatPrice(property.rentPrice, property.currency)}/mo
    </p>
  ) : (
    <p className="text-lg font-semibold" style={{ color: COLORS.primary[400] }}>
      Prix sur demande
    </p>
  )}
  {property.forSale && property.forRent && property.price && property.price > 0 && property.rentPrice && property.rentPrice > 0 && (
    <p className="text-xs mt-1" style={{ color: COLORS.primary[400] }}>
      Rent: {formatPrice(property.rentPrice, property.currency)}/mo
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
      className="block p-4 transition hover:bg-white/5"
    >
      <div className="flex gap-3">
        <img
          src={getPropertyImage(property)}
          alt={property.title}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getPlaceholderImage(property.type);
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded font-medium"
              style={{
                background: getStatusColor(property),
                color: COLORS.white,
              }}
            >
              {getPropertyStatus(property)}
            </span>
          </div>
          <p className="font-semibold text-sm text-white truncate mb-1">{property.title}</p>
          <p className="text-xs truncate mb-2" style={{ color: COLORS.primary[300] }}>
            {getPropertyLocation(property)}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded font-medium"
              style={{
                background: `${COLORS.primary[500]}30`,
                color: COLORS.primary[200],
              }}
            >
              {property.type}
            </span>
            {property.surface && (
              <span className="text-xs" style={{ color: COLORS.primary[400] }}>
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
        {/* Top stats bar */}
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
                  <Home className="w-4 h-4" style={{ color: COLORS.yellow[400] }} />
                  <span>
                    <strong style={{ color: COLORS.yellow[400] }}>{stats.published}</strong> Properties
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: '#22c55e' }} />
                  <span>
                    <strong style={{ color: '#22c55e' }}>{stats.forSale}</strong> For Sale
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: '#3b82f6' }} />
                  <span>
                    <strong style={{ color: '#3b82f6' }}>{stats.forRent}</strong> For Rent
                  </span>
                </div>
                {stats.featured > 0 && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: COLORS.yellow[400] }} />
                    <span>
                      <strong style={{ color: COLORS.yellow[400] }}>{stats.featured}</strong> Featured
                    </span>
                  </div>
                )}
              </div>
              <div className="flex sm:hidden items-center gap-3 text-xs">
                <span>
                  <strong style={{ color: COLORS.yellow[400] }}>{stats.published}</strong> Properties
                </span>
                <span>•</span>
                <span>
                  <strong style={{ color: '#22c55e' }}>{stats.forSale}</strong> Sale
                </span>
                <span>•</span>
                <span>
                  <strong style={{ color: '#3b82f6' }}>{stats.forRent}</strong> Rent
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden lg:inline opacity-80">📍 Yaoundé, Cameroon</span>
                <span className="opacity-80">📞 +237 677 212 279</span>
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
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 sm:gap-4 flex-shrink-0 cursor-pointer"
              >
               
                 <div
                    className="relative w-22 h-12 flex items-center justify-center"
                    style={{ borderColor: `${COLORS.primary[400]}60` }}
                  >
                    <img
                      src="/logo.png"
                      alt="earth design Logo"
                      className="w-full h-60 object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
              </motion.div>
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: COLORS.primary[600] }}
                />
                <input
                  type="text"
                  placeholder="Search properties, locations, types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-12 py-3 sm:py-4 rounded-full text-base shadow-xl transition-all focus:outline-none focus:ring-4"
                  style={{
                    background: COLORS.white,
                    color: COLORS.gray[900],
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition"
                  >
                    <X className="w-4 h-4" style={{ color: COLORS.gray[400] }} />
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition"
                  style={{ background: `${COLORS.white}15` }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full hover:bg-white/20 transition"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero section */}
      <section
        className="py-12 sm:py-16"
        style={{
          background: `linear-gradient(180deg, ${COLORS.primary[900]} 0%, ${COLORS.gray[900]} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              All Properties
            </h1>
            <p className="text-lg sm:text-xl" style={{ color: COLORS.primary[200] }}>
              Discover {stats.published}+ premium properties across Cameroon
            </p>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
          >
            {[
              { label: 'Total Properties', value: stats.published, icon: Building2, color: COLORS.yellow[400] },
              { label: 'For Sale', value: stats.forSale, icon: Tag, color: '#22c55e' },
              { label: 'For Rent', value: stats.forRent, icon: Home, color: '#3b82f6' },
              { label: 'Featured', value: stats.featured, icon: Sparkles, color: COLORS.yellow[400] },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 sm:p-6 rounded-2xl backdrop-blur-sm border text-center"
                style={{
                  background: `${COLORS.primary[800]}60`,
                  borderColor: `${COLORS.primary[600]}40`,
                }}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: stat.color }} />
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm" style={{ color: COLORS.primary[300] }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <p className="text-lg font-semibold text-white">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'}
            </p>
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="text-sm font-medium px-3 py-1 rounded-full transition flex items-center gap-1"
                style={{
                  color: COLORS.primary[300],
                  background: `${COLORS.primary[500]}20`,
                }}
              >
                <X className="w-3 h-3" />
                Clear filters
              </motion.button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View mode buttons */}
            {[
              { mode: 'grid' as const, icon: Grid3x3, label: 'Grid' },
              { mode: 'list' as const, icon: List, label: 'List' },
              { mode: 'map' as const, icon: MapIcon, label: 'Map' },
            ].map(({ mode, icon: Icon, label }) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(mode)}
                className="px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
                style={{
                  background: viewMode === mode ? GRADIENTS.button.primary : `${COLORS.white}10`,
                  color: COLORS.white,
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </motion.button>
            ))}

            {/* Filter button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border-2 rounded-xl font-medium transition"
              style={{
                borderColor: COLORS.primary[500],
                color: COLORS.white,
                background: showFilters ? `${COLORS.primary[500]}20` : 'transparent',
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: COLORS.primary[400] }}
                />
              )}
              <motion.div animate={{ rotate: showFilters ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl shadow-xl p-6 mb-6 border overflow-hidden"
              style={{
                background: `${COLORS.primary[800]}80`,
                borderColor: `${COLORS.primary[600]}40`,
                backdropFilter: 'blur(20px)',
              }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Properties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Property Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as PropertyType | 'All')}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      background: `${COLORS.primary[700]}80`,
                      color: COLORS.white,
                      borderColor: `${COLORS.primary[500]}40`,
                    }}
                  >
                    {propertyTypes.map((t) => (
                      <option key={t} value={t} style={{ background: COLORS.primary[900] }}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as 'All' | 'For Sale' | 'For Rent')}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      background: `${COLORS.primary[700]}80`,
                      color: COLORS.white,
                      borderColor: `${COLORS.primary[500]}40`,
                    }}
                  >
                    <option value="All" style={{ background: COLORS.primary[900] }}>All</option>
                    <option value="For Sale" style={{ background: COLORS.primary[900] }}>For Sale</option>
                    <option value="For Rent" style={{ background: COLORS.primary[900] }}>For Rent</option>
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Min Price (XAF)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      background: `${COLORS.primary[700]}80`,
                      color: COLORS.white,
                      borderColor: `${COLORS.primary[500]}40`,
                    }}
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Max Price (XAF)
                  </label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      background: `${COLORS.primary[700]}80`,
                      color: COLORS.white,
                      borderColor: `${COLORS.primary[500]}40`,
                    }}
                  />
                </div>

                {/* Min Bedrooms */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Min Bedrooms
                  </label>
                  <select
                    value={minBedrooms}
                    onChange={(e) => setMinBedrooms(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      background: `${COLORS.primary[700]}80`,
                      color: COLORS.white,
                      borderColor: `${COLORS.primary[500]}40`,
                    }}
                  >
                    <option value="" style={{ background: COLORS.primary[900] }}>Any</option>
                    <option value="1" style={{ background: COLORS.primary[900] }}>1+</option>
                    <option value="2" style={{ background: COLORS.primary[900] }}>2+</option>
                    <option value="3" style={{ background: COLORS.primary[900] }}>3+</option>
                    <option value="4" style={{ background: COLORS.primary[900] }}>4+</option>
                    <option value="5" style={{ background: COLORS.primary[900] }}>5+</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      background: `${COLORS.primary[700]}80`,
                      color: COLORS.white,
                      borderColor: `${COLORS.primary[500]}40`,
                    }}
                  >
                    <option value="newest" style={{ background: COLORS.primary[900] }}>Newest First</option>
                    <option value="oldest" style={{ background: COLORS.primary[900] }}>Oldest First</option>
                    <option value="price-asc" style={{ background: COLORS.primary[900] }}>Price: Low to High</option>
                    <option value="price-desc" style={{ background: COLORS.primary[900] }}>Price: High to Low</option>
                    <option value="bedrooms-desc" style={{ background: COLORS.primary[900] }}>Most Bedrooms</option>
                  </select>
                </div>

                {/* Amenities */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setHasParking(hasParking === true ? undefined : true)}
                      className="px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
                      style={{
                        background: hasParking ? GRADIENTS.button.primary : `${COLORS.primary[700]}80`,
                        color: COLORS.white,
                      }}
                    >
                      <Car className="w-4 h-4" />
                      Parking
                    </button>
                    <button
                      onClick={() => setHasGenerator(hasGenerator === true ? undefined : true)}
                      className="px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
                      style={{
                        background: hasGenerator ? GRADIENTS.button.primary : `${COLORS.primary[700]}80`,
                        color: COLORS.white,
                      }}
                    >
                      <Zap className="w-4 h-4" />
                      Generator
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Properties display */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: COLORS.primary[400] }} />
            <p style={{ color: COLORS.primary[300] }}>Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary[600] }} />
            <p className="text-xl mb-2" style={{ color: COLORS.primary[200] }}>
              No properties found
            </p>
            <p style={{ color: COLORS.primary[400] }}>Try adjusting your search or filters</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="mt-6 px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: GRADIENTS.button.primary }}
            >
              Clear All Filters
            </motion.button>
          </div>
        ) : viewMode === 'map' ? (
          // Map view
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl shadow-xl border overflow-hidden"
            style={{
              background: `${COLORS.primary[800]}40`,
              borderColor: `${COLORS.primary[600]}40`,
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-300px)]">
              <div className="lg:col-span-2 relative" style={{ background: `${COLORS.primary[900]}80` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary[500] }} />
                    <p className="font-medium mb-2 text-white">Interactive Map View</p>
                    <p className="text-sm max-w-md" style={{ color: COLORS.primary[300] }}>
                      Map integration coming soon. Properties will be displayed with their exact locations.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm" style={{ color: COLORS.primary[400] }}>
                      <MapPin className="w-4 h-4" />
                      <span>{filteredProperties.length} properties in this area</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="border-l overflow-y-auto"
                style={{
                  background: `${COLORS.primary[900]}90`,
                  borderColor: `${COLORS.primary[600]}40`,
                }}
              >
                <div
                  className="p-4 border-b sticky top-0"
                  style={{
                    background: `${COLORS.primary[800]}60`,
                    borderColor: `${COLORS.primary[600]}40`,
                  }}
                >
                  <h3 className="font-semibold text-white">Properties on Map</h3>
                  <p className="text-sm" style={{ color: COLORS.primary[300] }}>
                    {filteredProperties.length} results
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: `${COLORS.primary[700]}40` }}>
                  {filteredProperties.slice(0, 20).map((property, index) => renderMapSidebarItem(property, index))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          // Grid view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => renderGridCard(property, index))}
          </div>
        ) : (
          // List view
          <div className="space-y-4">
            {filteredProperties.map((property, index) => renderListCard(property, index))}
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section
        className="py-16"
        style={{
          background: GRADIENTS.background.hero,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: COLORS.primary[200] }}>
              Our team of experts is ready to help you find the perfect property
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition shadow-lg"
                  style={{
                    background: COLORS.white,
                    color: COLORS.primary[700],
                  }}
                >
                  <Phone className="w-5 h-5" />
                  Contact Us
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition"
                  style={{
                    background: `${COLORS.primary[700]}80`,
                    border: `2px solid ${COLORS.primary[500]}`,
                  }}
                >
                  <Home className="w-5 h-5" />
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