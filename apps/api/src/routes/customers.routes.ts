import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';

const customersRoutes = new Hono();

// All customer routes require authentication
customersRoutes.use('*', authMiddleware);

// GET /customers - List all customers (accessible by all authenticated users)
customersRoutes.get('/', async (c) => {
  try {
    const customers = await sql`
      SELECT id, name, location, contact_person, contact_phone, created_at
      FROM customers
      ORDER BY name ASC
    `;
    return c.json({ data: customers });
  } catch (error) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// POST /customers - Create a new customer (only ADMIN and MANAGER)
customersRoutes.post('/', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { name, location, contact_person, contact_phone } = await c.req.json();
    
    if (!name) return c.json({ error: 'Name is required' }, 400);

    const newCustomer = await sql`
      INSERT INTO customers (name, location, contact_person, contact_phone)
      VALUES (${name}, ${location}, ${contact_person}, ${contact_phone})
      RETURNING *
    `;
    
    return c.json({ message: 'Customer created successfully', data: newCustomer[0] }, 201);
  } catch (error) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// PUT /customers/:id - Update a customer
customersRoutes.put('/:id', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { id } = c.req.param();
    const { name, location, contact_person, contact_phone } = await c.req.json();
    
    if (!name) return c.json({ error: 'Name is required' }, 400);

    const updated = await sql`
      UPDATE customers 
      SET name = ${name}, location = ${location}, contact_person = ${contact_person}, contact_phone = ${contact_phone}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (updated.length === 0) return c.json({ error: 'Customer not found' }, 404);
    
    return c.json({ message: 'Customer updated', data: updated[0] });
  } catch (error) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// DELETE /customers/:id - Delete a customer
customersRoutes.delete('/:id', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { id } = c.req.param();
    const deleted = await sql`
      DELETE FROM customers WHERE id = ${id} RETURNING id
    `;
    
    if (deleted.length === 0) return c.json({ error: 'Customer not found' }, 404);
    
    return c.json({ message: 'Customer deleted' });
  } catch (error) {
    // If it fails, likely a foreign key constraint (customer has assets)
    return c.json({ error: 'Cannot delete customer because they have associated assets.' }, 400);
  }
});

export default customersRoutes;
