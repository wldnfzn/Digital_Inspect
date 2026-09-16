"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../middleware/auth");
const auditRoutes = new hono_1.Hono();
auditRoutes.use('*', auth_1.authMiddleware);
auditRoutes.use('*', (0, auth_1.roleGuard)(['SUPER_ADMIN']));
auditRoutes.get('/', async (c) => {
    try {
        const logs = await (0, db_1.default) `
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100
    `;
        return c.json({ data: logs });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
exports.default = auditRoutes;
