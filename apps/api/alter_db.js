require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await pool.query(`
      ALTER TABLE batteries 
      ADD COLUMN IF NOT EXISTS type TEXT,
      ADD COLUMN IF NOT EXISTS capacity NUMERIC(10,2);
    `);
    console.log('Columns added to batteries table successfully');
  } catch (err) {
    console.error('Error modifying database:', err);
  } finally {
    await pool.end();
  }
}

main();
