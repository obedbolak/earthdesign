// File: components/Header.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Home, Tag, MapPin, Square, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { COLORS, GRADIENTS } from '@/lib/constants/colors';
import { useProperties, searchProperties as searchPropertiesHelper, Property } from '@/lib/hooks/useProperties';

interface HeaderProps {
  stats: {
    total: number;
    forSale: number;
    forRent: number;
    sold: number;
  };
}

const PLACEHOLDER_IMAGES: Record<string, string> = {
  Villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&q=80',
  Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&q=80',
  Land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&q=80',
  Commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&q=80',
  Lotissement: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop&q=80',
  Building: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=400&h=300&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&q=80',
};

export default function Header({ stats }: HeaderProps) {
  const { properties } = useProperties();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Property[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Simplified search using the helper function
  useEffect(() => {
    const results = searchPropertiesHelper(properties, searchQuery);
    setSearchResults(results.slice(0, 6));
  }, [searchQuery, properties]);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
        inputRef.current?.blur();
        mobileInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleViewProperty = useCallback((property: Property) => {
    router.push(`/property/${property.table}-${property.id}`);
    setSearchQuery('');
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
  }, [router]);

  const getPlaceholderImage = useCallback((type: string) => {
    return PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.default;
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleMobileSearchOpen = useCallback(() => {
    setIsMobileSearchOpen(true);
  }, []);

  const handleMobileSearchClose = useCallback(() => {
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  }, []);

  const handleViewAllResults = useCallback(() => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  }, []);

  const showDropdown = isSearchFocused && searchQuery.trim() !== '';
  const hasResults = searchResults.length > 0;
  const showNoResults = searchQuery.trim() !== '' && !hasResults;

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
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: COLORS.primary[400] }} />
                  <span>
                    <strong style={{ color: COLORS.primary[400] }}>{stats.forRent}</strong> For Rent
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
                {/* Logo Container */}
                <div className="relative flex items-center justify-center">
                  {/* Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-full blur-md opacity-50"
                    style={{ 
                      background: `radial-gradient(circle, ${COLORS.primary[400]}40 0%, transparent 70%)` 
                    }}
                  />
                  
                  {/* Logo Image */}
                  <div className="relative w-22 h-12 flex items-center justify-center"
                    style={{ borderColor: `${COLORS.primary[400]}60` }}
                  >
                    <img 
                      src="/logo.png" 
                      alt="MAETUR Logo" 
                      className="w-full h-60 object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Brand Text */}
                <div className="hidden sm:flex flex-col">
                  <span 
                    className="text-xl md:text-2xl font-bold tracking-tight"
                    style={{ color: COLORS.white }}
                  >
                  </span>
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
            <div className="flex-1 max-w-2xl mx-4 hidden md:block relative" ref={searchRef}>
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition pointer-events-none"
                  style={{ color: isSearchFocused ? COLORS.primary[500] : COLORS.primary[600] }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search properties, locations, owners..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="w-full pl-14 pr-20 py-4 rounded-full text-base shadow-xl transition-all focus:outline-none"
                  style={{
                    background: COLORS.white,
                    color: COLORS.gray[900],
                    boxShadow: isSearchFocused
                      ? `0 0 0 4px ${COLORS.primary[500]}40, 0 20px 25px -5px rgba(0, 0, 0, 0.1)`
                      : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
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
                        <X className="w-4 h-4" style={{ color: COLORS.gray[400] }} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <span
                    className="px-2 py-1 rounded-lg text-xs font-semibold"
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
                      top: '100%',
                      background: `linear-gradient(135deg, ${COLORS.primary[900]}E6 0%, ${COLORS.emerald[900]}E6 50%, ${COLORS.teal[800]}E6 100%)`,
                      backdropFilter: 'blur(20px)',
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
                          <p className="font-semibold text-lg mb-2" style={{ color: COLORS.primary[200] }}>
                            No properties found
                          </p>
                          <p className="text-sm" style={{ color: COLORS.primary[300] }}>
                            Try a different search term
                          </p>
                        </div>
                      ) : hasResults ? (
                        <>
                          <div
                            className="px-2 py-4 border-b"
                            style={{ borderColor: `${COLORS.primary[400]}40` }}
                          >
                            <p className="text-sm font-semibold" style={{ color: COLORS.primary[100] }}>
                              Found {searchResults.length} {searchResults.length === 1 ? 'property' : 'properties'}
                            </p>
                          </div>
                          <div className="max-h-[500px] overflow-y-auto py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {searchResults.map((property, idx) => (
                                <motion.div
                                  key={`${property.table}-${property.id}`}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  onClick={() => handleViewProperty(property)}
                                  className="group cursor-pointer rounded-xl overflow-hidden transition-all hover:shadow-xl"
                                  style={{
                                    background: `${COLORS.primary[800]}99`,
                                    border: `1px solid ${COLORS.primary[600]}60`,
                                  }}
                                >
                                  <div className="relative h-40 overflow-hidden">
                                    <img
                                      src={property.images.length > 0 ? property.images[0] : getPlaceholderImage(property.type)}
                                      alt={property.title}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = getPlaceholderImage(property.type);
                                      }}
                                    />
                                    <div
                                      className="absolute inset-0"
                                      style={{ background: GRADIENTS.overlay.darkReverse }}
                                    />
                                    <div className="absolute top-3 left-3 flex gap-2">
                                      <span
                                        className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                                        style={{
                                          background: `${COLORS.primary[400]}E6`,
                                          color: COLORS.white,
                                        }}
                                      >
                                        {property.type}
                                      </span>
                                      <span
                                        className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                                        style={{
                                          background: `${COLORS.emerald[500]}E6`,
                                          color: COLORS.white,
                                        }}
                                      >
                                        {property.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-4">
                                    <h4
                                      className="font-bold text-base mb-2 line-clamp-1 group-hover:text-primary-200 transition-colors"
                                      style={{ color: COLORS.white }}
                                    >
                                      {property.title}
                                    </h4>
                                    <p
                                      className="flex items-center gap-1.5 text-sm mb-3 line-clamp-1"
                                      style={{ color: COLORS.primary[200] }}
                                    >
                                      <MapPin className="w-4 h-4 flex-shrink-0" />
                                      {property.location}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <p
                                        className="font-bold text-lg"
                                        style={{ color: COLORS.primary[300] }}
                                      >
                                        {property.price}
                                      </p>
                                      <p
                                        className="text-xs flex items-center gap-1"
                                        style={{ color: COLORS.primary[300] }}
                                      >
                                        <Square className="w-3 h-3" />
                                        {property.surface}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                          <div
                            className="px-2 py-4 border-t"
                            style={{
                              borderColor: `${COLORS.primary[400]}40`,
                            }}
                          >
                            <Link
                              href={`/properties?search=${encodeURIComponent(searchQuery)}`}
                              className="block text-center py-3 px-6 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                              style={{ background: GRADIENTS.button.primary }}
                              onClick={handleViewAllResults}
                            >
                              View all {searchResults.length} results
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
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search button (mobile) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMobileSearchOpen}
                className="md:hidden w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.button>

              {/* Account button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full hover:bg-white/20 transition"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
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
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          >
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="w-full"
              style={{
                background: GRADIENTS.background.hero,
              }}
            >
              {/* Search Input */}
              <div className="p-4 pt-6">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: COLORS.primary[500] }}
                  />
                  <input
                    ref={mobileInputRef}
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus
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
                    <X className="w-5 h-5" style={{ color: COLORS.gray[500] }} />
                  </button>
                </div>
              </div>

              {/* Mobile Search Results */}
              {searchQuery.trim() !== '' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-h-[70vh] overflow-y-auto"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary[900]}F2 0%, ${COLORS.emerald[900]}F2 50%, ${COLORS.teal[800]}F2 100%)`,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {searchResults.length === 0 ? (
                    <div className="p-8 text-center">
                      <Search
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <p className="font-semibold" style={{ color: COLORS.primary[200] }}>
                        No properties found
                      </p>
                      <p className="text-sm mt-1" style={{ color: COLORS.primary[300] }}>
                        Try a different search term
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        className="px-4 py-3 border-b"
                        style={{ borderColor: `${COLORS.primary[400]}40` }}
                      >
                        <p className="text-sm font-semibold" style={{ color: COLORS.primary[100] }}>
                          Found {searchResults.length} {searchResults.length === 1 ? 'property' : 'properties'}
                        </p>
                      </div>
                      {searchResults.map((property, idx) => (
                        <motion.div
                          key={`mobile-${property.table}-${property.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleViewProperty(property)}
                          className="flex items-center gap-3 p-4 cursor-pointer border-b transition-colors active:bg-primary-800/40"
                          style={{ borderColor: `${COLORS.primary[400]}30` }}
                        >
                          <img
                            src={property.images.length > 0 ? property.images[0] : getPlaceholderImage(property.type)}
                            alt={property.title}
                            className="w-14 h-14 rounded-lg object-cover shadow flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getPlaceholderImage(property.type);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                background: `${COLORS.primary[400]}CC`,
                                color: COLORS.white,
                              }}
                            >
                              {property.type}
                            </span>
                            <h4
                              className="font-bold text-sm truncate mt-1"
                              style={{ color: COLORS.white }}
                            >
                              {property.title}
                            </h4>
                            <p
                              className="text-xs truncate"
                              style={{ color: COLORS.primary[200] }}
                            >
                              {property.location}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className="font-bold text-sm"
                              style={{ color: COLORS.primary[300] }}
                            >
                              {property.price}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: COLORS.primary[400] }}
                            >
                              {property.surface}
                            </p>
                          </div>
                        </motion.div>
                      ))}
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