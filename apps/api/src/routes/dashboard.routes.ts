import { Hono } from 'hono';
import { pool } from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';

const dashboardRoutes = new Hono();
dashboardRoutes.use('*', authMiddleware);
dashboardRoutes.use('*', roleGuard(['SUPER_ADMIN', 'DIRECTOR', 'MANAGER']));

dashboardRoutes.get('/stats', async (c) => {
  try {
    const month = c.req.query('month');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    let filterCompleted = '1=1';
    let filterCompletedFi = '1=1';
    let filterCreated = '1=1';
    let params: any[] = [];

    if (startDate && endDate) {
      filterCompleted = 'completed_at >= $1 AND completed_at <= $2::timestamp + interval \'1 day\'';
      filterCompletedFi = 'fi.completed_at >= $1 AND fi.completed_at <= $2::timestamp + interval \'1 day\'';
      filterCreated = 'created_at >= $1 AND created_at <= $2::timestamp + interval \'1 day\'';
      params = [startDate, endDate];
    } else if (month) {
      filterCompleted = 'to_char(completed_at, \'YYYY-MM\') = $1';
      filterCompletedFi = 'to_char(fi.completed_at, \'YYYY-MM\') = $1';
      filterCreated = 'to_char(created_at, \'YYYY-MM\') = $1';
      params = [month];
    }

    // Unfiltered Metrics
    const forkliftCountRes = await pool.query('SELECT count(*) FROM forklifts');
    const batteryCountRes = await pool.query('SELECT count(*) FROM batteries');
    const userCountRes = await pool.query('SELECT count(*) FROM users');
    
    const forkliftCount = parseInt(forkliftCountRes.rows[0].count);
    const batteryCount = parseInt(batteryCountRes.rows[0].count);
    const employeeCount = parseInt(userCountRes.rows[0].count);

    // Filtered Metrics
    const ongoingTasksRes = await pool.query(`SELECT count(*) FROM inspection_tasks WHERE status IN ('SCHEDULED', 'IN_PROGRESS') AND ${filterCreated}`, params);
    const ongoingTasks = parseInt(ongoingTasksRes.rows[0].count);

    const completedForkliftsRes = await pool.query(`SELECT count(*) FROM forklift_inspections WHERE ${filterCompleted}`, params);
    const completedBatteriesRes = await pool.query(`SELECT count(*) FROM battery_service_reports WHERE ${filterCompleted}`, params);
    const completedInspections = parseInt(completedForkliftsRes.rows[0].count) + parseInt(completedBatteriesRes.rows[0].count);

    // Health Status
    const goodStatusRes = await pool.query(`SELECT count(*) FROM forklift_inspections WHERE health_status = 'HEALTHY' AND ${filterCompleted}`, params);
    const attentionStatusRes = await pool.query(`SELECT count(*) FROM forklift_inspections WHERE health_status = 'ATTENTION' AND ${filterCompleted}`, params);
    const criticalStatusRes = await pool.query(`SELECT count(*) FROM forklift_inspections WHERE health_status = 'CRITICAL' AND ${filterCompleted}`, params);
    const healthStatus = {
      good: parseInt(goodStatusRes.rows[0].count),
      attention: parseInt(attentionStatusRes.rows[0].count),
      critical: parseInt(criticalStatusRes.rows[0].count)
    };

    // Avg Fleet Health Overall
    const avgHealthRes = await pool.query(`SELECT avg(health_percentage) as avg FROM forklift_inspections WHERE ${filterCompleted}`, params);
    const avgFleetHealth = avgHealthRes.rows[0].avg ? parseFloat(avgHealthRes.rows[0].avg).toFixed(1) : 0;

    // Line Chart: Avg Health Trend
    const avgHealthTrendRes = await pool.query(`
      SELECT date_trunc('day', completed_at) as date, avg(health_percentage) as avg_score
      FROM forklift_inspections
      WHERE ${filterCompleted}
      GROUP BY date
      ORDER BY date ASC
    `, params);

    // Line Chart: Completed Inspections
    const activityInspectionsRes = await pool.query(`
      SELECT date, COUNT(*) as count FROM (
        SELECT date_trunc('day', completed_at) as date FROM forklift_inspections WHERE ${filterCompleted}
        UNION ALL
        SELECT date_trunc('day', completed_at) as date FROM battery_service_reports WHERE ${filterCompleted}
      ) as combined
      GROUP BY date
      ORDER BY date ASC
    `, params);

    // Line Chart: Active Tasks
    const activeTasksRes = await pool.query(`
      SELECT date_trunc('day', created_at) as date, COUNT(*) as count 
      FROM inspection_tasks 
      WHERE status IN ('SCHEDULED', 'IN_PROGRESS') AND ${filterCreated}
      GROUP BY date
      ORDER BY date ASC
    `, params);

    // Mechanic Inspection Count
    const mechanicInspectionsRes = await pool.query(`
      SELECT u.full_name as mechanic_name, COUNT(*) as count FROM (
        SELECT mechanic_id FROM forklift_inspections WHERE ${filterCompleted}
        UNION ALL
        SELECT mechanic_id FROM battery_service_reports WHERE ${filterCompleted}
      ) as combined
      JOIN users u ON combined.mechanic_id = u.id
      GROUP BY u.full_name
      ORDER BY count DESC
    `, params);

    // Recent Inspections (Last 5)
    const recentForkliftsRes = await pool.query(`
      SELECT fi.id, 'FORKLIFT' as asset_type, f.asset_code, fi.health_percentage as score, fi.health_status as status, fi.completed_at as date
      FROM forklift_inspections fi JOIN forklifts f ON fi.forklift_id = f.id
      WHERE ${filterCompletedFi}
      ORDER BY fi.completed_at DESC LIMIT 5
    `, params);
    const recentBatteriesRes = await pool.query(`
      SELECT b.id, 'BATTERY' as asset_type, ba.asset_code, b.voltage_reading as score, 'HEALTHY' as status, b.completed_at as date
      FROM battery_service_reports b JOIN batteries ba ON b.battery_id = ba.id
      WHERE ${filterCompleted}
      ORDER BY b.completed_at DESC LIMIT 5
    `, params);
    
    const recentInspections = [...recentForkliftsRes.rows, ...recentBatteriesRes.rows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Critical Alerts
    const criticalAlertsRes = await pool.query(`
      SELECT 
        f.asset_code, 
        c.name as customer_name, 
        'CRITICAL' as status, 
        i.name as notes,
        fi.id as report_id,
        fis.photo_url
      FROM forklift_inspection_scores fis
      JOIN forklift_inspections fi ON fis.inspection_id = fi.id
      JOIN forklifts f ON fi.forklift_id = f.id
      LEFT JOIN customers c ON f.customer_id = c.id
      JOIN inspection_items i ON fis.item_id = i.id
      WHERE fis.score = 1 AND ${filterCompletedFi}
      ORDER BY fi.completed_at DESC 
      LIMIT 50
    `, params);

    // Customer Summary
    const customerSummaryRes = await pool.query(`
      SELECT 
        c.name, 
        COUNT(DISTINCT f.id) as fl_count, 
        COUNT(DISTINCT b.id) as bt_count
      FROM customers c
      LEFT JOIN forklifts f ON f.customer_id = c.id
      LEFT JOIN batteries b ON b.customer_id = c.id
      GROUP BY c.id, c.name
    `);

    return c.json({
      data: {
        total_forklifts: forkliftCount,
        total_batteries: batteryCount,
        total_employees: employeeCount,
        ongoing_tasks: ongoingTasks,
        completed_this_month: completedInspections,
        health_status: healthStatus,
        avg_fleet_health: avgFleetHealth,
        avg_health_trend: avgHealthTrendRes.rows.map(row => ({
          date: new Date(row.date).toISOString().split('T')[0],
          avg_score: parseFloat(row.avg_score).toFixed(1)
        })),
        activity_inspections: activityInspectionsRes.rows.map(row => ({
          date: new Date(row.date).toISOString().split('T')[0],
          count: parseInt(row.count)
        })),
        active_tasks_trend: activeTasksRes.rows.map(row => ({
          date: new Date(row.date).toISOString().split('T')[0],
          count: parseInt(row.count)
        })),
        mechanic_inspections: mechanicInspectionsRes.rows.map(row => ({
          name: row.mechanic_name,
          count: parseInt(row.count)
        })),
        recent_inspections: recentInspections,
        critical_alerts: criticalAlertsRes.rows,
        customer_summary: customerSummaryRes.rows
      }
    });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default dashboardRoutes;
