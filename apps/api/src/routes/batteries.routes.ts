import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';

const batteriesRoutes = new Hono();
batteriesRoutes.use('*', authMiddleware);

batteriesRoutes.get('/', async (c) => {
  try {
    const batteries = await sql`
      SELECT b.*, c.name as customer_name
      FROM batteries b
      LEFT JOIN customers c ON b.customer_id = c.id
      ORDER BY b.created_at DESC
    `;
    return c.json({ data: batteries });
  } catch (error: any) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

batteriesRoutes.get('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const batteries = await sql`
      SELECT b.*, c.name as customer_name
      FROM batteries b
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.id = ${id} OR b.asset_code = ${id}
    `;
    
    if (batteries.length === 0) return c.json({ error: 'Battery not found' }, 404);
    
    return c.json({ data: batteries[0] });
  } catch (error: any) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

batteriesRoutes.post('/', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { asset_code, brand, voltage, customer_id } = await c.req.json();
    if (!asset_code) return c.json({ error: 'Asset code is required' }, 400);

    const newAsset = await sql`
      INSERT INTO batteries (asset_code, brand, voltage, customer_id)
      VALUES (${asset_code}, ${brand}, ${voltage}, ${customer_id})
      RETURNING *
    `;
    return c.json({ message: 'Battery created', data: newAsset[0] }, 201);
  } catch (error: any) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

batteriesRoutes.put('/:id', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { id } = c.req.param();
    const { asset_code, brand, voltage, customer_id } = await c.req.json();
    if (!asset_code) return c.json({ error: 'Asset code is required' }, 400);

    const updated = await sql`
      UPDATE batteries
      SET asset_code = ${asset_code}, brand = ${brand}, voltage = ${voltage}, customer_id = ${customer_id}
      WHERE id = ${id}
      RETURNING *
    `;
    if (updated.length === 0) return c.json({ error: 'Battery not found' }, 404);
    return c.json({ message: 'Battery updated', data: updated[0] });
  } catch (error: any) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

batteriesRoutes.delete('/:id', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { id } = c.req.param();
    const deleted = await sql`
      DELETE FROM batteries WHERE id = ${id} RETURNING id
    `;
    if (deleted.length === 0) return c.json({ error: 'Battery not found' }, 404);
    return c.json({ message: 'Battery deleted' });
  } catch (error: any) {
    return c.json({ error: 'Cannot delete battery (may have associated tasks).' }, 400);
  }
});

export default batteriesRoutes;
