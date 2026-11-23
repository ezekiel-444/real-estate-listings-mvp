const router = require('express').Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken, requireRole('user'));

router.get('/', (req, res) => {
  res.json(db.prepare(`
    SELECT p.*, c.name AS city_name, f.created_at AS favorited_at, 1 AS is_favorite
    FROM favorites f
    JOIN properties p ON p.id = f.property_id
    JOIN cities c ON c.id = p.city_id
    WHERE f.user_id = ? ORDER BY f.created_at DESC`).all(req.user.id));
});

router.post('/:propertyId', (req, res) => {
  if (!db.prepare('SELECT 1 FROM properties WHERE id = ?').get(req.params.propertyId)) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  db.prepare('INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)').run(req.user.id, req.params.propertyId);
  res.status(201).json({ ok: true });
});

router.delete('/:propertyId', (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND property_id = ?').run(req.user.id, req.params.propertyId);
  res.status(204).end();
});

module.exports = router;
