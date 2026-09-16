"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const logger_1 = require("hono/logger");
const vercel_1 = require("@hono/node-server/vercel");
// Nanti akan diimport routes yang dibuat:
// import authRoutes from './routes/auth.routes';
// import customersRoutes from './routes/customers.routes';
// dll
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const customers_routes_1 = __importDefault(require("./routes/customers.routes"));
const forklifts_routes_1 = __importDefault(require("./routes/forklifts.routes"));
const batteries_routes_1 = __importDefault(require("./routes/batteries.routes"));
const inspections_routes_1 = __importDefault(require("./routes/inspections.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const app = new hono_1.Hono();
// Middlewares
app.use('*', (0, logger_1.logger)());
app.use('*', (0, cors_1.cors)({
    origin: '*', // Untuk development, allow all
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
// Global error handler
app.onError((err, c) => {
    console.error(err);
    return c.json({ error: err.message || 'Internal Server Error' }, 500);
});
// Basic Health Check Route
app.get('/health', (c) => {
    return c.json({ status: 'ok', message: 'Digital Inspect API is running' });
});
app.route('/auth', auth_routes_1.default);
app.route('/customers', customers_routes_1.default);
app.route('/forklifts', forklifts_routes_1.default);
app.route('/batteries', batteries_routes_1.default);
app.route('/inspections', inspections_routes_1.default);
app.route('/dashboard', dashboard_routes_1.default);
app.route('/notifications', notifications_routes_1.default);
app.route('/audit', audit_routes_1.default);
app.route('/users', users_routes_1.default);
app.route('/reports', reports_routes_1.default);
app.route('/settings', settings_routes_1.default);
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
exports.default = (0, vercel_1.handle)(app);
