// src/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { pool } from './db.js';

const JWT_NAME = process.env.JWT_COOKIE_NAME || 'atlaskit_auth';
const JWT_SECRET = process.env.JWT_SECRET;

export function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = String(process.env.JWT_COOKIE_SECURE || 'false') === 'true';
  res.cookie(JWT_NAME, token, {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: secure,
    path: '/'
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(JWT_NAME, { path: '/' });
}

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies[JWT_NAME];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, plan: decoded.plan };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid auth' });
  }
}

export async function signup(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!validator.isEmail(email || '')) return res.status(400).json({ error: 'Invalid email' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password too short' });

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(409).json({ error: 'Email already registered' });

    const pass_hash = await bcrypt.hash(password, 10);
    const [ins] = await pool.query('INSERT INTO users (email, pass_hash) VALUES (?, ?)', [email, pass_hash]);

    const token = signJwt({ id: ins.insertId, plan: 'starter' });
    setAuthCookie(res, token);
    res.json({ id: ins.insertId, email, plan: 'starter' });
  } catch (e) {
    res.status(500).json({ error: 'Signup failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const [rows] = await pool.query('SELECT id, pass_hash, plan FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password || '', user.pass_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signJwt({ id: user.id, plan: user.plan });
    setAuthCookie(res, token);
    res.json({ id: user.id, email, plan: user.plan });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function me(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, email, plan, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0] || null);
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
}

export function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ ok: true });
}
