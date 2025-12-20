// app/admin/dashboard/page.tsx
import { Database, MapPin, Building2, DollarSign } from "lucide-react";
import prisma from "@/lib/prisma";
import QuickActions from "./QuickActions"; // ← New client component

async function getStats() {
  const [
    regions,
    departements,
    arrondissements,
    lotissements,
    parcelles,
    batiments,
    routes,
    rivieres,
    taxes,
  ] = await Promise.all([
    prisma.region.count(),
    prisma.departement.count(),
    prisma.arrondissement.count(),
    prisma.lotissement.count(),
    prisma.parcelle.count(),
    prisma.batiment.count(),
    prisma.route.count(),
    prisma.riviere.count(),
    prisma.taxe_immobiliere.count(),
  ]);

  const totalRecords =
    regions +
    departements +
    arrondissements +
    lotissements +
    parcelles +
    batiments +
    routes +
    rivieres +
    taxes;

  return {
    totalRecords,
    activeTables: 14,
    regions,
    departements,
    parcelles,
    batiments,
    taxes,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

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

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-teal-800">Welcome back!</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Here's what's happening with your GIS data today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-4 rounded-xl`}>
                <card.icon className={`w-8 h-8 ${card.color}`} />
              </div>
            </div>
            <p className="text-gray-600 text-sm">{card.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Interactive Quick Actions - moved to Client Component */}
      <QuickActions />
    </div>
  );
}