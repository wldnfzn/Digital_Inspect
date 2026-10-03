require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  const forklifts = await pool.query('SELECT id FROM forklifts');
  for (let row of forklifts.rows) {
    const id = row.id;
    const latest = await pool.query('SELECT health_percentage, health_status FROM forklift_inspections WHERE forklift_id = $1 ORDER BY completed_at DESC LIMIT 1', [id]);
    if (latest.rows.length > 0) {
      await pool.query('UPDATE forklifts SET health_score = $1, health_status = $2 WHERE id = $3', [latest.rows[0].health_percentage, latest.rows[0].health_status, id]);
    } else {
      await pool.query('UPDATE forklifts SET health_score = 0, health_status = \'HEALTHY\' WHERE id = $1', [id]);
    }
  }
  console.log('done forklifts');
  
  const batteries = await pool.query('SELECT id FROM batteries');
  for (let row of batteries.rows) {
    const id = row.id;
    const latest = await pool.query('SELECT voltage_reading FROM battery_service_reports WHERE battery_id = $1 ORDER BY completed_at DESC LIMIT 1', [id]);
    if (latest.rows.length > 0) {
      await pool.query('UPDATE batteries SET voltage = $1 WHERE id = $2', [latest.rows[0].voltage_reading, id]);
    } else {
      await pool.query('UPDATE batteries SET voltage = NULL WHERE id = $1', [id]);
    }
  }
  console.log('done batteries');
  process.exit(0);
}
fix();
