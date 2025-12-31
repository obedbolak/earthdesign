"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
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
} from "lucide-react";

interface PropertyDetail {
  id: number;
  table: string;
  title: string;
  location: string;
  price: string;
  type: string;
  status: string;
  surface: string;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  images: string[];
  video?: string;
  owner?: string;
  contactPhone?: string;
  contactEmail?: string;
  rawData?: any;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<PropertyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        let tableName: string | null = null;
        let propertyId: string | null = null;

        const validTables = ["Lotissement", "Parcelle", "Batiment"];
        for (const table of validTables) {
          if (idParam.startsWith(`${table}-`)) {
            tableName = table;
            propertyId = idParam.substring(table.length + 1);
            break;
          }
        }

        if (!tableName || !propertyId) {
          propertyId = idParam;
          for (const table of validTables) {
            const res = await fetch(`/api/data/${table}`);
            if (res.ok) {
              const result = await res.json();
              const item = result.data.find((p: any) => {
                const itemId = p.Id_Lotis || p.Id_Parcel || p.Id_Bat;
                return itemId?.toString() === propertyId;
              });
              if (item) {
                tableName = table;
                await processProperty(item, table);
                await fetchRelatedProperties(table, propertyId);
                return;
              }
            }
          }
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/data/${tableName}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const result = await res.json();
        const foundProperty = result.data.find((p: any) => {
          const itemId = p.Id_Lotis || p.Id_Parcel || p.Id_Bat;
          return itemId?.toString() === propertyId;
        });
        if (!foundProperty) {
          setLoading(false);
          return;
        }
        await processProperty(foundProperty, tableName);
        await fetchRelatedProperties(tableName, propertyId);
      } catch (err) {
        console.error("Error fetching property:", err);
        setLoading(false);
      }
    };

    const fetchRelatedProperties = async (currentTable: string, currentId: string) => {
      try {
        const res = await fetch(`/api/data/${currentTable}`);
        if (res.ok) {
          const result = await res.json();
          const related = result.data
            .filter((p: any) => {
              const itemId = p.Id_Lotis || p.Id_Parcel || p.Id_Bat;
              return itemId?.toString() !== currentId;
            })
            .slice(0, 6)
            .map((item: any) => processPropertySync(item, currentTable));
          setRelatedProperties(related);
        }
      } catch (err) {
        console.error("Error fetching related properties:", err);
      }
    };

    const processPropertySync = (foundProperty: any, tableName: string): PropertyDetail => {
      const realId = foundProperty.Id_Lotis || foundProperty.Id_Parcel || foundProperty.Id_Bat;
      let type = "Land";
      if (tableName === "Batiment") {
        type = foundProperty.Cat_Bat || foundProperty.Type_Usage || "Building";
      } else if (tableName === "Lotissement") {
        type = "Lotissement";
      } else if (tableName === "Parcelle") {
        type = foundProperty.Mise_Val ? "Developed Land" : "Land";
      }

      const imageUrls: string[] = [];
      for (let i = 1; i <= 6; i++) {
        const imageUrl = foundProperty[`Image_URL_${i}`];
        if (imageUrl && imageUrl.trim() !== '' && !isPlaceholderUrl(imageUrl)) {
          imageUrls.push(imageUrl.trim());
        }
      }

      return {
        id: realId,
        table: tableName,
        title: `${foundProperty.Nom_proprio || foundProperty.Nom_Prop || foundProperty.Nom || "Premium Property"}`,
        location: foundProperty.Lieudit || foundProperty.Lieu_dit || "Yaoundé",
        price: "Contact for price",
        type,
        status: foundProperty.Status || foundProperty.Statut || "For Sale",
        surface: foundProperty.Surface || foundProperty.Sup || "",
        images: imageUrls,
        video: foundProperty.Video_URL?.trim(),
        owner: foundProperty.Nom_proprio || foundProperty.Nom_Prop || foundProperty.Nom || "Earth Design",
        contactPhone: "+237 6XX XXX XXX",
        contactEmail: "contact@earthdesign.cm",
        rawData: foundProperty,
      };
    };

    const processProperty = async (foundProperty: any, tableName: string) => {
      const mapped = processPropertySync(foundProperty, tableName);
      
      let description = "";
      if (tableName === "Lotissement") {
        description = `This subdivision property consists of ${foundProperty.Nbre_lots || 'multiple'} lots with a total surface area of ${foundProperty.Surface || 'N/A'} m². `;
        if (foundProperty.Date_approb) {
          description += `Approved on ${new Date(foundProperty.Date_approb).toLocaleDateString()}. `;
        }
      } else if (tableName === "Parcelle") {
        description = `This parcel covers ${foundProperty.Sup || 'N/A'} m² located in ${foundProperty.Lieu_dit || 'the area'}. `;
        if (foundProperty.Mise_Val) description += "The land has been developed. ";
      } else if (tableName === "Batiment") {
        description = `${foundProperty.Type_Usage || 'Property'} - ${foundProperty.Cat_Bat || 'Building'}. `;
        if (foundProperty.Standing) description += `Standing: ${foundProperty.Standing}. `;
      }

      if (!description.trim()) {
        description = "Stunning property with modern amenities and excellent location.";
      }

      mapped.description = description;
      setProperty(mapped);
      setLoading(false);
    };

    if (idParam) fetchProperty();
  }, [idParam]);

  const isPlaceholderUrl = (url: string): boolean => {
    if (!url) return true;
    const placeholderPatterns = [
      /^https?:\/\/example\.com/i,
      /^https?:\/\/placeholder/i,
      /^https?:\/\/test\./i,
      /^https?:\/\/demo\./i,
      /^https?:\/\/sample/i,
      /^https?:\/\/localhost/i,
    ];
    return placeholderPatterns.some(pattern => pattern.test(url));
  };

  const getPlaceholderImage = (type: string) => {
    const map: Record<string, string> = {
      Villa: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
      Apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
      Land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
      Commercial: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
      Lotissement: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
      Building: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200",
    };
    return map[type] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200";
  };

  const renderPropertyFields = () => {
    if (!property?.rawData) return null;
    const data = property.rawData;
    const table = property.table;

    const fields: { label: string; value: any; icon: any }[] = [];

    if (table === "Lotissement") {
      if (data.Num_TF) fields.push({ label: "Title Deed", value: data.Num_TF, icon: FileText });
      if (data.Nbre_lots) fields.push({ label: "Number of Lots", value: data.Nbre_lots, icon: Building2 });
      if (data.Date_approb) fields.push({ label: "Approval Date", value: new Date(data.Date_approb).toLocaleDateString(), icon: Calendar });
      if (data.Geo_exe) fields.push({ label: "Surveyor", value: data.Geo_exe, icon: User });
      if (data.Echelle) fields.push({ label: "Scale", value: `1:${data.Echelle}`, icon: Ruler });
      if (data.Ccp) fields.push({ label: "CCP", value: data.Ccp, icon: FileText });
    } else if (table === "Parcelle") {
      if (data.TF_Cree) fields.push({ label: "Title Deed", value: data.TF_Cree, icon: FileText });
      if (data.Num_lot) fields.push({ label: "Lot Number", value: data.Num_lot, icon: Tag });
      if (data.Num_bloc) fields.push({ label: "Block Number", value: data.Num_bloc, icon: Building2 });
      if (data.Mode_Obtent) fields.push({ label: "Acquisition Mode", value: data.Mode_Obtent, icon: ShieldCheck });
      if (data.Date_visa) fields.push({ label: "Visa Date", value: new Date(data.Date_visa).toLocaleDateString(), icon: Calendar });
      if (data.Geometre) fields.push({ label: "Surveyor", value: data.Geometre, icon: User });
      if (data.Mise_Val !== null) fields.push({ label: "Developed", value: data.Mise_Val ? "Yes" : "No", icon: data.Mise_Val ? CheckCircle2 : XCircle });
      if (data.Cloture !== null) fields.push({ label: "Enclosed", value: data.Cloture ? "Yes" : "No", icon: data.Cloture ? CheckCircle2 : XCircle });
    } else if (table === "Batiment") {
      if (data.Type_Usage) fields.push({ label: "Usage Type", value: data.Type_Usage, icon: Building2 });
      if (data.Cat_Bat) fields.push({ label: "Category", value: data.Cat_Bat, icon: Tag });
      if (data.Standing) fields.push({ label: "Standing", value: data.Standing, icon: ShieldCheck });
      if (data.Etat_Bat) fields.push({ label: "Condition", value: data.Etat_Bat, icon: CheckCircle2 });
      if (data.Mat_Bati) fields.push({ label: "Construction Material", value: data.Mat_Bati, icon: Building2 });
      if (data.Type_Lodg) fields.push({ label: "Housing Type", value: data.Type_Lodg, icon: Home });
      if (data.No_Permis) fields.push({ label: "Permit Number", value: data.No_Permis, icon: FileText });
      if (data.Cloture !== null) fields.push({ label: "Enclosed", value: data.Cloture ? "Yes" : "No", icon: data.Cloture ? CheckCircle2 : XCircle });
    }

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
            className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 hover:border-green-500/30 transition"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
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

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getVideoThumbnail = (videoUrl: string): string => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return getPlaceholderImage(property?.type || "Building");
  };

  const getYouTubeEmbedUrl = (videoUrl: string): string => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    return videoUrl;
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const nextImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
    setShowVideo(false);
  };

  const handleShowVideo = () => {
    setShowVideo(true);
    setIsPlayingVideo(false);
  };

  const getCurrentImage = () => {
    if (!property) return "";
    if (property.images.length === 0 || imageErrors.has(currentImageIndex)) {
      return getPlaceholderImage(property.type);
    }
    return property.images[currentImageIndex];
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-950" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mb-4"></div>
            <p className="text-lg font-medium text-white">Loading property...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-950" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Property Not Found</h1>
            <p className="text-gray-300 mb-6">The property you're looking for doesn't exist.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-xl transition"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  const hasImages = property.images.length > 0;
  const hasVideo = property.video && !isPlaceholderUrl(property.video);
  const hasMedia = hasImages || hasVideo;

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-10 transition duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.15), transparent 40%)`,
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
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white rotate-180" />
          </motion.button>
          {!showVideo && property.images.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
              >
                <ChevronLeft className="w-7 h-7 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
              >
                <ChevronRight className="w-7 h-7 text-white" />
              </motion.button>
            </>
          )}
          <div className="max-w-full max-h-[90vh] w-full flex items-center justify-center">
            {showVideo && property.video ? (
              isPlayingVideo ? (
                <iframe
                  src={getYouTubeEmbedUrl(property.video)}
                  className="w-full aspect-video max-h-[90vh] rounded-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Property Video Tour"
                />
              ) : (
                <div className="relative w-full aspect-video max-h-[90vh]">
                  <img
                    src={getVideoThumbnail(property.video)}
                    alt="Video thumbnail"
                    className="w-full h-full object-contain rounded-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getPlaceholderImage(property.type);
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-2xl"
                    >
                      <Play className="w-16 h-16 text-white ml-2" fill="white" />
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
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImage(property.type);
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
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-900/95 via-emerald-900/95 to-teal-900/95 backdrop-blur-lg border-b border-green-700/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white">Earth Design</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-white hover:text-green-300 font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>
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
                className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20"
              >
                <div className="relative aspect-video">
                  {showVideo && hasVideo ? (
                    isPlayingVideo ? (
                      <iframe
                        src={getYouTubeEmbedUrl(property.video!)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Property Video Tour"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={getVideoThumbnail(property.video!)}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getPlaceholderImage(property.type);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsPlayingVideo(true)}
                            className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-2xl"
                          >
                            <Play className="w-12 h-12 text-white ml-2" fill="white" />
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
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(property.type);
                      }}
                    />
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <Heart className="w-5 h-5 text-gray-800" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <Share2 className="w-5 h-5 text-gray-800" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowLightbox(true)}
                      className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <Maximize2 className="w-5 h-5 text-gray-800" />
                    </motion.button>
                  </div>
                </div>
                <div className="p-4 flex gap-2 overflow-x-auto scrollbar-hide">
                  {property.images.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        !showVideo && currentImageIndex === idx ? "border-green-500" : "border-white/20"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage(property.type);
                          handleImageError(idx);
                        }}
                      />
                    </motion.button>
                  ))}
                  {hasVideo && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShowVideo}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        showVideo ? "border-red-500" : "border-white/20"
                      }`}
                    >
                      <img
                        src={getVideoThumbnail(property.video!)}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage(property.type);
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
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium">
                  {property.type}
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-sm font-medium">
                  {property.status}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-300 mb-6">
                <MapPin className="w-5 h-5 text-green-400" />
                <span>{property.location}</span>
              </div>
              
              <div className="flex items-baseline gap-8 py-6 border-y border-white/20">
                <div>
                  <p className="text-3xl font-bold text-green-400">{property.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{property.surface}</p>
                    <p className="text-sm text-gray-400">Surface</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                <p className="text-gray-300 leading-relaxed">{property.description}</p>
              </div>
            </motion.div>

            {/* Property Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-6">Property Details</h2>
              {renderPropertyFields()}
            </motion.div>

            {/* Location Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPinned className="w-6 h-6 text-green-400" />
                Location
              </h2>
              <div className="aspect-video bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl flex items-center justify-center border border-white/10">
                <div className="text-center">
                  <MapPinned className="w-16 h-16 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-semibold text-lg">Interactive Map</p>
                  <p className="text-gray-400 mt-1">Coming soon</p>
                  <p className="text-sm text-green-400 mt-2">{property.location}</p>
                </div>
              </div>
            </motion.div>

            {/* Investment Potential */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Investment Potential
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"
                >
                  <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white mb-1">High</p>
                  <p className="text-sm text-gray-300">Growth Potential</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30"
                >
                  <ShieldCheck className="w-8 h-8 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white mb-1">Secure</p>
                  <p className="text-sm text-gray-300">Investment</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
                >
                  <Award className="w-8 h-8 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-white mb-1">Premium</p>
                  <p className="text-sm text-gray-300">Location</p>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Contact & Related */}
          <div className="space-y-6">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl shadow-2xl p-6 text-white sticky top-24 border border-green-500/30"
            >
              <h3 className="text-xl font-bold mb-6">Contact Agent</h3>
              <div className="flex items-center gap-3 mb-6 p-4 bg-white/10 rounded-xl backdrop-blur">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">{property.owner}</p>
                  <p className="text-sm opacity-90">Property Agent</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`tel:${property.contactPhone}`}
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition"
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">{property.contactPhone}</span>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`mailto:${property.contactEmail}`}
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">{property.contactEmail}</span>
                </motion.a>
              </div>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-gray-100 transition"
                >
                  Request Info
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-white/10 border-2 border-white/30 font-semibold rounded-xl hover:bg-white/20 transition"
                >
                  Schedule Visit
                </motion.button>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="opacity-75">Property ID</span>
                  <span className="font-semibold">{property.table}-{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Type</span>
                  <span className="font-semibold">{property.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Status</span>
                  <span className="font-semibold">{property.status}</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Listed</span>
                  </div>
                  <span className="font-semibold text-white">2 days ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Photos</span>
                  </div>
                  <span className="font-semibold text-white">{property.images.length}</span>
                </div>
                {hasVideo && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">Video Tour</span>
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
              <h2 className="text-4xl font-extrabold text-white mb-4">Similar Properties</h2>
              <p className="text-xl text-gray-300">You might also be interested in these</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((related, index) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => router.push(`/property/${related.table}-${related.id}`)}
                  className="group bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-green-500/50 cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={related.images[0] || getPlaceholderImage(related.type)}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(related.type);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {related.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold mb-2">
                      {related.type}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-green-400 transition">
                      {related.title}
                    </h3>
                    <p className="text-gray-300 flex items-center gap-2 mb-3 text-sm">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <span className="truncate">{related.location}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-green-400">{related.surface}</p>
                      <span className="text-gray-400 text-sm">View Details →</span>
                    </div>
                  </div>
                </motion.div>
              ))}
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