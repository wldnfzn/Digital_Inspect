import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';
import { logAudit } from '../lib/audit';
import { UserRole } from '@digital-inspect/shared';

const ticketsRoutes = new Hono();
ticketsRoutes.use('*', authMiddleware);

// GET /tickets
ticketsRoutes.get('/', async (c) => {
  const user = c.get('user');
  let tickets;
  
  try {
    if (user.role === UserRole.SALES) {
      tickets = await sql`
        SELECT t.*, c.name as customer_name, f.asset_code as forklift_code, b.asset_code as battery_code,
               u.full_name as created_by_name, m.full_name as mechanic_name
        FROM service_tickets t
        JOIN customers c ON t.customer_id = c.id
        LEFT JOIN forklifts f ON t.forklift_id = f.id
        LEFT JOIN batteries b ON t.battery_id = b.id
        JOIN users u ON t.created_by = u.id
        LEFT JOIN users m ON t.assigned_mechanic_id = m.id
        WHERE t.created_by = ${user.userId}
        ORDER BY t.created_at DESC
      `;
    } else {
      tickets = await sql`
        SELECT t.*, c.name as customer_name, f.asset_code as forklift_code, b.asset_code as battery_code,
               u.full_name as created_by_name, m.full_name as mechanic_name
        FROM service_tickets t
        JOIN customers c ON t.customer_id = c.id
        LEFT JOIN forklifts f ON t.forklift_id = f.id
        LEFT JOIN batteries b ON t.battery_id = b.id
        JOIN users u ON t.created_by = u.id
        LEFT JOIN users m ON t.assigned_mechanic_id = m.id
        ORDER BY t.created_at DESC
      `;
    }
    return c.json({ data: tickets });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /tickets
ticketsRoutes.post('/', roleGuard(['SALES', 'SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    
    const countRes = await sql`SELECT COUNT(*) FROM service_tickets WHERE DATE(created_at) = CURRENT_DATE`;
    const count = parseInt(countRes[0].count) + 1;
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const ticketCode = `TKT-${dateStr}-${count.toString().padStart(3, '0')}`;
    
    const ticket = await sql`
      INSERT INTO service_tickets (ticket_code, customer_id, asset_type, forklift_id, battery_id, issue_type, issue_description, sales_notes, created_by, status)
      VALUES (${ticketCode}, ${body.customer_id}, ${body.asset_type}, ${body.forklift_id || null}, ${body.battery_id || null}, ${body.issue_type}, ${body.issue_description}, ${body.sales_notes || null}, ${user.userId}, 'DRAFT')
      RETURNING *
    `;
    
    await logAudit(user.userId, user.email, 'CREATE_TICKET', 'ServiceTickets', `Created ticket ${ticketCode}`);
    return c.json({ data: ticket[0] }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /tickets/:id/submit
ticketsRoutes.post('/:id/submit', roleGuard(['SALES', 'SUPER_ADMIN']), async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const ticket = await sql`
      UPDATE service_tickets SET status = 'SUBMITTED', submitted_at = NOW() 
      WHERE id = ${id} AND (created_by = ${user.userId} OR ${user.role} = 'SUPER_ADMIN') AND status = 'DRAFT'
      RETURNING *
    `;
    
    if (!ticket.length) return c.json({ error: 'Ticket not found or cannot be submitted' }, 404);
    
    await logAudit(user.userId, user.email, 'SUBMIT_TICKET', 'ServiceTickets', `Submitted ticket ${ticket[0].ticket_code}`);
    return c.json({ data: ticket[0] });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /tickets/:id/assign
ticketsRoutes.post('/:id/assign', roleGuard(['MANAGER', 'SUPER_ADMIN']), async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Create the task for mechanic first
    const ticketRes = await sql`SELECT * FROM service_tickets WHERE id = ${id}`;
    if (!ticketRes.length) return c.json({ error: 'Ticket not found' }, 404);
    const t = ticketRes[0];
    
    const task = await sql`
      INSERT INTO inspection_tasks (asset_type, forklift_id, battery_id, assigned_to, assigned_by, scheduled_date, status, ticket_id)
      VALUES (${t.asset_type}, ${t.forklift_id}, ${t.battery_id}, ${body.mechanic_id}, ${user.userId}, ${body.scheduled_date || new Date().toISOString().split('T')[0]}, 'SCHEDULED', ${t.id})
      RETURNING id
    `;
    
    // Update ticket
    const ticket = await sql`
      UPDATE service_tickets 
      SET status = 'ASSIGNED', assigned_at = NOW(), assigned_mechanic_id = ${body.mechanic_id}, leader_notes = ${body.leader_notes || null}
      WHERE id = ${id}
      RETURNING *
    `;
    
    await logAudit(user.userId, user.email, 'ASSIGN_TICKET', 'ServiceTickets', `Assigned ticket ${ticket[0].ticket_code}`);
    return c.json({ data: ticket[0] });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default ticketsRoutes;
