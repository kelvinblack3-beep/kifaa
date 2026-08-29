import postgres from "postgres";

export type Sql = ReturnType<typeof postgres>;

export interface DatabaseOptions {
  connectionString?: string;
  max?: number;
}

/**
 * Create a postgres.js connection pool.
 * Call sql.end() when shutting down.
 */
export function createSql(opts: DatabaseOptions = {}): Sql {
  const url =
    opts.connectionString ??
    process.env.DATABASE_URL ??
    "postgres://kifaa:kifaa@127.0.0.1:5432/kifaa";
  return postgres(url, {
    max: opts.max ?? 10,
  });
}

export async function withTransaction<T>(
  sql: Sql,
  fn: (tx: Sql) => Promise<T>
): Promise<T> {
  return sql.begin(async (tx) => fn(tx as unknown as Sql)) as Promise<T>;
}
