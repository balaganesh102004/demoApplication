/**
 * Vercel serverless entry-point.
 * No app.listen() — Vercel invokes the default export as a handler function.
 * DATABASE_URL must be set in Vercel project environment variables.
 */
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import usersRouter          from './routes/users.js';
import kanbanRouter         from './routes/kanban.js';
import activitiesRouter     from './routes/activities.js';
import settingsRouter       from './routes/settings.js';
import filesRouter          from './routes/files.js';
import formSubmissionsRouter from './routes/formSubmissions.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users',            usersRouter);
app.use('/api/kanban',           kanbanRouter);
app.use('/api/activities',       activitiesRouter);
app.use('/api/settings',         settingsRouter);
app.use('/api/files',            filesRouter);
app.use('/api/form-submissions', formSubmissionsRouter);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', backend: 'postgres' }));

// Initialise schema once per cold start (idempotent — IF NOT EXISTS)
let ready = false;
let initError = null;

export default async function handler(req, res) {
  if (!ready && !initError) {
    try {
      await initDb();
      ready = true;
    } catch (err) {
      initError = err;
      console.error('DB init failed:', err.message);
    }
  }
  if (initError) {
    return res.status(503).json({ error: 'Database initialisation failed', detail: initError.message });
  }
  app(req, res);
}
