import { Pool } from 'pg';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is missing!");
}

const pool = new Pool({
  connectionString: dbUrl,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false }
});

export default async function sql(strings: TemplateStringsArray, ...values: any[]) {
  let query = strings[0];
  for (let i = 1; i < strings.length; i++) {
    query += `$${i}` + strings[i];
  }
  const result = await pool.query(query, values);
  return result.rows;
}
