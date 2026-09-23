// app/dashboard/page.tsx
import { requireUser } from "@/lib/auth-helpers";
import { serverApiJson } from "@/lib/api-server";
import {
  Heart,
  Clock,
  Bell,
  Eye,
  Building2,
  Search,
  MapPin,
  TrendingUp,
  Star,
  MessageSquare,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  time: string;
  sortTime: number;
  icon: typeof Eye;
  link: string;
};

// Everything the dashboard shows comes from GET /api/dashboard/user.
async function getDashboardData() {
  try {
    return await serverApiJson<{
      stats: { favorites: number; recentViews: number };
      recentViews: any[];
      recentFavorites: any[];
      favoriteProperties: any[];
      recommended: any[];
    }>("/dashboard/user");
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

function buildRecentActivity(
  views: any[],
  favorites: any[],
): ActivityItem[] {
  const linkFor = (batiment: any) =>
    `/property/${batiment?.slug || `batiment-${batiment?.Id_Bat}`}`;

  const activities: ActivityItem[] = [
    ...views.map((view) => ({
      id: `view-${view.id}`,
      type: "view",
      title: `Viewed ${view.batiment?.title || view.batiment?.propertyType || "Property"}`,
      time: formatTimeAgo(view.createdAt),
      sortTime: new Date(view.createdAt).getTime(),
      icon: Eye,
      link: linkFor(view.batiment),
    })),
    ...favorites.map((fav) => ({
      id: `favorite-${fav.id}`,
      type: "favorite",
      title: `Saved ${fav.batiment?.title || fav.batiment?.propertyType || "Property"}`,
      time: formatTimeAgo(fav.createdAt),
      sortTime: new Date(fav.createdAt).getTime(),
      icon: Heart,
      link: linkFor(fav.batiment),
    })),
  ]
    .sort((a, b) => b.sortTime - a.sortTime)
    .slice(0, 5);

  // Add mock notification if no real activity
  if (activities.length === 0) {
    activities.push({
      id: "notification-1",
      type: "notification",
      title: "Welcome to Property Portal",
      time: "Today",
      sortTime: Date.now(),
      icon: Bell,
      link: "/properties",
    });
  }

  return activities;
}

// Helper function to format time
function formatTimeAgo(date: Date | string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

export default async function DashboardPage() {
  const session = await requireUser();
  const user = session.user;

  const data = await getDashboardData();
  const stats = data
    ? {
        favorites: data.stats.favorites,
        recentViews: data.stats.recentViews,
        // Placeholders until notifications and saved searches exist.
        notifications: 3,
        savedSearches: 5,
      }
    : null;
  const activity = data
    ? buildRecentActivity(data.recentViews, data.recentFavorites)
    : [];
  const favorites = data?.favoriteProperties ?? [];
  const recommended = data?.recommended ?? [];

  // Handle case when stats fail to load
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Unable to Load Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            There was an error loading your dashboard data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base">
            Here's what's happening with your property search.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          <StatCard
            icon={Search}
            label="Saved Searches"
            value={stats.savedSearches}
            href="/dashboard/searches"
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity - 2 columns */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-white">
                Recent Activity
              </h2>
              <Link
                href="/dashboard/history"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {activity.length > 0 ? (
                activity.map((item) => (
                  <ActivityItem key={item.id} activity={item} />
                ))
              ) : (
                <div className="p-12 text-center">
                  <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No recent activity
                  </p>
                  <Link
                    href="/properties"
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium"
                  >
                    Start exploring properties →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - 1 column */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-white">
                Quick Actions
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <QuickActionButton
                href="/properties"
                icon={Building2}
                label="Browse Properties"
                color="emerald"
                primary
              />
              <QuickActionButton
                href="/dashboard/favorites"
                icon={Heart}
                label="View Favorites"
                color="rose"
              />
              <QuickActionButton
                href="/dashboard/searches"
                icon={Search}
                label="Saved Searches"
                color="purple"
              />
              <QuickActionButton
                href="/dashboard/notifications"
                icon={Bell}
                label="Notifications"
                color="amber"
                badge={stats.notifications > 0}
              />
            </div>
          </div>
        </div>

        {/* Favorite Properties */}
        {favorites.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Your Favorites
                </h2>
              </div>
              <Link
                href="/dashboard/favorites"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {favorites.slice(0, 4).map((property) => (
                <PropertyCard key={property?.Id_Bat} property={property} />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Properties */}
        {recommended.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Recommended for You
                </h2>
              </div>
              <Link
                href="/properties"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
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

        {/* Empty State - Show if no favorites and no recommended */}
        {favorites.length === 0 && recommended.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Start Your Property Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Browse our extensive collection of properties to find your
                perfect home or investment.
              </p>
              <Link href="/properties">
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition shadow-lg">
                  Explore Properties
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
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
}: {
  icon: any;
  label: string;
  value: string | number;
  href?: string;
  color: string;
  badge?: boolean;
}) {
  const colorClasses: Record<
    string,
    { bg: string; icon: string; bgDark: string; iconDark: string }
  > = {
    rose: {
      bg: "bg-rose-100",
      icon: "text-rose-600",
      bgDark: "dark:bg-rose-900/30",
      iconDark: "dark:text-rose-400",
    },
    blue: {
      bg: "bg-blue-100",
      icon: "text-blue-600",
      bgDark: "dark:bg-blue-900/30",
      iconDark: "dark:text-blue-400",
    },
    amber: {
      bg: "bg-amber-100",
      icon: "text-amber-600",
      bgDark: "dark:bg-amber-900/30",
      iconDark: "dark:text-amber-400",
    },
    purple: {
      bg: "bg-purple-100",
      icon: "text-purple-600",
      bgDark: "dark:bg-purple-900/30",
      iconDark: "dark:text-purple-400",
    },
  };

  const colors = colorClasses[color] || colorClasses.rose;

  const Content = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition cursor-pointer relative">
      {badge && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 ${colors.bg} ${colors.bgDark} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${colors.icon} ${colors.iconDark}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
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
  badge,
}: {
  href: string;
  icon: any;
  label: string;
  color: string;
  primary?: boolean;
  badge?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 p-3 rounded-xl transition relative ${
          primary
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md"
            : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {badge && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
        <Icon
          className={`w-5 h-5 ${primary ? "text-white" : "text-gray-600 dark:text-gray-400"}`}
        />
        <span
          className={`font-medium text-sm ${
            primary ? "text-white" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}

// Activity Item Component
function ActivityItem({ activity }: { activity: any }) {
  const Icon = activity.icon;

  const typeColors: Record<string, string> = {
    view: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    favorite:
      "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    notification:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };

  const content = (
    <div className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[activity.type]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 dark:text-white truncate">
          {activity.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {activity.time}
        </p>
      </div>
    </div>
  );

  if (activity.link) {
    return <Link href={activity.link}>{content}</Link>;
  }

  return content;
}

// Property Card
function PropertyCard({ property }: { property: any }) {
  const image = property.media?.[0]?.url || "/placeholder-property.jpg";
  const location =
    property.parcelle?.lotissement?.arrondissement?.Nom_Arrond || "Location";
  const propertySlug = property.slug || `batiment-${property.Id_Bat}`;

  return (
    <Link href={`/property/${propertySlug}`}>
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer border border-gray-200 dark:border-gray-600 group">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={image}
            alt={property.title || "Property"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {property.featured && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-semibold text-gray-800 dark:text-white text-sm truncate mb-1">
            {property.title || property.propertyType || "Property"}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
          </div>
          {property.price && (
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {(Number(property.price) / 1000000).toFixed(1)}M XAF
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
