/**
 * Apply versioned SQL migrations from packages/database/migrations.
 * Brand-new durable ledger schema (M007).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createSql } from "./client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "migrations");

export async function migrate(connectionString?: string): Promise<string[]> {
  const sql = createSql({ connectionString, max: 1 });
  const applied: string[] = [];
  try {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const rows = await sql<{ version: string }[]>`SELECT version FROM schema_migrations`;
    const done = new Set(rows.map((r) => r.version));

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (done.has(file)) continue;
      const body = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      await sql.begin(async (tx) => {
        await tx.unsafe(body);
        await tx`INSERT INTO schema_migrations (version) VALUES (${file}) ON CONFLICT DO NOTHING`;
      });
      applied.push(file);
      console.log(`applied ${file}`);
    }
    if (applied.length === 0) console.log("no new migrations");
    return applied;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

const thisFile = fileURLToPath(import.meta.url);
const invoked = process.argv[1] && (
  process.argv[1] === thisFile ||
  process.argv[1].endsWith("/migrate.ts") ||
  process.argv[1].endsWith("/migrate.js")
);
if (invoked) {
  migrate(process.env.DATABASE_URL).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
