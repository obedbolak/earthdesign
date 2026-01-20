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
} from "lucide-react";

const tableConfigs = {
  Region: {
    icon: Map,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-300",
    hoverBg: "hover:bg-blue-50",
    label: "Régions",
    fields: ["Id_Reg", "Nom_Reg", "Sup_Reg", "Chef_lieu_Reg", "WKT_Geometry"],
  },
  Departement: {
    icon: MapPin,
    color: "bg-gradient-to-br from-green-500 to-green-600",
    lightColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-300",
    hoverBg: "hover:bg-green-50",
    label: "Départements",
    fields: [
      "Id_Dept",
      "Nom_Dept",
      "Sup_Dept",
      "Chef_lieu_Dept",
      "Id_Reg",
      "WKT_Geometry",
    ],
  },
  Arrondissement: {
    icon: Flag,
    color: "bg-gradient-to-br from-yellow-500 to-orange-500",
    lightColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-300",
    hoverBg: "hover:bg-yellow-50",
    label: "Arrondissements",
    fields: [
      "Id_Arrond",
      "Nom_Arrond",
      "Sup_Arrond",
      "Chef_lieu_Arrond",
      "Commune",
      "Id_Dept",
      "WKT_Geometry",
    ],
  },
  Lotissement: {
    icon: Database,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-300",
    hoverBg: "hover:bg-purple-50",
    label: "Lotissements",
    fields: [
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
      "Video_URL",
      "Image_URL_1",
      "Image_URL_2",
      "Image_URL_3",
      "Image_URL_4",
      "Image_URL_5",
      "Image_URL_6",
      "Id_Arrond",
      "WKT_Geometry",
      "price",
      "pricePerSqM",
      "currency",
      "forSale",
      "forRent",
      "rentPrice",
      "shortDescription",
      "description",
      "published",
      "featured",
    ],
  },
  Parcelle: {
    icon: MapPin,
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    lightColor: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-300",
    hoverBg: "hover:bg-orange-50",
    label: "Parcelles",
    fields: [
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
      "Video_URL",
      "Image_URL_1",
      "Image_URL_2",
      "Image_URL_3",
      "Image_URL_4",
      "Image_URL_5",
      "Image_URL_6",
      "Id_Lotis",
      "WKT_Geometry",
      "price",
      "pricePerSqM",
      "currency",
      "forSale",
      "forRent",
      "rentPrice",
      "shortDescription",
      "description",
      "published",
      "featured",
    ],
  },
  Batiment: {
    icon: Building2,
    color: "bg-gradient-to-br from-red-500 to-red-600",
    lightColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-300",
    hoverBg: "hover:bg-red-50",
    label: "Bâtiments",
    fields: [
      "Id_Bat",
      "Type_Usage",
      "Cat_Bat",
      "Status",
      "Standing",
      "Cloture",
      "No_Permis",
      "Type_Lodg",
      "Etat_Bat",
      "Nom",
      "Mat_Bati",
      "Video_URL",
      "Image_URL_1",
      "Image_URL_2",
      "Image_URL_3",
      "Image_URL_4",
      "Image_URL_5",
      "Image_URL_6",
      "Id_Parcel",
      "WKT_Geometry",
      "bedrooms",
      "bathrooms",
      "kitchens",
      "livingRooms",
      "totalFloors",
      "totalUnits",
      "hasElevator",
      "hasGenerator",
      "hasParking",
      "parkingSpaces",
      "price",
      "pricePerSqM",
      "currency",
      "forSale",
      "forRent",
      "rentPrice",
      "shortDescription",
      "description",
      "published",
      "featured",
    ],
  },
  Route: {
    icon: Route,
    color: "bg-gradient-to-br from-gray-500 to-gray-600",
    lightColor: "bg-gray-50",
    textColor: "text-gray-600",
    borderColor: "border-gray-300",
    hoverBg: "hover:bg-gray-100",
    label: "Routes",
    fields: [
      "Id_Rte",
      "Cat_Rte",
      "Type_Rte",
      "Largeur_Rte",
      "Etat_Rte",
      "Mat_Rte",
      "WKT_Geometry",
    ],
  },
  Riviere: {
    icon: Droplets,
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    lightColor: "bg-cyan-50",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-300",
    hoverBg: "hover:bg-cyan-50",
    label: "Rivières",
    fields: [
      "Id_Riv",
      "Nom_Riv",
      "Type_Riv",
      "Etat_amenag",
      "Debit_Riv",
      "WKT_Geometry",
    ],
  },
  Taxe_immobiliere: {
    icon: DollarSign,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-300",
    hoverBg: "hover:bg-emerald-50",
    label: "Taxes Immobilières",
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
  },
  Equipement: {
    icon: Lightbulb,
    color: "bg-gradient-to-br from-amber-500 to-amber-600",
    lightColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-300",
    hoverBg: "hover:bg-amber-50",
    label: "Équipements",
    fields: [
      "Id_Equip",
      "Type_Equip",
      "Design_Equip",
      "Etat_Equip",
      "Mat_Equip",
      "WKT_Geometry",
    ],
  },
  Reseau_energetique: {
    icon: Zap,
    color: "bg-gradient-to-br from-yellow-400 to-amber-500",
    lightColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-300",
    hoverBg: "hover:bg-yellow-50",
    label: "Réseau Énergétique",
    fields: [
      "Id_Reseaux",
      "Source_Res",
      "Type_Reseau",
      "Etat_Res",
      "Materiau",
      "WKT_Geometry",
    ],
  },
  Reseau_en_eau: {
    icon: Droplets,
    color: "bg-gradient-to-br from-sky-400 to-blue-500",
    lightColor: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-sky-300",
    hoverBg: "hover:bg-sky-50",
    label: "Réseau en Eau",
    fields: [
      "Id_Reseaux",
      "Source_Res",
      "Type_Res",
      "Etat_Res",
      "Mat_Res",
      "WKT_Geometry",
    ],
  },
  Infrastructure: {
    icon: Building2,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-300",
    hoverBg: "hover:bg-indigo-50",
    label: "Infrastructures",
    fields: [
      "Id_Infras",
      "Nom_infras",
      "Type_Infraas",
      "Categorie_infras",
      "Cycle",
      "Statut_infras",
      "Standing",
      "Video_URL",
      "Image_URL_1",
      "Image_URL_2",
      "Image_URL_3",
      "Image_URL_4",
      "Image_URL_5",
      "Image_URL_6",
      "WKT_Geometry",
    ],
  },
  Borne: {
    icon: MapPin,
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
    lightColor: "bg-pink-50",
    textColor: "text-pink-600",
    borderColor: "border-pink-300",
    hoverBg: "hover:bg-pink-50",
    label: "Bornes",
    fields: ["Id_Borne", "coord_x", "coord_y", "coord_z", "WKT_Geometry"],
  },
};

type TableName = keyof typeof tableConfigs;

const idFieldMap: Record<TableName, string> = {
  Region: "Id_Reg",
  Departement: "Id_Dept",
  Arrondissement: "Id_Arrond",
  Lotissement: "Id_Lotis",
  Parcelle: "Id_Parcel",
  Batiment: "Id_Bat",
  Route: "Id_Rte",
  Riviere: "Id_Riv",
  Taxe_immobiliere: "Id_Taxe",
  Equipement: "Id_Equip",
  Reseau_energetique: "Id_Reseaux",
  Reseau_en_eau: "Id_Reseaux",
  Infrastructure: "Id_Infras",
  Borne: "Id_Borne",
};

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
  "totalFloors",
  "totalUnits",
  "parkingSpaces",
]);

const booleanFields = new Set([
  "Taxe_Payee",
  "Mise_Val",
  "Cloture",
  "forSale",
  "forRent",
  "published",
  "featured",
  "hasElevator",
  "hasGenerator",
  "hasParking",
]);

export default function DataManagement() {
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [tableCounts, setTableCounts] = useState<Record<TableName, number>>({
    Region: 0,
    Departement: 0,
    Arrondissement: 0,
    Lotissement: 0,
    Parcelle: 0,
    Batiment: 0,
    Route: 0,
    Riviere: 0,
    Taxe_immobiliere: 0,
    Equipement: 0,
    Reseau_energetique: 0,
    Reseau_en_eau: 0,
    Infrastructure: 0,
    Borne: 0,
  });

  useEffect(() => {
    setExpandedRow(null);
    setEditingRowIndex(null);
    setEditForm({});
    setSearchQuery("");
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable) {
      fetchData(selectedTable);
    } else {
      // Fetch counts for all tables when viewing table selection
      fetchAllTableCounts();
    }
  }, [selectedTable]);

  const fetchAllTableCounts = async () => {
    const tables = Object.keys(tableConfigs) as TableName[];

    // Fetch ALL tables in parallel
    const results = await Promise.all(
      tables.map(async (table) => {
        try {
          const res = await fetch(`/api/data/${table}`);
          if (res.ok) {
            const json = await res.json();
            return { table, count: (json.data || []).length };
          }
          return { table, count: 0 };
        } catch (err) {
          console.error(`Failed to fetch count for ${table}:`, err);
          return { table, count: 0 };
        }
      }),
    );

    // Convert results array back to object
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
      const res = await fetch(`/api/data/${table}`);
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

  const getRowId = (item: any): number | null => {
    if (!selectedTable) return null;
    const idField = idFieldMap[selectedTable];
    const id = item[idField];
    return id != null ? Number(id) : null;
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

    const processedForm: Record<string, any> = {};
    const fields = tableConfigs[selectedTable].fields;

    for (const field of fields) {
      const value = editForm[field];
      if (value === "" || value == null) processedForm[field] = null;
      else if (numericFields.has(field)) {
        const num = parseFloat(value);
        processedForm[field] = isNaN(num) ? null : num;
      } else if (booleanFields.has(field)) {
        processedForm[field] =
          value === true || value === "true" || value === "1";
      } else processedForm[field] = value;
    }

    const idField = idFieldMap[selectedTable];
    const { [idField]: _, ...updateData } = processedForm;

    try {
      const res = await fetch(`/api/data/${selectedTable}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        await fetchData(selectedTable);
        setEditingRowIndex(null);
        setEditForm({});
        setExpandedRow(null);
      } else alert("Update failed");
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
      const res = await fetch(`/api/data/${selectedTable!}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setData((prev) => prev.filter((_, i) => i !== index));
      else alert("Delete failed");
    } catch {
      alert("Delete failed");
    }
  };

  const getFieldType = (field: string) => {
    if (field.startsWith("Image_URL")) return "image";
    if (field === "Video_URL") return "video";
    if (field === "WKT_Geometry") return "geometry";
    if (booleanFields.has(field)) return "boolean";
    if (numericFields.has(field)) return "number";
    if (field.includes("description") || field.includes("Description"))
      return "text";
    return "string";
  };

  const renderCellValue = (value: any, field: string) => {
    if (value == null || value === "") {
      return <span className="text-gray-400 italic text-xs">—</span>;
    }

    const fieldType = getFieldType(field);

    if (
      fieldType === "image" &&
      typeof value === "string" &&
      value.startsWith("http")
    ) {
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
            className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-cover rounded-lg border-2 border-gray-200 
                       group-hover:border-teal-400 transition-all shadow-sm"
          />
          <div
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                          transition-opacity rounded-lg flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </a>
      );
    }

    if (
      fieldType === "video" &&
      typeof value === "string" &&
      value.startsWith("http")
    ) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 text-red-600 
                     rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
        >
          <Video className="w-3.5 h-3.5" />
          Watch
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }

    if (fieldType === "boolean") {
      const isTrue =
        value === true || value === "true" || value === "1" || value === 1;
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
          ${
            isTrue ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {isTrue ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {isTrue ? "Yes" : "No"}
        </span>
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
    return (
      <div className="flex flex-col h-full w-full">
        {/* Header - Sticky */}
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

        {/* Cards Grid - Full Width */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
            {Object.entries(tableConfigs).map(([key, cfg]) => {
              const Icon = cfg.icon;
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
                  {/* Gradient Header */}
                  <div className={`${cfg.color} p-3 sm:p-4`}>
                    <div
                      className="w-9 h-9 sm:w-11 sm:h-11 bg-white/20 backdrop-blur-sm 
                                    rounded-lg flex items-center justify-center
                                    group-hover:scale-110 transition-transform"
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                      {cfg.label}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      {tableCounts[key as TableName] ?? 0} record
                      {(tableCounts[key as TableName] ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const config = tableConfigs[selectedTable];
  const Icon = config.icon;

  // ------------------------------------------------
  // TABLE DATA VIEW - FULL WIDTH
  // ------------------------------------------------
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shrink-0">
        {/* Back Button */}
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

        {/* Title + Controls */}
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`${config.color} p-2 sm:p-2.5 rounded-xl shadow-lg shrink-0`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {config.label}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {searchQuery
                    ? `${filteredData.length} of ${data.length}`
                    : data.length}{" "}
                  record{data.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Search + Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              {/* Search */}
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

              {/* Refresh + Add */}
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
                <button
                  disabled
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 
                           bg-gray-100 text-gray-400 rounded-lg text-sm font-medium
                           cursor-not-allowed whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add New</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Full Width Scrollable */}
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
                : "This table is empty. Add some records to get started."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          /* Records List - FULL WIDTH */
          <div className="space-y-3">
            {filteredData.map((item, index) => {
              const id = getRowId(item);
              const isExpanded = expandedRow === index;
              const isEditing = editingRowIndex === index;
              const idField = idFieldMap[selectedTable];
              // Show more fields on larger screens
              const summaryFieldsCount =
                typeof window !== "undefined" && window.innerWidth >= 1280
                  ? 6
                  : typeof window !== "undefined" && window.innerWidth >= 768
                    ? 5
                    : 3;
              const summaryFields = config.fields.slice(0, summaryFieldsCount);

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
                      {/* Mobile: Stack | Desktop: Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                        {/* Summary Fields - Responsive Grid */}
                        <div className="flex-1 min-w-0">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-2">
                            {config.fields.slice(0, 6).map((f, fIndex) => (
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
                                <p className="text-xs sm:text-sm font-medium text-gray-800 truncate mt-0.5">
                                  {booleanFields.has(f) ? (
                                    <span
                                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]
                                      ${
                                        item[f]
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                    >
                                      {item[f] ? (
                                        <Check className="w-2.5 h-2.5" />
                                      ) : (
                                        <X className="w-2.5 h-2.5" />
                                      )}
                                      {item[f] ? "Yes" : "No"}
                                    </span>
                                  ) : (
                                    String(item[f] ?? "—")
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions - Always visible */}
                        <div className="flex items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-0 border-gray-100 shrink-0">
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
                                ${
                                  id != null
                                    ? "text-blue-600 hover:bg-blue-50"
                                    : "text-gray-300 cursor-not-allowed"
                                }`}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              disabled={id == null}
                              className={`p-2 rounded-lg transition-colors
                                ${
                                  id != null
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-gray-300 cursor-not-allowed"
                                }`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXPANDED VIEW - FULL WIDTH */}
                  {isExpanded && (
                    <div className="w-full">
                      {/* Colored Header Bar */}
                      <div
                        className={`${config.color} px-4 sm:px-5 py-3 
                          flex flex-wrap items-center justify-between gap-2`}
                      >
                        <button
                          onClick={() => handleViewToggle(index)}
                          className="inline-flex items-center gap-1.5 text-white/90 hover:text-white 
                                   transition-colors text-sm font-medium"
                        >
                          <ChevronUp className="w-4 h-4" />
                          <span>Collapse</span>
                        </button>

                        <div className="flex items-center gap-2 flex-wrap">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                         bg-white text-green-600 rounded-lg text-sm font-medium
                                         hover:bg-green-50 transition-colors shadow-sm"
                              >
                                <Check className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                         bg-white/20 text-white rounded-lg text-sm font-medium
                                         hover:bg-white/30 transition-colors"
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
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 
                                          bg-white rounded-lg text-sm font-medium transition-colors shadow-sm
                                          ${
                                            id != null
                                              ? "text-blue-600 hover:bg-blue-50"
                                              : "text-gray-400 cursor-not-allowed"
                                          }`}
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                disabled={id == null}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 
                                          bg-white/20 rounded-lg text-sm font-medium transition-colors
                                          ${
                                            id != null
                                              ? "text-white hover:bg-white/30"
                                              : "text-white/50 cursor-not-allowed"
                                          }`}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Fields Grid - FULL WIDTH RESPONSIVE */}
                      <div className="p-4 sm:p-5 lg:p-6 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5 w-full">
                          {config.fields.map((field) => {
                            const isGeometry = field === "WKT_Geometry";
                            const fieldType = getFieldType(field);
                            const isLongText =
                              fieldType === "text" || isGeometry;
                            const isImageField = fieldType === "image";

                            // Make long text fields span full width
                            let colSpan = "";
                            if (isLongText) {
                              colSpan =
                                "sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5";
                            }

                            return (
                              <div key={field} className={`${colSpan} w-full`}>
                                {/* Label */}
                                <div className="flex items-center gap-1.5 mb-2">
                                  {fieldType === "image" && (
                                    <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                                  )}
                                  {fieldType === "video" && (
                                    <Video className="w-3.5 h-3.5 text-red-500" />
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
                                  {field === idField && (
                                    <span className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-bold">
                                      ID
                                    </span>
                                  )}
                                </div>

                                {/* Value/Input */}
                                <div className="w-full">
                                  {isEditing && field !== idField ? (
                                    booleanFields.has(field) ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditForm({
                                            ...editForm,
                                            [field]: !editForm[field],
                                          })
                                        }
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                                                  font-medium text-sm transition-all
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
                                        {editForm[field] ? "Yes" : "No"}
                                      </button>
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
                                        className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg
                                                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                                                  text-gray-800 text-sm resize-y
                                                  ${
                                                    isGeometry
                                                      ? "font-mono text-xs bg-gray-50"
                                                      : ""
                                                  }`}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                                 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                                                 text-gray-800 text-sm"
                                      />
                                    )
                                  ) : (
                                    <div
                                      className={`w-full ${
                                        isGeometry
                                          ? "font-mono text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto max-h-32 scrollbar-thin"
                                          : ""
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
