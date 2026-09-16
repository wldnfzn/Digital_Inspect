import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';
import * as bcrypt from 'bcryptjs';

const usersRoutes = new Hono();

usersRoutes.use('*', authMiddleware);

// Get list of mechanics (accessible by Admin/Manager for scheduling)
usersRoutes.get('/mechanics', roleGuard(['SUPER_ADMIN', 'MANAGER']), async (c) => {
  try {
    const mechanics = await sql`
      SELECT id, full_name, email 
      FROM users 
      WHERE role = 'MECHANIC' AND is_active = true
      ORDER BY full_name ASC
    `;
    return c.json({ data: mechanics });
  } catch (error) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// GET all users (SUPER_ADMIN only)
usersRoutes.get('/', roleGuard(['SUPER_ADMIN']), async (c) => {
  try {
    const users = await sql`
      SELECT id, full_name, email, role, is_active, last_login_at as last_login
      FROM users
      ORDER BY created_at DESC
    `;
    return c.json({ data: users });
  } catch (error) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// POST new user
usersRoutes.post('/', roleGuard(['SUPER_ADMIN']), async (c) => {
  try {
    const { full_name, email, password, role } = await c.req.json();
    
    if (!full_name || !email || !password || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if email exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return c.json({ error: 'Email already exists' }, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await sql`
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES (${full_name}, ${email}, ${password_hash}, ${role})
      RETURNING id, full_name, email, role, is_active
    `;

    return c.json({ message: 'User created successfully', data: result[0] }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// PUT update user
usersRoutes.put('/:id', roleGuard(['SUPER_ADMIN']), async (c) => {
  try {
    const id = c.req.param('id');
    const { full_name, email, role, is_active, password } = await c.req.json();

    let query;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      query = sql`
        UPDATE users 
        SET full_name = ${full_name ?? null}, email = ${email ?? null}, role = ${role ?? null}, is_active = ${is_active ?? false}, password_hash = ${password_hash}
        WHERE id = ${id}
        RETURNING id, full_name, email, role, is_active
      `;
    } else {
      query = sql`
        UPDATE users 
        SET full_name = ${full_name ?? null}, email = ${email ?? null}, role = ${role ?? null}, is_active = ${is_active ?? false}
        WHERE id = ${id}
        RETURNING id, full_name, email, role, is_active
      `;
    }

    const result = await query;
    return c.json({ message: 'User updated successfully', data: result[0] });
  } catch (error) {
    console.error(error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default usersRoutes;
