import { Router } from 'express';
import { getActivities, insertActivity } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try { res.json(await getActivities()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { action } = req.body;
  if (!action) return res.status(400).json({ error: 'action required' });
  try { res.status(201).json(await insertActivity(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
