"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const db_1 = __importDefault(require("../lib/db"));
const auth_1 = require("../middleware/auth");
const reportsRoutes = new hono_1.Hono();
reportsRoutes.use('*', auth_1.authMiddleware);
reportsRoutes.use('*', (0, auth_1.roleGuard)(['SUPER_ADMIN', 'MANAGER']));
// GET /reports
reportsRoutes.get('/', async (c) => {
    try {
        // Fetch Forklift Inspections
        const forkliftReports = await (0, db_1.default) `
      SELECT 
        fi.id, 
        'FORKLIFT' as asset_type,
        f.asset_code,
        fi.health_percentage as score,
        fi.health_status as status,
        fi.completed_at as date,
        u.full_name as mechanic,
        c.name as customer
      FROM forklift_inspections fi
      JOIN forklifts f ON fi.forklift_id = f.id
      LEFT JOIN customers c ON f.customer_id = c.id
      JOIN users u ON fi.mechanic_id = u.id
      ORDER BY fi.completed_at DESC
    `;
        // Fetch Battery Service Reports
        const batteryReports = await (0, db_1.default) `
      SELECT 
        b.id, 
        'BATTERY' as asset_type,
        ba.asset_code,
        b.voltage_reading as score,
        CASE WHEN b.water_level = 'LOW' THEN 'ATTENTION' ELSE 'HEALTHY' END as status,
        b.completed_at as date,
        u.full_name as mechanic,
        c.name as customer
      FROM battery_service_reports b
      JOIN batteries ba ON b.battery_id = ba.id
      LEFT JOIN customers c ON ba.customer_id = c.id
      JOIN users u ON b.mechanic_id = u.id
      ORDER BY b.completed_at DESC
    `;
        const allReports = [...forkliftReports, ...batteryReports].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        return c.json({ data: allReports });
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// DELETE /reports/:type/:id
reportsRoutes.delete('/:type/:id', async (c) => {
    try {
        const { type, id } = c.req.param();
        let taskId = null;
        if (type === 'FORKLIFT') {
            const report = await (0, db_1.default) `SELECT task_id FROM forklift_inspections WHERE id = ${id}`;
            if (report.length > 0)
                taskId = report[0].task_id;
            await (0, db_1.default) `DELETE FROM forklift_inspection_scores WHERE inspection_id = ${id}`;
            await (0, db_1.default) `DELETE FROM forklift_inspections WHERE id = ${id}`;
        }
        else if (type === 'BATTERY') {
            const report = await (0, db_1.default) `SELECT task_id FROM battery_service_reports WHERE id = ${id}`;
            if (report.length > 0)
                taskId = report[0].task_id;
            await (0, db_1.default) `DELETE FROM battery_service_reports WHERE id = ${id}`;
        }
        else {
            return c.json({ error: 'Invalid type' }, 400);
        }
        // Delete associated task if exists
        if (taskId) {
            await (0, db_1.default) `DELETE FROM inspection_tasks WHERE id = ${taskId}`;
        }
        return c.json({ message: 'Report and associated task deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
exports.default = reportsRoutes;
