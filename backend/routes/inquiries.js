const router = require('express').Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

const BASE = `
  SELECT i.*, p.title AS property_title, p.agent_id, u.full_name AS user_name, u.email AS user_email
  FROM inquiries i
  JOIN properties p ON p.id = i.property_id
  JOIN users u ON u.id = i.user_id`;

// Users see what they sent. Agents see inquiries on their own listings.
router.get('/', (req, res) => {
  if (req.user.role === 'agent') {
    return res.json(db.prepare(`${BASE} WHERE p.agent_id = ? ORDER BY i.created_at DESC`).all(req.user.id));
  }
  if (req.user.role === 'user') {
    return res.json(db.prepare(`${BASE} WHERE i.user_id = ? ORDER BY i.created_at DESC`).all(req.user.id));
  }
  res.json(db.prepare(`${BASE} ORDER BY i.created_at DESC`).all()); // admin
});

// Agent answers an inquiry on their own listing.
router.put('/:id/reply', requireRole('agent'), (req, res) => {
  const { reply } = req.body || {};
  if (!reply || !reply.trim()) return res.status(400).json({ error: 'reply is required' });
  const row = db.prepare(`${BASE} WHERE i.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Inquiry not found' });
  if (row.agent_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
  db.prepare("UPDATE inquiries SET reply = ?, replied_at = datetime('now') WHERE id = ?").run(reply.trim(), row.id);
  res.json(db.prepare('SELECT * FROM inquiries WHERE id = ?').get(row.id));
});

// Author can withdraw an unanswered or answered inquiry.
router.delete('/:id', requireRole('user', 'admin'), (req, res) => {
  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Inquiry not found' });
  if (req.user.role !== 'admin' && row.user_id !== req.user.id) return res.status(403).json({ error: 'Not your inquiry' });
  db.prepare('DELETE FROM inquiries WHERE id = ?').run(row.id);
  res.status(204).end();
});

module.exports = router;
