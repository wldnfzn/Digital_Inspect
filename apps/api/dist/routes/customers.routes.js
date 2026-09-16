"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../middleware/auth");
const customersRoutes = new hono_1.Hono();
// All customer routes require authentication
customersRoutes.use('*', auth_1.authMiddleware);
// GET /customers - List all customers (accessible by all authenticated users)
customersRoutes.get('/', async (c) => {
    try {
        const customers = await (0, db_1.default) `
      SELECT id, name, location, contact_person, contact_phone, created_at
      FROM customers
      ORDER BY name ASC
    `;
        return c.json({ data: customers });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// POST /customers - Create a new customer (only ADMIN and MANAGER)
customersRoutes.post('/', (0, auth_1.roleGuard)(['SUPER_ADMIN', 'MANAGER']), async (c) => {
    try {
        const { name, location, contact_person, contact_phone } = await c.req.json();
        if (!name)
            return c.json({ error: 'Name is required' }, 400);
        const newCustomer = await (0, db_1.default) `
      INSERT INTO customers (name, location, contact_person, contact_phone)
      VALUES (${name}, ${location}, ${contact_person}, ${contact_phone})
      RETURNING *
    `;
        return c.json({ message: 'Customer created successfully', data: newCustomer[0] }, 201);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// PUT /customers/:id - Update a customer
customersRoutes.put('/:id', (0, auth_1.roleGuard)(['SUPER_ADMIN', 'MANAGER']), async (c) => {
    try {
        const { id } = c.req.param();
        const { name, location, contact_person, contact_phone } = await c.req.json();
        if (!name)
            return c.json({ error: 'Name is required' }, 400);
        const updated = await (0, db_1.default) `
      UPDATE customers 
      SET name = ${name}, location = ${location}, contact_person = ${contact_person}, contact_phone = ${contact_phone}
      WHERE id = ${id}
      RETURNING *
    `;
        if (updated.length === 0)
            return c.json({ error: 'Customer not found' }, 404);
        return c.json({ message: 'Customer updated', data: updated[0] });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// DELETE /customers/:id - Delete a customer
customersRoutes.delete('/:id', (0, auth_1.roleGuard)(['SUPER_ADMIN', 'MANAGER']), async (c) => {
    try {
        const { id } = c.req.param();
        const deleted = await (0, db_1.default) `
      DELETE FROM customers WHERE id = ${id} RETURNING id
    `;
        if (deleted.length === 0)
            return c.json({ error: 'Customer not found' }, 404);
        return c.json({ message: 'Customer deleted' });
    }
    catch (error) {
        // If it fails, likely a foreign key constraint (customer has assets)
        return c.json({ error: 'Cannot delete customer because they have associated assets.' }, 400);
    }
});
exports.default = customersRoutes;
