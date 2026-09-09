/**
 * db.js — dual-backend data layer
 *
 * If DATABASE_URL is set  → Neon (postgres) — used in production / Vercel
 * If DATABASE_URL is unset → JSON flat files — used in local dev
 *
 * All exported functions are async in both modes so callers are identical.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const USE_PG = Boolean(process.env.DATABASE_URL);

// ── Postgres (Neon) backend ────────────────────────────────────────────────
let _sql = null;
function sql() {
  if (!_sql) {
    const { neon } = await_neon();
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Dynamic import so we don't blow up when the package is present but unused
let _neonMod = null;
function await_neon() {
  if (!_neonMod) {
    // synchronous-style trick — module was already loaded at startup via top-level
    // but we keep it lazy so JSON mode never touches it
    throw new Error('Call initDb() first to load the neon driver');
  }
  return _neonMod;
}

// ── JSON file backend ──────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.join(__dirname, 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(collection) { return path.join(DATA_DIR, `${collection}.json`); }

function jsonRead(collection) {
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

function jsonWrite(collection, data) {
  ensureDataDir();
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2));
}

function jsonInsert(collection, record) {
  const rows  = jsonRead(collection);
  const maxId = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  const rec   = { ...record, id: maxId + 1, createdAt: new Date().toISOString() };
  rows.push(rec);
  jsonWrite(collection, rows);
  return rec;
}

function jsonUpdate(collection, id, patch) {
  const rows = jsonRead(collection);
  const idx  = rows.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...patch, updatedAt: new Date().toISOString() };
  jsonWrite(collection, rows);
  return rows[idx];
}

function jsonDelete(collection, id) {
  const rows = jsonRead(collection);
  const idx  = rows.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return false;
  rows.splice(idx, 1);
  jsonWrite(collection, rows);
  return true;
}

function jsonMetaPath() { return path.join(DATA_DIR, 'meta.json'); }

function jsonReadMeta(key) {
  ensureDataDir();
  const fp  = jsonMetaPath();
  const all = fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf-8')) : {};
  return key ? (all[key] ?? null) : all;
}

function jsonWriteMeta(key, value) {
  ensureDataDir();
  const fp  = jsonMetaPath();
  const all = fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf-8')) : {};
  all[key]  = value;
  fs.writeFileSync(fp, JSON.stringify(all, null, 2));
}

// ── Schema bootstrap ───────────────────────────────────────────────────────
export async function initDb() {
  if (!USE_PG) {
    ensureDataDir();
    return; // JSON files need no schema
  }
  // Load neon driver dynamically
  _neonMod = await import('@neondatabase/serverless');
  _sql     = _neonMod.neon(process.env.DATABASE_URL);

  await _sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      role TEXT NOT NULL DEFAULT '',
      department TEXT NOT NULL DEFAULT '',
      join_date TEXT NOT NULL DEFAULT '',
      amount NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    )`;
  await _sql`
    CREATE TABLE IF NOT EXISTS kanban_columns (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await _sql`
    CREATE TABLE IF NOT EXISTS kanban_cards (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      column_id INTEGER NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    )`;
  await _sql`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      action TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'info',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await _sql`
    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      size BIGINT NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      progress INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    )`;
  await _sql`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await _sql`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
}

// ── Meta ───────────────────────────────────────────────────────────────────
export async function readMeta(key) {
  if (!USE_PG) return jsonReadMeta(key);
  const db = _sql;
  if (key) {
    const rows = await db`SELECT value FROM app_meta WHERE key = ${key}`;
    return rows.length ? rows[0].value : null;
  }
  const rows = await db`SELECT key, value FROM app_meta`;
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export async function writeMeta(key, value) {
  if (!USE_PG) { jsonWriteMeta(key, value); return; }
  await _sql`
    INSERT INTO app_meta (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
}

// ── Users ──────────────────────────────────────────────────────────────────
export async function getUsers({ search, status, role, department } = {}) {
  if (!USE_PG) {
    let rows = jsonRead('users');
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q));
    }
    if (status && status !== 'all') rows = rows.filter(r => r.status === status);
    if (role   && role   !== 'all') rows = rows.filter(r => r.role === role);
    if (department && department !== 'all') rows = rows.filter(r => r.department === department);
    return rows;
  }
  let rows = await _sql`SELECT * FROM users ORDER BY id`;
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q));
  }
  if (status && status !== 'all') rows = rows.filter(r => r.status === status);
  if (role   && role   !== 'all') rows = rows.filter(r => r.role === role);
  if (department && department !== 'all') rows = rows.filter(r => r.department === department);
  return rows.map(normalizeUser);
}

export async function getUser(id) {
  if (!USE_PG) return jsonRead('users').find(r => String(r.id) === String(id)) ?? null;
  const rows = await _sql`SELECT * FROM users WHERE id = ${id}`;
  return rows.length ? normalizeUser(rows[0]) : null;
}

export async function insertUser({ name, email, status, role, department, joinDate, amount }) {
  if (!USE_PG) {
    return jsonInsert('users', {
      name, email,
      status: status || 'pending',
      role: role || '',
      department: department || '',
      joinDate: joinDate || '',
      amount: Number(amount) || 0,
    });
  }
  const rows = await _sql`
    INSERT INTO users (name, email, status, role, department, join_date, amount)
    VALUES (${name}, ${email}, ${status || 'pending'}, ${role || ''}, ${department || ''}, ${joinDate || ''}, ${amount || 0})
    RETURNING *`;
  return normalizeUser(rows[0]);
}

export async function updateUser(id, patch) {
  if (!USE_PG) return jsonUpdate('users', id, patch);
  const rows = await _sql`
    UPDATE users SET
      name       = COALESCE(${patch.name       ?? null}, name),
      email      = COALESCE(${patch.email      ?? null}, email),
      status     = COALESCE(${patch.status     ?? null}, status),
      role       = COALESCE(${patch.role       ?? null}, role),
      department = COALESCE(${patch.department ?? null}, department),
      updated_at = NOW()
    WHERE id = ${id} RETURNING *`;
  return rows.length ? normalizeUser(rows[0]) : null;
}

export async function deleteUser(id) {
  if (!USE_PG) return jsonDelete('users', id);
  const rows = await _sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

function normalizeUser(r) {
  return {
    id: r.id, name: r.name, email: r.email,
    status: r.status, role: r.role, department: r.department,
    joinDate: r.join_date, amount: Number(r.amount),
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// ── Kanban ─────────────────────────────────────────────────────────────────
export async function getColumns() {
  if (!USE_PG) return jsonRead('kanban_columns');
  const rows = await _sql`SELECT * FROM kanban_columns ORDER BY id`;
  return rows.map(r => ({ id: r.id, name: r.name, createdAt: r.created_at }));
}

export async function insertColumn({ name }) {
  if (!USE_PG) return jsonInsert('kanban_columns', { name });
  const rows = await _sql`INSERT INTO kanban_columns (name) VALUES (${name}) RETURNING *`;
  return { id: rows[0].id, name: rows[0].name, createdAt: rows[0].created_at };
}

export async function deleteColumn(id) {
  if (!USE_PG) {
    const ok = jsonDelete('kanban_columns', id);
    if (ok) {
      // cascade: remove cards in that column
      const cards = jsonRead('kanban').filter(c => String(c.columnId) !== String(id));
      jsonWrite('kanban', cards);
    }
    return ok;
  }
  const rows = await _sql`DELETE FROM kanban_columns WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getCards({ columnId } = {}) {
  if (!USE_PG) {
    const rows = jsonRead('kanban');
    return columnId ? rows.filter(c => String(c.columnId) === String(columnId)) : rows;
  }
  const rows = columnId
    ? await _sql`SELECT * FROM kanban_cards WHERE column_id = ${columnId} ORDER BY id`
    : await _sql`SELECT * FROM kanban_cards ORDER BY id`;
  return rows.map(normalizeCard);
}

export async function insertCard({ title, columnId }) {
  if (!USE_PG) return jsonInsert('kanban', { title, columnId: Number(columnId) });
  const rows = await _sql`
    INSERT INTO kanban_cards (title, column_id) VALUES (${title}, ${columnId}) RETURNING *`;
  return normalizeCard(rows[0]);
}

export async function updateCard(id, patch) {
  if (!USE_PG) return jsonUpdate('kanban', id, patch);
  const rows = await _sql`
    UPDATE kanban_cards SET
      title     = COALESCE(${patch.title    ?? null}, title),
      column_id = COALESCE(${patch.columnId ?? null}, column_id),
      updated_at = NOW()
    WHERE id = ${id} RETURNING *`;
  return rows.length ? normalizeCard(rows[0]) : null;
}

export async function deleteCard(id) {
  if (!USE_PG) return jsonDelete('kanban', id);
  const rows = await _sql`DELETE FROM kanban_cards WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

function normalizeCard(r) {
  return { id: r.id, title: r.title, columnId: r.column_id, createdAt: r.created_at };
}

// ── Activities ─────────────────────────────────────────────────────────────
export async function getActivities() {
  if (!USE_PG) return jsonRead('activities').slice(-20).reverse();
  const rows = await _sql`SELECT * FROM activities ORDER BY created_at DESC LIMIT 20`;
  return rows.map(r => ({ id: r.id, action: r.action, status: r.status, createdAt: r.created_at }));
}

export async function insertActivity({ action, status }) {
  if (!USE_PG) return jsonInsert('activities', { action, status: status || 'info' });
  const rows = await _sql`
    INSERT INTO activities (action, status) VALUES (${action}, ${status || 'info'}) RETURNING *`;
  return { id: rows[0].id, action: rows[0].action, status: rows[0].status, createdAt: rows[0].created_at };
}

// ── Files ──────────────────────────────────────────────────────────────────
export async function getFiles() {
  if (!USE_PG) return jsonRead('files');
  const rows = await _sql`SELECT * FROM files ORDER BY id`;
  return rows.map(normalizeFile);
}

export async function insertFile({ name, size, type }) {
  if (!USE_PG) return jsonInsert('files', { name, size: size || 0, type: type || '', status: 'pending', progress: 0 });
  const rows = await _sql`
    INSERT INTO files (name, size, type) VALUES (${name}, ${size || 0}, ${type || ''}) RETURNING *`;
  return normalizeFile(rows[0]);
}

export async function updateFile(id, patch) {
  if (!USE_PG) return jsonUpdate('files', id, patch);
  const rows = await _sql`
    UPDATE files SET
      status     = COALESCE(${patch.status   ?? null}, status),
      progress   = COALESCE(${patch.progress ?? null}, progress),
      updated_at = NOW()
    WHERE id = ${id} RETURNING *`;
  return rows.length ? normalizeFile(rows[0]) : null;
}

export async function deleteFile(id) {
  if (!USE_PG) return jsonDelete('files', id);
  const rows = await _sql`DELETE FROM files WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

function normalizeFile(r) {
  return {
    id: r.id, name: r.name, size: Number(r.size),
    type: r.type, status: r.status, progress: r.progress,
    createdAt: r.created_at,
  };
}

// ── Form submissions ────────────────────────────────────────────────────────
export async function getFormSubmissions() {
  if (!USE_PG) return jsonRead('form_submissions');
  const rows = await _sql`SELECT * FROM form_submissions ORDER BY id`;
  return rows.map(r => ({ id: r.id, ...r.data, createdAt: r.created_at }));
}

export async function insertFormSubmission(data) {
  if (!USE_PG) return jsonInsert('form_submissions', data);
  const rows = await _sql`
    INSERT INTO form_submissions (data) VALUES (${JSON.stringify(data)}) RETURNING *`;
  return { id: rows[0].id, ...rows[0].data, createdAt: rows[0].created_at };
}

// ── Reset ──────────────────────────────────────────────────────────────────
export async function resetAll() {
  if (!USE_PG) {
    // Wipe data collections but keep meta (form options, theme, user settings)
    ['users', 'kanban', 'kanban_columns', 'files', 'form_submissions', 'activities'].forEach(c => {
      jsonWrite(c, []);
    });
    return;
  }
  // Postgres: truncate data tables, leave app_meta intact
  await _sql`TRUNCATE users, kanban_cards, kanban_columns, files, form_submissions, activities RESTART IDENTITY CASCADE`;
}
