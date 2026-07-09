// app/dashboard/components/DashboardHeader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Search,
  ChevronDown,
  Home,
  Settings,
  LogOut,
  User,
  ExternalLink,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getUserInitials = () => {
    if (!user.name) return "U";
    const names = user.name.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const notifications = [
    {
      id: 1,
      title: "New property match",
      message: "A villa in Bastos matches your preferences",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Price drop alert",
      message: "Property you saved dropped by 10%",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Viewing confirmed",
      message: "Your viewing for tomorrow is confirmed",
      time: "2 hours ago",
      unread: false,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <span className="hidden sm:block font-bold text-gray-800">
              Dashboard
            </span>
          </Link>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties, messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-teal-300 transition"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Visit Site Link */}
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-teal-600 transition"
            >
              <Home className="w-4 h-4" />
              <span>Visit Site</span>
              <ExternalLink className="w-3 h-3" />
            </motion.button>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </motion.button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                          notif.unread ? "bg-teal-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notif.unread && (
                            <div className="w-2 h-2 mt-2 bg-teal-500 rounded-full flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800">
                              {notif.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notif.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="block p-3 text-center text-sm font-medium text-teal-600 hover:bg-gray-50"
                  >
                    View all notifications
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {getUserInitials()}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                {user.name?.split(" ")[0]}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Settings</span>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
