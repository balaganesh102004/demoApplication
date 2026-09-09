import { Router } from 'express';
import { getFiles, insertFile, updateFile, deleteFile } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try { res.json(await getFiles()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try { res.status(201).json(await insertFile(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const updated = await updateFile(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteFile(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/upload', async (req, res) => {
  try {
    const success = Math.random() > 0.3;
    const updated = await updateFile(req.params.id, { status: success ? 'success' : 'error', progress: 100 });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
