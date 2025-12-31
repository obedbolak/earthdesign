'use client';

import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useProperties, searchProperties, calculateStats } from '@/lib/hooks/useProperties';
import Footer from '@/components/Footer';
import { COLORS, GRADIENTS } from '@/lib/constants/colors';

const PLACEHOLDER_IMAGES: Record<string, string> = {
  Villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&q=80',
  Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&q=80',
  Land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&q=80',
  Commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
  Lotissement: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&q=80',
  Building: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&q=80',
};

export default function AllPropertiesPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { properties, loading, error } = useProperties();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTable, setSelectedTable] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const stats = useMemo(() => calculateStats(properties), [properties]);

  const filteredProperties = useMemo(() => {
    let filtered = properties;

    if (searchQuery.trim()) {
      filtered = searchProperties(filtered, searchQuery);
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter((p) => p.type.includes(selectedType));
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    if (selectedTable !== 'All') {
      filtered = filtered.filter((p) => p.table === selectedTable);
    }

    return filtered;
  }, [properties, searchQuery, selectedType, selectedStatus, selectedTable]);

  const propertyTypes = ['All', 'Lotissement', 'Building', 'Land', 'Villa', 'Apartment'];
  const statuses = ['All', 'For Sale', 'For Rent', 'Sold'];
  const tables = ['All', 'Lotissement', 'Parcelle', 'Batiment'];

  const getPlaceholderImage = (type: string) => {
    return PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.default;
  };

  const clearFilters = () => {
    setSelectedType('All');
    setSelectedStatus('All');
    setSelectedTable('All');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedType !== 'All' || selectedStatus !== 'All' || selectedTable !== 'All' || searchQuery !== '';

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.gray[900] }}>
        <div className="text-center">
          <Home className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary[600] }} />
          <p className="text-xl text-white mb-2">Error loading properties</p>
          <p style={{ color: COLORS.primary[400] }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.gray[900] }}>
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
                    <strong style={{ color: COLORS.yellow[400] }}>{stats.total}</strong> Properties
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: COLORS.primary[400] }} />
                  <span>
                    <strong style={{ color: COLORS.primary[400] }}>{stats.forSale}</strong> For Sale
                  </span>
                </div>
              </div>
              <div className="flex sm:hidden items-center gap-3 text-xs">
                <span>
                  <strong style={{ color: COLORS.yellow[400] }}>{stats.total}</strong> Properties
                </span>
                <span>•</span>
                <span>
                  <strong style={{ color: COLORS.primary[400] }}>{stats.forSale}</strong> For Sale
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden lg:inline opacity-80">📍 Yaoundé, Cameroon</span>
                <span className="opacity-80">📞 +237 XXX XXX XXX</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 sm:gap-4 flex-shrink-0 cursor-pointer"
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: GRADIENTS.button.primary }}
                >
                  <Home className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                    Earth Design
                  </h1>
                  <p className="text-xs md:text-sm hidden md:block" style={{ color: COLORS.primary[200] }}>
                    Premium Real Estate
                  </p>
                </div>
              </motion.div>
            </Link>

            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: COLORS.primary[600] }}
                />
                <input
                  type="text"
                  placeholder="Search properties..."
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

            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition"
                  style={{ background: `${COLORS.white}15` }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
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
              Discover {properties.length}+ premium properties across Cameroon
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
          >
            {[
              { label: 'Total Properties', value: stats.total, icon: Building2 },
              { label: 'For Sale', value: stats.forSale, icon: Tag },
              { label: 'For Rent', value: stats.forRent, icon: Home },
              { label: 'Sold', value: stats.sold, icon: TreePine },
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
                <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: COLORS.primary[400] }} />
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm" style={{ color: COLORS.primary[300] }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
                className="text-sm font-medium px-3 py-1 rounded-full transition"
                style={{
                  color: COLORS.primary[300],
                  background: `${COLORS.primary[500]}20`,
                }}
              >
                Clear filters
              </motion.button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              <motion.div animate={{ rotate: showFilters ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>

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
              <h3 className="text-lg font-bold text-white mb-4">Filter Properties</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Category
                  </label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      background: `${COLORS.primary[700]}80`,
                      color: COLORS.white,
                      borderColor: `${COLORS.primary[500]}40`,
                    }}
                  >
                    {tables.map((t) => (
                      <option key={t} value={t} style={{ background: COLORS.primary[900] }}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Property Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      background: `${COLORS.primary[700]}80`,
                      color: COLORS.white,
                      borderColor: `${COLORS.primary[500]}40`,
                    }}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s} style={{ background: COLORS.primary[900] }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.primary[200] }}>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                    style={{
                      background: `${COLORS.primary[700]}80`,
                      color: COLORS.white,
                      borderColor: `${COLORS.primary[500]}40`,
                    }}
                  >
                    <option value="newest" style={{ background: COLORS.primary[900] }}>
                      Newest First
                    </option>
                    <option value="price-low" style={{ background: COLORS.primary[900] }}>
                      Price: Low to High
                    </option>
                    <option value="price-high" style={{ background: COLORS.primary[900] }}>
                      Price: High to Low
                    </option>
                    <option value="size-large" style={{ background: COLORS.primary[900] }}>
                      Size: Largest First
                    </option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  className="p-4 border-b"
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
                  {filteredProperties.slice(0, 20).map((property, index) => (
                    <Link
                      key={`${property.table}-${property.id}-${index}`}
                      href={`/property/${property.table}-${property.id}`}
                      className="block p-4 transition hover:bg-white/5"
                    >
                      <div className="flex gap-3">
                        <img
                          src={
                            property.images.length > 0
                              ? property.images[0]
                              : getPlaceholderImage(property.type)
                          }
                          alt={property.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getPlaceholderImage(property.type);
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white truncate mb-1">
                            {property.title}
                          </p>
                          <p className="text-xs truncate mb-2" style={{ color: COLORS.primary[300] }}>
                            {property.location}
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
                            <span className="text-xs" style={{ color: COLORS.primary[400] }}>
                              {property.surface} m²
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={`${property.table}-${property.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link
                  href={`/property/${property.table}-${property.id}`}
                  className="group block rounded-2xl shadow-xl border overflow-hidden transition-all"
                  style={{
                    background: `${COLORS.primary[800]}60`,
                    borderColor: `${COLORS.primary[600]}40`,
                  }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={
                        property.images.length > 0
                          ? property.images[0]
                          : getPlaceholderImage(property.type)
                      }
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(property.type);
                      }}
                    />
                    <div className="absolute inset-0" style={{ background: GRADIENTS.overlay.darkReverse }} />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                        style={{
                          background: GRADIENTS.button.primary,
                          color: COLORS.white,
                        }}
                      >
                        {property.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
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
                        }}
                        className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                      >
                        <Share2 className="w-4 h-4" style={{ color: COLORS.gray[700] }} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: `${COLORS.primary[500]}30`,
                          color: COLORS.primary[200],
                        }}
                      >
                        {property.type}
                      </span>
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: `${COLORS.primary[600]}30`,
                          color: COLORS.primary[300],
                        }}
                      >
                        {property.table}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-green-300 transition">
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm mb-4" style={{ color: COLORS.primary[300] }}>
                      <MapPin className="w-4 h-4" style={{ color: COLORS.primary[400] }} />
                      <span className="truncate">{property.location}</span>
                    </div>

                    <div
                      className="flex items-center justify-between pt-4 border-t"
                      style={{ borderColor: `${COLORS.primary[600]}40` }}
                    >
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4" style={{ color: COLORS.primary[400] }} />
                        <span className="font-semibold text-sm text-white">{property.surface} m²</span>
                      </div>
                      <p className="text-lg font-bold" style={{ color: COLORS.primary[300] }}>
                        {property.price}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={`${property.table}-${property.id}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ x: 8 }}
              >
                <Link
                  href={`/property/${property.table}-${property.id}`}
                  className="group flex flex-col sm:flex-row rounded-2xl shadow-xl border overflow-hidden transition-all"
                  style={{
                    background: `${COLORS.primary[800]}60`,
                    borderColor: `${COLORS.primary[600]}40`,
                  }}
                >
                  <div className="relative w-full sm:w-72 h-64 sm:h-auto flex-shrink-0">
                    <img
                      src={
                        property.images.length > 0
                          ? property.images[0]
                          : getPlaceholderImage(property.type)
                      }
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(property.type);
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                        style={{
                          background: GRADIENTS.button.primary,
                          color: COLORS.white,
                        }}
                      >
                        {property.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-3 py-1 rounded-lg text-sm font-medium"
                          style={{
                            background: `${COLORS.primary[500]}30`,
                            color: COLORS.primary[200],
                          }}
                        >
                          {property.type}
                        </span>
                        <span
                          className="px-3 py-1 rounded-lg text-sm font-medium"
                          style={{
                            background: `${COLORS.primary[600]}30`,
                            color: COLORS.primary[300],
                          }}
                        >
                          {property.table}
                        </span>
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

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-300 transition">
                      {property.title}
                    </h3>

                    <div
                      className="flex items-center gap-2 mb-4"
                      style={{ color: COLORS.primary[300] }}
                    >
                      <MapPin className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                      <span>{property.location}</span>
                    </div>

                    <div
                      className="flex items-center gap-6 pt-4 border-t"
                      style={{ borderColor: `${COLORS.primary[600]}40` }}
                    >
                      <div className="flex items-center gap-2">
                        <Square className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                        <div>
                          <p className="text-sm" style={{ color: COLORS.primary[400] }}>
                            Surface
                          </p>
                          <p className="font-semibold text-white">{property.surface} m²</p>
                        </div>
                      </div>
                      {property.bedrooms && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                          <div>
                            <p className="text-sm" style={{ color: COLORS.primary[400] }}>
                              Lots
                            </p>
                            <p className="font-semibold text-white">{property.bedrooms}</p>
                          </div>
                        </div>
                      )}
                      <div className="ml-auto text-right">
                        <p className="text-sm" style={{ color: COLORS.primary[400] }}>
                          Price
                        </p>
                        <p className="text-2xl font-bold" style={{ color: COLORS.primary[300] }}>
                          {property.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

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
                  href="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition"
                  style={{
                    background: `${COLORS.primary[700]}80`,
                    border: `2px solid ${COLORS.primary[500]}`,
                  }}
                >
                  <Mail className="w-5 h-5" />
                  Request Info
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