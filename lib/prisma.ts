// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Create a single PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

// Configure SSL for the connection pool
let sslConfig: any = false;

// Check if we have a base64 encoded certificate
if (process.env.DATABASE_CA_CERT) {
  try {
    // Decode the base64 certificate
    const caCert = Buffer.from(process.env.DATABASE_CA_CERT, "base64").toString(
      "utf-8",
    );

    sslConfig = {
      rejectUnauthorized: true,
      ca: caCert,
    };

    console.log("✅ SSL certificate loaded from environment variable");
  } catch (error) {
    console.error("❌ Failed to decode DATABASE_CA_CERT:", error);
    // Fallback to reject unauthorized false
    sslConfig = {
      rejectUnauthorized: false,
    };
  }
} else if (process.env.VERCEL || process.env.NODE_ENV === "production") {
  // In production without cert, use default SSL
  console.warn("⚠️ DATABASE_CA_CERT not found, using default SSL");
  sslConfig = {
    rejectUnauthorized: false, // More permissive for compatibility
  };
} else {
  // In development, allow connections without strict SSL
  console.log("🔧 Development mode: SSL verification disabled");
  sslConfig = {
    rejectUnauthorized: false,
  };
}

// Create pool with SSL configuration
const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  // Connection pool settings (optimized for Vercel serverless)
  max: process.env.VERCEL ? 1 : 10, // 1 connection per serverless function, 10 for local dev
  idleTimeoutMillis: 60000, // Close idle connections after 60 seconds
  connectionTimeoutMillis: 10000, // Timeout after 10 seconds if can't connect
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

// Log successful connection (useful for debugging)
pool.on("connect", () => {
  console.log("✅ PostgreSQL pool connection established");
});

// Use PrismaPg adapter for connection pooling (recommended in production)
const adapter = new PrismaPg(pool);

// Singleton pattern to avoid multiple PrismaClient instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Optional: useful logging in development
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

// In development mode (hot reloading), store the instance globally to prevent warnings
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
