import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';

const dashboardRoutes = new Hono();
dashboardRoutes.use('*', authMiddleware);
dashboardRoutes.use('*', roleGuard(['SUPER_ADMIN', 'DIRECTOR', 'MANAGER']));

dashboardRoutes.get('/stats', async (c) => {
  try {
    const month = c.req.query('month');
    
    // For queries that don't need month filtering (overall counts)
    const forkliftCount = await sql`SELECT count(*) FROM forklifts`;
    const batteryCount = await sql`SELECT count(*) FROM batteries`;
    const ongoingTasks = await sql`
      SELECT count(*) FROM inspection_tasks 
      WHERE status IN ('SCHEDULED', 'IN_PROGRESS')
    `;

    // Dynamic month filtering for completed tasks
    let completedCondition = sql`completed_at >= date_trunc('month', CURRENT_DATE)`;
    let monthFilterCondition = sql`1=1`; // Default no filter if no month provided, wait no, let's filter if month is provided
    
    if (month) {
      completedCondition = sql`to_char(completed_at, 'YYYY-MM') = ${month}`;
      monthFilterCondition = sql`to_char(completed_at, 'YYYY-MM') = ${month}`;
    }

    const completedForklifts = await sql`SELECT count(*) FROM forklift_inspections WHERE ${completedCondition}`;
    const completedBatteries = await sql`SELECT count(*) FROM battery_service_reports WHERE ${completedCondition}`;

    // Health Status
    const goodStatus = await sql`SELECT count(*) FROM forklift_inspections WHERE health_status = 'HEALTHY' AND ${monthFilterCondition}`;
    const attentionStatus = await sql`SELECT count(*) FROM forklift_inspections WHERE health_status = 'ATTENTION' AND ${monthFilterCondition}`;
    const criticalStatus = await sql`SELECT count(*) FROM forklift_inspections WHERE health_status = 'CRITICAL' AND ${monthFilterCondition}`;

    // Avg Fleet Health (Overall)
    const avgHealth = await sql`SELECT avg(health_percentage) as avg FROM forklift_inspections WHERE ${monthFilterCondition}`;

    // NEW: Avg Health Per Asset (Forklifts)
    const avgHealthPerAsset = await sql`
      SELECT f.asset_code, ROUND(avg(fi.health_percentage), 1) as avg_health
      FROM forklift_inspections fi
      JOIN forklifts f ON fi.forklift_id = f.id
      WHERE ${monthFilterCondition}
      GROUP BY f.asset_code
      ORDER BY avg_health ASC
    `;

    // NEW: Activity Inspection for Line Chart (Count per day)
    const activityInspections = await sql`
      SELECT date, COUNT(*) as count FROM (
        SELECT date_trunc('day', completed_at) as date FROM forklift_inspections WHERE ${monthFilterCondition}
        UNION ALL
        SELECT date_trunc('day', completed_at) as date FROM battery_service_reports WHERE ${monthFilterCondition}
      ) as combined
      GROUP BY date
      ORDER BY date ASC
    `;

    // NEW: Mechanic Inspection Count
    const mechanicInspections = await sql`
      SELECT u.full_name as mechanic_name, COUNT(*) as count FROM (
        SELECT mechanic_id FROM forklift_inspections WHERE ${monthFilterCondition}
        UNION ALL
        SELECT mechanic_id FROM battery_service_reports WHERE ${monthFilterCondition}
      ) as combined
      JOIN users u ON combined.mechanic_id = u.id
      GROUP BY u.full_name
      ORDER BY count DESC
    `;

    // Recent Inspections (Last 5)
    const recentForklifts = await sql`
      SELECT fi.id, 'FORKLIFT' as asset_type, f.asset_code, fi.health_percentage as score, fi.health_status as status, fi.completed_at as date
      FROM forklift_inspections fi JOIN forklifts f ON fi.forklift_id = f.id
      WHERE ${monthFilterCondition}
      ORDER BY fi.completed_at DESC LIMIT 5
    `;
    const recentBatteries = await sql`
      SELECT b.id, 'BATTERY' as asset_type, ba.asset_code, b.voltage_reading as score, 'HEALTHY' as status, b.completed_at as date
      FROM battery_service_reports b JOIN batteries ba ON b.battery_id = ba.id
      WHERE ${monthFilterCondition}
      ORDER BY b.completed_at DESC LIMIT 5
    `;
    const recentInspections = [...recentForklifts, ...recentBatteries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Critical Alerts (Items that scored 1)
    const criticalAlerts = await sql`
      SELECT 
        f.asset_code, 
        c.name as customer_name, 
        'CRITICAL' as status, 
        i.name as notes,
        fi.id as report_id
      FROM forklift_inspection_scores fis
      JOIN forklift_inspections fi ON fis.inspection_id = fi.id
      JOIN forklifts f ON fi.forklift_id = f.id
      LEFT JOIN customers c ON f.customer_id = c.id
      JOIN inspection_items i ON fis.item_id = i.id
      WHERE fis.score = 1 AND ${month ? sql`to_char(fi.completed_at, 'YYYY-MM') = ${month}` : sql`1=1`}
      ORDER BY fi.completed_at DESC 
      LIMIT 50
    `;

    // Customer Summary
    const customerSummary = await sql`
      SELECT 
        c.name, 
        COUNT(DISTINCT f.id) as fl_count, 
        COUNT(DISTINCT b.id) as bt_count
      FROM customers c
      LEFT JOIN forklifts f ON f.customer_id = c.id
      LEFT JOIN batteries b ON b.customer_id = c.id
      GROUP BY c.id, c.name
    `;

    return c.json({
      data: {
        total_forklifts: parseInt(forkliftCount[0].count),
        total_batteries: parseInt(batteryCount[0].count),
        ongoing_tasks: parseInt(ongoingTasks[0].count),
        completed_this_month: parseInt(completedForklifts[0].count) + parseInt(completedBatteries[0].count),
        health_status: {
          good: parseInt(goodStatus[0].count),
          attention: parseInt(attentionStatus[0].count),
          critical: parseInt(criticalStatus[0].count),
        },
        avg_fleet_health: avgHealth[0].avg ? parseFloat(avgHealth[0].avg).toFixed(1) : 0,
        avg_health_per_asset: avgHealthPerAsset,
        activity_inspections: activityInspections.map(row => ({
          date: new Date(row.date).toISOString().split('T')[0],
          count: parseInt(row.count)
        })),
        mechanic_inspections: mechanicInspections.map(row => ({
          name: row.mechanic_name,
          count: parseInt(row.count)
        })),
        recent_inspections: recentInspections,
        critical_alerts: criticalAlerts,
        customer_summary: customerSummary
      }
    });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default dashboardRoutes;
