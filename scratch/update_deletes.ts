import fs from 'fs';

// 1. Update inspections.routes.ts
let inspectionsFile = fs.readFileSync('apps/api/src/routes/inspections.routes.ts', 'utf8');

const taskDeleteRegex = /inspectionsRoutes\.delete\('\/tasks\/:id'[\s\S]*?\}\);/;
const newTaskDelete = `inspectionsRoutes.delete('/tasks/:id', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { id } = c.req.param();
    
    // Check if this task has an associated forklift report
    const flReport = await sql\`SELECT id FROM forklift_inspections WHERE task_id = \${id}\`;
    if (flReport.length > 0) {
      await sql\`DELETE FROM forklift_inspection_scores WHERE inspection_id = \${flReport[0].id}\`;
      await sql\`DELETE FROM forklift_inspections WHERE id = \${flReport[0].id}\`;
    }

    // Check if this task has an associated battery report
    const batReport = await sql\`SELECT id FROM battery_service_reports WHERE task_id = \${id}\`;
    if (batReport.length > 0) {
      await sql\`DELETE FROM battery_service_reports WHERE id = \${batReport[0].id}\`;
    }

    // Now delete the task
    await sql\`DELETE FROM inspection_tasks WHERE id = \${id}\`;
    
    return c.json({ message: 'Task and associated reports deleted successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});`;

inspectionsFile = inspectionsFile.replace(taskDeleteRegex, newTaskDelete);
fs.writeFileSync('apps/api/src/routes/inspections.routes.ts', inspectionsFile);


// 2. Update reports.routes.ts
let reportsFile = fs.readFileSync('apps/api/src/routes/reports.routes.ts', 'utf8');

const reportsDeleteRegex = /reportsRoutes\.delete\('\/:type\/:id'[\s\S]*?\}\);/;
const newReportsDelete = `reportsRoutes.delete('/:type/:id', async (c) => {
  try {
    const { type, id } = c.req.param();
    let taskId = null;

    if (type === 'FORKLIFT') {
      const report = await sql\`SELECT task_id FROM forklift_inspections WHERE id = \${id}\`;
      if (report.length > 0) taskId = report[0].task_id;
      
      await sql\`DELETE FROM forklift_inspection_scores WHERE inspection_id = \${id}\`;
      await sql\`DELETE FROM forklift_inspections WHERE id = \${id}\`;
    } else if (type === 'BATTERY') {
      const report = await sql\`SELECT task_id FROM battery_service_reports WHERE id = \${id}\`;
      if (report.length > 0) taskId = report[0].task_id;

      await sql\`DELETE FROM battery_service_reports WHERE id = \${id}\`;
    } else {
      return c.json({ error: 'Invalid type' }, 400);
    }

    // Delete associated task if exists
    if (taskId) {
      await sql\`DELETE FROM inspection_tasks WHERE id = \${taskId}\`;
    }

    return c.json({ message: 'Report and associated task deleted successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});`;

reportsFile = reportsFile.replace(reportsDeleteRegex, newReportsDelete);
fs.writeFileSync('apps/api/src/routes/reports.routes.ts', reportsFile);

console.log('Update Complete');
