// app/agent/dashboard/page.tsx
import { requireUser } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import {
  Building2,
  Users,
  Eye,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  BarChart3,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Get agent-specific statistics
async function getAgentStats(userId: string) {
  try {
    const [
      totalListings,
      activeListings,
      pendingListings,
      soldListings,
      totalViews,
      totalFavorites,
    ] = await Promise.all([
      // Total listings created by this agent
      prisma.batiment.count({
        where: { createdById: userId },
      }),

      // Active/Published listings
      prisma.batiment.count({
        where: {
          createdById: userId,
          listingStatus: "PUBLISHED",
        },
      }),

      // Pending/Draft listings
      prisma.batiment.count({
        where: {
          createdById: userId,
          listingStatus: "DRAFT",
        },
      }),

      // Sold listings
      prisma.batiment.count({
        where: {
          createdById: userId,
          listingStatus: "SOLD",
        },
      }),

      // Total views across all agent listings
      prisma.batiment.aggregate({
        where: { createdById: userId },
        _sum: { viewCount: true },
      }),

      // Total favorites
      prisma.batiment.aggregate({
        where: { createdById: userId },
        _sum: { favoriteCount: true },
      }),
    ]);

    // Mock data for features not yet in schema (replace with actual queries when available)
    const totalLeads = 23;
    const newLeads = 7;
    const appointments = 8;
    const thisMonthEarnings = 850000;
    const totalEarnings = 3750000;

    // Calculate trends (mock - replace with actual month-over-month comparison)
    const trends = {
      listings: { value: 12, positive: true },
      leads: { value: 8, positive: true },
      views: { value: 15, positive: true },
      revenue: { value: 5, positive: false },
    };

    return {
      totalListings,
      activeListings,
      pendingListings,
      soldListings,
      totalLeads,
      newLeads,
      appointments,
      thisMonthViews: totalViews._sum.viewCount || 0,
      totalFavorites: totalFavorites._sum.favoriteCount || 0,
      thisMonthEarnings,
      totalEarnings,
      trends,
    };
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return null;
  }
}

// Get recent leads (mock data - replace with actual lead system)
async function getRecentLeads() {
  return [
    {
      id: 1,
      name: "Jean Mbarga",
      property: "Villa in Bastos",
      status: "new",
      priority: "high",
      time: "2 hours ago",
      phone: "+237 6XX XXX XXX",
      email: "jean.m@example.com",
      message: "Interested in scheduling a visit this weekend",
    },
    {
      id: 2,
      name: "Marie Nkolo",
      property: "Apartment in Bonapriso",
      status: "contacted",
      priority: "medium",
      time: "5 hours ago",
      phone: "+237 6XX XXX XXX",
      email: "marie.n@example.com",
      message: "Looking for 3-bedroom options",
    },
    {
      id: 3,
      name: "Paul Etame",
      property: "Office Space in Bonanjo",
      status: "qualified",
      priority: "high",
      time: "1 day ago",
      phone: "+237 6XX XXX XXX",
      email: "paul.e@example.com",
      message: "Ready to make an offer",
    },
  ];
}

// Get upcoming appointments (mock data)
async function getUpcomingAppointments() {
  return [
    {
      id: 1,
      clientName: "Sophie Kamdem",
      property: "Duplex in Akwa",
      date: "2026-02-03",
      time: "10:00 AM",
      type: "viewing",
      status: "confirmed",
    },
    {
      id: 2,
      clientName: "Andre Fouda",
      property: "Villa in Bastos",
      date: "2026-02-03",
      time: "2:30 PM",
      type: "negotiation",
      status: "confirmed",
    },
    {
      id: 3,
      clientName: "Grace Tchami",
      property: "Land in Odza",
      date: "2026-02-04",
      time: "11:00 AM",
      type: "viewing",
      status: "pending",
    },
  ];
}

// Get top performing listings
async function getTopListings(userId: string) {
  try {
    const properties = await prisma.batiment.findMany({
      where: { createdById: userId },
      take: 3,
      orderBy: { viewCount: "desc" },
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
        media: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    // Add mock performance data
    return properties.map((property, index) => ({
      ...property,
      inquiries: [23, 18, 12][index] || 5,
      trend: property.viewCount > 100 ? "up" : "down",
    }));
  } catch (error) {
    console.error("Error fetching top listings:", error);
    return [];
  }
}

// Get recent activity
async function getRecentActivity(userId: string) {
  try {
    // Get recent views on agent's listings
    const recentViews = await prisma.view.findMany({
      where: {
        batiment: {
          createdById: userId,
        },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        batiment: {
          select: {
            title: true,
            propertyType: true,
          },
        },
      },
    });

    // Transform to activity format with mock data mixed in
    const activities = [
      {
        id: 1,
        type: "new_lead",
        title: "New inquiry for Villa in Bastos",
        description: "Jean Mbarga requested property details",
        time: "2 hours ago",
        icon: Users,
        color: "blue",
      },
      {
        id: 2,
        type: "appointment",
        title: "Appointment confirmed",
        description: "Viewing scheduled with Sophie Kamdem",
        time: "4 hours ago",
        icon: Calendar,
        color: "green",
      },
      ...recentViews.slice(0, 2).map((view, index) => ({
        id: index + 3,
        type: "view",
        title: `Property view - ${view.batiment?.title || "Property"}`,
        description: `Someone viewed your listing`,
        time: formatTimeAgo(view.createdAt),
        icon: Eye,
        color: "purple",
      })),
    ];

    return activities;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

// Helper function to format time
function formatTimeAgo(date: Date): string {
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

export default async function AgentDashboardPage() {
  const session = await requireUser();
  const user = session.user;

  // Verify user is an agent or admin
  if (user?.role !== "AGENT" && user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [stats, leads, appointments, topListings, activity] = await Promise.all(
    [
      getAgentStats(user?.id || ""),
      getRecentLeads(),
      getUpcomingAppointments(),
      getTopListings(user?.id || ""),
      getRecentActivity(user?.id || ""),
    ],
  );

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Agent Dashboard
              </h1>
              <p className="text-emerald-100 text-sm sm:text-base">
                Welcome back, {user?.name?.split(" ")[0]}! Here's your
                performance overview.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/agent/listings/new">
                <button className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-medium hover:bg-emerald-50 transition flex items-center gap-2 shadow-lg">
                  <Plus className="w-4 h-4" />
                  New Listing
                </button>
              </Link>
              <button className="bg-emerald-700/50 text-white px-4 py-2 rounded-xl font-medium hover:bg-emerald-700 transition flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics - Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            icon={Building2}
            label="Total Listings"
            value={stats.totalListings}
            subValue={`${stats.activeListings} active`}
            trend={stats.trends.listings}
            color="emerald"
            href="/agent/listings"
          />
          <MetricCard
            icon={Users}
            label="Total Leads"
            value={stats.totalLeads}
            subValue={`${stats.newLeads} new this week`}
            trend={stats.trends.leads}
            color="blue"
            href="/agent/leads"
            badge={stats.newLeads > 0}
          />
          <MetricCard
            icon={Eye}
            label="Total Views"
            value={stats.thisMonthViews.toLocaleString()}
            trend={stats.trends.views}
            color="purple"
          />
          <MetricCard
            icon={DollarSign}
            label="Total Earnings"
            value={`${(stats.totalEarnings / 1000000).toFixed(1)}M`}
            subValue={`${(stats.thisMonthEarnings / 1000).toLocaleString()} XAF this month`}
            trend={stats.trends.revenue}
            color="teal"
            href="/agent/earnings"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Appointments"
            value={stats.appointments}
            color="orange"
            href="/agent/appointments"
          />
          <StatCard
            icon={CheckCircle}
            label="Active Listings"
            value={stats.activeListings}
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pendingListings}
            color="amber"
          />
          <StatCard
            icon={BarChart3}
            label="Conversion Rate"
            value="18.5%"
            color="indigo"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Leads - 2 columns */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Recent Leads
                </h2>
                {stats.newLeads > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                    {stats.newLeads} new
                  </span>
                )}
              </div>
              <Link
                href="/agent/leads"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {leads.length > 0 ? (
                leads
                  .slice(0, 4)
                  .map((lead) => <LeadItem key={lead.id} lead={lead} />)
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No recent leads
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments - 1 column */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Appointments
                </h2>
              </div>
              <Link
                href="/agent/appointments"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {appointments.length > 0 ? (
                appointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))
              ) : (
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No upcoming appointments
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Performing Listings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-gray-800 dark:text-white">
                Top Performing Listings
              </h2>
            </div>
            <Link
              href="/agent/listings"
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
            >
              View all listings
            </Link>
          </div>
          <div className="p-4">
            {topListings.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topListings.map((listing) => (
                  <PerformancePropertyCard
                    key={listing.Id_Bat}
                    listing={listing}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No listings yet
                </p>
                <Link
                  href="/agent/listings/new"
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm inline-block"
                >
                  Create your first listing →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {activity.length > 0 ? (
              activity.map((item) => (
                <ActivityItem key={item.id} activity={item} />
              ))
            ) : (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component (with trends)
function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color,
  href,
  badge,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: number; positive: boolean };
  color: string;
  href?: string;
  badge?: boolean;
}) {
  const colorClasses: Record<
    string,
    { bg: string; icon: string; bgDark: string; iconDark: string }
  > = {
    emerald: {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      bgDark: "dark:bg-emerald-900/30",
      iconDark: "dark:text-emerald-400",
    },
    blue: {
      bg: "bg-blue-100",
      icon: "text-blue-600",
      bgDark: "dark:bg-blue-900/30",
      iconDark: "dark:text-blue-400",
    },
    purple: {
      bg: "bg-purple-100",
      icon: "text-purple-600",
      bgDark: "dark:bg-purple-900/30",
      iconDark: "dark:text-purple-400",
    },
    teal: {
      bg: "bg-teal-100",
      icon: "text-teal-600",
      bgDark: "dark:bg-teal-900/30",
      iconDark: "dark:text-teal-400",
    },
  };

  const colors = colorClasses[color] || colorClasses.emerald;

  const Content = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition relative h-full">
      {badge && (
        <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 ${colors.bg} ${colors.bgDark} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${colors.icon} ${colors.iconDark}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              trend.positive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.positive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
        {value}
      </p>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </p>
      {subValue && (
        <p className="text-xs text-gray-500 dark:text-gray-500">{subValue}</p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        <Content />
      </Link>
    );
  }

  return <Content />;
}

// Simple Stat Card
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  href?: string;
}) {
  const colorClasses: Record<
    string,
    { bg: string; icon: string; bgDark: string; iconDark: string }
  > = {
    orange: {
      bg: "bg-orange-100",
      icon: "text-orange-600",
      bgDark: "dark:bg-orange-900/30",
      iconDark: "dark:text-orange-400",
    },
    green: {
      bg: "bg-green-100",
      icon: "text-green-600",
      bgDark: "dark:bg-green-900/30",
      iconDark: "dark:text-green-400",
    },
    amber: {
      bg: "bg-amber-100",
      icon: "text-amber-600",
      bgDark: "dark:bg-amber-900/30",
      iconDark: "dark:text-amber-400",
    },
    indigo: {
      bg: "bg-indigo-100",
      icon: "text-indigo-600",
      bgDark: "dark:bg-indigo-900/30",
      iconDark: "dark:text-indigo-400",
    },
  };

  const colors = colorClasses[color];

  const Content = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
      <div
        className={`w-10 h-10 ${colors.bg} ${colors.bgDark} rounded-lg flex items-center justify-center mb-3`}
      >
        <Icon className={`w-5 h-5 ${colors.icon} ${colors.iconDark}`} />
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

// Lead Item Component
function LeadItem({ lead }: { lead: any }) {
  const statusColors = {
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    contacted:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    qualified:
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  };

  const priorityColors = {
    high: "border-l-red-500 dark:border-l-red-400",
    medium: "border-l-amber-500 dark:border-l-amber-400",
    low: "border-l-gray-300 dark:border-l-gray-600",
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer border-l-4 ${priorityColors[lead.priority as keyof typeof priorityColors]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-800 dark:text-white">
              {lead.name}
            </p>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status as keyof typeof statusColors]}`}
            >
              {lead.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
            {lead.property}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1 mb-2">
            {lead.message}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {lead.phone}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {lead.email}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {lead.time}
          </p>
        </div>
      </div>
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment }: { appointment: any }) {
  const statusColors = {
    confirmed:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    pending:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800",
    cancelled:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  };

  const typeIcons = {
    viewing: Eye,
    negotiation: MessageSquare,
    signing: CheckCircle,
  };

  const Icon =
    typeIcons[appointment.type as keyof typeof typeIcons] || Calendar;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600 transition">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
            {appointment.clientName}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {appointment.property}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(appointment.date).toLocaleDateString()} at{" "}
              {appointment.time}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <span
          className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${statusColors[appointment.status as keyof typeof statusColors]}`}
        >
          {appointment.status}
        </span>
      </div>
    </div>
  );
}

// Performance Property Card
function PerformancePropertyCard({ listing }: { listing: any }) {
  const image = listing.media?.[0]?.url || "/placeholder-property.jpg";
  const location =
    listing.parcelle?.lotissement?.arrondissement?.Nom_Arrond || "Location";
  const propertySlug = listing.slug || `batiment-${listing.Id_Bat}`;

  return (
    <Link href={`/property/${propertySlug}`}>
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg transition border border-gray-200 dark:border-gray-600 group">
        <div className="aspect-video relative">
          <img
            src={image}
            alt={listing.title || "Property"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {listing.trend && (
            <div
              className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ${
                listing.trend === "up"
                  ? "bg-green-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {listing.trend === "up" ? "↑" : "↓"} Trending
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="font-semibold text-gray-800 dark:text-white text-sm truncate mb-1">
            {listing.title || listing.propertyType || "Property"}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
          </div>
          {listing.price && (
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {(Number(listing.price) / 1000000).toFixed(1)}M XAF
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{listing.viewCount} views</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{listing.inquiries} inquiries</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Activity Item Component
function ActivityItem({ activity }: { activity: any }) {
  const Icon = activity.icon;
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    orange:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <div className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[activity.color]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 dark:text-white truncate">
          {activity.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {activity.description}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {activity.time}
        </p>
      </div>
    </div>
  );
}
