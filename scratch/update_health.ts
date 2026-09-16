import fs from 'fs';
let reportsFile = fs.readFileSync('apps/api/src/routes/reports.routes.ts', 'utf8');

const regex = /await sql\`DELETE FROM forklift_inspections WHERE id = \$\{id\}\`;/;
const replacement = `await sql\`DELETE FROM forklift_inspections WHERE id = \$\{id\}\`;
      
      // Recalculate Forklift Health
      if (report.length > 0) {
        const flId = await sql\`SELECT forklift_id FROM inspection_tasks WHERE id = \$\{report[0].task_id\}\`;
        if (flId.length > 0) {
          const latestReport = await sql\`
            SELECT health_percentage, health_status 
            FROM forklift_inspections 
            WHERE forklift_id = \$\{flId[0].forklift_id\} 
            ORDER BY completed_at DESC LIMIT 1
          \`;
          
          if (latestReport.length > 0) {
            await sql\`UPDATE forklifts SET health_score = \$\{latestReport[0].health_percentage\}, health_status = \$\{latestReport[0].health_status\} WHERE id = \$\{flId[0].forklift_id\}\`;
          } else {
            await sql\`UPDATE forklifts SET health_score = 0, health_status = 'HEALTHY' WHERE id = \$\{flId[0].forklift_id\}\`;
          }
        }
      }`;

reportsFile = reportsFile.replace(regex, replacement);
fs.writeFileSync('apps/api/src/routes/reports.routes.ts', reportsFile);

let inspectionsFile = fs.readFileSync('apps/api/src/routes/inspections.routes.ts', 'utf8');

const insRegex = /await sql\`DELETE FROM forklift_inspections WHERE id = \$\{flReport\[0\]\.id\}\`;/;
const insReplacement = `await sql\`DELETE FROM forklift_inspections WHERE id = \$\{flReport[0].id\}\`;
      
      // Recalculate Forklift Health
      const taskFl = await sql\`SELECT forklift_id FROM inspection_tasks WHERE id = \$\{id\}\`;
      if (taskFl.length > 0 && taskFl[0].forklift_id) {
         const latestReport = await sql\`
            SELECT health_percentage, health_status 
            FROM forklift_inspections 
            WHERE forklift_id = \$\{taskFl[0].forklift_id\} 
            ORDER BY completed_at DESC LIMIT 1
          \`;
          
          if (latestReport.length > 0) {
            await sql\`UPDATE forklifts SET health_score = \$\{latestReport[0].health_percentage\}, health_status = \$\{latestReport[0].health_status\} WHERE id = \$\{taskFl[0].forklift_id\}\`;
          } else {
            await sql\`UPDATE forklifts SET health_score = 0, health_status = 'HEALTHY' WHERE id = \$\{taskFl[0].forklift_id\}\`;
          }
      }`;

inspectionsFile = inspectionsFile.replace(insRegex, insReplacement);
fs.writeFileSync('apps/api/src/routes/inspections.routes.ts', inspectionsFile);
console.log('Update Health Logic Complete');
