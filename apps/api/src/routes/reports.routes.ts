import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';
import { logAudit } from '../lib/audit';

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
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// DELETE /reports/:type/:id
reportsRoutes.delete('/:type/:id', async (c) => {
  try {
    const { type, id } = c.req.param();
    let taskId = null;

    if (type === 'FORKLIFT') {
      let assetId = null;
      const report = await sql`SELECT task_id, forklift_id FROM forklift_inspections WHERE id = ${id}`;
      if (report.length > 0) {
        taskId = report[0].task_id;
        assetId = report[0].forklift_id;
      }
      
      await sql`DELETE FROM forklift_inspection_scores WHERE inspection_id = ${id}`;
      await sql`DELETE FROM forklift_inspections WHERE id = ${id}`;

      if (assetId) {
        const latest = await sql`SELECT health_percentage, health_status FROM forklift_inspections WHERE forklift_id = ${assetId} ORDER BY completed_at DESC LIMIT 1`;
        if (latest.length > 0) {
          await sql`UPDATE forklifts SET health_score = ${latest[0].health_percentage}, health_status = ${latest[0].health_status} WHERE id = ${assetId}`;
        } else {
          await sql`UPDATE forklifts SET health_score = 0, health_status = 'HEALTHY' WHERE id = ${assetId}`;
        }
      }
    } else if (type === 'BATTERY') {
      let assetId = null;
      const report = await sql`SELECT task_id, battery_id FROM battery_service_reports WHERE id = ${id}`;
      if (report.length > 0) {
        taskId = report[0].task_id;
        assetId = report[0].battery_id;
      }

      await sql`DELETE FROM battery_service_reports WHERE id = ${id}`;

      if (assetId) {
        const latest = await sql`SELECT voltage_reading FROM battery_service_reports WHERE battery_id = ${assetId} ORDER BY completed_at DESC LIMIT 1`;
        if (latest.length > 0) {
          await sql`UPDATE batteries SET voltage = ${latest[0].voltage_reading} WHERE id = ${assetId}`;
        } else {
          await sql`UPDATE batteries SET voltage = NULL WHERE id = ${assetId}`;
        }
      }
    } else {
      return c.json({ error: 'Invalid type' }, 400);
    }

    // Delete associated task if exists
    if (taskId) {
      await sql`DELETE FROM inspection_tasks WHERE id = ${taskId}`;
    }

    await logAudit(user.userId, user.email, 'DELETE_REPORT', type, `Deleted ${type} report ${id}`);

    return c.json({ message: 'Report and associated task deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default reportsRoutes;
