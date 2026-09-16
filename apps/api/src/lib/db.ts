import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://digital_inspect_owner:EaC3nQ5LkxBf@ep-curly-recipe-a1m4d6s2.ap-southeast-1.aws.neon.tech/digital_inspect?sslmode=require';

const sql = neon(dbUrl);

export default sql;
