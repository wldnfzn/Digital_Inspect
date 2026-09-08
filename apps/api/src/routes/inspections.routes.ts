import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';
import { calculateHealthScore, determineHealthStatus } from '@digital-inspect/shared';

const inspectionsRoutes = new Hono();
inspectionsRoutes.use('*', authMiddleware);

// ==========================================
// TASKS (Jadwal)
// ==========================================

// Get all tasks (for Manager/Admin)
inspectionsRoutes.get('/tasks', roleGuard(['SUPER_ADMIN', 'MANAGER', 'DIRECTOR']), async (c) => {
  try {
    const tasks = await sql`
      SELECT t.*, 
             f.asset_code as forklift_code, 
             b.asset_code as battery_code,
             u.full_name as mechanic_name
      FROM inspection_tasks t
      LEFT JOIN forklifts f ON t.forklift_id = f.id
      LEFT JOIN batteries b ON t.battery_id = b.id
      LEFT JOIN users u ON t.assigned_to = u.id
      ORDER BY t.created_at DESC
    `;
    return c.json({ data: tasks });
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Manager assigns a task to mechanic
inspectionsRoutes.post('/schedule', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { asset_type, forklift_id, battery_id, assigned_to, scheduled_date } = await c.req.json();
    const user = c.get('user');

    if (!asset_type || !assigned_to || !scheduled_date) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const newTask = await sql`
      INSERT INTO inspection_tasks (asset_type, forklift_id, battery_id, assigned_to, assigned_by, scheduled_date)
      VALUES (${asset_type}, ${forklift_id || null}, ${battery_id || null}, ${assigned_to}, ${user.userId}, ${scheduled_date})
      RETURNING *
    `;

    // Create Notification for the mechanic
    await sql`
      INSERT INTO notifications (user_id, title, message, related_entity_type, related_entity_id)
      VALUES (${assigned_to}, 'Tugas Baru', 'Anda mendapat tugas inspeksi baru untuk tanggal ' || ${scheduled_date}, 'INSPECTION_TASK', ${newTask[0].id})
    `;

    return c.json({ message: 'Task scheduled', data: newTask[0] }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Mechanic gets their active tasks
inspectionsRoutes.get('/my-tasks', async (c) => {
  try {
    const user = c.get('user');
    const tasks = await sql`
      SELECT t.*, 
             f.asset_code as forklift_code, 
             b.asset_code as battery_code
      FROM inspection_tasks t
      LEFT JOIN forklifts f ON t.forklift_id = f.id
      LEFT JOIN batteries b ON t.battery_id = b.id
      WHERE t.assigned_to = ${user.userId} AND t.status != 'COMPLETED'
      ORDER BY t.scheduled_date ASC
    `;
    return c.json({ data: tasks });
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Mechanic gets their inspection history
inspectionsRoutes.get('/my-history', async (c) => {
  try {
    const user = c.get('user');
    const forkliftReports = await sql`
      SELECT fi.id, 'FORKLIFT' as asset_type, f.asset_code, fi.health_percentage as score, fi.health_status as status, fi.completed_at as date
      FROM forklift_inspections fi JOIN forklifts f ON fi.forklift_id = f.id
      WHERE fi.mechanic_id = ${user.userId}
    `;
    const batteryReports = await sql`
      SELECT b.id, 'BATTERY' as asset_type, ba.asset_code, b.voltage_reading as score, 'HEALTHY' as status, b.completed_at as date
      FROM battery_service_reports b JOIN batteries ba ON b.battery_id = ba.id
      WHERE b.mechanic_id = ${user.userId}
    `;
    
    const all = [...forkliftReports, ...batteryReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return c.json({ data: all });
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ==========================================
// FORKLIFT INSPECTION SUBMISSION
// ==========================================

inspectionsRoutes.post('/forklift', async (c) => {
  try {
    const user = c.get('user');
    const { task_id, forklift_id, items, notes, additional_data } = await c.req.json();
    
    // items is array of { item_id: string, score: 1|2|3, photo_url?: string, notes?: string }
    if (!forklift_id || !items || !Array.isArray(items)) {
      return c.json({ error: 'Invalid payload' }, 400);
    }

    // 1. Calculate Health
    let totalScore = 0;
    let hasCriticalIssue = false;
    const totalItems = items.length;

    // We should ideally fetch real item criticality from DB, but for simplicity assuming payload is honest 
    // or we can query it here:
    const itemIds = items.map((i: any) => i.item_id);
    const dbItems = await sql`SELECT id, is_critical FROM inspection_items WHERE id IN ${sql(itemIds)}`;
    const criticalMap = new Map(dbItems.map(i => [i.id, i.is_critical]));

    for (const item of items) {
      totalScore += item.score;
      if (item.score === 1 && criticalMap.get(item.item_id)) {
        hasCriticalIssue = true;
      }
    }

    const health_percentage = calculateHealthScore(totalScore, totalItems);
    const health_status = determineHealthStatus(health_percentage, hasCriticalIssue);

    // 2. Start Transaction
    const result = await sql.begin(async (tx) => {
      // Generate Service Report No
      const countRes = await tx`SELECT count(*) FROM forklift_inspections WHERE DATE(created_at) = CURRENT_DATE`;
      const count = parseInt(countRes[0].count) + 1;
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
      const serviceReportNo = `SR-FL-${dateStr}-${count.toString().padStart(3, '0')}`;
      
      const finalAdditionalData = { ...(additional_data || {}), service_report_no: serviceReportNo };

      // Insert Inspection
      const insp = await tx`
        INSERT INTO forklift_inspections (task_id, forklift_id, mechanic_id, total_score, total_items, health_percentage, health_status, notes, additional_data, completed_at)
        VALUES (${task_id || null}, ${forklift_id}, ${user.userId}, ${totalScore}, ${totalItems}, ${health_percentage}, ${health_status}, ${notes || null}, ${sql.json(finalAdditionalData)}, NOW())
        RETURNING id
      `;
      const inspectionId = insp[0].id;

      // Insert Scores
      for (const item of items) {
        await tx`
          INSERT INTO forklift_inspection_scores (inspection_id, item_id, score, photo_url, notes)
          VALUES (${inspectionId}, ${item.item_id}, ${item.score}, ${item.photo_url || null}, ${item.notes || null})
        `;
      }

      // Update Forklift Health
      await tx`
        UPDATE forklifts SET health_score = ${health_percentage}, health_status = ${health_status}
        WHERE id = ${forklift_id}
      `;

      // Update Task Status if task_id provided
      if (task_id) {
        await tx`UPDATE inspection_tasks SET status = 'COMPLETED' WHERE id = ${task_id}`;
      }

      return inspectionId;
    });

    return c.json({ message: 'Inspection submitted', inspection_id: result }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
// ==========================================
// BATTERY SERVICE SUBMISSION
// ==========================================

inspectionsRoutes.post('/battery', async (c) => {
  try {
    const user = c.get('user');
    const { task_id, battery_id, voltage_reading, full_report_data } = await c.req.json();
    
    if (!battery_id) {
      return c.json({ error: 'Battery ID is required' }, 400);
    }

    const result = await sql.begin(async (tx) => {
      // Generate Service Report No
      const countRes = await tx`SELECT count(*) FROM battery_service_reports WHERE DATE(created_at) = CURRENT_DATE`;
      const count = parseInt(countRes[0].count) + 1;
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
      const serviceReportNo = `SR-BT-${dateStr}-${count.toString().padStart(3, '0')}`;
      
      const finalReportData = { ...(full_report_data || {}), service_report_no: serviceReportNo };

      // Insert Report
      const report = await tx`
        INSERT INTO battery_service_reports (task_id, battery_id, mechanic_id, voltage_reading, full_report_data, completed_at)
        VALUES (${task_id || null}, ${battery_id}, ${user.userId}, ${voltage_reading || null}, ${sql.json(finalReportData)}, NOW())
        RETURNING id
      `;

      // Update Battery Status
      await tx`
        UPDATE batteries SET voltage = ${voltage_reading || null}, status = 'IN_USE'
        WHERE id = ${battery_id}
      `;

      // Update Task Status if task_id provided
      if (task_id) {
        await tx`UPDATE inspection_tasks SET status = 'COMPLETED' WHERE id = ${task_id}`;
      }

      return report[0].id;
    });

    return c.json({ message: 'Battery service submitted', report_id: result }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// GET Forklift Report Detail
inspectionsRoutes.get('/forklift/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const report = await sql`
      SELECT fi.*, f.asset_code, f.model, f.year, u.full_name as mechanic, c.name as customer_name, c.location as customer_address 
      FROM forklift_inspections fi 
      JOIN forklifts f ON fi.forklift_id = f.id 
      LEFT JOIN customers c ON f.customer_id = c.id
      JOIN users u ON fi.mechanic_id = u.id 
      WHERE fi.id = ${id}
    `;
    const scores = await sql`SELECT fis.score, fis.photo_url, i.name as item_name, c.name as category_name FROM forklift_inspection_scores fis JOIN inspection_items i ON fis.item_id = i.id JOIN inspection_categories c ON i.category_id = c.id WHERE fis.inspection_id = ${id}`;
    return c.json({ data: { ...report[0], scores } });
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// GET Battery Report Detail
inspectionsRoutes.get('/battery/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const report = await sql`
      SELECT b.*, ba.asset_code, u.full_name as mechanic, c.name as customer_name, c.location as customer_address 
      FROM battery_service_reports b 
      JOIN batteries ba ON b.battery_id = ba.id 
      LEFT JOIN customers c ON ba.customer_id = c.id
      JOIN users u ON b.mechanic_id = u.id 
      WHERE b.id = ${id}
    `;
    return c.json({ data: report[0] });
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default inspectionsRoutes;
