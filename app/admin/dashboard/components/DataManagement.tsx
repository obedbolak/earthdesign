// app/admin/dashboard/components/DataManagement.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Map,
  MapPin,
  Flag,
  Database,
  Building2,
  Route,
  Droplets,
  DollarSign,
  Lightbulb,
  Zap,
  Search,
  Loader2,
  AlertCircle,
  Check,
  X,
  Image as ImageIcon,
  Video,
  RefreshCw,
  Home,
  Layers,
  Play,
  Images,
  LucideIcon,
  Eye,
  Heart,
  Share2,
  User,
  Star,
  Tag,
} from "lucide-react";

// ============================================
// TYPES & INTERFACES
// ============================================

interface TableConfig {
  icon: LucideIcon;
  color: string;
  lightColor: string;
  textColor: string;
  borderColor: string;
  hoverBg: string;
  label: string;
  fields: string[];
  hasMedia: boolean;
  mediaEntityType?: string;
  mediaForeignKey?: string;
  isListing?: boolean; // For lotissement, parcelle, batiment
  primaryKey: string;
}

// ============================================
// TABLE CONFIGURATIONS - Updated for new schema
// ============================================

const tableConfigs: Record<string, TableConfig> = {
  // Geographic Tables
  Region: {
    icon: Map,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-300",
    hoverBg: "hover:bg-blue-50",
    label: "Régions",
    primaryKey: "Id_Reg",
    fields: ["Id_Reg", "Nom_Reg", "Sup_Reg", "Chef_lieu_Reg", "WKT_Geometry"],
    hasMedia: false,
  },
  Departement: {
    icon: MapPin,
    color: "bg-gradient-to-br from-green-500 to-green-600",
    lightColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-300",
    hoverBg: "hover:bg-green-50",
    label: "Départements",
    primaryKey: "Id_Dept",
    fields: [
      "Id_Dept",
      "Nom_Dept",
      "Sup_Dept",
      "Chef_lieu_Dept",
      "Id_Reg",
      "WKT_Geometry",
    ],
    hasMedia: false,
  },
  Arrondissement: {
    icon: Flag,
    color: "bg-gradient-to-br from-yellow-500 to-orange-500",
    lightColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-300",
    hoverBg: "hover:bg-yellow-50",
    label: "Arrondissements",
    primaryKey: "Id_Arrond",
    fields: [
      "Id_Arrond",
      "Nom_Arrond",
      "Sup_Arrond",
      "Chef_lieu_Arrond",
      "Commune",
      "Id_Dept",
      "WKT_Geometry",
    ],
    hasMedia: false,
  },

  // Main Listing Tables
  Lotissement: {
    icon: Layers,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-300",
    hoverBg: "hover:bg-purple-50",
    label: "Lotissements",
    primaryKey: "Id_Lotis",
    isListing: true,
    fields: [
      // Cadastral
      "Id_Lotis",
      "Nom_proprio",
      "Num_TF",
      "Statut",
      "Nom_cons",
      "Surface",
      "Nom_visa_lotis",
      "Date_approb",
      "Geo_exe",
      "Nbre_lots",
      "Lieudit",
      "Echelle",
      "Ccp",
      "Id_Arrond",
      "WKT_Geometry",
      // Listing
      "slug",
      "title",
      "shortDescription",
      "description",
      "category",
      "listingType",
      "listingStatus",
      "price",
      "pricePerSqM",
      "currency",
      "featured",
      "viewCount",
      "favoriteCount",
      "shareCount",
      // Development
      "totalParcels",
      "availableParcels",
      "hasRoadAccess",
      "hasElectricity",
      "hasWater",
      // Owner
      "createdById",
    ],
    hasMedia: true,
    mediaEntityType: "LOTISSEMENT",
    mediaForeignKey: "lotissementId",
  },
  Parcelle: {
    icon: MapPin,
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    lightColor: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-300",
    hoverBg: "hover:bg-orange-50",
    label: "Parcelles",
    primaryKey: "Id_Parcel",
    isListing: true,
    fields: [
      // Cadastral
      "Id_Parcel",
      "Nom_Prop",
      "TF_Mere",
      "Mode_Obtent",
      "TF_Cree",
      "Nom_Cons",
      "Sup",
      "Nom_Visa_Cad",
      "Date_visa",
      "Geometre",
      "Date_impl",
      "Num_lot",
      "Num_bloc",
      "Lieu_dit",
      "Largeur_Rte",
      "Echelle",
      "Ccp_N",
      "Mise_Val",
      "Cloture",
      "Id_Lotis",
      "WKT_Geometry",
      // Listing
      "slug",
      "title",
      "shortDescription",
      "description",
      "category",
      "listingType",
      "listingStatus",
      "price",
      "pricePerSqM",
      "currency",
      "featured",
      "viewCount",
      "favoriteCount",
      "shareCount",
      // Land specifics
      "isForDevelopment",
      "approvedForBuilding",
      "zoningType",
      // Owner
      "createdById",
    ],
    hasMedia: true,
    mediaEntityType: "PARCELLE",
    mediaForeignKey: "parcelleId",
  },
  Batiment: {
    icon: Building2,
    color: "bg-gradient-to-br from-red-500 to-red-600",
    lightColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-300",
    hoverBg: "hover:bg-red-50",
    label: "Bâtiments",
    primaryKey: "Id_Bat",
    isListing: true,
    fields: [
      // Cadastral
      "Id_Bat",
      "Cat_Bat",
      "Status",
      "Standing",
      "Cloture",
      "No_Permis",
      "Type_Lodg",
      "Etat_Bat",
      "Nom",
      "Mat_Bati",
      "Id_Parcel",
      "WKT_Geometry",
      // Property type
      "propertyType",
      // Listing
      "slug",
      "title",
      "shortDescription",
      "description",
      "category",
      "listingType",
      "listingStatus",
      "price",
      "rentPrice",
      "pricePerSqM",
      "currency",
      "featured",
      "viewCount",
      "favoriteCount",
      "shareCount",
      // Building characteristics
      "totalFloors",
      "totalUnits",
      "hasElevator",
      "surfaceArea",
      "doorNumber",
      "address",
      // Unit features
      "bedrooms",
      "bathrooms",
      "kitchens",
      "livingRooms",
      "floorLevel",
      // Amenities
      "hasGenerator",
      "hasParking",
      "parkingSpaces",
      "hasPool",
      "hasGarden",
      "hasSecurity",
      "hasAirConditioning",
      "hasFurnished",
      "hasBalcony",
      "hasTerrace",
      "amenities",
      // Owner
      "createdById",
    ],
    hasMedia: true,
    mediaEntityType: "BATIMENT",
    mediaForeignKey: "batimentId",
  },

  // Media
  Media: {
    icon: ImageIcon,
    color: "bg-gradient-to-br from-pink-500 to-rose-600",
    lightColor: "bg-pink-50",
    textColor: "text-pink-600",
    borderColor: "border-pink-300",
    hoverBg: "hover:bg-pink-50",
    label: "Media",
    primaryKey: "id",
    fields: [
      "id",
      "entityType",
      "url",
      "type",
      "order",
      "caption",
      "isPrimary",
      "lotissementId",
      "parcelleId",
      "batimentId",
      "infrastructureId",
    ],
    hasMedia: false,
  },

  // Infrastructure Tables
  Route: {
    icon: Route,
    color: "bg-gradient-to-br from-gray-500 to-gray-600",
    lightColor: "bg-gray-50",
    textColor: "text-gray-600",
    borderColor: "border-gray-300",
    hoverBg: "hover:bg-gray-100",
    label: "Routes",
    primaryKey: "Id_Rte",
    fields: [
      "Id_Rte",
      "Cat_Rte",
      "Type_Rte",
      "Largeur_Rte",
      "Etat_Rte",
      "Mat_Rte",
      "WKT_Geometry",
    ],
    hasMedia: false,
  },
  Riviere: {
    icon: Droplets,
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    lightColor: "bg-cyan-50",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-300",
    hoverBg: "hover:bg-cyan-50",
    label: "Rivières",
    primaryKey: "Id_Riv",
    fields: [
      "Id_Riv",
      "Nom_Riv",
      "Type_Riv",
      "Etat_amenag",
      "Debit_Riv",
      "WKT_Geometry",
    ],
    hasMedia: false,
  },
  Taxe_immobiliere: {
    icon: DollarSign,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-300",
    hoverBg: "hover:bg-emerald-50",
    label: "Taxes Immobilières",
    primaryKey: "Id_Taxe",
    fields: [
      "Id_Taxe",
      "Num_TF",
      "Nom_Proprio",
      "NIU",
      "Val_imm",
      "Taxe_Payee",
      "Date_declaree",
      "Type_taxe",
    ],
    hasMedia: false,
  },
  Equipement: {
    icon: Lightbulb,
    color: "bg-gradient-to-br from-amber-500 to-amber-600",
    lightColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-300",
    hoverBg: "hover:bg-amber-50",
    label: "Équipements",
    primaryKey: "Id_Equip",
    fields: [
      "Id_Equip",
      "Type_Equip",
      "Design_Equip",
      "Etat_Equip",
      "Mat_Equip",
      "WKT_Geometry",
    ],
    hasMedia: false,
  },
  Reseau_energetique: {
    icon: Zap,
    color: "bg-gradient-to-br from-yellow-400 to-amber-500",
    lightColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-300",
    hoverBg: "hover:bg-yellow-50",
    label: "Réseau Énergétique",
    primaryKey: "Id_Reseaux",
    fields: [
      "Id_Reseaux",
      "Source_Res",
      "Type_Reseau",
      "Etat_Res",
      "Materiau",
      "WKT_Geometry",
    ],
    hasMedia: false,
  },
  Reseau_en_eau: {
    icon: Droplets,
    color: "bg-gradient-to-br from-sky-400 to-blue-500",
    lightColor: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-sky-300",
    hoverBg: "hover:bg-sky-50",
    label: "Réseau en Eau",
    primaryKey: "Id_Reseaux",
    fields: [
      "Id_Reseaux",
      "Source_Res",
      "Type_Res",
      "Etat_Res",
      "Mat_Res",
      "WKT_Geometry",
    ],
    hasMedia: false,
  },
  Infrastructure: {
    icon: Building2,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-300",
    hoverBg: "hover:bg-indigo-50",
    label: "Infrastructures",
    primaryKey: "Id_Infras",
    fields: [
      "Id_Infras",
      "Nom_infras",
      "Type_Infraas",
      "Categorie_infras",
      "Cycle",
      "Statut_infras",
      "Standing",
      "WKT_Geometry",
    ],
    hasMedia: true,
    mediaEntityType: "INFRASTRUCTURE",
    mediaForeignKey: "infrastructureId",
  },
  Borne: {
    icon: MapPin,
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
    lightColor: "bg-pink-50",
    textColor: "text-pink-600",
    borderColor: "border-pink-300",
    hoverBg: "hover:bg-pink-50",
    label: "Bornes",
    primaryKey: "Id_Borne",
    fields: ["Id_Borne", "coord_x", "coord_y", "coord_z", "WKT_Geometry"],
    hasMedia: false,
  },

  // User Management (Admin only)
  User: {
    icon: User,
    color: "bg-gradient-to-br from-slate-600 to-slate-700",
    lightColor: "bg-slate-50",
    textColor: "text-slate-600",
    borderColor: "border-slate-300",
    hoverBg: "hover:bg-slate-50",
    label: "Utilisateurs",
    primaryKey: "id",
    fields: [
      "id",
      "email",
      "name",
      "phone",
      "role",
      "agencyName",
      "isVerified",
      "emailVerified",
    ],
    hasMedia: false,
  },
};

type TableName = keyof typeof tableConfigs;

// ============================================
// FIELD TYPE CONFIGURATIONS
// ============================================

// Numeric fields
const numericFields = new Set([
  "Sup_Reg",
  "Sup_Dept",
  "Sup_Arrond",
  "Surface",
  "Sup",
  "Echelle",
  "Nbre_lots",
  "Val_imm",
  "Source_Res",
  "coord_x",
  "coord_y",
  "coord_z",
  "price",
  "pricePerSqM",
  "rentPrice",
  "bedrooms",
  "bathrooms",
  "kitchens",
  "livingRooms",
  "surfaceArea",
  "floorLevel",
  "totalFloors",
  "totalUnits",
  "parkingSpaces",
  "order",
  "viewCount",
  "favoriteCount",
  "shareCount",
  "totalParcels",
  "availableParcels",
  "Id_Arrond",
  "Id_Dept",
  "Id_Reg",
  "Id_Lotis",
  "Id_Parcel",
  "lotissementId",
  "parcelleId",
  "batimentId",
  "infrastructureId",
]);

// Boolean fields
const booleanFields = new Set([
  "Taxe_Payee",
  "Mise_Val",
  "Cloture",
  "featured",
  "hasElevator",
  "hasGenerator",
  "hasParking",
  "hasPool",
  "hasGarden",
  "hasSecurity",
  "hasAirConditioning",
  "hasFurnished",
  "hasBalcony",
  "hasTerrace",
  "isForDevelopment",
  "approvedForBuilding",
  "hasRoadAccess",
  "hasElectricity",
  "hasWater",
  "isPrimary",
  "isVerified",
]);

// Enum fields with their values
const enumFields: Record<string, string[]> = {
  propertyType: [
    "APARTMENT",
    "HOUSE",
    "VILLA",
    "STUDIO",
    "DUPLEX",
    "TRIPLEX",
    "PENTHOUSE",
    "CHAMBRE_MODERNE",
    "CHAMBRE",
    "OFFICE",
    "SHOP",
    "RESTAURANT",
    "HOTEL",
    "WAREHOUSE",
    "COMMERCIAL_SPACE",
    "INDUSTRIAL",
    "FACTORY",
    "BUILDING",
    "MIXED_USE",
  ],
  category: ["LAND", "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "MIXED"],
  listingType: ["SALE", "RENT", "BOTH"],
  listingStatus: ["DRAFT", "PUBLISHED", "SOLD", "RENTED", "ARCHIVED"],
  entityType: ["LOTISSEMENT", "PARCELLE", "BATIMENT", "INFRASTRUCTURE"],
  type: ["image", "video"],
  role: ["USER", "AGENT", "ADMIN"],
};

// Date fields
const dateFields = new Set([
  "Date_approb",
  "Date_visa",
  "Date_impl",
  "Date_declaree",
  "createdAt",
  "updatedAt",
  "emailVerified",
]);

// URL fields
const urlFields = new Set(["url", "image", "agencyLogo"]);

// Read-only fields
const readOnlyFields = new Set([
  "createdAt",
  "updatedAt",
  "viewCount",
  "favoriteCount",
  "shareCount",
  "createdById",
]);

// ============================================
// MEDIA MODAL COMPONENT
// ============================================

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: number;
  entityName: string;
  foreignKey?: string;
}

function MediaModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  foreignKey,
}: MediaModalProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingMedia, setAddingMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaType, setNewMediaType] = useState<"image" | "video">("image");
  const [newMediaCaption, setNewMediaCaption] = useState("");
  const [newMediaIsPrimary, setNewMediaIsPrimary] = useState(false);

  useEffect(() => {
    if (isOpen && entityType && entityId) {
      fetchMedia();
    }
  }, [isOpen, entityType, entityId]);

  useEffect(() => {
    if (!isOpen) {
      setShowAddForm(false);
      setNewMediaUrl("");
      setNewMediaType("image");
      setNewMediaCaption("");
      setNewMediaIsPrimary(false);
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the foreign key to filter
      const fkParam = foreignKey ? `&${foreignKey}=${entityId}` : "";
      const res = await fetch(
        `/api/data/media?entityType=${entityType}${fkParam}`,
      );
      if (!res.ok) throw new Error("Failed to fetch media");
      const json = await res.json();
      setMedia(json.data || []);
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Failed to load media");
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    setDeleting(mediaId);
    try {
      const res = await fetch(`/api/data/media/${mediaId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }

      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (err) {
      console.error("Error deleting media:", err);
      alert("Failed to delete media");
    } finally {
      setDeleting(null);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMediaUrl.trim()) {
      alert("Please enter a URL");
      return;
    }

    try {
      new URL(newMediaUrl);
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    setAddingMedia(true);
    try {
      const body: any = {
        entityType,
        url: newMediaUrl.trim(),
        type: newMediaType,
        caption: newMediaCaption || null,
        isPrimary: newMediaIsPrimary,
        order: media.length,
      };

      if (foreignKey) {
        body[foreignKey] = entityId;
      }

      const res = await fetch("/api/data/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add media");
      }

      const json = await res.json();
      setMedia((prev) => [...prev, json.data]);

      setNewMediaUrl("");
      setNewMediaType("image");
      setNewMediaCaption("");
      setNewMediaIsPrimary(false);
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding media:", err);
      alert(err instanceof Error ? err.message : "Failed to add media");
    } finally {
      setAddingMedia(false);
    }
  };

  if (!isOpen) return null;

  const images = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Images className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Media Gallery</h2>
                <p className="text-white/80 text-sm">
                  {entityName} • {entityType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    showAddForm
                      ? "bg-white text-purple-600"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
              >
                {showAddForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Media
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Add Media Form */}
          {showAddForm && (
            <div className="bg-purple-50 border-b border-purple-100 px-6 py-4">
              <form onSubmit={handleAddMedia} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Media URL
                    </label>
                    <input
                      type="url"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                               text-gray-800 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewMediaType("image")}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${
                            newMediaType === "image"
                              ? "bg-purple-600 text-white ring-2 ring-purple-300"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewMediaType("video")}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${
                            newMediaType === "video"
                              ? "bg-red-600 text-white ring-2 ring-red-300"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        <Video className="w-4 h-4" />
                        Video
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption (optional)
                    </label>
                    <input
                      type="text"
                      value={newMediaCaption}
                      onChange={(e) => setNewMediaCaption(e.target.value)}
                      placeholder="Enter caption..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                               text-gray-800 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMediaIsPrimary}
                      onChange={(e) => setNewMediaIsPrimary(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">
                      Set as primary image
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={addingMedia || !newMediaUrl.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg 
                             text-sm font-semibold hover:bg-purple-700 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                  >
                    {addingMedia ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add {newMediaType === "image" ? "Image" : "Video"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-gray-500 mt-3">Loading media...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-red-600 mt-3 font-medium">{error}</p>
                <button
                  onClick={fetchMedia}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : media.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  No Media Found
                </h3>
                <p className="text-gray-500 text-sm mt-1 text-center max-w-sm">
                  No images or videos have been added yet.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg 
                           text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Media
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Images Section */}
                {images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="w-5 h-5 text-purple-600" />
                      <h3 className="text-base font-semibold text-gray-800">
                        Images ({images.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className="group relative aspect-square rounded-xl overflow-hidden 
                                   border-2 border-gray-100 hover:border-purple-400 
                                   transition-all shadow-sm hover:shadow-lg"
                        >
                          <a
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full h-full"
                          >
                            <img
                              src={img.url}
                              alt={img.caption || `Image ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </a>

                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent 
                                      opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                              <span className="text-white text-xs font-medium bg-black/40 px-2 py-0.5 rounded">
                                #{img.order ?? idx + 1}
                              </span>
                              <div className="flex items-center gap-1">
                                <a
                                  href={img.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-gray-700" />
                                </a>
                                <button
                                  onClick={() => handleDeleteMedia(img.id)}
                                  disabled={deleting === img.id}
                                  className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                  title="Delete"
                                >
                                  {deleting === img.id ? (
                                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5 text-white" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {img.isPrimary && (
                            <div
                              className="absolute top-2 left-2 px-2 py-0.5 bg-purple-600 text-white 
                                        text-[10px] font-bold rounded-full shadow"
                            >
                              PRIMARY
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos Section */}
                {videos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Video className="w-5 h-5 text-red-500" />
                      <h3 className="text-base font-semibold text-gray-800">
                        Videos ({videos.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.map((vid, idx) => (
                        <div
                          key={vid.id || idx}
                          className="group flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 
                                   rounded-xl border border-red-100 hover:border-red-300 
                                   transition-all hover:shadow-md"
                        >
                          <a
                            href={vid.url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl 
                                      flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shrink-0"
                          >
                            <Play className="w-6 h-6 text-white ml-0.5" />
                          </a>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">
                              {vid.caption || `Video ${idx + 1}`}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {vid.url}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={vid.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-600" />
                            </a>
                            <button
                              onClick={() => handleDeleteMedia(vid.id)}
                              disabled={deleting === vid.id}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleting === vid.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Total: {media.length} file{media.length !== 1 ? "s" : ""}
                    </span>
                    <span>
                      {images.length} image{images.length !== 1 ? "s" : ""},{" "}
                      {videos.length} video{videos.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LISTING STATS COMPONENT
// ============================================

interface ListingStatsProps {
  item: any;
}

function ListingStats({ item }: ListingStatsProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500">
      <span className="inline-flex items-center gap-1">
        <Eye className="w-3.5 h-3.5" />
        {item.viewCount || 0}
      </span>
      <span className="inline-flex items-center gap-1">
        <Heart className="w-3.5 h-3.5" />
        {item.favoriteCount || 0}
      </span>
      <span className="inline-flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" />
        {item.shareCount || 0}
      </span>
      {item.featured && (
        <span className="inline-flex items-center gap-1 text-amber-600">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          Featured
        </span>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DataManagement() {
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [tableCounts, setTableCounts] = useState<Record<TableName, number>>(
    {} as Record<TableName, number>,
  );

  // Media modal state
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalData, setMediaModalData] = useState<{
    entityType: string;
    entityId: number;
    entityName: string;
    foreignKey?: string;
  } | null>(null);

  // Reset state when table changes
  useEffect(() => {
    setExpandedRow(null);
    setEditingRowIndex(null);
    setEditForm({});
    setSearchQuery("");
  }, [selectedTable]);

  // Fetch data when table is selected
  useEffect(() => {
    if (selectedTable) {
      fetchData(selectedTable);
    } else {
      fetchAllTableCounts();
    }
  }, [selectedTable]);

  const fetchAllTableCounts = async () => {
    const tables = Object.keys(tableConfigs) as TableName[];

    const results = await Promise.all(
      tables.map(async (table) => {
        try {
          const res = await fetch(`/api/data/${table.toLowerCase()}?limit=1`);
          if (res.ok) {
            const json = await res.json();
            return { table, count: json.total || json.count || 0 };
          }
          return { table, count: 0 };
        } catch (err) {
          console.error(`Failed to fetch count for ${table}:`, err);
          return { table, count: 0 };
        }
      }),
    );

    const counts: Record<TableName, number> = results.reduce(
      (acc, { table, count }) => {
        acc[table] = count;
        return acc;
      },
      {} as Record<TableName, number>,
    );

    setTableCounts(counts);
  };

  const fetchData = async (table: TableName) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data/${table.toLowerCase()}`);
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
      alert("Error loading data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getRowId = (item: any): number | string | null => {
    if (!selectedTable) return null;
    const primaryKey = tableConfigs[selectedTable].primaryKey;
    const id = item[primaryKey];
    return id != null ? id : null;
  };

  const getEntityName = (item: any, table: TableName): string => {
    const nameFields: Record<string, string[]> = {
      Lotissement: ["title", "Nom_proprio", "Lieudit", "Num_TF"],
      Parcelle: ["title", "Nom_Prop", "Lieu_dit", "Num_lot"],
      Batiment: ["title", "Nom", "propertyType", "Cat_Bat"],
      Infrastructure: ["Nom_infras", "Type_Infraas"],
      User: ["name", "email"],
    };

    const fields = nameFields[table] || [];
    for (const field of fields) {
      if (item[field]) return String(item[field]);
    }

    const id = getRowId(item);
    return `${table} #${id}`;
  };

  const handleOpenMedia = (item: any) => {
    if (!selectedTable) return;

    const config = tableConfigs[selectedTable];
    if (!config.hasMedia || !config.mediaEntityType) return;

    const id = getRowId(item);
    if (id == null) {
      alert("Cannot view media: missing database ID");
      return;
    }

    setMediaModalData({
      entityType: config.mediaEntityType,
      entityId: Number(id),
      entityName: getEntityName(item, selectedTable),
      foreignKey: config.mediaForeignKey,
    });
    setMediaModalOpen(true);
  };

  const handleViewToggle = (index: number) =>
    setExpandedRow(expandedRow === index ? null : index);

  const handleEdit = (item: any, index: number) => {
    const id = getRowId(item);
    if (id == null) {
      alert("Cannot edit: missing database ID");
      return;
    }
    setEditingRowIndex(index);
    setEditForm({ ...item });
    setExpandedRow(index);
  };

  const handleSave = async () => {
    if (!selectedTable || editingRowIndex == null) return;
    const item = data[editingRowIndex];
    const id = getRowId(item);
    if (id == null) {
      alert("Cannot save: missing database ID");
      return;
    }

    const config = tableConfigs[selectedTable];
    const processedForm: Record<string, any> = {};

    for (const field of config.fields) {
      // Skip read-only fields
      if (readOnlyFields.has(field) || field === config.primaryKey) continue;

      const value = editForm[field];

      if (value === "" || value == null) {
        processedForm[field] = null;
      } else if (numericFields.has(field)) {
        const num = parseFloat(value);
        processedForm[field] = isNaN(num) ? null : num;
      } else if (booleanFields.has(field)) {
        processedForm[field] =
          value === true || value === "true" || value === "1";
      } else if (dateFields.has(field)) {
        processedForm[field] = value ? new Date(value).toISOString() : null;
      } else {
        processedForm[field] = value;
      }
    }

    try {
      const res = await fetch(
        `/api/data/${selectedTable.toLowerCase()}/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processedForm),
        },
      );
      if (res.ok) {
        await fetchData(selectedTable);
        setEditingRowIndex(null);
        setEditForm({});
        setExpandedRow(null);
      } else {
        const error = await res.json();
        alert(`Update failed: ${error.error || "Unknown error"}`);
      }
    } catch {
      alert("Update failed");
    }
  };

  const handleCancel = () => {
    setEditingRowIndex(null);
    setEditForm({});
    setExpandedRow(null);
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Delete this record?")) return;
    const item = data[index];
    const id = getRowId(item);
    if (id == null) {
      alert("Cannot delete: missing database ID");
      return;
    }
    try {
      const res = await fetch(
        `/api/data/${selectedTable!.toLowerCase()}/${id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setData((prev) => prev.filter((_, i) => i !== index));
      } else {
        const error = await res.json();
        alert(`Delete failed: ${error.error || "Unknown error"}`);
      }
    } catch {
      alert("Delete failed");
    }
  };

  const getFieldType = (field: string) => {
    if (urlFields.has(field)) return "url";
    if (field === "WKT_Geometry") return "geometry";
    if (booleanFields.has(field)) return "boolean";
    if (numericFields.has(field)) return "number";
    if (dateFields.has(field)) return "date";
    if (enumFields[field]) return "enum";
    if (
      field.includes("description") ||
      field.includes("Description") ||
      field === "amenities" ||
      field === "address"
    )
      return "text";
    return "string";
  };

  const renderCellValue = (value: any, field: string) => {
    if (value == null || value === "") {
      return <span className="text-gray-400 italic text-xs">—</span>;
    }

    const fieldType = getFieldType(field);

    // URL/Image
    if (
      fieldType === "url" &&
      typeof value === "string" &&
      value.startsWith("http")
    ) {
      if (value.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="group relative inline-block"
          >
            <img
              src={value}
              alt={field}
              className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 
                         group-hover:border-teal-400 transition-all shadow-sm"
            />
          </a>
        );
      }
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 
                     rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </a>
      );
    }

    // Boolean
    if (fieldType === "boolean") {
      const isTrue =
        value === true || value === "true" || value === "1" || value === 1;
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
          ${isTrue ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
        >
          {isTrue ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {isTrue ? "Yes" : "No"}
        </span>
      );
    }

    // Date
    if (fieldType === "date" && value) {
      try {
        return (
          <span className="text-gray-800 text-sm">
            {new Date(value).toLocaleDateString()}
          </span>
        );
      } catch {
        return <span className="text-gray-800 text-sm">{String(value)}</span>;
      }
    }

    // Enum
    if (fieldType === "enum") {
      // Status badges
      if (field === "listingStatus") {
        const statusColors: Record<string, string> = {
          DRAFT: "bg-gray-100 text-gray-700",
          PUBLISHED: "bg-green-100 text-green-700",
          SOLD: "bg-blue-100 text-blue-700",
          RENTED: "bg-purple-100 text-purple-700",
          ARCHIVED: "bg-red-100 text-red-700",
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[value] || "bg-gray-100 text-gray-700"}`}
          >
            {value}
          </span>
        );
      }

      if (field === "listingType") {
        const typeColors: Record<string, string> = {
          SALE: "bg-emerald-100 text-emerald-700",
          RENT: "bg-orange-100 text-orange-700",
          BOTH: "bg-violet-100 text-violet-700",
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[value] || "bg-gray-100 text-gray-700"}`}
          >
            {value}
          </span>
        );
      }

      if (field === "role") {
        const roleColors: Record<string, string> = {
          USER: "bg-gray-100 text-gray-700",
          AGENT: "bg-blue-100 text-blue-700",
          ADMIN: "bg-red-100 text-red-700",
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[value] || "bg-gray-100 text-gray-700"}`}
          >
            {value}
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          {String(value)}
        </span>
      );
    }

    // Number
    if (fieldType === "number" && typeof value === "number") {
      if (field === "price" || field === "rentPrice") {
        if (value >= 1000000) {
          return (
            <span className="text-gray-800 text-sm font-semibold">
              {(value / 1000000).toFixed(1)}M XAF
            </span>
          );
        }
        if (value >= 1000) {
          return (
            <span className="text-gray-800 text-sm font-semibold">
              {(value / 1000).toFixed(0)}K XAF
            </span>
          );
        }
        return (
          <span className="text-gray-800 text-sm font-semibold">
            {value.toLocaleString()} XAF
          </span>
        );
      }
      return (
        <span className="text-gray-800 text-sm">{value.toLocaleString()}</span>
      );
    }

    return (
      <span className="text-gray-800 break-words text-sm">{String(value)}</span>
    );
  };

  const filteredData = data.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(item).some(
      (val) => val && String(val).toLowerCase().includes(query),
    );
  });

  // ------------------------------------------------
  // TABLE SELECTION VIEW
  // ------------------------------------------------
  if (!selectedTable) {
    // Group tables by category
    const tableGroups = {
      Listings: ["Lotissement", "Parcelle", "Batiment"],
      Geographic: ["Region", "Departement", "Arrondissement"],
      Media: ["Media"],
      Infrastructure: [
        "Route",
        "Riviere",
        "Infrastructure",
        "Equipement",
        "Reseau_energetique",
        "Reseau_en_eau",
        "Borne",
      ],
      Other: ["Taxe_immobiliere", "User"],
    };

    return (
      <div className="flex flex-col h-full w-full">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shrink-0">
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Data Management
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Select a table to view and manage records
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full w-fit">
                <Database className="w-4 h-4" />
                <span>{Object.keys(tableConfigs).length} tables</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="space-y-8">
            {Object.entries(tableGroups).map(([groupName, tables]) => (
              <div key={groupName}>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  {groupName === "Listings" && (
                    <Home className="w-5 h-5 text-teal-600" />
                  )}
                  {groupName === "Geographic" && (
                    <Map className="w-5 h-5 text-blue-600" />
                  )}
                  {groupName === "Media" && (
                    <ImageIcon className="w-5 h-5 text-pink-600" />
                  )}
                  {groupName === "Infrastructure" && (
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  )}
                  {groupName === "Other" && (
                    <Database className="w-5 h-5 text-gray-600" />
                  )}
                  {groupName}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {tables.map((key) => {
                    const cfg = tableConfigs[key as TableName];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    const count = tableCounts[key as TableName] ?? 0;

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedTable(key as TableName)}
                        className="group bg-white rounded-xl shadow-sm hover:shadow-lg 
                                   transition-all duration-200 text-left overflow-hidden
                                   border border-gray-100 hover:border-gray-200
                                   hover:-translate-y-0.5 active:translate-y-0
                                   flex flex-col"
                      >
                        <div className={`${cfg.color} p-3 sm:p-4 relative`}>
                          <div
                            className="w-9 h-9 sm:w-11 sm:h-11 bg-white/20 backdrop-blur-sm 
                                          rounded-lg flex items-center justify-center
                                          group-hover:scale-110 transition-transform"
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          {cfg.hasMedia && (
                            <div className="absolute top-2 right-2">
                              <Images className="w-3.5 h-3.5 text-white/70" />
                            </div>
                          )}
                          {cfg.isListing && (
                            <div className="absolute bottom-2 right-2">
                              <Tag className="w-3.5 h-3.5 text-white/70" />
                            </div>
                          )}
                        </div>

                        <div className="p-3 sm:p-4 flex-1 flex flex-col">
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                            {cfg.label}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                            {count} record{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const config = tableConfigs[selectedTable];
  const Icon = config.icon;

  // ------------------------------------------------
  // TABLE DATA VIEW
  // ------------------------------------------------
  return (
    <div className="flex flex-col h-full w-full">
      {/* Media Modal */}
      {mediaModalData && (
        <MediaModal
          isOpen={mediaModalOpen}
          onClose={() => {
            setMediaModalOpen(false);
            setMediaModalData(null);
          }}
          entityType={mediaModalData.entityType}
          entityId={mediaModalData.entityId}
          entityName={mediaModalData.entityName}
          foreignKey={mediaModalData.foreignKey}
        />
      )}

      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shrink-0">
        <div className="px-4 sm:px-6 py-2 border-b border-gray-100">
          <button
            onClick={() => setSelectedTable(null)}
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-teal-600 
                       font-medium transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Tables</span>
          </button>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`${config.color} p-2 sm:p-2.5 rounded-xl shadow-lg shrink-0`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {config.label}
                  </h1>
                  {config.hasMedia && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-medium rounded-full flex items-center gap-1">
                      <Images className="w-3 h-3" />
                      Media
                    </span>
                  )}
                  {config.isListing && (
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-600 text-[10px] font-medium rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Listing
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  {searchQuery
                    ? `${filteredData.length} of ${data.length}`
                    : data.length}{" "}
                  record{data.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none lg:w-56 xl:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-teal-500 
                           focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => fetchData(selectedTable)}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 
                           border border-gray-200 text-gray-600 rounded-lg text-sm font-medium
                           hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
            <p className="text-gray-600 mt-3 text-sm">Loading records...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
            <div
              className={`${config.lightColor} w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4`}
            >
              <AlertCircle className={`w-7 h-7 ${config.textColor}`} />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              {searchQuery ? "No matching records" : "No records found"}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              {searchQuery
                ? "Try adjusting your search query"
                : "This table is empty."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((item, index) => {
              const id = getRowId(item);
              const isExpanded = expandedRow === index;
              const isEditing = editingRowIndex === index;
              const primaryKey = config.primaryKey;

              // Get preview fields (first 4-6 non-geometry fields)
              const previewFields = config.fields
                .filter((f) => f !== "WKT_Geometry" && f !== "description")
                .slice(0, 6);

              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all w-full
                    ${
                      isExpanded
                        ? `${config.borderColor} border-2 shadow-md`
                        : "border-gray-100 hover:border-gray-200 hover:shadow"
                    }`}
                >
                  {/* COLLAPSED VIEW */}
                  {!isExpanded && (
                    <div className="p-3 sm:p-4 lg:p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Listing stats for listing tables */}
                          {config.isListing && (
                            <div className="mb-2">
                              <ListingStats item={item} />
                            </div>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-2">
                            {previewFields.map((f, fIndex) => (
                              <div
                                key={f}
                                className={`min-w-0 ${
                                  fIndex >= 4
                                    ? "hidden xl:block"
                                    : fIndex >= 3
                                      ? "hidden lg:block"
                                      : ""
                                }`}
                              >
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium truncate">
                                  {f.replace(/_/g, " ")}
                                </p>
                                <div className="mt-0.5">
                                  {renderCellValue(item[f], f)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-0 border-gray-100 shrink-0">
                          {config.hasMedia && config.mediaEntityType && (
                            <button
                              onClick={() => handleOpenMedia(item)}
                              disabled={id == null}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                        text-xs sm:text-sm font-medium transition-colors
                                        ${
                                          id != null
                                            ? "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                            : "bg-gray-50 text-gray-400 cursor-not-allowed"
                                        }`}
                            >
                              <Images className="w-3.5 h-3.5" />
                              <span>Media</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleViewToggle(index)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                      text-xs sm:text-sm font-medium transition-colors
                                      ${config.lightColor} ${config.textColor} ${config.hoverBg}`}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(item, index)}
                              disabled={id == null}
                              className={`p-2 rounded-lg transition-colors
                                ${id != null ? "text-blue-600 hover:bg-blue-50" : "text-gray-300 cursor-not-allowed"}`}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              disabled={id == null}
                              className={`p-2 rounded-lg transition-colors
                                ${id != null ? "text-red-600 hover:bg-red-50" : "text-gray-300 cursor-not-allowed"}`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXPANDED VIEW */}
                  {isExpanded && (
                    <div className="w-full">
                      <div
                        className={`${config.color} px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2`}
                      >
                        <button
                          onClick={() => handleViewToggle(index)}
                          className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors text-sm font-medium"
                        >
                          <ChevronUp className="w-4 h-4" />
                          <span>Collapse</span>
                        </button>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* MEDIA BUTTON in expanded view */}
                          {config.hasMedia && config.mediaEntityType && (
                            <button
                              onClick={() => handleOpenMedia(item)}
                              disabled={id == null}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 
                                        bg-white rounded-lg text-sm font-medium transition-colors shadow-sm
                                        ${
                                          id != null
                                            ? "text-purple-600 hover:bg-purple-50"
                                            : "text-gray-400 cursor-not-allowed"
                                        }`}
                            >
                              <Images className="w-4 h-4" />
                              <span>View Media</span>
                            </button>
                          )}

                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors shadow-sm"
                              >
                                <Check className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                              >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(item, index)}
                                disabled={id == null}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm font-medium transition-colors shadow-sm
                                  ${id != null ? "text-blue-600 hover:bg-blue-50" : "text-gray-400 cursor-not-allowed"}`}
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                disabled={id == null}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium transition-colors
                                  ${id != null ? "text-white hover:bg-white/30" : "text-white/50 cursor-not-allowed"}`}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Fields Grid */}
                      <div className="p-4 sm:p-5 lg:p-6 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5 w-full">
                          {config.fields.map((field) => {
                            const fieldType = getFieldType(field);
                            const isGeometry = field === "WKT_Geometry";
                            const isLongText =
                              fieldType === "text" || isGeometry;
                            const isReadOnly =
                              readOnlyFields.has(field) || field === primaryKey;

                            let colSpan = "";
                            if (isLongText) {
                              colSpan =
                                "sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5";
                            }

                            return (
                              <div key={field} className={`${colSpan} w-full`}>
                                <div className="flex items-center gap-1.5 mb-2">
                                  {fieldType === "url" && (
                                    <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                                  )}
                                  {isGeometry && (
                                    <Map className="w-3.5 h-3.5 text-teal-500" />
                                  )}
                                  {fieldType === "boolean" && (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                  )}
                                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                    {field.replace(/_/g, " ")}
                                  </p>
                                  {field === primaryKey && (
                                    <span className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-bold">
                                      PK
                                    </span>
                                  )}
                                </div>

                                <div className="w-full">
                                  {isEditing && !isReadOnly ? (
                                    // EDIT MODE INPUTS
                                    booleanFields.has(field) ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditForm({
                                            ...editForm,
                                            [field]: !editForm[field],
                                          })
                                        }
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all w-full justify-center
                                          ${
                                            editForm[field]
                                              ? "bg-green-100 text-green-700 ring-2 ring-green-200"
                                              : "bg-gray-100 text-gray-600"
                                          }`}
                                      >
                                        {editForm[field] ? (
                                          <Check className="w-4 h-4" />
                                        ) : (
                                          <X className="w-4 h-4" />
                                        )}
                                        {editForm[field] ? "True" : "False"}
                                      </button>
                                    ) : enumFields[field] ? (
                                      <select
                                        value={editForm[field] ?? ""}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            [field]: e.target.value,
                                          })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800 text-sm bg-white"
                                      >
                                        <option value="">Select...</option>
                                        {enumFields[field].map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    ) : isLongText ? (
                                      <textarea
                                        rows={isGeometry ? 4 : 3}
                                        value={editForm[field] ?? ""}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            [field]: e.target.value,
                                          })
                                        }
                                        className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800 text-sm resize-y
                                          ${
                                            isGeometry
                                              ? "font-mono text-xs bg-gray-50"
                                              : ""
                                          }`}
                                      />
                                    ) : dateFields.has(field) ? (
                                      <input
                                        type="date"
                                        value={
                                          editForm[field]
                                            ? new Date(editForm[field])
                                                .toISOString()
                                                .split("T")[0]
                                            : ""
                                        }
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            [field]: e.target.value,
                                          })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800 text-sm"
                                      />
                                    ) : (
                                      <input
                                        type={
                                          numericFields.has(field)
                                            ? "number"
                                            : "text"
                                        }
                                        step={
                                          numericFields.has(field)
                                            ? "any"
                                            : undefined
                                        }
                                        value={editForm[field] ?? ""}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            [field]: e.target.value,
                                          })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800 text-sm"
                                      />
                                    )
                                  ) : (
                                    // READ ONLY MODE
                                    <div
                                      className={`w-full min-h-[38px] flex items-center
                                        ${
                                          isGeometry
                                            ? "font-mono text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto max-h-32 block"
                                            : "text-gray-800 text-sm"
                                        }`}
                                    >
                                      {renderCellValue(item[field], field)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
