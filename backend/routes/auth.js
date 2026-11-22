const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { full_name, email, password, role } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  // Prevent self-registration as 'admin'
  const assignedRole = role === 'agent' ? 'agent' : 'user';
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const info = db.prepare(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(full_name.trim(), normalizedEmail, passwordHash, assignedRole);

    const newUser = {
      id: info.lastInsertRowid,
      full_name: full_name.trim(),
      email: normalizedEmail,
      role: assignedRole
    };

    const token = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = db.prepare(
      'SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?'
    ).get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const payload = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ user: payload, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;