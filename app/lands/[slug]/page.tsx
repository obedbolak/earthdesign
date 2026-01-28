// app/lands/[slug]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Share2,
  MapPin,
  Square,
  Home,
  ArrowLeft,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  Video,
  Sparkles,
  Map,
  Layers,
  TreePine,
  Route,
  Power,
  Droplets,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  useParcelleBySlug,
  useParcelles,
  Parcelle,
  getListingImages,
  getLocationString,
  formatPrice,
  formatArea,
  getCategoryLabel,
  isForSale,
  isForRent,
} from "@/lib/hooks/useProperties";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";

// =========================================================
// LOCAL UTILITIES
// =========================================================

function formatPriceCompact(price: string | number | null | undefined): string {
  if (price == null || price === "") return "N/A";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice) || numPrice <= 0) return "N/A";
  if (numPrice >= 1e9) return `${(numPrice / 1e9).toFixed(1)}B`;
  if (numPrice >= 1e6) return `${(numPrice / 1e6).toFixed(0)}M`;
  if (numPrice >= 1e3) return `${(numPrice / 1e3).toFixed(0)}K`;
  return numPrice.toLocaleString("fr-CM");
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function getParcelleVideo(parcelle: Parcelle): string | null {
  if (!parcelle.media?.length) return null;
  const video = parcelle.media.find((m) => m.type === "video");
  return video?.url || null;
}

function getSimilarParcelles(
  parcelle: Parcelle,
  all: Parcelle[],
  limit = 6,
): Parcelle[] {
  return all
    .filter(
      (p) =>
        p.Id_Parcel !== parcelle.Id_Parcel &&
        p.listingStatus === "PUBLISHED" &&
        p.category === parcelle.category,
    )
    .slice(0, limit);
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200";

function getListingStatusLabel(parcelle: Parcelle): string {
  if (parcelle.listingType === "BOTH") return "Sale / Rent";
  if (parcelle.listingType === "SALE") return "For Sale";
  if (parcelle.listingType === "RENT") return "For Rent";
  return "Available";
}

function getStatusBgColor(parcelle: Parcelle): string {
  if (parcelle.listingType === "BOTH") return "from-purple-500 to-indigo-600";
  if (parcelle.listingType === "SALE") return "from-green-500 to-emerald-600";
  if (parcelle.listingType === "RENT") return "from-blue-500 to-cyan-600";
  return "from-gray-500 to-gray-600";
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function LandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = params?.slug as string;

  // Fetch land by slug or ID
  const { data: parcelle, loading, error } = useParcelleBySlug(slugOrId);

  // Fetch all parcelles for related
  const { data: allParcelles } = useParcelles({
    status: "PUBLISHED",
    limit: 50,
  });

  // UI State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Related parcelles
  const relatedParcelles = useMemo(() => {
    if (!parcelle || !allParcelles.length) return [];
    return getSimilarParcelles(parcelle, allParcelles, 6);
  }, [parcelle, allParcelles]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Images and video
  const images = useMemo(
    () => (parcelle ? getListingImages(parcelle) : []),
    [parcelle],
  );
  const videoUrl = useMemo(
    () => (parcelle ? getParcelleVideo(parcelle) : null),
    [parcelle],
  );
  const hasImages = images.length > 0;
  const hasVideo = !!videoUrl;

  // Navigation
  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  };

  const getCurrentImage = (): string => {
    if (!parcelle) return PLACEHOLDER_IMAGE;
    if (images.length === 0) return PLACEHOLDER_IMAGE;
    return images[currentImageIndex] || PLACEHOLDER_IMAGE;
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="relative min-h-screen"
        style={{ background: COLORS.gray[900] }}
      >
        <div
          className="fixed inset-0"
          style={{ background: GRADIENTS.background.hero }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mb-4"
              style={{
                borderColor: COLORS.primary[500],
                borderTopColor: "transparent",
              }}
            />
            <p className="text-lg font-medium text-white">
              Loading land details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !parcelle) {
    return (
      <div
        className="relative min-h-screen"
        style={{ background: COLORS.gray[900] }}
      >
        <div
          className="fixed inset-0"
          style={{ background: GRADIENTS.background.hero }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <Map
                className="w-10 h-10"
                style={{ color: COLORS.primary[400] }}
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Land Not Found
            </h1>
            <p className="text-gray-300 mb-6">
              {error ||
                "The land you're looking for doesn't exist or has been removed."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/properties")}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium"
              style={{ background: GRADIENTS.button.primary }}
            >
              <ArrowLeft className="w-4 h-4" /> Browse Properties
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: COLORS.gray[900] }}
    >
      {/* Background */}
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
      </div>

      {/* Spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${COLORS.primary[500]}15, transparent 40%)`,
        }}
      />

      {/* Lightbox */}
      {showLightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <XCircle className="w-6 h-6 text-white" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <ChevronLeft className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <ChevronRight className="w-7 h-7 text-white" />
              </button>
            </>
          )}

          <img
            src={getCurrentImage()}
            alt={parcelle.title || "Land"}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
        </motion.div>
      )}

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b"
        style={{
          background: GRADIENTS.background.hero,
          borderColor: `${COLORS.primary[700]}4D`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <img src="/logo.png" alt="Logo" className="h-12 object-contain" />
            </motion.div>
          </Link>

          <div className="flex items-center gap-2 flex-1 min-w-0 mx-4">
            <Map className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <h1 className="text-white font-bold text-sm sm:text-base truncate">
              {parcelle.title || "Land Details"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/properties">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-xl"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">All Listings</span>
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-white font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl shadow-2xl overflow-hidden border"
              style={{
                background: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <div className="relative aspect-video">
                <img
                  src={getCurrentImage()}
                  alt={parcelle.title || "Land"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                  }}
                />

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-gray-800" />
                  </button>
                  <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-gray-800" />
                  </button>
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center"
                  >
                    <Maximize2 className="w-5 h-5 text-gray-800" />
                  </button>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 bg-gradient-to-r ${getStatusBgColor(parcelle)} text-white rounded-full text-sm font-medium shadow-lg`}
                  >
                    {getListingStatusLabel(parcelle)}
                  </span>
                  <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
                    <Map className="w-3 h-3" /> Land
                  </span>
                  {parcelle.featured && (
                    <span className="px-3 py-1 bg-yellow-500 text-gray-900 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                {/* Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full text-white text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {hasImages && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition"
                      style={{
                        borderColor:
                          currentImageIndex === idx
                            ? COLORS.primary[500]
                            : "rgba(255,255,255,0.2)",
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Land Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl shadow-2xl p-6 border"
              style={{
                background: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              {/* Type Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                  Land / Parcelle
                </span>
                {parcelle.category && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-600 text-white">
                    {getCategoryLabel(parcelle.category, "en")}
                  </span>
                )}
                {parcelle.approvedForBuilding && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Build Approved
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {parcelle.title || "Land for Sale"}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 mb-6 text-gray-300">
                <MapPin
                  className="w-5 h-5"
                  style={{ color: COLORS.primary[400] }}
                />
                <span>{getLocationString(parcelle)}</span>
              </div>

              {/* Price & Surface */}
              <div
                className="flex flex-wrap items-baseline gap-8 py-6 border-y"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <div>
                  {parcelle.price && Number(parcelle.price) > 0 ? (
                    <>
                      <p className="text-sm mb-1 text-gray-400">Price</p>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: COLORS.primary[400] }}
                      >
                        {formatPrice(parcelle.price, parcelle.currency)}
                      </p>
                      {parcelle.pricePerSqM &&
                        Number(parcelle.pricePerSqM) > 0 && (
                          <p className="text-sm mt-1 text-gray-400">
                            {formatPrice(
                              parcelle.pricePerSqM,
                              parcelle.currency,
                            )}
                            /m²
                          </p>
                        )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm mb-1 text-gray-400">Price</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: COLORS.primary[400] }}
                      >
                        Prix sur demande
                      </p>
                    </>
                  )}
                </div>

                {parcelle.Sup && (
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {formatArea(parcelle.Sup)}
                      </p>
                      <p className="text-sm text-gray-400">Surface</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Description
                </h2>
                <p className="leading-relaxed text-gray-300">
                  {parcelle.description ||
                    parcelle.shortDescription ||
                    "No description available."}
                </p>
              </div>

              {/* Features */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Land Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parcelle.Sup && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Square
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Surface Area</p>
                        <p className="font-semibold text-white">
                          {formatArea(parcelle.Sup)}
                        </p>
                      </div>
                    </div>
                  )}

                  {parcelle.TF_Cree && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <FileText
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Title Deed</p>
                        <p className="font-semibold text-white">
                          {parcelle.TF_Cree}
                        </p>
                      </div>
                    </div>
                  )}

                  {parcelle.Num_lot && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Layers
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Lot Number</p>
                        <p className="font-semibold text-white">
                          {parcelle.Num_lot}
                        </p>
                      </div>
                    </div>
                  )}

                  {parcelle.zoningType && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Map
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Zoning Type</p>
                        <p className="font-semibold text-white">
                          {parcelle.zoningType}
                        </p>
                      </div>
                    </div>
                  )}

                  {parcelle.approvedForBuilding && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Building2
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">
                          Building Approval
                        </p>
                        <p className="font-semibold text-white">Approved</p>
                      </div>
                    </div>
                  )}

                  {parcelle.Cloture && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <CheckCircle2
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Fenced</p>
                        <p className="font-semibold text-white">Yes</p>
                      </div>
                    </div>
                  )}

                  {parcelle.isForDevelopment && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <TreePine
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">
                          Development Land
                        </p>
                        <p className="font-semibold text-white">Yes</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Contact */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl shadow-2xl p-6 text-white sticky top-24 border"
              style={{
                background: GRADIENTS.button.primary,
                borderColor: `${COLORS.primary[500]}50`,
              }}
            >
              <h3 className="text-xl font-bold mb-6">Contact Agent</h3>

              <div
                className="flex items-center gap-3 mb-6 p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">
                    {parcelle.createdBy?.name || "Land Agent"}
                  </p>
                  <p className="text-sm opacity-90">Real Estate Specialist</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${parcelle.createdBy?.phone || "+237677212279"}`}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">
                    {parcelle.createdBy?.phone || "+237 677 212 279"}
                  </span>
                </a>
                <a
                  href={`mailto:${parcelle.createdBy?.email || "contact@example.com"}`}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">
                    {parcelle.createdBy?.email || "contact@example.com"}
                  </span>
                </a>
              </div>

              <div className="space-y-3">
                <button
                  className="w-full py-3 bg-white font-semibold rounded-xl"
                  style={{ color: COLORS.primary[700] }}
                >
                  Request Info
                </button>
                <button
                  className="w-full py-3 border-2 font-semibold rounded-xl"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  Schedule Visit
                </button>
              </div>

              <div
                className="mt-6 pt-6 border-t text-sm space-y-2"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <div className="flex justify-between">
                  <span className="opacity-75">Property ID</span>
                  <span className="font-semibold">#{parcelle.Id_Parcel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Type</span>
                  <span className="font-semibold">Land / Parcelle</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl shadow-2xl p-6 border"
              style={{
                background: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <Clock
                      className="w-5 h-5"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <span className="text-gray-300">Listed</span>
                  </div>
                  <span className="text-white font-medium">
                    {formatTimeAgo(parcelle.createdAt)}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <Camera
                      className="w-5 h-5"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <span className="text-gray-300">Photos</span>
                  </div>
                  <span className="font-semibold text-white">
                    {images.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Lands */}
        {relatedParcelles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Similar Lands
              </h2>
              <p className="text-xl text-gray-300">
                You might also be interested in these
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedParcelles.map((related, index) => (
                <motion.div
                  key={related.Id_Parcel}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Link
                    href={`/lands/${related.slug || related.Id_Parcel}`}
                    className="group block rounded-3xl shadow-xl overflow-hidden border"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getListingImages(related)[0] || PLACEHOLDER_IMAGE}
                        alt={related.title || "Land"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`bg-gradient-to-r ${getStatusBgColor(related)} text-white px-3 py-1 rounded-full text-xs font-bold`}
                        >
                          {getListingStatusLabel(related)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-green-400 transition">
                        {related.title || "Land"}
                      </h3>
                      <p className="flex items-center gap-2 mb-3 text-sm text-gray-300">
                        <MapPin
                          className="w-4 h-4"
                          style={{ color: COLORS.primary[400] }}
                        />
                        <span className="truncate">
                          {getLocationString(related)}
                        </span>
                      </p>
                      <div className="flex items-center justify-between">
                        <p
                          className="text-xl font-bold"
                          style={{ color: COLORS.primary[400] }}
                        >
                          {related.price && Number(related.price) > 0
                            ? formatPriceCompact(related.price)
                            : "Prix sur demande"}
                        </p>
                        {related.Sup && (
                          <span className="text-sm text-gray-400">
                            {formatArea(related.Sup)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
