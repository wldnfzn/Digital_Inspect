import sql from './apps/api/src/lib/db';  
sql.unsafe('ALTER TABLE forklifts ADD COLUMN IF NOT EXISTS year TEXT').then(()=>process.exit(0));  
