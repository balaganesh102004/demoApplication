import { Router } from 'express';
import { readMeta, writeMeta, resetAll } from '../db.js';

const router = Router();

const DEFAULTS = {
  countries: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'],
  statesByCountry: {
    'United States': ['California', 'New York', 'Texas', 'Florida', 'Washington', 'Illinois'],
    'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
    'Germany': ['Bavaria', 'Berlin', 'Hamburg', 'North Rhine-Westphalia'],
    'France': ['Île-de-France', 'Provence', 'Normandy', 'Brittany'],
  },
  roles: ['Developer', 'Designer', 'Manager', 'Tester', 'DevOps Engineer', 'Product Owner', 'Analyst'],
  departments: ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Support', 'HR', 'Finance'],
  statuses: ['active', 'inactive', 'pending'],
};

async function getOptions() {
  const meta = (await readMeta()) || {};
  for (const [key, def] of Object.entries(DEFAULTS)) {
    const cur = meta[key];
    const empty = !cur || (Array.isArray(cur) && cur.length === 0) ||
                  (typeof cur === 'object' && !Array.isArray(cur) && Object.keys(cur).length === 0);
    if (empty) {
      await writeMeta(key, def);
      meta[key] = def;
    }
  }
  return meta;
}

router.get('/', async (_req, res) => {
  try {
    const meta = (await readMeta()) || {};
    res.json({
      theme: meta.theme || 'system',
      user: meta.user || { name: 'Test User', email: 'testuser@example.com', role: 'Administrator' },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/', async (req, res) => {
  try {
    const { theme, user } = req.body;
    if (theme !== undefined) await writeMeta('theme', theme);
    if (user  !== undefined) await writeMeta('user', user);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/reset', async (_req, res) => {
  try {
    await resetAll();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/form-options', async (_req, res) => {
  try {
    const meta = await getOptions();
    res.json({
      countries:       meta.countries,
      statesByCountry: meta.statesByCountry,
      roles:           meta.roles,
      departments:     meta.departments,
      statuses:        meta.statuses,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/form-options', async (req, res) => {
  try {
    const { countries, statesByCountry, roles, departments, statuses } = req.body;
    if (countries)       await writeMeta('countries', countries);
    if (statesByCountry) await writeMeta('statesByCountry', statesByCountry);
    if (roles)           await writeMeta('roles', roles);
    if (departments)     await writeMeta('departments', departments);
    if (statuses)        await writeMeta('statuses', statuses);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
