import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  founderBoxPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.founderBoxPrisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG_QUERIES === "true" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.founderBoxPrisma = prisma;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
