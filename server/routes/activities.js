import { Router } from 'express';
import { read, insert } from '../db.js';

const router = Router();
const C = 'activities';

router.get('/', (_req, res) => {
  const rows = read(C).slice(-20).reverse();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { action, status } = req.body;
  if (!action) return res.status(400).json({ error: 'action required' });
  const rec = insert(C, { action, status: status || 'info' });
  res.status(201).json(rec);
});

export default router;
