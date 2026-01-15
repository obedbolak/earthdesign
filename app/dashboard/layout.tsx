// app/dashboard/layout.tsx
import { requireUser } from "@/lib/auth-helpers";
import DashboardSidebar from "./components/DashboardSiderbar";
import DashboardHeader from "./components/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <DashboardHeader user={session.user} />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar user={session.user} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
