import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth-helpers";

export const metadata = {
  title: "EarthDesign Admin CMS",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  );
}
