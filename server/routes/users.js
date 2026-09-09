import { Router } from 'express';
import { read, insert, update, remove } from '../db.js';

const router = Router();
const C = 'users';

router.get('/', (req, res) => {
  const { search, status, role, department } = req.query;
  let rows = read(C);
  if (search) {
    const q = String(search).toLowerCase();
    rows = rows.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q)
    );
  }
  if (status && status !== 'all') rows = rows.filter(r => r.status === status);
  if (role && role !== 'all') rows = rows.filter(r => r.role === role);
  if (department && department !== 'all') rows = rows.filter(r => r.department === department);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = read(C).find(r => String(r.id) === req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, email, status, role, department, joinDate, amount } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const record = insert(C, { name, email, status: status || 'pending', role: role || 'User', department: department || 'Engineering', joinDate: joinDate || new Date().toISOString().split('T')[0], amount: Number(amount) || 0 });
  res.status(201).json(record);
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

export default router;
