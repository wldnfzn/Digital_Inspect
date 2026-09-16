const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://digital_inspect_owner:EaC3nQ5LkxBf@ep-curly-recipe-a1m4d6s2.ap-southeast-1.aws.neon.tech/digital_inspect?sslmode=require');
async function run() {
  const res = await sql(process.argv[2]);
  console.log(res);
}
run();
