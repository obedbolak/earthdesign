// app/admin/dashboard/data/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
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

const getIdFieldName = (table: TableName): string => `Id_${table}`;

export default function DataManagementPage() {
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // Now string to support fallback keys
  const [editForm, setEditForm] = useState<Record<string, any>>({});

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

  const getRowKey = (item: any, index: number): string => {
    const idField = getIdFieldName(selectedTable!);
    const id = item[idField];
    if (id != null) return String(id);

    // Fallback: combine index with some field values to make unique key
    const values = config.fields.map(f => item[f] ?? "").join("|");
    return `row-${index}-${values.substring(0, 50)}`;
  };

  const handleDelete = async (key: string) => {
    if (!confirm("Delete this record?")) return;
    if (!selectedTable) return;

    const idField = getIdFieldName(selectedTable);
    const item = data.find(d => getRowKey(d, data.indexOf(d)) === key);
    const id = item?.[idField];
    if (id == null) {
      alert("Cannot delete: missing ID");
      return;
    }

    try {
      const res = await fetch(`/api/data/${selectedTable}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData(prev => prev.filter(d => getRowKey(d, prev.indexOf(d)) !== key));
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Delete failed");
    }
  };

  const handleEdit = (item: any, key: string) => {
    if (!selectedTable) return;
    setEditingId(key);
    setEditForm({ ...item });
  };

  const handleSave = async () => {
    if (!selectedTable || editingId == null) return;

    const item = data.find(d => getRowKey(d, data.indexOf(d)) === editingId);
    const idField = getIdFieldName(selectedTable);
    const id = item?.[idField];
    if (id == null) {
      alert("Cannot save: missing ID");
      return;
    }

    try {
      const res = await fetch(`/api/data/${selectedTable}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        await fetchData(selectedTable);
        setEditingId(null);
        setEditForm({});
      } else {
        alert("Update failed");
      }
    } catch {
      alert("Update failed");
    }
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
  const idField = getIdFieldName(selectedTable);

  const renderCellValue = (value: any, field: string) => {
    if (value == null || value === "") return "-";

    if (field.startsWith("Image_URL") && typeof value === "string" && value.startsWith("http")) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          <img src={value} alt={field} className="w-24 h-24 object-cover rounded border" />
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
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none z-20">
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </div>

            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {config.fields.map((field) => (
                        <th
                          key={field}
                          className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap"
                        >
                          {field.replace(/_/g, " ")}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((item, index) => {
                      const rowKey = getRowKey(item, index);
                      const isEditing = editingId === rowKey;

                      return (
                        <tr key={rowKey} className="hover:bg-gray-50">
                          {config.fields.map((field) => (
                            <td key={field} className="px-6 py-4 text-sm text-black whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm[field] ?? ""}
                                  onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                  className="border border-gray-300 rounded px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                              ) : (
                                renderCellValue(item[field], field)
                              )}
                            </td>
                          ))}
                          <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                            {isEditing ? (
                              <>
                                <button onClick={handleSave} className="text-green-600 font-medium mr-4 hover:underline">
                                  Save
                                </button>
                                <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline">
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleEdit(item, rowKey)} className="text-blue-600 mr-4 hover:underline">
                                  <Edit className="w-4 h-4 inline" />
                                </button>
                                <button onClick={() => handleDelete(rowKey)} className="text-red-600 hover:underline">
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}