import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis;
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const isRemoteLibSql = databaseUrl.startsWith("libsql://");

function createPrismaClient() {
  if (isRemoteLibSql && !process.env.LIBSQL_AUTH_TOKEN) {
    throw new Error("LIBSQL_AUTH_TOKEN is required when DATABASE_URL uses libsql://");
  }

  return new PrismaClient({
    adapter: new PrismaLibSql({
      url: databaseUrl,
      authToken: isRemoteLibSql ? process.env.LIBSQL_AUTH_TOKEN : undefined,
    }),
  });
}

/** @type {import('@prisma/client').PrismaClient} */
export const prisma =
  globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
