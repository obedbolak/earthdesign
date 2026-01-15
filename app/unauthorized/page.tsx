// app/unauthorized/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black p-4">
      <div className="w-full max-w-md text-center space-y-8 backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Access Denied
          </h1>
          <p className="text-gray-400 text-lg">
            You don't have permission to access this page.
          </p>
          <p className="text-gray-500 text-sm">
            This area is restricted to administrators only. If you believe this
            is an error, please contact support.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-all"
          >
            Go Back
          </button>
          <Link
            href="/"
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-all hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center"
          >
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="pt-6 border-t border-white/10">
          <p className="text-gray-500 text-xs">Error Code: 403 - Forbidden</p>
        </div>
      </div>
    </div>
  );
}
