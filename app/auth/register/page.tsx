// app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // ← Add this import

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Step 2: Sign in using next-auth's signIn function
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please log in manually.");
        setTimeout(() => router.push("/auth/signin"), 2000);
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white/10 backdrop-blur rounded-xl border border-white/20">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        Register
      </h1>

      {error && <p className="text-red-400 text-center mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Full Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 bg-white/5 border border-white/30 rounded-lg text-white placeholder:text-gray-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 bg-white/5 border border-white/30 rounded-lg text-white placeholder:text-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 bg-white/5 border border-white/30 rounded-lg text-white placeholder:text-gray-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold rounded-lg transition"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
