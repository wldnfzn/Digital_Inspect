"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../middleware/auth");
const forkliftsRoutes = new hono_1.Hono();
forkliftsRoutes.use('*', auth_1.authMiddleware);
forkliftsRoutes.get('/', async (c) => {
    try {
        const forklifts = await (0, db_1.default) `
      SELECT f.*, c.name as customer_name
      FROM forklifts f
      LEFT JOIN customers c ON f.customer_id = c.id
      ORDER BY f.created_at DESC
    `;
        return c.json({ data: forklifts });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
forkliftsRoutes.get('/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const forklifts = await (0, db_1.default) `
      SELECT f.*, c.name as customer_name
      FROM forklifts f
      LEFT JOIN customers c ON f.customer_id = c.id
      WHERE f.id = ${id} OR f.asset_code = ${id}
    `;
        if (forklifts.length === 0)
            return c.json({ error: 'Forklift not found' }, 404);
        return c.json({ data: forklifts[0] });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
forkliftsRoutes.post('/', (0, auth_1.roleGuard)(['SUPER_ADMIN', 'MANAGER']), async (c) => {
    try {
        const { asset_code, model, year, customer_id } = await c.req.json();
        if (!asset_code)
            return c.json({ error: 'Asset code is required' }, 400);
        const newAsset = await (0, db_1.default) `
      INSERT INTO forklifts (asset_code, model, year, customer_id)
      VALUES (${asset_code}, ${model}, ${year || null}, ${customer_id})
      RETURNING *
    `;
        return c.json({ message: 'Forklift created', data: newAsset[0] }, 201);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
forkliftsRoutes.put('/:id', (0, auth_1.roleGuard)(['SUPER_ADMIN', 'MANAGER']), async (c) => {
    try {
        const { id } = c.req.param();
        const { asset_code, model, year, customer_id } = await c.req.json();
        if (!asset_code)
            return c.json({ error: 'Asset code is required' }, 400);
        const updated = await (0, db_1.default) `
      UPDATE forklifts
      SET asset_code = ${asset_code}, model = ${model}, year = ${year || null}, customer_id = ${customer_id}
      WHERE id = ${id}
      RETURNING *
    `;
        if (updated.length === 0)
            return c.json({ error: 'Forklift not found' }, 404);
        return c.json({ message: 'Forklift updated', data: updated[0] });
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
forkliftsRoutes.delete('/:id', (0, auth_1.roleGuard)(['SUPER_ADMIN', 'MANAGER']), async (c) => {
    try {
        const { id } = c.req.param();
        const deleted = await (0, db_1.default) `
      DELETE FROM forklifts WHERE id = ${id} RETURNING id
    `;
        if (deleted.length === 0)
            return c.json({ error: 'Forklift not found' }, 404);
        return c.json({ message: 'Forklift deleted' });
    }
    catch (error) {
        return c.json({ error: 'Cannot delete forklift (may have associated tasks).' }, 400);
    }
});
exports.default = forkliftsRoutes;
