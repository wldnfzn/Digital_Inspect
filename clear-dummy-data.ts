import sql from './apps/api/src/lib/db';

async function clearDummyData() {
  try {
    console.log('Starting data clearance...');
    
    // Clear in correct order due to foreign keys, or use CASCADE
    // Truncate will remove all data and reset sequences if applicable
    await sql`TRUNCATE TABLE 
      forklift_inspection_scores,
      forklift_inspections,
      battery_service_reports,
      inspection_tasks,
      forklifts,
      batteries,
      customers
      CASCADE
    `;

    console.log('Successfully cleared dummy assets, customers, and inspections.');
  } catch (err) {
    console.error('Error clearing data:', err);
  } finally {
    process.exit(0);
  }
}

clearDummyData();
