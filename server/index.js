import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';
import kanbanRouter from './routes/kanban.js';
import activitiesRouter from './routes/activities.js';
import settingsRouter from './routes/settings.js';
import filesRouter from './routes/files.js';
import formSubmissionsRouter from './routes/formSubmissions.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/kanban', kanbanRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/files', filesRouter);
app.use('/api/form-submissions', formSubmissionsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
