import { readFileSync, writeFileSync } from 'fs';

// 1. Add DELETE to reports.routes.ts
let reportsCode = readFileSync('apps/api/src/routes/reports.routes.ts', 'utf8');
const reportsDelete = `
// DELETE /reports/:type/:id
reportsRoutes.delete('/:type/:id', async (c) => {
  try {
    const { type, id } = c.req.param();
    if (type === 'FORKLIFT') {
      await sql\`DELETE FROM forklift_inspection_scores WHERE inspection_id = \${id}\`;
      await sql\`DELETE FROM forklift_inspections WHERE id = \${id}\`;
    } else if (type === 'BATTERY') {
      await sql\`DELETE FROM battery_service_reports WHERE id = \${id}\`;
    } else {
      return c.json({ error: 'Invalid type' }, 400);
    }
    return c.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
`;
reportsCode = reportsCode.replace('export default reportsRoutes;', reportsDelete + '\nexport default reportsRoutes;');
writeFileSync('apps/api/src/routes/reports.routes.ts', reportsCode);

// 2. Add DELETE to inspections.routes.ts
let inspectionsCode = readFileSync('apps/api/src/routes/inspections.routes.ts', 'utf8');
const inspDelete = `
// Delete a task (Admin/Manager only)
inspectionsRoutes.delete('/tasks/:id', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { id } = c.req.param();
    await sql\`DELETE FROM inspection_tasks WHERE id = \${id}\`;
    return c.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
`;
inspectionsCode = inspectionsCode.replace('// Get all tasks (Admin/Manager)', inspDelete + '\n// Get all tasks (Admin/Manager)');
writeFileSync('apps/api/src/routes/inspections.routes.ts', inspectionsCode);

console.log('Backend routes updated');
