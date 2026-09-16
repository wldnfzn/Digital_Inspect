import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/digital_inspect'
});

async function run() {
  const res = await pool.query("SELECT full_report_data FROM battery_service_reports WHERE full_report_data->>'service_report_no' = 'SR-BT-260912-001'");
  console.log(JSON.stringify(res.rows[0], null, 2));
  process.exit();
}
run();
