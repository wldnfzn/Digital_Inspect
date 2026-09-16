const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://digital_inspect_owner:EaC3nQ5LkxBf@ep-curly-recipe-a1m4d6s2.ap-southeast-1.aws.neon.tech/digital_inspect?sslmode=require');

async function run() {
  await sql`UPDATE batteries SET voltage = '24' WHERE asset_code = 'BT-0001'`;
  console.log('done');
}
run();
