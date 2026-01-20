// app/admin/dashboard/components/Overview.tsx
"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  Database,
  MapPin,
  Building2,
  DollarSign,
  Upload,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

type TabKey = "overview" | "data" | "upload" | "images" | "video" | "clear";

interface Stats {
  totalRecords: number;
  regions: number;
  departements: number;
  parcelles: number;
  batiments: number;
  taxes: number;
}

export default function Overview({
  onTabChange,
}: { onTabChange?: Dispatch<SetStateAction<TabKey>> } = {}) {
  const [stats, setStats] = useState<Stats>({
    totalRecords: 0,
    regions: 0,
    departements: 0,
    parcelles: 0,
    batiments: 0,
    taxes: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    const firstConfirm = confirm(
      "⚠️ DANGER: This will PERMANENTLY DELETE ALL records in the database!\n\nAre you absolutely sure?",
    );
    if (!firstConfirm) return;

    const secondConfirm = confirm(
      "FINAL WARNING: This action CANNOT be undone. Proceed?",
    );
    if (!secondConfirm) return;

    try {
      const res = await fetch("/api/clear-data", {
        method: "POST",
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert("✅ All data has been successfully cleared!");
        fetchStats();
      } else {
        alert("❌ Failed to clear data: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Network error while clearing database");
    }
  };

  const statCards = [
    {
      label: "Total Records",
      value: stats.totalRecords.toLocaleString(),
      icon: Database,
      color: "text-teal-600",
      bg: "bg-teal-100",
    },
    {
      label: "Régions",
      value: stats.regions,
      icon: MapPin,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Parcelles",
      value: stats.parcelles.toLocaleString(),
      icon: MapPin,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Bâtiments",
      value: stats.batiments.toLocaleString(),
      icon: Building2,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Taxes",
      value: stats.taxes.toLocaleString(),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="text-gray-600 mt-4">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-teal-800">
          Welcome {user?.name || "Admin"}
        </h1>
        <p className="text-gray-600 mt-2 text-base md:text-lg">
          Here's what's happening with your data today.
        </p>
      </div>

      {/* Stats Grid - Single Card on Mobile */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
          Database Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl border border-gray-100 hover:border-teal-200 transition-colors"
            >
              <div className={`${card.bg} p-2 md:p-3 rounded-lg mb-2`}>
                <card.icon className={`w-5 h-5 md:w-6 md:h-6 ${card.color}`} />
              </div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">
                {card.label}
              </p>
              <p className="text-lg md:text-2xl font-bold text-gray-800">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          <button
            onClick={() => onTabChange?.("upload")}
            className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 hover:border-teal-500 hover:shadow-md transition text-center w-full"
          >
            <Upload className="w-10 h-10 md:w-12 md:h-12 text-teal-600 mx-auto mb-3 md:mb-4" />
            <h3 className="font-semibold text-base md:text-lg">
              Upload New Data
            </h3>
            <p className="text-gray-600 text-xs md:text-sm mt-2">
              Import Excel file
            </p>
          </button>

          <button
            onClick={() => onTabChange?.("data")}
            className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 hover:border-blue-500 hover:shadow-md transition text-center w-full hover:bg-blue-50"
          >
            <Database className="w-10 h-10 md:w-12 md:h-12 text-blue-600 mx-auto mb-3 md:mb-4" />
            <h3 className="font-semibold text-base md:text-lg">
              Manage Records
            </h3>
            <p className="text-gray-600 text-xs md:text-sm mt-2">
              View, edit & delete data
            </p>
          </button>

          <button
            onClick={handleClearDatabase}
            className="bg-white border border-red-200 rounded-xl p-5 md:p-6 hover:border-red-500 hover:shadow-md transition text-center w-full hover:bg-red-50"
          >
            <Trash2 className="w-10 h-10 md:w-12 md:h-12 text-red-600 mx-auto mb-3 md:mb-4" />
            <h3 className="font-semibold text-base md:text-lg">
              Clear Database
            </h3>
            <p className="text-gray-600 text-xs md:text-sm mt-2">
              Remove all records
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
