import { Router } from 'express';
import { readMeta, writeMeta, reset } from '../db.js';

const router = Router();

// ── Defaults seeded once on first use ────────────────────────────────────────
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

function getOptions() {
  const meta = readMeta() || {};
  // Seed defaults if any key is missing/empty
  let dirty = false;
  for (const [key, def] of Object.entries(DEFAULTS)) {
    const current = meta[key];
    const isEmpty = !current || (Array.isArray(current) && current.length === 0) ||
                    (typeof current === 'object' && !Array.isArray(current) && Object.keys(current).length === 0);
    if (isEmpty) {
      writeMeta(key, def);
      meta[key] = def;
      dirty = true;
    }
  }
  return meta;
}

router.get('/', (_req, res) => {
  const meta = readMeta() || {};
  res.json({
    theme: meta.theme || 'system',
    user: meta.user || { name: 'Test User', email: 'testuser@example.com', role: 'Administrator' },
  });
});

router.patch('/', (req, res) => {
  const { theme, user } = req.body;
  if (theme !== undefined) writeMeta('theme', theme);
  if (user !== undefined) writeMeta('user', user);
  res.json({ success: true });
});

router.post('/reset', (_req, res) => {
  const collections = ['users', 'kanban', 'kanban_columns', 'files', 'form_submissions', 'activities'];
  collections.forEach(c => reset(c));
  res.json({ success: true });
});

router.get('/form-options', (_req, res) => {
  const meta = getOptions();
  res.json({
    countries:       meta.countries,
    statesByCountry: meta.statesByCountry,
    roles:           meta.roles,
    departments:     meta.departments,
    statuses:        meta.statuses,
  });
});

router.put('/form-options', (req, res) => {
  const { countries, statesByCountry, roles, departments, statuses } = req.body;
  if (countries)       writeMeta('countries', countries);
  if (statesByCountry) writeMeta('statesByCountry', statesByCountry);
  if (roles)           writeMeta('roles', roles);
  if (departments)     writeMeta('departments', departments);
  if (statuses)        writeMeta('statuses', statuses);
  res.json({ success: true });
});

export default router;
