import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';
import { logAudit } from '../lib/audit';

const sparepartsRoutes = new Hono();
sparepartsRoutes.use('*', authMiddleware);

// GET /spareparts
sparepartsRoutes.get('/', async (c) => {
  try {
    const requests = await sql`
      SELECT s.*, c.name as customer_name, f.asset_code as forklift_code, b.asset_code as battery_code,
             u.full_name as created_by_name, p.full_name as processed_by_name, t.ticket_code
      FROM sparepart_requests s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN forklifts f ON s.forklift_id = f.id
      LEFT JOIN batteries b ON s.battery_id = b.id
      LEFT JOIN service_tickets t ON s.ticket_id = t.id
      JOIN users u ON s.created_by = u.id
      LEFT JOIN users p ON s.processed_by = p.id
      ORDER BY s.created_at DESC
    `;
    
    // Fetch items for each request
    for (let req of requests) {
      req.items = await sql`SELECT * FROM sparepart_request_items WHERE request_id = ${req.id}`;
    }
    
    return c.json({ data: requests });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /spareparts
sparepartsRoutes.post('/', roleGuard(['MANAGER', 'SUPER_ADMIN']), async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    
    const countRes = await sql`SELECT COUNT(*) FROM sparepart_requests WHERE DATE(created_at) = CURRENT_DATE`;
    const count = parseInt(countRes[0].count) + 1;
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const reqCode = `SPR-${dateStr}-${count.toString().padStart(3, '0')}`;
    
    let request;
    await sql.begin(async (tx: any) => {
      request = await tx`
        INSERT INTO sparepart_requests (request_code, customer_id, asset_type, forklift_id, battery_id, ticket_id, urgency, leader_notes, created_by, status)
        VALUES (${reqCode}, ${body.customer_id || null}, ${body.asset_type || null}, ${body.forklift_id || null}, ${body.battery_id || null}, ${body.ticket_id || null}, ${body.urgency || 'NORMAL'}, ${body.leader_notes || null}, ${user.userId}, 'DRAFT')
        RETURNING *
      `;
      
      for (const item of body.items) {
        await tx`
          INSERT INTO sparepart_request_items (request_id, part_name, part_number, quantity)
          VALUES (${request[0].id}, ${item.part_name}, ${item.part_number || null}, ${item.quantity})
        `;
      }
    });
    
    await logAudit(user.userId, user.email, 'CREATE_SPAREPART_REQ', 'Spareparts', `Created request ${reqCode}`);
    return c.json({ data: request[0] }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /spareparts/:id/submit
sparepartsRoutes.post('/:id/submit', roleGuard(['MANAGER', 'SUPER_ADMIN']), async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const req = await sql`
      UPDATE sparepart_requests SET status = 'SUBMITTED', submitted_at = NOW() 
      WHERE id = ${id} AND status = 'DRAFT'
      RETURNING *
    `;
    
    if (!req.length) return c.json({ error: 'Request not found or already submitted' }, 404);
    
    await logAudit(user.userId, user.email, 'SUBMIT_SPAREPART_REQ', 'Spareparts', `Submitted request ${req[0].request_code}`);
    return c.json({ data: req[0] });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /spareparts/:id/process
sparepartsRoutes.post('/:id/process', roleGuard(['TECH_INVENTORY', 'SUPER_ADMIN']), async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const status = body.status; // PROCESSING, READY, REJECTED
    if (!['PROCESSING', 'READY', 'REJECTED'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    const req = await sql`
      UPDATE sparepart_requests 
      SET status = ${status}, processed_at = NOW(), processed_by = ${user.userId}, inventory_notes = ${body.inventory_notes || null},
          completed_at = CASE WHEN ${status} IN ('READY', 'REJECTED') THEN NOW() ELSE completed_at END
      WHERE id = ${id}
      RETURNING *
    `;
    
    await logAudit(user.userId, user.email, 'PROCESS_SPAREPART_REQ', 'Spareparts', `Processed request ${req[0].request_code} to ${status}`);
    return c.json({ data: req[0] });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default sparepartsRoutes;
