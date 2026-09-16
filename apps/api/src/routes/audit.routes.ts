import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';

const auditRoutes = new Hono();
auditRoutes.use('*', authMiddleware);
auditRoutes.use('*', roleGuard(['SUPER_ADMIN']));

auditRoutes.get('/', async (c) => {
  try {
    const logs = await sql`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return c.json({ data: logs });
  } catch (error) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default auditRoutes;
