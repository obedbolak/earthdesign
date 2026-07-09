import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pgPool: Pool;
};

// Create pool singleton
if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new Pool({
    connectionString,
    max: process.env.NODE_ENV === "development" ? 5 : 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

const adapter = new PrismaPg(globalForPrisma.pgPool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
