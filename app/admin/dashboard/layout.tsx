// app/admin/dashboard/layout.tsx
import { requireAdmin } from "@/lib/auth-helpers";
import AdminDashboardClient from "./admin-dashboard-client";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  await requireAdmin();

  return <AdminDashboardClient>{children}</AdminDashboardClient>;
}
