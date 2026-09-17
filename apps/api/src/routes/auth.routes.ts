import { Hono } from 'hono';
import sql from '../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth';
import { logAudit } from '../lib/audit';

const authRoutes = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const users = await sql`
      SELECT id, email, password_hash, full_name, role, avatar_url, is_active
      FROM users
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = users[0];

    if (!user.is_active) {
      return c.json({ error: 'Account is inactive' }, 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Update last login
    await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`;
    
    await logAudit(user.id, user.full_name, 'USER_LOGIN', 'System', `User ${user.email} logged in`);

    // Sign JWT
    const payload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password hash from response
    const { password_hash, ...userProfile } = user;

    return c.json({
      message: 'Login successful',
      token,
      user: userProfile,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// Get current user profile (requires auth token)
authRoutes.get('/me', authMiddleware, async (c) => {
  const userPayload = c.get('user');

  try {
    const users = await sql`
      SELECT id, email, full_name, role, avatar_url, is_active, created_at
      FROM users
      WHERE id = ${userPayload.userId}
    `;

    if (users.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: users[0] });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default authRoutes;
