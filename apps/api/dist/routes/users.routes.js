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
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../middleware/auth");
const bcrypt = __importStar(require("bcryptjs"));
const usersRoutes = new hono_1.Hono();
usersRoutes.use('*', auth_1.authMiddleware);
// Get list of mechanics (accessible by Admin/Manager for scheduling)
usersRoutes.get('/mechanics', (0, auth_1.roleGuard)(['SUPER_ADMIN', 'MANAGER']), async (c) => {
    try {
        const mechanics = await (0, db_1.default) `
      SELECT id, full_name, email 
      FROM users 
      WHERE role = 'MECHANIC' AND is_active = true
      ORDER BY full_name ASC
    `;
        return c.json({ data: mechanics });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// GET all users (SUPER_ADMIN only)
usersRoutes.get('/', (0, auth_1.roleGuard)(['SUPER_ADMIN']), async (c) => {
    try {
        const users = await (0, db_1.default) `
      SELECT id, full_name, email, role, is_active, last_login_at as last_login
      FROM users
      ORDER BY created_at DESC
    `;
        return c.json({ data: users });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// POST new user
usersRoutes.post('/', (0, auth_1.roleGuard)(['SUPER_ADMIN']), async (c) => {
    try {
        const { full_name, email, password, role } = await c.req.json();
        if (!full_name || !email || !password || !role) {
            return c.json({ error: 'Missing required fields' }, 400);
        }
        // Check if email exists
        const existing = await (0, db_1.default) `SELECT id FROM users WHERE email = ${email}`;
        if (existing.length > 0) {
            return c.json({ error: 'Email already exists' }, 400);
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const result = await (0, db_1.default) `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES (${full_name}, ${email}, ${password_hash}, ${role})
      RETURNING id, full_name, email, role, is_active
    `;
        return c.json({ message: 'User created successfully', data: result[0] }, 201);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// PUT update user
usersRoutes.put('/:id', (0, auth_1.roleGuard)(['SUPER_ADMIN']), async (c) => {
    try {
        const id = c.req.param('id');
        const { full_name, email, role, is_active, password } = await c.req.json();
        let query;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            query = (0, db_1.default) `
        UPDATE users 
        SET full_name = ${full_name ?? null}, email = ${email ?? null}, role = ${role ?? null}, is_active = ${is_active ?? false}, password_hash = ${password_hash}
        WHERE id = ${id}
        RETURNING id, full_name, email, role, is_active
      `;
        }
        else {
            query = (0, db_1.default) `
        UPDATE users 
        SET full_name = ${full_name ?? null}, email = ${email ?? null}, role = ${role ?? null}, is_active = ${is_active ?? false}
        WHERE id = ${id}
        RETURNING id, full_name, email, role, is_active
      `;
        }
        const result = await query;
        return c.json({ message: 'User updated successfully', data: result[0] });
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
exports.default = usersRoutes;
