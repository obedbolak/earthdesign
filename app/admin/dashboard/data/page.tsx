// app/admin/dashboard/data/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  Eye,
  EyeOff,
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
} from "lucide-react";

const tableConfigs = {
  Region: {
    icon: Map,
    color: "bg-blue-500",
    label: "Régions",
    fields: ["Id_Reg", "Nom_Reg", "Sup_Reg", "Chef_lieu_Reg", "WKT_Geometry"]
  },
  Departement: {
    icon: MapPin,
    color: "bg-green-500",
    label: "Départements",
    fields: ["Id_Dept", "Nom_Dept", "Sup_Dept", "Chef_lieu_Dept", "Id_Reg", "WKT_Geometry"]
  },
  Arrondissement: {
    icon: Flag,
    color: "bg-yellow-500",
    label: "Arrondissements",
    fields: ["Id_Arrond", "Nom_Arrond", "Sup_Arrond", "Chef_lieu_Arrond", "Commune", "Id_Dept", "WKT_Geometry"]
  },
  Lotissement: {
    icon: Database,
    color: "bg-purple-500",
    label: "Lotissements",
    fields: [
      "Id_Lotis", "Nom_proprio", "Num_TF", "Statut", "Nom_cons", "Surface",
      "Nom_visa_lotis", "Date_approb", "Geo_exe", "Nbre_lots", "Lieudit", "Echelle",
      "Ccp", "Video_URL", "Image_URL_1", "Image_URL_2", "Image_URL_3", "Image_URL_4",
      "Image_URL_5", "Image_URL_6", "Id_Arrond", "WKT_Geometry"
    ]
  },
  Parcelle: {
    icon: MapPin,
    color: "bg-orange-500",
    label: "Parcelles",
    fields: [
      "Id_Parcel", "Nom_Prop", "TF_Mere", "Mode_Obtent", "TF_Cree", "Nom_Cons", "Sup",
      "Nom_Visa_Cad", "Date_visa", "Geometre", "Date_impl", "Num_lot", "Num_bloc",
      "Lieu_dit", "Largeur_Rte", "Echelle", "Ccp_N", "Mise_Val", "Cloture",
      "Video_URL", "Image_URL_1", "Image_URL_2", "Image_URL_3", "Image_URL_4",
      "Image_URL_5", "Image_URL_6", "Id_Lotis", "WKT_Geometry"
    ]
  },
  Batiment: {
    icon: Building2,
    color: "bg-red-500",
    label: "Bâtiments",
    fields: [
      "Id_Bat", "Type_Usage", "Cat_Bat", "Status", "Standing", "Cloture", "No_Permis",
      "Type_Lodg", "Etat_Bat", "Nom", "Mat_Bati", "Video_URL",
      "Image_URL_1", "Image_URL_2", "Image_URL_3", "Image_URL_4", "Image_URL_5", "Image_URL_6",
      "Id_Parcel", "WKT_Geometry"
    ]
  },
  Route: {
    icon: Route,
    color: "bg-gray-500",
    label: "Routes",
    fields: ["Id_Rte", "Cat_Rte", "Type_Rte", "Largeur_Rte", "Etat_Rte", "Mat_Rte", "WKT_Geometry"]
  },
  Riviere: {
    icon: Droplets,
    color: "bg-cyan-500",
    label: "Rivières",
    fields: ["Id_Riv", "Nom_Riv", "Type_Riv", "Etat_amenag", "Debit_Riv", "WKT_Geometry"]
  },
  Taxe_immobiliere: {
    icon: DollarSign,
    color: "bg-green-600",
    label: "Taxes Immobilières",
    fields: ["Id_Taxe", "Num_TF", "Nom_Proprio", "NIU", "Val_imm", "Taxe_Payee", "Date_declaree", "Type_taxe"]
  },
  Equipement: {
    icon: Lightbulb,
    color: "bg-yellow-600",
    label: "Équipements",
    fields: ["Id_Equip", "Type_Equip", "Design_Equip", "Etat_Equip", "Mat_Equip", "WKT_Geometry"]
  },
  Reseau_energetique: {
    icon: Zap,
    color: "bg-amber-500",
    label: "Réseau Énergétique",
    fields: ["Id_Reseaux", "Source_Res", "Type_Reseau", "Etat_Res", "Materiau", "WKT_Geometry"]
  },
  Reseau_en_eau: {
    icon: Droplets,
    color: "bg-blue-400",
    label: "Réseau en Eau",
    fields: ["Id_Reseaux", "Source_Res", "Type_Res", "Etat_Res", "Mat_Res", "WKT_Geometry"]
  },
  Infrastructure: {
    icon: Building2,
    color: "bg-indigo-500",
    label: "Infrastructures",
    fields: [
      "Id_Infras", "Nom_infras", "Type_Infraas", "Categorie_infras", "Cycle", "Statut_infras",
      "Standing", "Video_URL", "Image_URL_1", "Image_URL_2", "Image_URL_3", "Image_URL_4",
      "Image_URL_5", "Image_URL_6", "WKT_Geometry"
    ]
  },
  Borne: {
    icon: MapPin,
    color: "bg-pink-500",
    label: "Bornes",
    fields: ["Id_Borne", "coord_x", "coord_y", "coord_z", "WKT_Geometry"]
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
  "Sup_Reg", "Sup_Dept", "Sup_Arrond", "Surface", "Sup", "Echelle", "Nbre_lots",
  "Val_imm", "Source_Res", "coord_x", "coord_y", "coord_z"
]);

const booleanFields = new Set(["Taxe_Payee", "Mise_Val", "Cloture"]);

export default function DataManagementPage() {
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  // Reset state when switching tables
  useEffect(() => {
    setExpandedRow(null);
    setEditingRowIndex(null);
    setEditForm({});
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable) fetchData(selectedTable);
  }, [selectedTable]);

  const fetchData = async (table: TableName) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data/${table}`);
      if (!res.ok) throw new Error("Failed to load");
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
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

  const handleViewToggle = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

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
    const currentFields = tableConfigs[selectedTable].fields;

    for (const field of currentFields) {
      const value = editForm[field];

      if (value === "" || value == null) {
        processedForm[field] = null;
      } else if (numericFields.has(field)) {
        const num = parseFloat(value);
        processedForm[field] = isNaN(num) ? null : num;
      } else if (booleanFields.has(field)) {
        processedForm[field] = value === "true" || value === true || value === "1";
      } else {
        processedForm[field] = value;
      }
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
      } else {
        alert("Update failed");
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
      const res = await fetch(`/api/data/${selectedTable!}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData(prev => prev.filter((_, i) => i !== index));
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Delete failed");
    }
  };

  const renderCellValue = (value: any, field: string) => {
    if (value == null || value === "") return "-";

    if (field.startsWith("Image_URL") && typeof value === "string" && value.startsWith("http")) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="block">
          <img src={value} alt={field} className="w-32 h-32 object-cover rounded border" />
        </a>
      );
    }

    if (field === "Video_URL" && typeof value === "string" && value.startsWith("http")) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
          View Video <ExternalLink className="w-4 h-4" />
        </a>
      );
    }

    return String(value);
  };

  if (!selectedTable) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Data</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(tableConfigs).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedTable(key as TableName)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
              >
                <div className={`${config.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{config.label}</h3>
                <p className="text-gray-600 text-sm mt-2">View, edit, and delete records</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const config = tableConfigs[selectedTable];
  const Icon = config.icon;

  const summaryFieldsCount = 5;

  return (
    <div className="p-8">
      <button
        onClick={() => setSelectedTable(null)}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6"
      >
        <ChevronLeft className="w-5 h-5" /> Back to tables
      </button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`${config.color} p-4 rounded-xl`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{config.label}</h1>
            <p className="text-gray-600">{data.length} record{data.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 opacity-50 cursor-not-allowed">
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-600">Loading data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-500 text-lg">No records found</p>
          <p className="text-gray-400 mt-2">This table is empty.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((item, index) => {
            const id = getRowId(item);
            const isExpanded = expandedRow === index;
            const isEditing = editingRowIndex === index;
            const idField = idFieldMap[selectedTable];

            return (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Summary Row (only when NOT expanded) */}
                {!isExpanded && (
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex flex-wrap gap-6 flex-1">
                      {config.fields.slice(0, summaryFieldsCount).map((field) => (
                        <div key={field} className="min-w-0">
                          <p className="text-xs text-gray-500 uppercase">{field.replace(/_/g, " ")}</p>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {String(item[field] ?? "-")}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <button
                        onClick={() => handleViewToggle(index)}
                        className="text-gray-600 hover:text-teal-600 flex items-center gap-1"
                      >
                        <Eye className="w-5 h-5" />
                        <span className="text-sm">Show more</span>
                      </button>

                      {isEditing ? (
                        <>
                          <button onClick={handleSave} className="text-green-600 hover:text-green-700 font-medium">
                            Save
                          </button>
                          <button onClick={handleCancel} className="text-gray-600 hover:text-gray-700 font-medium">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(item, index)}
                            disabled={id == null}
                            className={id != null ? "text-blue-600 hover:text-blue-700" : "text-gray-400 cursor-not-allowed"}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            disabled={id == null}
                            className={id != null ? "text-red-600 hover:text-red-700" : "text-gray-400 cursor-not-allowed"}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Expanded Full View (replaces summary) */}
                {isExpanded && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={() => handleViewToggle(index)}
                        className="text-gray-600 hover:text-teal-600 flex items-center gap-1"
                      >
                        <EyeOff className="w-5 h-5" />
                        <span className="text-sm">Hide Details</span>
                      </button>

                      <div className="flex items-center gap-4">
                        {isEditing ? (
                          <>
                            <button onClick={handleSave} className="text-green-600 hover:text-green-700 font-medium">
                              Save
                            </button>
                            <button onClick={handleCancel} className="text-gray-600 hover:text-gray-700 font-medium">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(item, index)}
                              disabled={id == null}
                              className={id != null ? "text-blue-600 hover:text-blue-700" : "text-gray-400 cursor-not-allowed"}
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              disabled={id == null}
                              className={id != null ? "text-red-600 hover:text-red-700" : "text-gray-400 cursor-not-allowed"}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {config.fields.map((field) => {
                        const isGeometryField = field === "WKT_Geometry";

                        return (
                          <div
                            key={field}
                            className={isGeometryField ? "md:col-span-2 lg:col-span-3" : ""}
                          >
                            <p className="text-xs font-medium text-gray-500 uppercase">{field.replace(/_/g, " ")}</p>
                            <div className="mt-2">
                              {isEditing && field !== idField ? (
                                <input
                                  type={numericFields.has(field) ? "number" : "text"}
                                  step={numericFields.has(field) ? "any" : undefined}
                                  value={editForm[field] ?? ""}
                                  onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 ${isGeometryField ? "font-mono text-xs" : ""}`}
                                />
                              ) : (
                                <div className={`text-sm text-gray-900 break-words ${isGeometryField ? "font-mono text-xs" : ""}`}>
                                  {renderCellValue(item[field], field)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}