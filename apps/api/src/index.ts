import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { handle } from 'hono/vercel';

// Nanti akan diimport routes yang dibuat:
// import authRoutes from './routes/auth.routes';
// import customersRoutes from './routes/customers.routes';
// dll

import authRoutes from './routes/auth.routes';
import customersRoutes from './routes/customers.routes';
import forkliftsRoutes from './routes/forklifts.routes';
import batteriesRoutes from './routes/batteries.routes';
import inspectionsRoutes from './routes/inspections.routes';
import usersRoutes from './routes/users.routes';
import reportsRoutes from './routes/reports.routes';
import dashboardRoutes from './routes/dashboard.routes';
import notificationsRoutes from './routes/notifications.routes';
import auditRoutes from './routes/audit.routes';
import settingsRoutes from './routes/settings.routes';

const app = new Hono();

// Middlewares
app.use('*', logger());
app.use('*', cors({
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

app.route('/auth', authRoutes);
app.route('/customers', customersRoutes);
app.route('/forklifts', forkliftsRoutes);
app.route('/batteries', batteriesRoutes);
app.route('/inspections', inspectionsRoutes);
app.route('/dashboard', dashboardRoutes);
app.route('/notifications', notificationsRoutes);
app.route('/audit', auditRoutes);
app.route('/users', usersRoutes);
app.route('/reports', reportsRoutes);
app.route('/settings', settingsRoutes);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;



export default handle(app);
