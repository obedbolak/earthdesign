// app/admin/dashboard/page.tsx
"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  Database,
  Trash2,
  Image as ImageIcon,
  Video,
  Menu,
  X,
  LogOut,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Component imports
import Overview from "./components/Overview";
import DataManagement from "./components/DataManagement";
import UploadExcel from "./components/UploadExcel";
import UploadImages from "./components/UploadImages";
import UploadVideo from "./components/UploadVideo";
import UserManagement from "./components/UserManagement";
import { useAuth } from "@/lib/hooks/useAuth";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";

type TabKey =
  | "overview"
  | "data"
  | "upload"
  | "images"
  | "video"
  | "users"
  | "clear";

const tabs = [
  { key: "overview" as TabKey, icon: LayoutDashboard, label: "Overview" },
  { key: "data" as TabKey, icon: Database, label: "Manage Data" },
  { key: "upload" as TabKey, icon: Upload, label: "Upload Excel" },
  { key: "images" as TabKey, icon: ImageIcon, label: "Upload Images" },
  { key: "video" as TabKey, icon: Video, label: "Upload Video" },
  { key: "users" as TabKey, icon: Users, label: "Manage Users" },
  { key: "clear" as TabKey, icon: Trash2, label: "Clear Data" },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            onTabChange={(tab: unknown) => setActiveTab(tab as TabKey)}
          />
        );
      case "data":
        return <DataManagement />;
      case "upload":
        return (
          <UploadExcel
            onTabChange={(tab: unknown) => setActiveTab(tab as TabKey)}
          />
        );
      case "images":
        return <UploadImages />;
      case "video":
        return <UploadVideo />;
      case "users":
        return <UserManagement />;
      default:
        return (
          <Overview
            onTabChange={(tab: unknown) => setActiveTab(tab as TabKey)}
          />
        );
    }
  };

  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    const names = user.name.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button - Fixed top-left */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Always Fixed */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{
                background: user?.image
                  ? "transparent"
                  : `linear-gradient(135deg, ${COLORS.primary[500]} 0%, ${COLORS.emerald[500]} 100%)`,
                border: `2px solid ${COLORS.primary[400]}60`,
              }}
            >
              {user?.image ? (
                <img
                  src={user?.image}
                  alt={user?.name || "User Avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <span className="font-bold text-base text-white">
                  {getUserInitials()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-teal-800">Earth Design</h1>
              <p className="text-sm text-gray-500">Panel CMS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition w-full text-left",
                activeTab === tab.key
                  ? "bg-teal-100 text-teal-800 font-semibold"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Back to Home */}
        <div className="p-4 border-t">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Back to Home</span>
          </a>
        </div>
      </aside>

      {/* Main Content - With left margin on desktop to account for fixed sidebar */}
      <main className="min-h-screen lg:ml-64 pt-16 lg:pt-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 bg-white border-b border-gray-200 px-4 py-4 shadow-sm z-20">
          <h2 className="text-lg font-semibold text-gray-900 ml-12">
            {tabs.find((tab) => tab.key === activeTab)?.label}
          </h2>
        </div>

        {/* Content Area */}
        <div className="min-h-screen">{renderContent()}</div>
      </main>
    </div>
  );
}
