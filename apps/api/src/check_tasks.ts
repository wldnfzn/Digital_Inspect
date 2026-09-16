import sql from './lib/db';
async function clearAndRecalc() {
  await sql`DELETE FROM forklift_inspection_scores`;
  await sql`DELETE FROM forklift_inspections`;
  await sql`DELETE FROM battery_service_reports`;
  
  await sql`UPDATE forklifts SET health_score = 0, health_status = 'HEALTHY'`;
  await sql`UPDATE batteries SET voltage = 0, status = 'STANDBY'`;
  
  console.log('All reports deleted and assets reset to 0');
  process.exit(0);
}
clearAndRecalc();
