import postgres from 'postgres';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is missing!");
}

const sql = postgres(dbUrl, {
  max: 10,
  idle_timeout: 0, // Supabase recommends lower idle timeouts or 0 for serverless
  connect_timeout: 10,
  ssl: 'require' // Supabase requires SSL
});

export default sql;
