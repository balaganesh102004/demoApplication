import { Router } from 'express';
import { getFormSubmissions, insertFormSubmission } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try { res.json(await getFormSubmissions()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await insertFormSubmission(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
