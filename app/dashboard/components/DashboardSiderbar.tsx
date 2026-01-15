// app/dashboard/components/DashboardSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Heart,
  Clock,
  Bell,
  Settings,
  User,
  Building2,
  BarChart3,
  Users,
  FileText,
  Plus,
  MessageSquare,
  Calendar,
  DollarSign,
  MapPin,
  ChevronDown,
  X,
  Menu,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface DashboardSidebarProps {
  user: User;
}

// Navigation items based on role
const getNavItems = (role: string) => {
  const baseItems = [
    {
      id: "overview",
      label: "Overview",
      href: "/dashboard",
      icon: Home,
      description: "Dashboard home",
    },
    {
      id: "favorites",
      label: "My Favorites",
      href: "/dashboard/favorites",
      icon: Heart,
      description: "Saved properties",
    },
    {
      id: "history",
      label: "Recent Views",
      href: "/dashboard/history",
      icon: Clock,
      description: "Browsing history",
    },
    {
      id: "notifications",
      label: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      description: "Alerts & updates",
      badge: 3, // Dynamic badge count
    },
    {
      id: "messages",
      label: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      description: "Your conversations",
      badge: 2,
    },
  ];

  const agentItems = [
    {
      id: "divider-1",
      type: "divider",
      label: "Agent Tools",
    },
    {
      id: "my-listings",
      label: "My Listings",
      href: "/dashboard/listings",
      icon: Building2,
      description: "Manage your properties",
    },
    {
      id: "add-listing",
      label: "Add Property",
      href: "/dashboard/listings/new",
      icon: Plus,
      description: "Create new listing",
    },
    {
      id: "analytics",
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      description: "Performance stats",
    },
    {
      id: "leads",
      label: "Leads",
      href: "/dashboard/leads",
      icon: Users,
      description: "Potential clients",
      badge: 5,
    },
    {
      id: "appointments",
      label: "Appointments",
      href: "/dashboard/appointments",
      icon: Calendar,
      description: "Scheduled viewings",
    },
    {
      id: "earnings",
      label: "Earnings",
      href: "/dashboard/earnings",
      icon: DollarSign,
      description: "Commission & payments",
    },
  ];

  const settingsItems = [
    {
      id: "divider-2",
      type: "divider",
      label: "Account",
    },
    {
      id: "profile",
      label: "Profile",
      href: "/dashboard/profile",
      icon: User,
      description: "Edit your info",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      description: "Preferences",
    },
  ];

  if (role === "AGENT") {
    return [...baseItems, ...agentItems, ...settingsItems];
  }

  return [...baseItems, ...settingsItems];
};

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = getNavItems(user.role || "USER");
  const isAgent = user.role === "AGENT";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  const getUserInitials = () => {
    if (!user.name) return "U";
    const names = user.name.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const SidebarContent = () => (
    <>
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center overflow-hidden">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {getUserInitials()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.name || "User"}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isAgent
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-teal-100 text-teal-700"
                }`}
              >
                {user.role || "USER"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          if (item.label) {
            return (
              <div key={item.id} className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href!}
              onClick={() => setIsMobileOpen(false)}
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-teal-50 text-teal-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-teal-100" : "bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-teal-600" : "text-gray-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm ${
                      isActive ? "text-teal-700" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
                {item.id && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.label}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-medium"
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Sign Out
            </>
          )}
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-700 transition"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-gray-200">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/50"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-bold text-lg text-gray-800">Menu</h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
