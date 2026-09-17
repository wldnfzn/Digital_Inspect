import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware } from '../middleware/auth';

const notificationsRoutes = new Hono();
notificationsRoutes.use('*', authMiddleware);

notificationsRoutes.get('/', async (c) => {
  try {
    const user = c.get('user');
    const notifications = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${user.userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return c.json({ data: notifications });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

notificationsRoutes.put('/:id/read', async (c) => {
  try {
    const { id } = c.req.param();
    const user = c.get('user');

    await sql`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = ${id} AND user_id = ${user.userId}
    `;
    return c.json({ message: 'Marked as read' });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default notificationsRoutes;
