import { Router } from 'express';
import { read, write, insert, update, remove } from '../db.js';

const router = Router();
const C = 'kanban';
const COLS = 'kanban_columns';

// Columns
router.get('/columns', (_req, res) => {
  let cols = read(COLS);
  if (cols.length === 0) cols = [];
  res.json(cols);
});

router.post('/columns', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const rec = insert(COLS, { name });
  res.status(201).json(rec);
});

router.delete('/columns/:id', (req, res) => {
  const ok = remove(COLS, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  // remove cards in that column too
  const cards = read(C).filter(c => String(c.columnId) !== req.params.id);
  write(C, cards);
  res.json({ success: true });
});

// Cards
router.get('/cards', (req, res) => {
  const { columnId } = req.query;
  let cards = read(C);
  if (columnId) cards = cards.filter(c => String(c.columnId) === String(columnId));
  res.json(cards);
});

router.post('/cards', (req, res) => {
  const { title, columnId } = req.body;
  if (!title || !columnId) return res.status(400).json({ error: 'title and columnId required' });
  const rec = insert(C, { title, columnId: Number(columnId) });
  res.status(201).json(rec);
});

router.patch('/cards/:id', (req, res) => {
  const updated = update(C, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/cards/:id', (req, res) => {
  const ok = remove(C, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

export default router;
