import sql from './apps/api/src/lib/db';  
sql.unsafe('ALTER TABLE forklift_inspections ADD COLUMN IF NOT EXISTS additional_data JSONB').then(()=>process.exit(0));  
