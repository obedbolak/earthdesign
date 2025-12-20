// app/admin/dashboard/QuickActions.tsx
"use client";

import { Upload, Database, Trash2 } from "lucide-react";

export default function QuickActions() {
  const handleClearDatabase = async () => {
    const firstConfirm = confirm(
      "⚠️ DANGER: This will PERMANENTLY DELETE ALL records in the database!\n\nAre you absolutely sure?"
    );
    if (!firstConfirm) return;

    const secondConfirm = confirm("FINAL WARNING: This action CANNOT be undone. Proceed?");
    if (!secondConfirm) return;

    try {
      const res = await fetch("/api/clear-data", {
        method: "POST",
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert("✅ All data has been successfully cleared!");
        window.location.reload();
      } else {
        alert("❌ Failed to clear data: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Network error while clearing database");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/dashboard/upload"
          className="border border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:shadow-md transition text-center"
        >
          <Upload className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Upload New Data</h3>
          <p className="text-gray-600 text-sm mt-2">Import Excel file</p>
        </a>

        <a
          href="/admin/dashboard/data"
          className="border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition text-center"
        >
          <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Manage Records</h3>
          <p className="text-gray-600 text-sm mt-2">View, edit & delete data</p>
        </a>

        <button
          onClick={handleClearDatabase}
          className="border border-red-200 rounded-xl p-6 hover:border-red-500 hover:shadow-md transition text-center w-full"
        >
          <Trash2 className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Clear Database</h3>
          <p className="text-gray-600 text-sm mt-2">Remove all records</p>
        </button>
      </div>
    </div>
  );
}