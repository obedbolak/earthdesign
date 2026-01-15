// lib/auth-helpers.ts
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session (server-side)
 * Returns session or null if not authenticated
 */
export async function getSession() {
  return await auth();
}

/**
 * Require authentication for a page
 * Redirects to sign in if not authenticated
 */
export async function requireAuth() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return session;
}

/**
 * Require admin role for a page
 * Redirects to unauthorized if not admin
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

/**
 * Get current user
 */

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  // Allow USER, AGENT, OWNER - but not redirect admins (they can access if needed)
  return session;
}

export async function requireAgent() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return session;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}
