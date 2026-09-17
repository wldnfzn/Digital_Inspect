import { Pool } from 'pg';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is missing!');
}

const pool = new Pool({
  connectionString: dbUrl,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false }
});

const sql = async function(strings: TemplateStringsArray, ...values: any[]) {
  let query = strings[0];
  for (let i = 1; i < strings.length; i++) {
    query += '$' + i + strings[i];
  }
  const result = await pool.query(query, values);
  return result.rows;
} as any;

sql.json = (obj: any) => JSON.stringify(obj);

sql.begin = async (callback: any) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tx = async (strings: TemplateStringsArray, ...values: any[]) => {
      let query = strings[0];
      for (let i = 1; i < strings.length; i++) {
        query += '$' + i + strings[i];
      }
      const result = await client.query(query, values);
      return result.rows;
    };
    const result = await callback(tx);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export default sql;
