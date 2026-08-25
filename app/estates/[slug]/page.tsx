// File: app/estates/[slug]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Square,
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
  Route,
  Power,
  Droplets,
  FileText,
  Grid3X3,
  Users,
  Calendar,
  TreePine,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useLotissementBySlug,
  useLotissements,
  Lotissement,
  Parcelle,
  getListingImages,
  getLocationString,
  formatPrice,
  formatArea,
  getCategoryLabel,
} from "@/lib/hooks/useProperties";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import PropertyLocationMap from "@/components/PropertyLocationMap";

// =========================================================
// LOCAL UTILITIES
// =========================================================

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

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("fr-CM", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function getLotissementVideo(lotissement: Lotissement): string | null {
  if (!lotissement.media?.length) return null;
  const video = lotissement.media.find((m) => m.type === "video");
  return video?.url || null;
}

function getSimilarLotissements(
  lotissement: Lotissement,
  all: Lotissement[],
  limit = 6,
): Lotissement[] {
  return all
    .filter(
      (l) =>
        l.Id_Lotis !== lotissement.Id_Lotis &&
        l.listingStatus === "PUBLISHED" &&
        l.category === lotissement.category,
    )
    .slice(0, limit);
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200";

function getListingStatusLabel(lotissement: Lotissement): string {
  if (lotissement.listingType === "BOTH") return "Sale / Rent";
  if (lotissement.listingType === "SALE") return "For Sale";
  if (lotissement.listingType === "RENT") return "For Rent";
  return "Available";
}

function getStatusBgColor(lotissement: Lotissement): string {
  if (lotissement.listingType === "BOTH")
    return "from-purple-500 to-indigo-600";
  if (lotissement.listingType === "SALE")
    return "from-green-500 to-emerald-600";
  if (lotissement.listingType === "RENT") return "from-blue-500 to-cyan-600";
  return "from-gray-500 to-gray-600";
}

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const isYouTubeUrl = (url: string): boolean =>
  url.includes("youtube.com") || url.includes("youtu.be");

const getVideoThumbnail = (videoUrl: string): string => {
  const videoId = getYouTubeVideoId(videoUrl);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  return PLACEHOLDER_IMAGE;
};

const getYouTubeEmbedUrl = (videoUrl: string): string => {
  const videoId = getYouTubeVideoId(videoUrl);
  if (videoId)
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  return videoUrl;
};

// =========================================================
// GALLERY BADGES COMPONENT
// =========================================================

function GalleryBadges({ lotissement }: { lotissement: Lotissement }) {
  const [showAll, setShowAll] = useState(false);

  const badges: {
    label: string;
    className: string;
    icon?: React.ReactNode;
  }[] = [];

  badges.push({
    label:
      lotissement.listingType === "BOTH"
        ? "Sale / Rent"
        : lotissement.listingType === "SALE"
          ? "For Sale"
          : lotissement.listingType === "RENT"
            ? "For Rent"
            : "Available",
    className: `bg-gradient-to-r ${
      lotissement.listingType === "BOTH"
        ? "from-purple-500 to-indigo-600"
        : lotissement.listingType === "SALE"
          ? "from-green-500 to-emerald-600"
          : lotissement.listingType === "RENT"
            ? "from-blue-500 to-cyan-600"
            : "from-gray-500 to-gray-600"
    } text-white`,
  });

  badges.push({
    label: "Estate",
    className: "bg-orange-500 text-white",
    icon: <Grid3X3 className="w-3 h-3" />,
  });

  if (lotissement.featured) {
    badges.push({
      label: "Featured",
      className: "bg-yellow-500 text-gray-900 font-bold",
      icon: <Sparkles className="w-3 h-3" />,
    });
  }

  if (lotissement.hasRoadAccess) {
    badges.push({
      label: "Road Access",
      className: "bg-emerald-600 text-white",
      icon: <Route className="w-3 h-3" />,
    });
  }

  if (lotissement.hasElectricity) {
    badges.push({
      label: "Electricity",
      className: "bg-yellow-600 text-white",
      icon: <Power className="w-3 h-3" />,
    });
  }

  if (lotissement.hasWater) {
    badges.push({
      label: "Water",
      className: "bg-blue-600 text-white",
      icon: <Droplets className="w-3 h-3" />,
    });
  }

  if (lotissement.Nbre_lots) {
    badges.push({
      label: `${lotissement.Nbre_lots} Lots`,
      className: "bg-black/50 backdrop-blur-sm text-white",
      icon: <Layers className="w-3 h-3" />,
    });
  }

  if (lotissement.Surface) {
    badges.push({
      label: formatArea(lotissement.Surface),
      className: "bg-black/50 backdrop-blur-sm text-white",
      icon: <Square className="w-3 h-3" />,
    });
  }

  const MAX_VISIBLE_MOBILE = 2;
  const hiddenCount = badges.length - MAX_VISIBLE_MOBILE;

  return (
    <div className="absolute top-4 left-4 z-20 max-w-[55%] sm:max-w-[60%]">
      {/* Desktop */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {badges.map((badge, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg flex items-center gap-1 ${badge.className}`}
          >
            {badge.icon}
            {badge.label}
          </span>
        ))}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex flex-wrap gap-1.5">
          {badges
            .slice(0, showAll ? badges.length : MAX_VISIBLE_MOBILE)
            .map((badge, idx) => (
              <motion.span
                key={idx}
                initial={
                  idx >= MAX_VISIBLE_MOBILE ? { opacity: 0, scale: 0.8 } : false
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay:
                    idx >= MAX_VISIBLE_MOBILE
                      ? (idx - MAX_VISIBLE_MOBILE) * 0.05
                      : 0,
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium shadow-lg flex items-center gap-1 ${badge.className}`}
              >
                {badge.icon}
                {badge.label}
              </motion.span>
            ))}

          {hiddenCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAll(!showAll);
              }}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1 bg-white/90 text-gray-800 hover:bg-white transition"
            >
              {showAll ? (
                <>
                  <ChevronLeft className="w-3 h-3" />
                  Less
                </>
              ) : (
                <>
                  +{hiddenCount}
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function EstateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = params?.slug as string;

  const { data: lotissement, loading, error } = useLotissementBySlug(slugOrId);

  const { data: allLotissements } = useLotissements({
    status: "PUBLISHED",
    limit: 50,
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "parcels">(
    "overview",
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const relatedLotissements = useMemo(() => {
    if (!lotissement || !allLotissements.length) return [];
    return getSimilarLotissements(lotissement, allLotissements, 6);
  }, [lotissement, allLotissements]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const images = useMemo(
    () => (lotissement ? getListingImages(lotissement) : []),
    [lotissement],
  );
  const videoUrl = useMemo(
    () => (lotissement ? getLotissementVideo(lotissement) : null),
    [lotissement],
  );
  const hasImages = images.length > 0;
  const hasVideo = !!videoUrl;

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
    if (!lotissement) return PLACEHOLDER_IMAGE;
    if (images.length === 0) return PLACEHOLDER_IMAGE;
    return images[currentImageIndex] || PLACEHOLDER_IMAGE;
  };

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
              Loading estate details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lotissement) {
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
              <Grid3X3
                className="w-10 h-10"
                style={{ color: COLORS.primary[400] }}
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Estate Not Found
            </h1>
            <p className="text-gray-300 mb-6">
              {error ||
                "The estate you're looking for doesn't exist or has been removed."}
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
            onClick={() => {
              setShowLightbox(false);
              setIsPlayingVideo(false);
              setShowVideo(false);
            }}
            className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 transition"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <XCircle className="w-6 h-6 text-white" />
          </button>

          {!showVideo && images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center hover:bg-white/20 transition"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <ChevronLeft className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center hover:bg-white/20 transition"
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
                    src={getVideoThumbnail(videoUrl)}
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
                alt={lotissement.title || "Estate"}
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
            <Grid3X3 className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <h1 className="text-white font-bold text-sm sm:text-base truncate">
              {lotissement.title || "Estate Details"}
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
            {/* ==========================================
                IMAGE GALLERY — SINGLE aspect-video
                ========================================== */}
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
                {/* Image / Video Display */}
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
                        src={getVideoThumbnail(videoUrl)}
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
                    alt={lotissement.title || "Estate"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                )}

                {/* Action Buttons — top right */}
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                  <FavoriteButton
                    entityType="LOTISSEMENT"
                    entityId={lotissement.Id_Lotis}
                    variant="default"
                    size="md"
                  />
                  <ShareButton
                    entityType="LOTISSEMENT"
                    entityId={lotissement.Id_Lotis}
                    variant="default"
                    slug={lotissement.slug}
                    description={lotissement.description || ""}
                    size="md"
                    title={
                      lotissement.title ||
                      lotissement.Lieudit ||
                      "Estate for Sale"
                    }
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLightbox(true)}
                    className="w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
                  >
                    <Maximize2 className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Badges — top left */}
                <GalleryBadges lotissement={lotissement} />

                {/* Image Navigation */}
                {!showVideo && images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition z-10"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition z-10"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm z-10">
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
                        src={getVideoThumbnail(videoUrl!)}
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

            {/* Estate Info */}
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
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500 text-white">
                  Estate / Lotissement
                </span>
                {lotissement.category && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-600 text-white">
                    {getCategoryLabel(lotissement.category, "en")}
                  </span>
                )}
                {lotissement.Statut && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                    {lotissement.Statut}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {lotissement.title || lotissement.Lieudit || "Estate for Sale"}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 mb-6 text-gray-300">
                <MapPin
                  className="w-5 h-5"
                  style={{ color: COLORS.primary[400] }}
                />
                <span>{getLocationString(lotissement)}</span>
              </div>

              {/* Price & Surface */}
              <div
                className="flex flex-wrap items-baseline gap-8 py-6 border-y"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <div>
                  {lotissement.price && Number(lotissement.price) > 0 ? (
                    <>
                      <p className="text-sm mb-1 text-gray-400">Price</p>
                      {/* Only show price/m² if available, otherwise fallback to total price or pricePerSqM if that's the only one */}
                      {lotissement.pricePerSqM &&
                      Number(lotissement.pricePerSqM) > 0 ? (
                        <p
                          className="text-3xl font-bold"
                          style={{ color: COLORS.primary[400] }}
                        >
                          {formatPriceCompact(lotissement.pricePerSqM)} XAF/m²
                        </p>
                      ) : (
                        <p
                          className="text-3xl font-bold"
                          style={{ color: COLORS.primary[400] }}
                        >
                          {formatPrice(lotissement.price, lotissement.currency)}
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

                {lotissement.Surface && (
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {formatArea(lotissement.Surface)}
                      </p>
                      <p className="text-sm text-gray-400">Total Surface</p>
                    </div>
                  </div>
                )}

                {lotissement.Nbre_lots && (
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {lotissement.Nbre_lots}
                      </p>
                      <p className="text-sm text-gray-400">Total Lots</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
                {lotissement.totalParcels != null && (
                  <div className="text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: COLORS.primary[400] }}
                    >
                      {lotissement.totalParcels}
                    </p>
                    <p className="text-sm text-gray-400">Total Parcels</p>
                  </div>
                )}
                {lotissement.availableParcels != null && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {lotissement.availableParcels}
                    </p>
                    <p className="text-sm text-gray-400">Available</p>
                  </div>
                )}
                {lotissement.hasRoadAccess && (
                  <div className="text-center">
                    <Route
                      className="w-6 h-6 mx-auto mb-1"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <p className="text-sm text-gray-400">Road Access</p>
                  </div>
                )}
                {lotissement.hasElectricity && (
                  <div className="text-center">
                    <Power
                      className="w-6 h-6 mx-auto mb-1"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <p className="text-sm text-gray-400">Electricity</p>
                  </div>
                )}
                {lotissement.hasWater && (
                  <div className="text-center">
                    <Droplets
                      className="w-6 h-6 mx-auto mb-1"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <p className="text-sm text-gray-400">Water</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div
                className="flex gap-4 border-b mb-6"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-3 px-2 font-medium transition ${
                    activeTab === "overview"
                      ? "text-white border-b-2"
                      : "text-gray-400"
                  }`}
                  style={{
                    borderColor:
                      activeTab === "overview"
                        ? COLORS.primary[500]
                        : "transparent",
                  }}
                >
                  Overview
                </button>
                {lotissement.parcelles && lotissement.parcelles.length > 0 && (
                  <button
                    onClick={() => setActiveTab("parcels")}
                    className={`pb-3 px-2 font-medium transition ${
                      activeTab === "parcels"
                        ? "text-white border-b-2"
                        : "text-gray-400"
                    }`}
                    style={{
                      borderColor:
                        activeTab === "parcels"
                          ? COLORS.primary[500]
                          : "transparent",
                    }}
                  >
                    Parcels ({lotissement.parcelles.length})
                  </button>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                      Description
                    </h2>
                    <p className="leading-relaxed text-gray-300">
                      {lotissement.description ||
                        lotissement.shortDescription ||
                        "No description available."}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                      Estate Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lotissement.Surface && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Square
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">
                              Total Surface
                            </p>
                            <p className="font-semibold text-white">
                              {formatArea(lotissement.Surface)}
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.Num_TF && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <FileText
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">
                              Title Deed (TF)
                            </p>
                            <p className="font-semibold text-white">
                              {lotissement.Num_TF}
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.Nom_proprio && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Users
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">Owner</p>
                            <p className="font-semibold text-white">
                              {lotissement.Nom_proprio}
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.Nbre_lots && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Layers
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">
                              Number of Lots
                            </p>
                            <p className="font-semibold text-white">
                              {lotissement.Nbre_lots}
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.Date_approb && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Calendar
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">
                              Approval Date
                            </p>
                            <p className="font-semibold text-white">
                              {formatDate(lotissement.Date_approb)}
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.Nom_cons && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Building2
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">Surveyor</p>
                            <p className="font-semibold text-white">
                              {lotissement.Nom_cons}
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.Geo_exe && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Map
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">
                              Geometer Executor
                            </p>
                            <p className="font-semibold text-white">
                              {lotissement.Geo_exe}
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.Lieudit && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <MapPin
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">Locality</p>
                            <p className="font-semibold text-white">
                              {lotissement.Lieudit}
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.hasRoadAccess && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Route
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">Road Access</p>
                            <p className="font-semibold text-green-400">
                              Available
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.hasElectricity && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Power
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">Electricity</p>
                            <p className="font-semibold text-green-400">
                              Connected
                            </p>
                          </div>
                        </div>
                      )}

                      {lotissement.hasWater && (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Droplets
                            className="w-5 h-5"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <div>
                            <p className="text-sm text-gray-400">
                              Water Supply
                            </p>
                            <p className="font-semibold text-green-400">
                              Connected
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Parcels Tab */}
              {activeTab === "parcels" &&
                lotissement.parcelles &&
                lotissement.parcelles.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">
                      Available Parcels
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {lotissement.parcelles.map((parcel: Parcelle) => (
                        <Link
                          key={parcel.Id_Parcel}
                          href={`/lands/${parcel.slug || parcel.Id_Parcel}`}
                          className="group block p-4 rounded-xl border transition hover:border-green-500"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-white group-hover:text-green-400 transition">
                                {parcel.title ||
                                  `Lot ${parcel.Num_lot || parcel.Id_Parcel}`}
                              </h3>
                              {parcel.Num_lot && (
                                <p className="text-sm text-gray-400">
                                  Lot #{parcel.Num_lot}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                parcel.listingStatus === "PUBLISHED"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {parcel.listingStatus === "PUBLISHED"
                                ? "Available"
                                : parcel.listingStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            {parcel.Sup && (
                              <span className="text-gray-300">
                                {formatArea(parcel.Sup)}
                              </span>
                            )}
                            {parcel.price && Number(parcel.price) > 0 && (
                              <span
                                className="font-semibold"
                                style={{
                                  color: COLORS.primary[400],
                                }}
                              >
                                {formatPriceCompact(parcel.price)}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
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
              <PropertyLocationMap
                title={lotissement.title || lotissement.Nom_cons || "this estate"}
                location={lotissement}
              />
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
                  className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  {lotissement.createdById ? (
                    <img
                      src={
                        lotissement.createdBy?.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          lotissement.createdBy?.name || "Estate Agent",
                        )}&background=4ade80&color=ffffff&size=128`
                      }
                      alt={lotissement.createdBy?.name || "Agent Avatar"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {lotissement.createdBy?.name || "Estate Agent"}
                  </p>
                  <p className="text-sm opacity-90">Real Estate Specialist</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {/* Phone */}
                <a
                  href={`tel:${lotissement.createdBy?.phone || "+237652149121"}`}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">
                    {lotissement.createdBy?.phone || "+237 652 149 121"}
                  </span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${(lotissement.createdBy?.phone || "+237652149121").replace(/[\s\-\(\)]/g, "")}?text=${encodeURIComponent(
                    `Hi, I'm interested in the estate "${lotissement?.Nbre_lots || "your listing"}" (ID: #${lotissement.Id_Lotis}).\n\nListing: ${typeof window !== "undefined" ? `${window.location.origin}/estates/${lotissement.slug || lotissement.Id_Lotis}` : ""}\n\nCould you please share more details?`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(37, 211, 102, 0.25)" }}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <div className="flex-1">
                    <span className="text-sm font-medium">
                      Chat on WhatsApp
                    </span>
                    <p className="text-[10px] opacity-70">
                      Typically replies instantly
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${lotissement.createdBy?.email || "contact@example.com"}?subject=${encodeURIComponent(
                    `Inquiry about Estate: ${lotissement.Nbre_lots || "Your Listing"} (ID: #${lotissement.Id_Lotis})`,
                  )}&body=${encodeURIComponent(
                    `Hello,\n\nI'm interested in the estate "${lotissement.Nbre_lots || "your listing"}" (ID: #${lotissement.Id_Lotis}).\n\nListing: ${typeof window !== "undefined" ? `${window.location.origin}/estates/${lotissement.slug || lotissement.Id_Lotis}` : ""}\n\nCould you please share more details?\n\nThank you.`,
                  )}`}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Mail className="w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm block truncate">
                      {lotissement.createdBy?.email || "contact@example.com"}
                    </span>
                  </div>
                </a>
              </div>

              <div className="space-y-3">
                {/* Request Info → WhatsApp */}
                <a
                  href={`https://wa.me/${(lotissement.createdBy?.phone || "+237652149121").replace(/[\s\-\(\)]/g, "")}?text=${encodeURIComponent(
                    `Hello, I'd like to request more information about the estate "${lotissement.Nbre_lots || "your listing"}" (ID: #${lotissement.Id_Lotis}).\n\nListing: ${typeof window !== "undefined" ? `${window.location.origin}/estates/${lotissement.slug || lotissement.Id_Lotis}` : ""}\n\nPlease share pricing, availability, and any other relevant details.\n\nThank you.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{ color: COLORS.primary[700] }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Request Info
                </a>

                {/* Schedule Visit → WhatsApp */}
                <a
                  href={`https://wa.me/${(lotissement.createdBy?.phone || "+237652149121").replace(/[\s\-\(\)]/g, "")}?text=${encodeURIComponent(
                    `Hello, I'd like to schedule a visit to the estate "${lotissement.Nbre_lots || "your listing"}" (ID: #${lotissement.Id_Lotis}).\n\nListing: ${typeof window !== "undefined" ? `${window.location.origin}/estates/${lotissement.slug || lotissement.Id_Lotis}` : ""}\n\nPlease let me know your available dates and times.\n\nThank you.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border-2 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Visit
                </a>
              </div>

              <div
                className="mt-6 pt-6 border-t text-sm space-y-2"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <div className="flex justify-between">
                  <span className="opacity-75">Property ID</span>
                  <span className="font-semibold">#{lotissement.Id_Lotis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Type</span>
                  <span className="font-semibold">Estate / Lotissement</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Status</span>
                  <span className="font-semibold">
                    {lotissement.listingStatus}
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
                    {formatTimeAgo(lotissement.createdAt)}
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
                {lotissement.viewCount > 0 && (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Users
                        className="w-5 h-5"
                        style={{ color: COLORS.primary[400] }}
                      />
                      <span className="text-gray-300">Views</span>
                    </div>
                    <span className="font-semibold text-white">
                      {lotissement.viewCount}
                    </span>
                  </div>
                )}
                {lotissement.featured && (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles
                        className="w-5 h-5"
                        style={{ color: "#facc15" }}
                      />
                      <span className="text-gray-300">Featured</span>
                    </div>
                    <span className="font-semibold text-yellow-400">Yes</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Utilities Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl shadow-2xl p-6 border"
              style={{
                background: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Utilities</h3>
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <Route
                      className="w-5 h-5"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <span className="text-gray-300">Road Access</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      lotissement.hasRoadAccess
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    {lotissement.hasRoadAccess ? "Yes" : "No"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <Power
                      className="w-5 h-5"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <span className="text-gray-300">Electricity</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      lotissement.hasElectricity
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    {lotissement.hasElectricity ? "Yes" : "No"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <Droplets
                      className="w-5 h-5"
                      style={{ color: COLORS.primary[400] }}
                    />
                    <span className="text-gray-300">Water</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      lotissement.hasWater ? "text-green-400" : "text-gray-500"
                    }`}
                  >
                    {lotissement.hasWater ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Estates */}
        {relatedLotissements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Similar Estates
              </h2>
              <p className="text-xl text-gray-300">
                You might also be interested in these
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedLotissements.map((related, index) => (
                <motion.div
                  key={related.Id_Lotis}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Link
                    href={`/estates/${related.slug || related.Id_Lotis}`}
                    className="group block rounded-3xl shadow-xl overflow-hidden border"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getListingImages(related)[0] || PLACEHOLDER_IMAGE}
                        alt={related.title || "Estate"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span
                          className={`bg-gradient-to-r ${getStatusBgColor(related)} text-white px-3 py-1 rounded-full text-xs font-bold`}
                        >
                          {getListingStatusLabel(related)}
                        </span>
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Grid3X3 className="w-3 h-3" /> Estate
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-green-400 transition">
                        {related.title || related.Lieudit || "Estate"}
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
                          {related.pricePerSqM &&
                          Number(related.pricePerSqM) > 0
                            ? `${formatPriceCompact(related.pricePerSqM)} XAF/m²`
                            : related.price && Number(related.price) > 0
                              ? formatPriceCompact(related.price)
                              : "Prix sur demande"}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          {related.Surface && (
                            <span>{formatArea(related.Surface)}</span>
                          )}
                          {related.Nbre_lots && (
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" /> {related.Nbre_lots}
                            </span>
                          )}
                        </div>
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
