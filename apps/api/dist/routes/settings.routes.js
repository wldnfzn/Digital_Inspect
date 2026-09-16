"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../middleware/auth");
const settingsRoutes = new hono_1.Hono();
settingsRoutes.use('*', auth_1.authMiddleware);
// ====================
// FORKLIFT TEMPLATES
// ====================
settingsRoutes.get('/templates/forklift', async (c) => {
    try {
        const categories = await (0, db_1.default) `SELECT * FROM inspection_categories ORDER BY sort_order ASC, created_at ASC`;
        const items = await (0, db_1.default) `SELECT * FROM inspection_items ORDER BY sort_order ASC, created_at ASC`;
        const mapped = categories.map(cat => ({
            ...cat,
            items: items.filter(i => i.category_id === cat.id)
        }));
        return c.json({ data: mapped });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// Sync full template structure
settingsRoutes.post('/templates/forklift/sync', (0, auth_1.roleGuard)(['SUPER_ADMIN']), async (c) => {
    try {
        const { categories } = await c.req.json(); // Expected format: [{ name: '...', items: [{name: '...'}, ...] }]
        // We do a full replace for simplicity in this demo, though ideally we should upsert
        await (0, db_1.default) `DELETE FROM inspection_categories`; // cascade will delete items
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const [newCat] = await (0, db_1.default) `
        INSERT INTO inspection_categories (name, sort_order) 
        VALUES (${cat.name}, ${i}) RETURNING id
      `;
            if (cat.items && cat.items.length > 0) {
                for (let j = 0; j < cat.items.length; j++) {
                    const item = cat.items[j];
                    await (0, db_1.default) `
            INSERT INTO inspection_items (category_id, name, is_critical, sort_order)
            VALUES (${newCat.id}, ${typeof item === 'string' ? item : item.name}, ${false}, ${j})
          `;
                }
            }
        }
        return c.json({ message: 'Template synchronized successfully' });
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
exports.default = settingsRoutes;
