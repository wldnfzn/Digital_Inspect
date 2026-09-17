import { Hono } from 'hono';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import sql from '../lib/db';
import { authMiddleware } from '../middleware/auth';

const authRoutes = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    console.log('Login attempt for:', email);
    const users = await sql`
      SELECT id, email, password_hash, full_name, role, avatar_url, is_active
      FROM users
      WHERE email = ${email}
    `;
    console.log('Query returned', users.length, 'users');

    if (users.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = users[0];

    console.log('Checking active status');
    if (!user.is_active) {
      return c.json({ error: 'Account is inactive' }, 403);
    }

    console.log('Comparing bcrypt password');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    console.log('Updating last login');
    // Update last login
    await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`;
    
    console.log('Generating JWT');

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
