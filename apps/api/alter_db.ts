import sql from './src/lib/db';

async function main() {
  try {
    await sql`
      ALTER TABLE batteries 
      ADD COLUMN IF NOT EXISTS type TEXT,
      ADD COLUMN IF NOT EXISTS capacity NUMERIC(10,2);
    `;
    console.log('Columns added to batteries table successfully');
  } catch (err) {
    console.error('Error modifying database:', err);
  } finally {
    process.exit(0);
  }
}

main();
