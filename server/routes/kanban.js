import { Router } from 'express';
import { getColumns, insertColumn, deleteColumn, getCards, insertCard, updateCard, deleteCard } from '../db.js';

const router = Router();

router.get('/columns', async (_req, res) => {
  try { res.json(await getColumns()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/columns', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try { res.status(201).json(await insertColumn({ name })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/columns/:id', async (req, res) => {
  try {
    const ok = await deleteColumn(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/cards', async (req, res) => {
  try { res.json(await getCards(req.query)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/cards', async (req, res) => {
  const { title, columnId } = req.body;
  if (!title || !columnId) return res.status(400).json({ error: 'title and columnId required' });
  try { res.status(201).json(await insertCard({ title, columnId: Number(columnId) })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/cards/:id', async (req, res) => {
  try {
    const updated = await updateCard(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/cards/:id', async (req, res) => {
  try {
    const ok = await deleteCard(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
