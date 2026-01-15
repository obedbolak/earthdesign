// app/dashboard/page.tsx
import { requireUser } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import {
  Heart,
  Clock,
  Bell,
  Eye,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

// Get user stats
async function getUserStats(userId: string, role: string) {
  // Base stats for all users
  const baseStats = {
    favorites: 12, // Replace with actual query
    recentViews: 24,
    notifications: 3,
    savedSearches: 5,
  };

  // Agent-specific stats
  if (role === "AGENT") {
    const [listings, leads] = await Promise.all([
      prisma.batiment.count({
        where: { published: true }, // Add agent filter when available
      }),
      Promise.resolve(8), // Replace with actual leads count
    ]);

    return {
      ...baseStats,
      listings,
      leads,
      viewsThisMonth: 1234,
      inquiriesThisMonth: 45,
      earnings: 2500000,
      pendingAppointments: 3,
    };
  }

  return baseStats;
}

// Get recent activity
async function getRecentActivity(userId: string, role: string) {
  // Mock data - replace with actual queries
  return [
    {
      id: 1,
      type: "view",
      title: "Viewed Villa in Bastos",
      time: "2 hours ago",
      icon: Eye,
    },
    {
      id: 2,
      type: "favorite",
      title: "Saved Apartment in Bonapriso",
      time: "5 hours ago",
      icon: Heart,
    },
    {
      id: 3,
      type: "notification",
      title: "Price drop on saved property",
      time: "1 day ago",
      icon: Bell,
    },
  ];
}

// Get recommended properties
async function getRecommendedProperties() {
  const properties = await prisma.batiment.findMany({
    where: { published: true, featured: true },
    take: 4,
    include: {
      parcelle: {
        include: {
          lotissement: {
            include: {
              arrondissement: true,
            },
          },
        },
      },
    },
  });

  return properties;
}

export default async function DashboardPage() {
  const session = await requireUser();
  const user = session.user;
  const isAgent = user?.role === "AGENT";

  const [stats, activity, recommended] = await Promise.all([
    getUserStats(user?.id || "", user?.role || "USER"),
    getRecentActivity(user?.id || "", user?.role || "USER"),
    getRecommendedProperties(),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-teal-100 text-sm sm:text-base">
          {isAgent
            ? "Here's an overview of your listings and performance."
            : "Here's what's happening with your property search."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* User Stats */}
        <StatCard
          icon={Heart}
          label="Favorites"
          value={stats.favorites}
          href="/dashboard/favorites"
          color="rose"
        />
        <StatCard
          icon={Clock}
          label="Recent Views"
          value={stats.recentViews}
          href="/dashboard/history"
          color="blue"
        />
        <StatCard
          icon={Bell}
          label="Notifications"
          value={stats.notifications}
          href="/dashboard/notifications"
          color="amber"
          badge={stats.notifications > 0}
        />

        {isAgent ? (
          <StatCard
            icon={Building2}
            label="My Listings"
            value={(stats as any).listings}
            href="/dashboard/listings"
            color="teal"
          />
        ) : (
          <StatCard
            icon={Eye}
            label="Saved Searches"
            value={stats.savedSearches}
            href="/dashboard/searches"
            color="purple"
          />
        )}
      </div>

      {/* Agent-Only Stats Row */}
      {isAgent && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={Users}
            label="Active Leads"
            value={(stats as any).leads}
            href="/dashboard/leads"
            color="indigo"
            badge
          />
          <StatCard
            icon={Eye}
            label="Views This Month"
            value={(stats as any).viewsThisMonth.toLocaleString()}
            trend={{ value: 12, positive: true }}
            color="cyan"
          />
          <StatCard
            icon={Calendar}
            label="Appointments"
            value={(stats as any).pendingAppointments}
            href="/dashboard/appointments"
            color="orange"
          />
          <StatCard
            icon={DollarSign}
            label="Earnings"
            value={`${((stats as any).earnings / 1000000).toFixed(1)}M XAF`}
            trend={{ value: 8, positive: true }}
            href="/dashboard/earnings"
            color="emerald"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
            <Link
              href="/dashboard/history"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activity.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === "view"
                      ? "bg-blue-100"
                      : item.type === "favorite"
                      ? "bg-rose-100"
                      : "bg-amber-100"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      item.type === "view"
                        ? "text-blue-600"
                        : item.type === "favorite"
                        ? "text-rose-600"
                        : "text-amber-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            <QuickActionButton
              href="/properties"
              icon={Building2}
              label="Browse Properties"
              color="teal"
            />
            <QuickActionButton
              href="/dashboard/favorites"
              icon={Heart}
              label="View Favorites"
              color="rose"
            />
            {isAgent && (
              <>
                <QuickActionButton
                  href="/dashboard/listings/new"
                  icon={Building2}
                  label="Add New Listing"
                  color="emerald"
                  primary
                />
                <QuickActionButton
                  href="/dashboard/leads"
                  icon={Users}
                  label="Manage Leads"
                  color="indigo"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Properties */}
      {recommended.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recommended for You</h2>
            <Link
              href="/properties"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommended.slice(0, 4).map((property) => (
              <PropertyCard key={property.Id_Bat} property={property} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  href,
  color,
  badge,
  trend,
}: {
  icon: any;
  label: string;
  value: string | number;
  href?: string;
  color: string;
  badge?: boolean;
  trend?: { value: number; positive: boolean };
}) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    rose: { bg: "bg-rose-100", icon: "text-rose-600" },
    blue: { bg: "bg-blue-100", icon: "text-blue-600" },
    amber: { bg: "bg-amber-100", icon: "text-amber-600" },
    teal: { bg: "bg-teal-100", icon: "text-teal-600" },
    purple: { bg: "bg-purple-100", icon: "text-purple-600" },
    indigo: { bg: "bg-indigo-100", icon: "text-indigo-600" },
    cyan: { bg: "bg-cyan-100", icon: "text-cyan-600" },
    orange: { bg: "bg-orange-100", icon: "text-orange-600" },
    emerald: { bg: "bg-emerald-100", icon: "text-emerald-600" },
  };

  const colors = colorClasses[color] || colorClasses.teal;

  const Content = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer relative">
      {badge && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full" />
      )}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.positive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend.positive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <Content />
      </Link>
    );
  }

  return <Content />;
}

// Quick Action Button
function QuickActionButton({
  href,
  icon: Icon,
  label,
  color,
  primary,
}: {
  href: string;
  icon: any;
  label: string;
  color: string;
  primary?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 p-3 rounded-xl transition ${
          primary
            ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
            : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${primary ? "text-white" : "text-gray-600"}`}
        />
        <span
          className={`font-medium text-sm ${
            primary ? "text-white" : "text-gray-700"
          }`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}

// Property Card (simplified)
function PropertyCard({ property }: { property: any }) {
  const image = property.Image_URL_1 || "/placeholder-property.jpg";
  const location =
    property.Parcelle?.Lotissement?.Arrondissement?.Nom_Arrond || "Location";

  // Generate proper URL slug
  const propertySlug = `batiment-${property.Id_Bat}`;

  return (
    <Link href={`/property/${propertySlug}`}>
      <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer">
        <div className="aspect-video relative">
          <img
            src={image}
            alt={property.Type_Usage || "Property"}
            className="w-full h-full object-cover"
          />
          {property.featured && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              Featured
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {property.Type_Usage || "Property"}
          </p>
          <p className="text-xs text-gray-500 truncate">{location}</p>
          {property.price && (
            <p className="text-sm font-bold text-teal-600 mt-1">
              {(property.price / 1000000).toFixed(1)}M XAF
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
