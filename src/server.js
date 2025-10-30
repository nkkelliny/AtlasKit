// src/server.js
import path from 'node:path';
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import slugify from 'slugify';
import { pool } from './db.js';
import { signup, login, logout, requireAuth, me } from './auth.js';

dotenv.config();
const app = express();
const PORT = +(process.env.PORT || 5173);
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

app.use(helmet({
  // Relax CSP so Leaflet + CDN tiles load without hassle
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ---------- Auth routes ----------
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/me', requireAuth, me);

// ---------- Map CRUD ----------
app.get('/api/maps', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, visibility, slug, created_at, updated_at FROM maps WHERE user_id = ? ORDER BY updated_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

app.get('/api/maps/:id', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, visibility, slug, cfg_json, created_at, updated_at FROM maps WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

app.post('/api/maps', requireAuth, async (req, res) => {
  const { name, cfg, visibility = 'unlisted' } = req.body || {};
  if (!name || !cfg) return res.status(400).json({ error: 'Missing name or config' });

  const slugBase = slugify(name, { lower: true, strict: true }) || 'map';
  let slug = slugBase;
  for (let i = 0; i < 5; i++) {
    const [check] = await pool.query('SELECT id FROM maps WHERE slug = ?', [slug]);
    if (!check.length) break;
    slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const [ins] = await pool.query(
    'INSERT INTO maps (user_id, name, cfg_json, visibility, slug) VALUES (?, ?, CAST(? AS JSON), ?, ?)',
    [req.user.id, name, JSON.stringify(cfg), visibility, slug]
  );
  res.json({ id: ins.insertId, slug });
});

app.put('/api/maps/:id', requireAuth, async (req, res) => {
  const { name, cfg, visibility } = req.body || {};
  const [rows] = await pool.query('SELECT id FROM maps WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });

  await pool.query(
    'UPDATE maps SET name = COALESCE(?, name), cfg_json = COALESCE(CAST(? AS JSON), cfg_json), visibility = COALESCE(?, visibility) WHERE id = ?',
    [name ?? null, cfg ? JSON.stringify(cfg) : null, visibility ?? null, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/maps/:id', requireAuth, async (req, res) => {
  const [rows] = await pool.query('DELETE FROM maps WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ ok: true, affected: rows.affectedRows || 0 });
});

// ---------- Public share ----------
app.get('/api/share/:slug', async (req, res) => {
  const [rows] = await pool.query(
    "SELECT name, cfg_json FROM maps WHERE slug = ? AND visibility IN ('unlisted','public')",
    [req.params.slug]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// Pretty share page
app.get('/s/:slug', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'share.html'));
});

// ---------- Builder routes (pretty + .html) ----------
app.get(['/builder', '/builder.html'], (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'builder.html'));
});

// ---------- Static ----------
app.use(express.static(PUBLIC_DIR));

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`AtlasKit SaaS running on http://localhost:${PORT}`);
});
