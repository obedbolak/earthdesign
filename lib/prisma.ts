import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pgPool: Pool;
};

// Decode CA cert from base64 env var
const caCert = process.env.DATABASE_CA_CERT
  ? Buffer.from(process.env.DATABASE_CA_CERT, "base64").toString("utf-8")
  : undefined;

// Singleton pattern for the PG Pool with proper SSL
if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new Pool({
    connectionString,
    max: process.env.NODE_ENV === "development" ? 5 : 20,
    ssl: caCert
      ? {
          ca: caCert,
          rejectUnauthorized: true, // Verify the certificate (secure)
        }
      : false, // Local dev without SSL
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
