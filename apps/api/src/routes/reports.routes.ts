import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';

const reportsRoutes = new Hono();

reportsRoutes.use('*', authMiddleware);
reportsRoutes.use('*', roleGuard(['SUPER_ADMIN', 'MANAGER']));

// GET /reports
reportsRoutes.get('/', async (c) => {
  try {
    // Fetch Forklift Inspections
    const forkliftReports = await sql`
      SELECT 
        fi.id, 
        'FORKLIFT' as asset_type,
        f.asset_code,
        fi.health_percentage as score,
        fi.health_status as status,
        fi.completed_at as date,
        u.full_name as mechanic,
        c.name as customer
      FROM forklift_inspections fi
      JOIN forklifts f ON fi.forklift_id = f.id
      LEFT JOIN customers c ON f.customer_id = c.id
      JOIN users u ON fi.mechanic_id = u.id
      ORDER BY fi.completed_at DESC
    `;

    // Fetch Battery Service Reports
    const batteryReports = await sql`
      SELECT 
        b.id, 
        'BATTERY' as asset_type,
        ba.asset_code,
        b.voltage_reading as score,
        CASE WHEN b.water_level = 'LOW' THEN 'ATTENTION' ELSE 'HEALTHY' END as status,
        b.completed_at as date,
        u.full_name as mechanic,
        c.name as customer
      FROM battery_service_reports b
      JOIN batteries ba ON b.battery_id = ba.id
      LEFT JOIN customers c ON ba.customer_id = c.id
      JOIN users u ON b.mechanic_id = u.id
      ORDER BY b.completed_at DESC
    `;

    const allReports = [...forkliftReports, ...batteryReports].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return c.json({ data: allReports });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default reportsRoutes;
