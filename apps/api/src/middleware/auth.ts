import { Context, Next } from 'hono';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

// Extend Hono's Context variables type
declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    // Set user data in context variable so subsequent routes can access it
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized: Invalid or expired token' }, 401);
  }
};

export const roleGuard = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JwtPayload | undefined;
    
    if (!user) {
      return c.json({ error: 'Unauthorized: No user found in context' }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
    }

    await next();
  };
};
