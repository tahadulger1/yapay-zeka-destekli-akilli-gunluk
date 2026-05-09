import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const defaultExport = globalThis;

/** @type {import('@prisma/client').PrismaClient} */
export const prisma =
  defaultExport.prisma ||
  new PrismaClient({
    adapter: new PrismaLibSql({
      url: process.env.DATABASE_URL || "file:./dev.db",
      authToken: process.env.LIBSQL_AUTH_TOKEN,
    }),
  });

if (process.env.NODE_ENV !== "production") defaultExport.prisma = prisma;
