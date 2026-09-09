import { Router } from 'express';
import { read, insert } from '../db.js';

const router = Router();
const C = 'form_submissions';

router.get('/', (_req, res) => {
  res.json(read(C));
});

router.post('/', (req, res) => {
  const rec = insert(C, req.body);
  res.status(201).json(rec);
});

export default router;
