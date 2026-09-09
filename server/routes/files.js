import { Router } from 'express';
import { read, insert, update, remove } from '../db.js';

const router = Router();
const C = 'files';

router.get('/', (_req, res) => res.json(read(C)));

router.post('/', (req, res) => {
  const { name, size, type } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const rec = insert(C, { name, size, type, status: 'pending', progress: 0 });
  res.status(201).json(rec);
});

router.patch('/:id', (req, res) => {
  const updated = update(C, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const ok = remove(C, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// simulate upload
router.post('/:id/upload', async (req, res) => {
  const file = read(C).find(f => String(f.id) === req.params.id);
  if (!file) return res.status(404).json({ error: 'Not found' });
  // 70% success rate for testing purposes
  const success = Math.random() > 0.3;
  const updated = update(C, req.params.id, {
    status: success ? 'success' : 'error',
    progress: 100,
  });
  res.json(updated);
});

export default router;
