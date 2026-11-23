const router = require('express').Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM cities ORDER BY name').all());
});

router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, region } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const info = db.prepare('INSERT INTO cities (name, region) VALUES (?, ?)').run(name.trim(), region || null);
    res.status(201).json(db.prepare('SELECT * FROM cities WHERE id = ?').get(info.lastInsertRowid));
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'City already exists' });
    throw e;
  }
});

router.put('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, region } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare('UPDATE cities SET name = ?, region = ? WHERE id = ?').run(name.trim(), region || null, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'City not found' });
  res.json(db.prepare('SELECT * FROM cities WHERE id = ?').get(req.params.id));
});

router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const info = db.prepare('DELETE FROM cities WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'City not found' });
    res.status(204).end();
  } catch (e) {
    if (String(e.message).includes('FOREIGN KEY')) {
      return res.status(409).json({ error: 'City still has listings' });
    }
    throw e;
  }
});

module.exports = router;
