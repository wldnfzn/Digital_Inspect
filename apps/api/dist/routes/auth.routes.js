"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../middleware/auth");
const authRoutes = new hono_1.Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';
authRoutes.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        if (!email || !password) {
            return c.json({ error: 'Email and password are required' }, 400);
        }
        const users = await (0, db_1.default) `
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
        await (0, db_1.default) `UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`;
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
    }
    catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// Get current user profile (requires auth token)
authRoutes.get('/me', auth_1.authMiddleware, async (c) => {
    const userPayload = c.get('user');
    try {
        const users = await (0, db_1.default) `
      SELECT id, email, full_name, role, avatar_url, is_active, created_at
      FROM users
      WHERE id = ${userPayload.userId}
    `;
        if (users.length === 0) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json({ user: users[0] });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
exports.default = authRoutes;
