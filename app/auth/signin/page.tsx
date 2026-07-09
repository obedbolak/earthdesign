"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Step = "signin" | "forgot-password" | "verify-reset" | "new-password";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Redirect if already signed in
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("signin");
  const [successMessage, setSuccessMessage] = useState("");

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP input when step changes to verify
  useEffect(() => {
    if (step === "verify-reset") {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-green-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render page content if authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

  // Handle sign in
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset code");
        return;
      }

      setStep("verify-reset");
      setResendCooldown(60);
      setSuccessMessage("Reset code sent to your email");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every((digit) => digit !== "")) {
      handleVerifyResetOtp(newOtp.join(""));
    }
  };

  // Handle backspace in OTP input
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    if (pastedData.length === 6) {
      handleVerifyResetOtp(pastedData);
    }
  };

  // Verify reset OTP
  const handleVerifyResetOtp = async (code: string) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code");
        setOtp(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
        return;
      }

      setStep("new-password");
      setSuccessMessage("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      // Auto sign in with new password
      const result = await signIn("credentials", {
        email,
        password: newPassword,
        redirect: false,
      });

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setStep("signin");
        setSuccessMessage("Password reset successful. Please sign in.");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Resend reset OTP
  const handleResendResetOtp = async () => {
    if (resendCooldown > 0) return;

    setError("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "PASSWORD_RESET" }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(data.error);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to resend code");
        return;
      }

      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      setSuccessMessage("Code resent successfully");
    } catch {
      setError("Failed to resend code");
    }
  };

  // Reset form
  const handleBackToSignIn = () => {
    setStep("signin");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccessMessage("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black p-4">
      <div className="w-full max-w-md space-y-8 backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Earth<span className="text-green-500">Design</span>
          </h1>
          <p className="mt-2 text-gray-400">
            {step === "signin" && "Sign in to your account"}
            {step === "forgot-password" && "Reset your password"}
            {step === "verify-reset" && "Verify reset code"}
            {step === "new-password" && "Create new password"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-center text-sm">
            {successMessage}
          </div>
        )}

        {/* Sign In Form */}
        {step === "signin" && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setStep("forgot-password")}
                className="text-sm text-green-400 hover:text-green-300 transition"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium transition-all ${
                loading
                  ? "bg-green-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/25"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-green-400 hover:text-green-300 font-medium transition"
              >
                Register
              </Link>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {step === "forgot-password" && (
          <form onSubmit={handleForgotPassword} className="mt-8 space-y-6">
            <div className="text-center text-sm text-gray-400">
              Enter your email address and we'll send you a code to reset your
              password.
            </div>

            <div>
              <label
                htmlFor="reset-email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium transition-all ${
                loading
                  ? "bg-green-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/25"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Code"
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToSignIn}
              className="w-full text-gray-400 hover:text-white text-sm transition"
            >
              ← Back to sign in
            </button>
          </form>
        )}

        {/* Verify Reset OTP */}
        {step === "verify-reset" && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <p className="text-gray-400">We sent a 6-digit code to</p>
              <p className="text-green-400 font-medium mt-1">{email}</p>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  disabled={loading}
                  className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold border-2 border-white/20 rounded-lg bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:opacity-50"
                />
              ))}
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResendResetOtp}
                  disabled={resendCooldown > 0 || loading}
                  className={`font-medium transition ${
                    resendCooldown > 0 || loading
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-green-400 hover:text-green-300"
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend"}
                </button>
              </p>
            </div>

            <button
              onClick={handleBackToSignIn}
              disabled={loading}
              className="w-full text-gray-400 hover:text-white text-sm transition disabled:opacity-50"
            >
              ← Back to sign in
            </button>
          </div>
        )}

        {/* New Password Form */}
        {step === "new-password" && (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium transition-all ${
                loading
                  ? "bg-green-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/25"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToSignIn}
              disabled={loading}
              className="w-full text-gray-400 hover:text-white text-sm transition disabled:opacity-50"
            >
              ← Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
