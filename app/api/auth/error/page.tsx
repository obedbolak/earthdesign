"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();

  // Common Auth.js error codes & friendly messages
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    CredentialsSignin: "Invalid email or password. Please try again.",
    Configuration:
      "There's a problem with our authentication setup. Please contact support.",
    AccessDenied: "You don't have permission to access this page.",
    OAuthSignin: "Failed to sign in with the provider. Try another method.",
    OAuthCallback: "Something went wrong during authentication callback.",
    OAuthCreateAccount: "Could not create account with this provider.",
    EmailCreateAccount: "Could not create account with this email.",
    Callback: "Authentication callback failed.",
    OAuthAccountNotLinked: "This email is already linked to another account.",
    EmailSignin: "Failed to send email.",
    default: "An unexpected authentication error occurred. Please try again.",
  };

  const message = error
    ? errorMessages[error] || errorMessages.default
    : errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black p-4">
      <div className="w-full max-w-lg backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-10 shadow-2xl text-center">
        {/* Error Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Authentication Error
        </h1>

        {/* Message */}
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">{message}</p>

        {/* Help text */}
        <p className="text-gray-400 mb-10">
          This can happen due to invalid credentials, network issues, or a
          temporary problem. Please try again or contact support if the issue
          persists.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Login
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="h-5 w-5" />
            Return to Home
          </Link>
        </div>

        {/* Error code (for debugging) */}
        {error && (
          <div className="mt-10 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500">
              Error code:{" "}
              <span className="font-mono text-red-400">{error}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
