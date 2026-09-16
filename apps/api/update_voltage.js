require('dotenv').config({ path: 'apps/api/.env' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`UPDATE batteries SET voltage = '24' WHERE asset_code = 'BT-0001'`;
  console.log('done');
}
run();
