/**
 * Vercel catch-all API handler.
 * Vercel auto-detects this as a serverless function because it lives in /api/.
 * All /api/* requests are routed here by vercel.json rewrites.
 */
import express from 'express';
import cors from 'cors';
import { initDb } from '../server/db.js';
import usersRouter           from '../server/routes/users.js';
import kanbanRouter          from '../server/routes/kanban.js';
import activitiesRouter      from '../server/routes/activities.js';
import settingsRouter        from '../server/routes/settings.js';
import filesRouter           from '../server/routes/files.js';
import formSubmissionsRouter from '../server/routes/formSubmissions.js';

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
    return res.status(503).json({ error: 'Database init failed', detail: initError.message });
  }
  return app(req, res);
}
