"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../middleware/auth");
const notificationsRoutes = new hono_1.Hono();
notificationsRoutes.use('*', auth_1.authMiddleware);
notificationsRoutes.get('/', async (c) => {
    try {
        const user = c.get('user');
        const notifications = await (0, db_1.default) `
      SELECT * FROM notifications
      WHERE user_id = ${user.userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
        return c.json({ data: notifications });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
notificationsRoutes.put('/:id/read', async (c) => {
    try {
        const { id } = c.req.param();
        const user = c.get('user');
        await (0, db_1.default) `
      UPDATE notifications 
      SET is_read = true 
      WHERE id = ${id} AND user_id = ${user.userId}
    `;
        return c.json({ message: 'Marked as read' });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
exports.default = notificationsRoutes;
