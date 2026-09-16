import { readFileSync, writeFileSync } from 'fs';
const p = 'apps/api/src/routes/inspections.routes.ts';
let content = readFileSync(p, 'utf8');

const newEndpoint = `
// Get inspection history for a specific asset
inspectionsRoutes.get('/asset/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const type = c.req.query('type'); // 'battery' or 'forklift'
    
    if (type === 'battery') {
      const reports = await sql\`
        SELECT b.id, 'BATTERY' as asset_type, b.voltage_reading as score, b.completed_at as date, u.full_name as mechanic_name
        FROM battery_service_reports b
        JOIN users u ON b.mechanic_id = u.id
        WHERE b.battery_id = \${id}
        ORDER BY b.completed_at DESC
      \`;
      return c.json({ data: reports });
    } else {
      const reports = await sql\`
        SELECT fi.id, 'FORKLIFT' as asset_type, fi.health_percentage as score, fi.health_status as status, fi.completed_at as date, u.full_name as mechanic_name
        FROM forklift_inspections fi
        JOIN users u ON fi.mechanic_id = u.id
        WHERE fi.forklift_id = \${id}
        ORDER BY fi.completed_at DESC
      \`;
      return c.json({ data: reports });
    }
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Mechanic gets their inspection history`;

if (!content.includes('/asset/:id')) {
  content = content.replace('// Mechanic gets their inspection history', newEndpoint);
  writeFileSync(p, content);
  console.log('Added /asset/:id endpoint');
} else {
  console.log('Endpoint already exists');
}
