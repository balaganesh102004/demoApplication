/**
 * Local dev server entry-point.
 * Uses JSON flat files when DATABASE_URL is not set.
 * Uses Neon postgres when DATABASE_URL is set.
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

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users',            usersRouter);
app.use('/api/kanban',           kanbanRouter);
app.use('/api/activities',       activitiesRouter);
app.use('/api/settings',         settingsRouter);
app.use('/api/files',            filesRouter);
app.use('/api/form-submissions', formSubmissionsRouter);

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  backend: process.env.DATABASE_URL ? 'postgres' : 'json-files',
}));

initDb()
  .then(() => {
    const backend = process.env.DATABASE_URL ? 'Neon postgres' : 'JSON flat files';
    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}  [${backend}]`);
    });
  })
  .catch(err => {
    console.error('Failed to initialise database:', err.message);
    process.exit(1);
  });
