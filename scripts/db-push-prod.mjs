import { spawnSync } from "node:child_process";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.DATABASE_URL;
const authToken = process.env.LIBSQL_AUTH_TOKEN;

if (!databaseUrl?.startsWith("libsql://")) {
  console.error("db:push:prod requires DATABASE_URL to be set to a libsql:// Turso URL.");
  process.exit(1);
}

if (!authToken) {
  console.error("db:push:prod requires LIBSQL_AUTH_TOKEN.");
  process.exit(1);
}

const diff = spawnSync(
  process.execPath,
  [
    "node_modules/prisma/build/index.js",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema",
    "prisma/schema.prisma",
    "--script",
  ],
  {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  },
);

if (diff.error) {
  console.error("Failed to run Prisma schema diff.");
  console.error(diff.error.message);
  process.exit(1);
}

if (diff.status !== 0) {
  writeIfPresent(process.stderr, diff.stderr);
  writeIfPresent(process.stderr, diff.stdout);
  process.exit(diff.status || 1);
}

writeIfPresent(process.stderr, diff.stderr);

if (typeof diff.stdout !== "string") {
  console.error("Prisma schema diff did not return SQL output.");
  process.exit(1);
}

const statements = splitSqlStatements(diff.stdout);

if (statements.length === 0) {
  console.log("No SQL statements generated.");
  process.exit(0);
}

const client = createClient({
  url: databaseUrl,
  authToken,
});

try {
  for (const statement of statements) {
    await client.execute(statement);
  }

  console.log(`Applied ${statements.length} SQL statements to Turso/libSQL.`);
} catch (error) {
  console.error("Failed to apply production schema to Turso/libSQL.");
  console.error(error);
  process.exit(1);
} finally {
  client.close();
}

function splitSqlStatements(sql) {
  const statements = [];
  let current = "";
  let quote = null;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        current += char;
      }
      continue;
    }

    if (!quote && char === "-" && next === "-") {
      inLineComment = true;
      i += 1;
      continue;
    }

    current += char;

    if ((char === "'" || char === '"') && sql[i - 1] !== "\\") {
      quote = quote === char ? null : quote || char;
      continue;
    }

    if (!quote && char === ";") {
      const statement = current.trim();
      if (statement) {
        statements.push(statement);
      }
      current = "";
    }
  }

  const finalStatement = current.trim();
  if (finalStatement) {
    statements.push(finalStatement);
  }

  return statements;
}

function writeIfPresent(stream, chunk) {
  if (typeof chunk === "string" && chunk.length > 0) {
    stream.write(chunk);
  }
}
