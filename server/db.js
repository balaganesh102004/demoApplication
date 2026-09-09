import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

export function read(collection) {
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

export function write(collection, data) {
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2));
}

export function readOne(collection, id) {
  return read(collection).find(r => String(r.id) === String(id)) ?? null;
}

export function insert(collection, record) {
  const rows = read(collection);
  const maxId = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  const newRecord = { ...record, id: maxId + 1, createdAt: new Date().toISOString() };
  rows.push(newRecord);
  write(collection, rows);
  return newRecord;
}

export function update(collection, id, patch) {
  const rows = read(collection);
  const idx = rows.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...patch, updatedAt: new Date().toISOString() };
  write(collection, rows);
  return rows[idx];
}

export function remove(collection, id) {
  const rows = read(collection);
  const idx = rows.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return false;
  rows.splice(idx, 1);
  write(collection, rows);
  return true;
}

export function reset(collection) {
  write(collection, []);
}

export function readMeta(key) {
  const fp = path.join(DATA_DIR, 'meta.json');
  if (!fs.existsSync(fp)) return null;
  const meta = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  return key ? (meta[key] ?? null) : meta;
}

export function writeMeta(key, value) {
  const fp = path.join(DATA_DIR, 'meta.json');
  const meta = fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf-8')) : {};
  meta[key] = value;
  fs.writeFileSync(fp, JSON.stringify(meta, null, 2));
}
