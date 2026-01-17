// app/admin/dashboard/admin-dashboard-client.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Database,
  Trash2,
  LogOut,
  Image as ImageIcon,
  Video,
} from "lucide-react";

export default function AdminDashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
