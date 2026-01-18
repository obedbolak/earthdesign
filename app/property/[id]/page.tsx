// app/property/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
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
  Tag,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  Calendar,
  FileText,
  Ruler,
  Building2,
  ShieldCheck,
  MapPinned,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Camera,
  Video,
  Car,
  Zap,
  TreePine,
  Layers,
  Grid3X3,
} from "lucide-react";
import Link from "next/link";
import {
  useProperty,
  useProperties,
  UnifiedProperty,
  formatPrice,
  formatPriceCompact,
  formatArea,
  getPropertyImages,
  getPropertyLocation,
  getSourceLabel,
  getSourceColor,
  getSimilarProperties,
} from "@/lib/hooks/useProperties";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";

// Placeholder images by type
const PLACEHOLDER_IMAGES: Record<string, string> = {
  Villa: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
  Apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
  Land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
  Commercial:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
  Building:
    "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200",
  House: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
  Office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
  Studio: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
  Duplex: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
  default: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
};

// Get placeholder by type
const getPlaceholderImage = (type: string): string => {
  return PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.default;
};

// Get property status
const getPropertyStatus = (property: UnifiedProperty): string => {
  if (property.forSale && property.forRent) return "Sale / Rent";
  if (property.forSale) return "For Sale";
  if (property.forRent) return "For Rent";
  return "Available";
};

// Get status color
const getStatusBgColor = (property: UnifiedProperty): string => {
  if (property.forSale && property.forRent)
    return "from-purple-500 to-indigo-600";
  if (property.forSale) return "from-green-500 to-emerald-600";
  if (property.forRent) return "from-blue-500 to-cyan-600";
  return "from-gray-500 to-gray-600";
};

// YouTube helpers
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getVideoThumbnail = (videoUrl: string, type: string): string => {
  const videoId = getYouTubeVideoId(videoUrl);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return getPlaceholderImage(type);
};

const getYouTubeEmbedUrl = (videoUrl: string): string => {
  const videoId = getYouTubeVideoId(videoUrl);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  return videoUrl;
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  // Fetch property using the hook
  const { property, loading, error } = useProperty(propertyId);
  const { properties } = useProperties();

  // UI State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get related properties
  const relatedProperties = property
    ? getSimilarProperties(property, properties, 6)
    : [];

  // Mouse tracking for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Get images array
  const images = property ? getPropertyImages(property) : [];
  const hasImages = images.length > 0;
  const hasVideo = property?.videoUrl && property.videoUrl.trim() !== "";
  const hasMedia = hasImages || hasVideo;

  // Image navigation
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

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
    setShowVideo(false);
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const getCurrentImage = (): string => {
    if (!property) return "";
    if (images.length === 0 || imageErrors.has(currentImageIndex)) {
      return getPlaceholderImage(property.type);
    }
    return images[currentImageIndex];
  };

  function formatTimeAgoIntl(dateString: string, locale = "en") {
    const pastDate = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = pastDate.getTime() - now.getTime(); // Past date minus now results in a negative value

    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    const MS_PER_SECOND = 1000;
    const MS_PER_MINUTE = 60 * MS_PER_SECOND;
    const MS_PER_HOUR = 60 * MS_PER_MINUTE;
    const MS_PER_DAY = 24 * MS_PER_HOUR;

    if (Math.abs(diffInMilliseconds) < MS_PER_MINUTE) {
      return formatter.format(
        Math.round(diffInMilliseconds / MS_PER_SECOND),
        "second",
      );
    } else if (Math.abs(diffInMilliseconds) < MS_PER_HOUR) {
      return formatter.format(
        Math.round(diffInMilliseconds / MS_PER_MINUTE),
        "minute",
      );
    } else if (Math.abs(diffInMilliseconds) < MS_PER_DAY) {
      return formatter.format(
        Math.round(diffInMilliseconds / MS_PER_HOUR),
        "hour",
      );
    } else if (Math.abs(diffInMilliseconds) < 30 * MS_PER_DAY) {
      // Less than approx 30 days
      return formatter.format(
        Math.round(diffInMilliseconds / MS_PER_DAY),
        "day",
      );
    } else if (Math.abs(diffInMilliseconds) < 365 * MS_PER_DAY) {
      // Less than approx 1 year
      return formatter.format(
        Math.round(diffInMilliseconds / (30 * MS_PER_DAY)),
        "month",
      );
    } else {
      return formatter.format(
        Math.round(diffInMilliseconds / (365 * MS_PER_DAY)),
        "year",
      );
    }
  }
  // Render property details based on source
  const renderPropertyFields = () => {
    if (!property?._meta) return null;
    const meta = property._meta;
    const source = property.source;

    const fields: { label: string; value: any; icon: any }[] = [];

    // Common fields
    if (property.surface) {
      fields.push({
        label: "Surface Area",
        value: formatArea(property.surface),
        icon: Square,
      });
    }

    if (source === "lotissement") {
      if (meta.Num_TF)
        fields.push({
          label: "Title Deed",
          value: meta.Num_TF,
          icon: FileText,
        });
      if (property.nbreLots)
        fields.push({
          label: "Number of Lots",
          value: property.nbreLots,
          icon: Grid3X3,
        });
      if (meta.Date_approb)
        fields.push({
          label: "Approval Date",
          value: new Date(meta.Date_approb).toLocaleDateString(),
          icon: Calendar,
        });
      if (meta.Geo_exe)
        fields.push({ label: "Surveyor", value: meta.Geo_exe, icon: User });
      if (meta.Statut)
        fields.push({ label: "Status", value: meta.Statut, icon: Tag });
      if (meta.Nom_visa_lotis)
        fields.push({
          label: "Visa",
          value: meta.Nom_visa_lotis,
          icon: ShieldCheck,
        });
    } else if (source === "parcelle") {
      if (meta.TF_Cree)
        fields.push({
          label: "Title Deed",
          value: meta.TF_Cree,
          icon: FileText,
        });
      if (meta.TF_Mere)
        fields.push({
          label: "Parent Title",
          value: meta.TF_Mere,
          icon: FileText,
        });
      if (meta.Num_lot)
        fields.push({ label: "Lot Number", value: meta.Num_lot, icon: Tag });
      if (meta.Num_bloc)
        fields.push({
          label: "Block Number",
          value: meta.Num_bloc,
          icon: Building2,
        });
      if (meta.Largeur_Rte)
        fields.push({
          label: "Road Width",
          value: meta.Largeur_Rte,
          icon: Ruler,
        });
      if (meta.Mise_Val !== undefined) {
        fields.push({
          label: "Developed",
          value: meta.Mise_Val ? "Yes" : "No",
          icon: meta.Mise_Val ? CheckCircle2 : XCircle,
        });
      }
      if (meta.Cloture !== undefined) {
        fields.push({
          label: "Enclosed",
          value: meta.Cloture ? "Yes" : "No",
          icon: meta.Cloture ? CheckCircle2 : XCircle,
        });
      }
    } else if (source === "batiment") {
      if (property.bedrooms)
        fields.push({ label: "Bedrooms", value: property.bedrooms, icon: Bed });
      if (property.bathrooms)
        fields.push({
          label: "Bathrooms",
          value: property.bathrooms,
          icon: Bath,
        });
      if (property.kitchens)
        fields.push({
          label: "Kitchens",
          value: property.kitchens,
          icon: Home,
        });
      if (property.livingRooms)
        fields.push({
          label: "Living Rooms",
          value: property.livingRooms,
          icon: Home,
        });
      if (property.totalFloors)
        fields.push({
          label: "Floors",
          value: property.totalFloors,
          icon: Layers,
        });
      if (meta.Standing)
        fields.push({ label: "Standing", value: meta.Standing, icon: Award });
      if (meta.Etat_Bat)
        fields.push({
          label: "Condition",
          value: meta.Etat_Bat,
          icon: CheckCircle2,
        });
      if (meta.Mat_Bati)
        fields.push({
          label: "Material",
          value: meta.Mat_Bati,
          icon: Building2,
        });
      if (meta.No_Permis)
        fields.push({
          label: "Permit #",
          value: meta.No_Permis,
          icon: FileText,
        });
      if (property.hasParking)
        fields.push({
          label: "Parking",
          value: `${meta.parkingSpaces || "Yes"}`,
          icon: Car,
        });
      if (property.hasGenerator)
        fields.push({ label: "Generator", value: "Available", icon: Zap });
      if (meta.hasElevator)
        fields.push({ label: "Elevator", value: "Yes", icon: Building2 });
      if (meta.totalUnits)
        fields.push({
          label: "Total Units",
          value: meta.totalUnits,
          icon: Grid3X3,
        });
    }

    if (fields.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-start gap-3 p-4 rounded-xl border transition"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: GRADIENTS.button.primary }}
            >
              <field.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">{field.label}</p>
              <p className="font-semibold text-white">{field.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="relative min-h-screen overflow-hidden"
        style={{ background: COLORS.gray[900] }}
      >
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

  // Error or not found state
  if (error || !property) {
    return (
      <div
        className="relative min-h-screen overflow-hidden"
        style={{ background: COLORS.gray[900] }}
      >
        <div className="fixed inset-0">
          <div
            className="absolute inset-0"
            style={{ background: GRADIENTS.background.hero }}
          />
        </div>
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
              {error ||
                "The property you're looking for doesn't exist or has been removed."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/properties")}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-10 transition duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${COLORS.primary[500]}15, transparent 40%)`,
        }}
      />

      {/* Lightbox Modal */}
      {showLightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setShowLightbox(false);
              setIsPlayingVideo(false);
              setShowVideo(false);
            }}
            className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center z-10 transition"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <XCircle className="w-6 h-6 text-white" />
          </motion.button>

          {!showVideo && images.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center z-10 transition"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <ChevronLeft className="w-7 h-7 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center z-10 transition"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <ChevronRight className="w-7 h-7 text-white" />
              </motion.button>
            </>
          )}

          <div className="max-w-full max-h-[90vh] w-full flex items-center justify-center">
            {showVideo && property.videoUrl ? (
              isPlayingVideo ? (
                <iframe
                  src={getYouTubeEmbedUrl(property.videoUrl)}
                  className="w-full aspect-video max-h-[90vh] rounded-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Property Video Tour"
                />
              ) : (
                <div className="relative w-full aspect-video max-h-[90vh]">
                  <img
                    src={getVideoThumbnail(property.videoUrl, property.type)}
                    alt="Video thumbnail"
                    className="w-full h-full object-contain rounded-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getPlaceholderImage(
                        property.type,
                      );
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-2xl"
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
                alt={property.title}
                className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPlaceholderImage(
                    property.type,
                  );
                }}
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
              className="flex items-center gap-2 cursor-pointer"
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
                    target.style.display = "none";
                  }}
                />
              </div>
            </motion.div>
          </Link>

          {/*lets make the title of the property at the top bar*/}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm sm:text-base md:text-lg truncate">
              {property.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/properties">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 text-white font-medium transition rounded-xl"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">All Properties</span>
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-white font-medium transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {hasMedia && (
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
                  {showVideo && hasVideo ? (
                    isPlayingVideo ? (
                      <iframe
                        src={getYouTubeEmbedUrl(property.videoUrl!)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Property Video Tour"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={getVideoThumbnail(
                            property.videoUrl!,
                            property.type,
                          )}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              getPlaceholderImage(property.type);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsPlayingVideo(true)}
                            className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-2xl"
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
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          getPlaceholderImage(property.type);
                      }}
                    />
                  )}

                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <Heart
                        className="w-5 h-5"
                        style={{ color: COLORS.gray[800] }}
                      />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <Share2
                        className="w-5 h-5"
                        style={{ color: COLORS.gray[800] }}
                      />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowLightbox(true)}
                      className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <Maximize2
                        className="w-5 h-5"
                        style={{ color: COLORS.gray[800] }}
                      />
                    </motion.button>
                  </div>

                  {/* Navigation arrows */}
                  {!showVideo && images.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </motion.button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectImage(idx)}
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
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            getPlaceholderImage(property.type);
                          handleImageError(idx);
                        }}
                      />
                    </motion.button>
                  ))}
                  {hasVideo && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                          property.videoUrl!,
                          property.type,
                        )}
                        alt="Video"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            getPlaceholderImage(property.type);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

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
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 bg-gradient-to-r ${getStatusBgColor(
                    property,
                  )} text-white rounded-full text-sm font-medium`}
                >
                  {getPropertyStatus(property)}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ background: getSourceColor(property.source) }}
                >
                  {getSourceLabel(property.source)}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: `${COLORS.primary[500]}33`,
                    color: COLORS.primary[300],
                  }}
                >
                  {property.type}
                </span>
                {property.featured && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      background: COLORS.yellow[500],
                      color: COLORS.gray[900],
                    }}
                  >
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {property.title}
              </h1>

              {/* Location */}
              <div
                className="flex items-center gap-2 mb-6"
                style={{ color: COLORS.gray[300] }}
              >
                <MapPin
                  className="w-5 h-5"
                  style={{ color: COLORS.primary[400] }}
                />
                <span>{getPropertyLocation(property)}</span>
              </div>

              {/* Price and Surface */}
              <div
                className="flex flex-wrap items-baseline gap-8 py-6 border-y"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <div>
                  {property.forSale && property.price && property.price > 0 ? (
                    <>
                      <p
                        className="text-sm mb-1"
                        style={{ color: COLORS.gray[400] }}
                      >
                        Sale Price
                      </p>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: COLORS.primary[400] }}
                      >
                        {formatPrice(property.price, property.currency)}
                      </p>
                      {property.pricePerSqM && (
                        <p
                          className="text-sm mt-1"
                          style={{ color: COLORS.gray[400] }}
                        >
                          {formatPrice(property.pricePerSqM, property.currency)}
                          /m²
                        </p>
                      )}
                    </>
                  ) : property.forRent &&
                    property.rentPrice &&
                    property.rentPrice > 0 ? (
                    <>
                      <p
                        className="text-sm mb-1"
                        style={{ color: COLORS.gray[400] }}
                      >
                        Monthly Rent
                      </p>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: COLORS.primary[400] }}
                      >
                        {formatPrice(property.rentPrice, property.currency)}
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: COLORS.gray[400] }}
                      >
                        /month
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        className="text-sm mb-1"
                        style={{ color: COLORS.gray[400] }}
                      >
                        Price
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: COLORS.primary[400] }}
                      >
                        Prix sur demande
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: COLORS.gray[400] }}
                      >
                        Contact us for pricing
                      </p>
                    </>
                  )}

                  {/* Show rent price separately if both sale and rent are available */}
                  {property.forSale &&
                    property.forRent &&
                    property.price &&
                    property.price > 0 &&
                    property.rentPrice &&
                    property.rentPrice > 0 && (
                      <div
                        className="mt-4 pt-4 border-t"
                        style={{ borderColor: "rgba(255,255,255,0.2)" }}
                      >
                        <p
                          className="text-sm mb-1"
                          style={{ color: COLORS.gray[400] }}
                        >
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

                {property.surface && !property.forRent && (
                  <div className="flex items-center gap-2">
                    <Square
                      className="w-5 h-5"
                      style={{ color: COLORS.gray[400] }}
                    />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {formatArea(property.surface)}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.gray[400] }}
                      >
                        Surface
                      </p>
                    </div>
                  </div>
                )}

                {property.nbreLots && property.nbreLots > 0 && (
                  <div className="flex items-center gap-2">
                    <Grid3X3
                      className="w-5 h-5"
                      style={{ color: COLORS.gray[400] }}
                    />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {property.nbreLots}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.gray[400] }}
                      >
                        Lots
                      </p>
                    </div>
                  </div>
                )}

                {property.bedrooms && property.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bed
                      className="w-5 h-5"
                      style={{ color: COLORS.gray[400] }}
                    />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {property.bedrooms}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.gray[400] }}
                      >
                        {property.bedrooms > 1 ? "Bedrooms" : "Bedroom"}
                      </p>
                    </div>
                  </div>
                )}

                {property.bathrooms && property.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bath
                      className="w-5 h-5"
                      style={{ color: COLORS.gray[400] }}
                    />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {property.bathrooms}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.gray[400] }}
                      >
                        {property.bathrooms > 1 ? "Bathrooms" : "Bathroom"}
                      </p>
                    </div>
                  </div>
                )}

                {property.kitchens && property.kitchens > 0 && (
                  <div className="flex items-center gap-2">
                    <Home
                      className="w-5 h-5"
                      style={{ color: COLORS.gray[400] }}
                    />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {property.kitchens}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.gray[400] }}
                      >
                        {property.kitchens > 1 ? "Kitchens" : "Kitchen"}
                      </p>
                    </div>
                  </div>
                )}

                {property.livingRooms && property.livingRooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Home
                      className="w-5 h-5"
                      style={{ color: COLORS.gray[400] }}
                    />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {property.livingRooms}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.gray[400] }}
                      >
                        {property.livingRooms > 1
                          ? "Living Rooms"
                          : "Living Room"}
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
                <p
                  className="leading-relaxed"
                  style={{ color: COLORS.gray[300] }}
                >
                  {property.description ||
                    property.shortDescription ||
                    "No description available."}
                </p>
              </div>

              {/* Amenities */}
              {(property.hasParking || property.hasGenerator) && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Amenities
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
                  </div>
                </div>
              )}
            </motion.div>

            {/* Property Details */}
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
              <h2 className="text-xl font-bold text-white mb-6">
                Property Details
              </h2>
              {renderPropertyFields()}
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl shadow-2xl p-6 border"
              style={{
                background: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPinned
                  className="w-6 h-6"
                  style={{ color: COLORS.primary[400] }}
                />
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
                  <MapPinned
                    className="w-16 h-16 mx-auto mb-3"
                    style={{ color: COLORS.primary[500] }}
                  />
                  <p className="text-white font-semibold text-lg">
                    Interactive Map
                  </p>
                  <p className="mt-1" style={{ color: COLORS.gray[400] }}>
                    Coming soon
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{ color: COLORS.primary[400] }}
                  >
                    {getPropertyLocation(property)}
                  </p>
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
                className="flex items-center gap-3 mb-6 p-4 rounded-xl backdrop-blur"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Mr. Cletus</p>
                  <p className="text-sm opacity-90">Property Agent</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="tel:+237677212279"
                  className="flex items-center gap-3 p-3 rounded-xl transition"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">+237 677 212 279</span>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="mailto:realeastate@earthdesignengineeringltd.com"
                  className="flex items-center gap-3 p-3 rounded-xl transition"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">
                    realeastate@earthdesignengineeringltd.com
                  </span>
                </motion.a>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-white font-semibold rounded-xl transition"
                  style={{ color: COLORS.primary[700] }}
                >
                  Request Info
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 border-2 font-semibold rounded-xl transition"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  Schedule Visit
                </motion.button>
              </div>

              {/* Property ID */}
              <div
                className="mt-6 pt-6 border-t text-sm space-y-2"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <div className="flex justify-between">
                  <span className="opacity-75">Property ID</span>
                  <span className="font-semibold">{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Source</span>
                  <span className="font-semibold">
                    {getSourceLabel(property.source)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Type</span>
                  <span className="font-semibold">{property.type}</span>
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
                    <span style={{ color: COLORS.gray[300] }}>Listed</span>
                  </div>
                  <span className="text-gray-400 font-normal ml-2">
                    ({formatTimeAgoIntl(property.createdAt)})
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
                    <span style={{ color: COLORS.gray[300] }}>Photos</span>
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
                      <span style={{ color: COLORS.gray[300] }}>
                        Video Tour
                      </span>
                    </div>
                    <span className="font-semibold text-white">Available</span>
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
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Similar Properties
              </h2>
              <p className="text-xl" style={{ color: COLORS.gray[300] }}>
                You might also be interested in these
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((related, index) => {
                const relatedImages = getPropertyImages(related);
                return (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Link
                      href={`/property/${related.id}`}
                      className="group block rounded-3xl shadow-xl overflow-hidden transition-all duration-500 border cursor-pointer"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.2)",
                      }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            relatedImages[0] ||
                            getPlaceholderImage(related.type)
                          }
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              getPlaceholderImage(related.type);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span
                            className={`bg-gradient-to-r ${getStatusBgColor(
                              related,
                            )} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}
                          >
                            {getPropertyStatus(related)}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold text-white"
                            style={{
                              background: getSourceColor(related.source),
                            }}
                          >
                            {getSourceLabel(related.source)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                          style={{
                            background: `${COLORS.primary[500]}33`,
                            color: COLORS.primary[300],
                          }}
                        >
                          {related.type}
                        </span>
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-green-400 transition">
                          {related.title}
                        </h3>
                        <p
                          className="flex items-center gap-2 mb-3 text-sm"
                          style={{ color: COLORS.gray[300] }}
                        >
                          <MapPin
                            className="w-4 h-4"
                            style={{ color: COLORS.primary[400] }}
                          />
                          <span className="truncate">
                            {getPropertyLocation(related)}
                          </span>
                        </p>
                        <div className="flex items-center justify-between">
                          <p
                            className="text-xl font-bold"
                            style={{ color: COLORS.primary[400] }}
                          >
                            {related.forSale &&
                            related.price &&
                            related.price > 0
                              ? formatPriceCompact(
                                  related.price,
                                  related.currency,
                                )
                              : related.forRent &&
                                  related.rentPrice &&
                                  related.rentPrice > 0
                                ? `${formatPriceCompact(
                                    related.rentPrice,
                                    related.currency,
                                  )}/mo`
                                : "Prix sur demande"}
                          </p>
                          {related.surface && (
                            <span
                              className="text-sm"
                              style={{ color: COLORS.gray[400] }}
                            >
                              {formatArea(related.surface)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
