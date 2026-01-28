// app/properties/[slug]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
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
  Car,
  Zap,
  TreePine,
  Layers,
  Grid3X3,
  Utensils,
  Sofa,
  DoorOpen,
  Sparkles,
  Power,
  Droplets,
} from "lucide-react";
import Link from "next/link";
import {
  useBatimentBySlug,
  useBatiments,
  Batiment,
  getListingImages,
  getLocationString,
  formatPrice,
  formatArea,
  getPropertyTypeLabel,
  getCategoryLabel,
  isForSale,
  isForRent,
} from "@/lib/hooks/useProperties";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";
import Footer from "@/components/Footer";

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

function getPropertyVideo(property: Batiment): string | null {
  if (!property.media?.length) return null;
  const video = property.media.find((m) => m.type === "video");
  return video?.url || null;
}

function getSimilarProperties(
  property: Batiment,
  all: Batiment[],
  limit = 6,
): Batiment[] {
  return all
    .filter(
      (p) =>
        p.Id_Bat !== property.Id_Bat &&
        p.listingStatus === "PUBLISHED" &&
        (p.propertyType === property.propertyType ||
          p.category === property.category),
    )
    .slice(0, limit);
}

const PLACEHOLDER_IMAGES: Record<string, string> = {
  VILLA: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
  APARTMENT: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
  HOUSE: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
  OFFICE: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
  default: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
};

const getPlaceholderImage = (type?: string | null): string => {
  if (type && PLACEHOLDER_IMAGES[type]) return PLACEHOLDER_IMAGES[type];
  return PLACEHOLDER_IMAGES.default;
};

const getTypeColor = (type?: string | null): string => {
  const colors: Record<string, string> = {
    VILLA: "#10b981",
    APARTMENT: "#6366f1",
    HOUSE: "#3b82f6",
    OFFICE: "#8b5cf6",
    BUILDING: "#14b8a6",
    STUDIO: "#06b6d4",
  };
  return type ? colors[type] || "#10b981" : "#10b981";
};

const getListingStatusLabel = (property: Batiment): string => {
  if (property.listingType === "BOTH") return "Sale / Rent";
  if (property.listingType === "SALE") return "For Sale";
  if (property.listingType === "RENT") return "For Rent";
  return "Available";
};

const getStatusBgColor = (property: Batiment): string => {
  if (property.listingType === "BOTH") return "from-purple-500 to-indigo-600";
  if (property.listingType === "SALE") return "from-green-500 to-emerald-600";
  if (property.listingType === "RENT") return "from-blue-500 to-cyan-600";
  return "from-gray-500 to-gray-600";
};

// Video helpers
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const isYouTubeUrl = (url: string): boolean =>
  url.includes("youtube.com") || url.includes("youtu.be");

const getVideoThumbnail = (videoUrl: string, type?: string | null): string => {
  const videoId = getYouTubeVideoId(videoUrl);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  return getPlaceholderImage(type);
};

const getYouTubeEmbedUrl = (videoUrl: string): string => {
  const videoId = getYouTubeVideoId(videoUrl);
  if (videoId)
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  return videoUrl;
};

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = params?.slug as string;

  const { data: property, loading, error } = useBatimentBySlug(slugOrId);
  const { data: allProperties } = useBatiments({
    status: "PUBLISHED",
    limit: 50,
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const relatedProperties = useMemo(() => {
    if (!property || !allProperties.length) return [];
    return getSimilarProperties(property, allProperties, 6);
  }, [property, allProperties]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const images = useMemo(
    () => (property ? getListingImages(property) : []),
    [property],
  );
  const videoUrl = useMemo(
    () => (property ? getPropertyVideo(property) : null),
    [property],
  );
  const hasImages = images.length > 0;
  const hasVideo = !!videoUrl;

  const nextImage = () => {
    if (images.length > 0)
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length > 0)
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
  };

  const getCurrentImage = (): string => {
    if (!property) return PLACEHOLDER_IMAGES.default;
    if (images.length === 0) return getPlaceholderImage(property.propertyType);
    return (
      images[currentImageIndex] || getPlaceholderImage(property.propertyType)
    );
  };

  const getAmenitiesList = (): string[] => {
    if (!property?.amenities) return [];
    return property.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
  };

  // Loading
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
              Loading property...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error || !property) {
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
              <Home
                className="w-10 h-10"
                style={{ color: COLORS.primary[400] }}
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Property Not Found
            </h1>
            <p className="text-gray-300 mb-6">
              {error || "The property you're looking for doesn't exist."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
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

  const amenitiesList = getAmenitiesList();

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
            onClick={() => {
              setShowLightbox(false);
              setIsPlayingVideo(false);
              setShowVideo(false);
            }}
            className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <XCircle className="w-6 h-6 text-white" />
          </button>

          {!showVideo && images.length > 1 && (
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

          <div className="max-w-full max-h-[90vh] w-full flex items-center justify-center">
            {showVideo && videoUrl ? (
              isPlayingVideo ? (
                isYouTubeUrl(videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(videoUrl)}
                    className="w-full aspect-video max-h-[90vh] rounded-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[90vh] rounded-2xl"
                  />
                )
              ) : (
                <div className="relative w-full aspect-video max-h-[90vh]">
                  <img
                    src={getVideoThumbnail(videoUrl, property.propertyType)}
                    alt="Video thumbnail"
                    className="w-full h-full object-contain rounded-2xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <Play
                        className="w-16 h-16 text-white ml-2"
                        fill="white"
                      />
                    </motion.button>
                  </div>
                </div>
              )
            ) : hasImages ? (
              <img
                src={getCurrentImage()}
                alt={property.title || "Property"}
                className="max-w-full max-h-[90vh] object-contain rounded-2xl"
              />
            ) : null}
          </div>
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
            <Building2
              className="w-5 h-5 flex-shrink-0"
              style={{ color: getTypeColor(property.propertyType) }}
            />
            <h1 className="text-white font-bold text-sm sm:text-base truncate">
              {property.title || "Property Details"}
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
                <span className="hidden sm:inline">All Properties</span>
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
                {showVideo && videoUrl ? (
                  isPlayingVideo ? (
                    isYouTubeUrl(videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(videoUrl)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={getVideoThumbnail(videoUrl, property.propertyType)}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setIsPlayingVideo(true)}
                          className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-2xl"
                        >
                          <Play
                            className="w-12 h-12 text-white ml-2"
                            fill="white"
                          />
                        </motion.button>
                      </div>
                    </div>
                  )
                ) : (
                  <img
                    src={getCurrentImage()}
                    alt={property.title || "Property"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getPlaceholderImage(
                        property.propertyType,
                      );
                    }}
                  />
                )}

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
                    className={`px-3 py-1 bg-gradient-to-r ${getStatusBgColor(property)} text-white rounded-full text-sm font-medium shadow-lg`}
                  >
                    {getListingStatusLabel(property)}
                  </span>
                  {property.featured && (
                    <span className="px-3 py-1 bg-yellow-500 text-gray-900 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                {/* Navigation */}
                {!showVideo && images.length > 1 && (
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
              {(hasImages || hasVideo) && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setShowVideo(false);
                      }}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition"
                      style={{
                        borderColor:
                          !showVideo && currentImageIndex === idx
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
                  {hasVideo && (
                    <button
                      onClick={() => {
                        setShowVideo(true);
                        setIsPlayingVideo(false);
                      }}
                      className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition"
                      style={{
                        borderColor: showVideo
                          ? "#ef4444"
                          : "rgba(255,255,255,0.2)",
                      }}
                    >
                      <img
                        src={getVideoThumbnail(
                          videoUrl!,
                          property.propertyType,
                        )}
                        alt="Video"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Property Info */}
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
                {property.propertyType && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ background: getTypeColor(property.propertyType) }}
                  >
                    {getPropertyTypeLabel(property.propertyType, "en")}
                  </span>
                )}
                {property.category && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-600 text-white">
                    {getCategoryLabel(property.category, "en")}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {property.title || "Property Details"}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 mb-6 text-gray-300">
                <MapPin
                  className="w-5 h-5"
                  style={{ color: COLORS.primary[400] }}
                />
                <span>{getLocationString(property)}</span>
              </div>

              {/* Price & Stats */}
              <div
                className="flex flex-wrap items-baseline gap-8 py-6 border-y"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <div>
                  {isForSale(property) &&
                  property.price &&
                  Number(property.price) > 0 ? (
                    <>
                      <p className="text-sm mb-1 text-gray-400">Sale Price</p>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: COLORS.primary[400] }}
                      >
                        {formatPrice(property.price, property.currency)}
                      </p>
                      {property.pricePerSqM &&
                        Number(property.pricePerSqM) > 0 && (
                          <p className="text-sm mt-1 text-gray-400">
                            {formatPrice(
                              property.pricePerSqM,
                              property.currency,
                            )}
                            /m²
                          </p>
                        )}
                    </>
                  ) : isForRent(property) &&
                    property.rentPrice &&
                    Number(property.rentPrice) > 0 ? (
                    <>
                      <p className="text-sm mb-1 text-gray-400">Monthly Rent</p>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: COLORS.primary[400] }}
                      >
                        {formatPrice(property.rentPrice, property.currency)}
                      </p>
                      <p className="text-sm mt-1 text-gray-400">/month</p>
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

                  {property.listingType === "BOTH" &&
                    property.price &&
                    Number(property.price) > 0 &&
                    property.rentPrice &&
                    Number(property.rentPrice) > 0 && (
                      <div
                        className="mt-4 pt-4 border-t"
                        style={{ borderColor: "rgba(255,255,255,0.2)" }}
                      >
                        <p className="text-sm mb-1 text-gray-400">
                          Also Available for Rent
                        </p>
                        <p
                          className="text-xl font-bold"
                          style={{ color: COLORS.primary[400] }}
                        >
                          {formatPrice(property.rentPrice, property.currency)}{" "}
                          /month
                        </p>
                      </div>
                    )}
                </div>

                {property.surfaceArea && (
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {formatArea(property.surfaceArea)}
                      </p>
                      <p className="text-sm text-gray-400">Surface</p>
                    </div>
                  </div>
                )}

                {property.bedrooms && property.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {property.bedrooms}
                      </p>
                      <p className="text-sm text-gray-400">
                        {property.bedrooms > 1 ? "Bedrooms" : "Bedroom"}
                      </p>
                    </div>
                  </div>
                )}

                {property.bathrooms && property.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {property.bathrooms}
                      </p>
                      <p className="text-sm text-gray-400">
                        {property.bathrooms > 1 ? "Bathrooms" : "Bathroom"}
                      </p>
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
                  {property.description ||
                    property.shortDescription ||
                    "No description available."}
                </p>
              </div>

              {/* Amenities */}
              {(amenitiesList.length > 0 ||
                property.hasParking ||
                property.hasGenerator ||
                property.hasElevator ||
                property.hasPool ||
                property.hasGarden ||
                property.hasSecurity ||
                property.hasAirConditioning) && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Amenities & Features
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {property.hasParking && (
                      <span
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <Car
                          className="w-5 h-5"
                          style={{ color: COLORS.primary[400] }}
                        />
                        Parking
                      </span>
                    )}
                    {property.hasGenerator && (
                      <span
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <Zap
                          className="w-5 h-5"
                          style={{ color: COLORS.primary[400] }}
                        />
                        Generator
                      </span>
                    )}
                    {property.hasElevator && (
                      <span
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <Building2
                          className="w-5 h-5"
                          style={{ color: COLORS.primary[400] }}
                        />
                        Elevator
                      </span>
                    )}
                    {property.hasPool && (
                      <span
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <Droplets
                          className="w-5 h-5"
                          style={{ color: COLORS.primary[400] }}
                        />
                        Pool
                      </span>
                    )}
                    {property.hasGarden && (
                      <span
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <TreePine
                          className="w-5 h-5"
                          style={{ color: COLORS.primary[400] }}
                        />
                        Garden
                      </span>
                    )}
                    {property.hasSecurity && (
                      <span
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <CheckCircle2
                          className="w-5 h-5"
                          style={{ color: COLORS.primary[400] }}
                        />
                        Security
                      </span>
                    )}
                    {property.hasAirConditioning && (
                      <span
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <Power
                          className="w-5 h-5"
                          style={{ color: COLORS.primary[400] }}
                        />
                        AC
                      </span>
                    )}
                    {amenitiesList.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <CheckCircle2
                          className="w-4 h-4"
                          style={{ color: COLORS.primary[400] }}
                        />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Details Grid */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Property Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.surfaceArea && (
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
                          {formatArea(property.surfaceArea)}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Bed
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Bedrooms</p>
                        <p className="font-semibold text-white">
                          {property.bedrooms}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Bath
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Bathrooms</p>
                        <p className="font-semibold text-white">
                          {property.bathrooms}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.kitchens && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Utensils
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Kitchens</p>
                        <p className="font-semibold text-white">
                          {property.kitchens}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.livingRooms && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Sofa
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Living Rooms</p>
                        <p className="font-semibold text-white">
                          {property.livingRooms}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.totalFloors && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Layers
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Total Floors</p>
                        <p className="font-semibold text-white">
                          {property.totalFloors}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.floorLevel && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Building2
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Floor Level</p>
                        <p className="font-semibold text-white">
                          {property.floorLevel}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.doorNumber && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <DoorOpen
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Door Number</p>
                        <p className="font-semibold text-white">
                          {property.doorNumber}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.totalUnits && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Grid3X3
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Total Units</p>
                        <p className="font-semibold text-white">
                          {property.totalUnits}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.parkingSpaces && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Car
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">Parking Spaces</p>
                        <p className="font-semibold text-white">
                          {property.parkingSpaces}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl shadow-2xl p-6 border"
              style={{
                background: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin
                  className="w-6 h-6"
                  style={{ color: COLORS.primary[400] }}
                />{" "}
                Location
              </h2>
              <div
                className="aspect-video rounded-2xl flex items-center justify-center border"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-center">
                  <MapPin
                    className="w-16 h-16 mx-auto mb-3"
                    style={{ color: COLORS.primary[500] }}
                  />
                  <p className="text-white font-semibold text-lg">
                    Interactive Map
                  </p>
                  <p className="mt-1 text-gray-400">Coming soon</p>
                  <p
                    className="text-sm mt-2"
                    style={{ color: COLORS.primary[400] }}
                  >
                    {getLocationString(property)}
                  </p>
                  {property.address && (
                    <p className="text-sm mt-1 text-gray-400">
                      {property.address}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Contact */}
          <div className="space-y-6">
            {/* Contact Card */}
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
                    {property.createdBy?.name || "Property Agent"}
                  </p>
                  <p className="text-sm opacity-90">Real Estate Specialist</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${property.createdBy?.phone || "+237677212279"}`}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">
                    {property.createdBy?.phone || "+237 677 212 279"}
                  </span>
                </a>
                <a
                  href={`mailto:${property.createdBy?.email || "contact@example.com"}`}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">
                    {property.createdBy?.email || "contact@example.com"}
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
                  <span className="font-semibold">#{property.Id_Bat}</span>
                </div>
                {property.propertyType && (
                  <div className="flex justify-between">
                    <span className="opacity-75">Type</span>
                    <span className="font-semibold">
                      {getPropertyTypeLabel(property.propertyType, "en")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="opacity-75">Status</span>
                  <span className="font-semibold">
                    {property.listingStatus}
                  </span>
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
                    {formatTimeAgo(property.createdAt)}
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
                {hasVideo && (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Video
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <span className="text-gray-300">Video Tour</span>
                    </div>
                    <span className="font-semibold text-white">Available</span>
                  </div>
                )}
                {property.featured && (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles
                        className="w-5 h-5"
                        style={{ color: COLORS.yellow[400] }}
                      />
                      <span className="text-gray-300">Featured</span>
                    </div>
                    <span className="font-semibold text-yellow-400">Yes</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Similar Properties
              </h2>
              <p className="text-xl text-gray-300">
                You might also be interested in these
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((related, index) => (
                <motion.div
                  key={related.Id_Bat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Link
                    href={`/properties/${related.slug || related.Id_Bat}`}
                    className="group block rounded-3xl shadow-xl overflow-hidden border"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          getListingImages(related)[0] ||
                          getPlaceholderImage(related.propertyType)
                        }
                        alt={related.title || "Property"}
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
                      {related.propertyType && (
                        <div className="absolute top-3 right-3">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold text-white"
                            style={{
                              background: getTypeColor(related.propertyType),
                            }}
                          >
                            {getPropertyTypeLabel(related.propertyType, "en")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-green-400 transition">
                        {related.title || "Property"}
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
                          {isForSale(related) &&
                          related.price &&
                          Number(related.price) > 0
                            ? formatPriceCompact(related.price)
                            : isForRent(related) &&
                                related.rentPrice &&
                                Number(related.rentPrice) > 0
                              ? `${formatPriceCompact(related.rentPrice)}/month`
                              : "Prix sur demande"}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-800" />
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
