import postgres from 'postgres';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is missing!");
}

// Set up the postgres client
const sql = postgres(dbUrl, {
  max: 10,             // Max number of connections
  idle_timeout: 20,    // Idle connection timeout in seconds
  connect_timeout: 10, // Connect timeout in seconds
});

export default sql;
