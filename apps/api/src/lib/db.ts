import postgres from 'postgres';

// Use environment variables in production, fallback to local docker for dev
const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:password123@localhost:5432/digital_inspect';

// Set up the postgres client
const sql = postgres(dbUrl, {
  max: 10,             // Max number of connections
  idle_timeout: 20,    // Idle connection timeout in seconds
  connect_timeout: 10, // Connect timeout in seconds
});

export default sql;
