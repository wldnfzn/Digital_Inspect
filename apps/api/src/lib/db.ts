import postgres from 'postgres';

const dbUrl = 'postgresql://digital_inspect_owner:EaC3nQ5LkxBf@ep-curly-recipe-a1m4d6s2.ap-southeast-1.aws.neon.tech/digital_inspect?sslmode=require';

// Set up the postgres client
const sql = postgres(dbUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require'
});

export default sql;
