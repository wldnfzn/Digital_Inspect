import sql from './apps/api/src/lib/db';

async function addJsonColumn() {
  try {
    await sql`ALTER TABLE battery_service_reports ADD COLUMN full_report_data JSONB`;
    console.log('Added full_report_data column to battery_service_reports');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

addJsonColumn();
sql`ALTER TABLE forklift_inspections ADD COLUMN IF NOT EXISTS additional_data JSONB`.then(() => process.exit(0));
