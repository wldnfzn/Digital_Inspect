import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';

const batteriesRoutes = new Hono();
batteriesRoutes.use('*', authMiddleware);

batteriesRoutes.get('/', async (c) => {
  try {
    const batteries = await sql`
      SELECT b.*, c.name as customer_name, c.location as customer_address, c.contact_person as customer_contact_person
      FROM batteries b
      LEFT JOIN customers c ON b.customer_id = c.id
      ORDER BY b.created_at DESC
    `;
    return c.json({ data: batteries });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

batteriesRoutes.get('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const batteries = await sql`
      SELECT b.*, c.name as customer_name, c.location as customer_address, c.contact_person as customer_contact_person
      FROM batteries b
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.id = ${id} OR b.asset_code = ${id}
    `;
    
    if (batteries.length === 0) return c.json({ error: 'Battery not found' }, 404);
    
    return c.json({ data: batteries[0] });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

batteriesRoutes.post('/', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { 
      asset_code, brand, voltage, customer_id,
      capacity_ah, tray_size, cable_length_positive, type, type_of_plug, cable_length_negative, truck_brand, serial_no
    } = await c.req.json();
    if (!asset_code) return c.json({ error: 'Asset code is required' }, 400);

    const newAsset = await sql`
      INSERT INTO batteries (
        asset_code, brand, voltage, customer_id,
        capacity_ah, tray_size, cable_length_positive, type, type_of_plug, cable_length_negative, truck_brand, serial_no
      )
      VALUES (
        ${asset_code}, ${brand}, ${voltage}, ${customer_id},
        ${capacity_ah || null}, ${tray_size || null}, ${cable_length_positive || null}, ${type || null}, ${type_of_plug || null}, ${cable_length_negative || null}, ${truck_brand || null}, ${serial_no || null}
      )
      RETURNING *
    `;
    return c.json({ message: 'Battery created', data: newAsset[0] }, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

batteriesRoutes.put('/:id', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const { id } = c.req.param();
    const { 
      asset_code, brand, voltage, customer_id,
      capacity_ah, tray_size, cable_length_positive, type, type_of_plug, cable_length_negative, truck_brand, serial_no
    } = await c.req.json();
    if (!asset_code) return c.json({ error: 'Asset code is required' }, 400);

    const updated = await sql`
      UPDATE batteries
      SET 
        asset_code = ${asset_code}, 
        brand = ${brand}, 
        voltage = ${voltage}, 
        customer_id = ${customer_id},
        capacity_ah = ${capacity_ah || null},
        tray_size = ${tray_size || null},
        cable_length_positive = ${cable_length_positive || null},
        type = ${type || null},
        type_of_plug = ${type_of_plug || null},
        cable_length_negative = ${cable_length_negative || null},
        truck_brand = ${truck_brand || null},
        serial_no = ${serial_no || null}
      WHERE id = ${id}
      RETURNING *
    `;
    if (updated.length === 0) return c.json({ error: 'Battery not found' }, 404);
    return c.json({ message: 'Battery updated', data: updated[0] });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
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
