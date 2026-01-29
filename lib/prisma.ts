import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

// Configuration for the PG Pool
const poolConfig = {
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: true,
          ca: process.env.DDATABASE_CA_CERT, // We will set this in Vercel
        }
      : false, // In local dev, you usually don't need SSL unless specified
};

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
