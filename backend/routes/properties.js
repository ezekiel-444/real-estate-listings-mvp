const router = require('express').Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const SELECT = `
  SELECT p.*, c.name AS city_name, u.full_name AS agent_name
  FROM properties p
  JOIN cities c ON c.id = p.city_id
  JOIN users  u ON u.id = p.agent_id`;

function validate(body, partial = false) {
  const errors = [];
  const b = body || {};
  const need = (k) => !partial && (b[k] === undefined || b[k] === null || b[k] === '');
  for (const k of ['title', 'city_id', 'price', 'area_m2', 'rooms', 'type']) {
    if (need(k)) errors.push(`${k} is required`);
  }
  if (b.type !== undefined && !['sale', 'rent'].includes(b.type)) errors.push("type must be 'sale' or 'rent'");
  for (const k of ['price', 'rooms']) {
    if (b[k] !== undefined && (!Number.isInteger(Number(b[k])) || Number(b[k]) < 0)) errors.push(`${k} must be a non-negative integer`);
  }
  if (b.area_m2 !== undefined && (!Number.isInteger(Number(b.area_m2)) || Number(b.area_m2) <= 0)) errors.push('area_m2 must be a positive integer');
  if (b.city_id !== undefined && !db.prepare('SELECT 1 FROM cities WHERE id = ?').get(b.city_id)) errors.push('city_id does not exist');
  return errors;
}

// READ (list + filters). Public. Filters: city_id, min_price, max_price, rooms (minimum), type, q, page, limit.
router.get('/', optionalAuth, (req, res) => {
  const { city_id, min_price, max_price, rooms, type, q } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
  const where = [];
  const args = [];
  if (city_id)   { where.push('p.city_id = ?');   args.push(city_id); }
  if (min_price) { where.push('p.price >= ?');    args.push(min_price); }
  if (max_price) { where.push('p.price <= ?');    args.push(max_price); }
  if (rooms)     { where.push('p.rooms >= ?');    args.push(rooms); }
  if (type)      { where.push('p.type = ?');      args.push(type); }
  if (q)         { where.push('(p.title LIKE ? OR p.address LIKE ?)'); args.push(`%${q}%`, `%${q}%`); }
  const clause = where.length ? ' WHERE ' + where.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) AS n FROM properties p${clause}`).get(...args).n;
  const rows = db
    .prepare(`${SELECT}${clause} ORDER BY p.created_at DESC, p.id DESC LIMIT ? OFFSET ?`)
    .all(...args, limit, (page - 1) * limit);

  if (req.user) {
    const favs = new Set(db.prepare('SELECT property_id FROM favorites WHERE user_id = ?').all(req.user.id).map((r) => r.property_id));
    rows.forEach((r) => (r.is_favorite = favs.has(r.id)));
  }
  res.json({ items: rows, total, page, pages: Math.ceil(total / limit) });
});

// Agent's own listings (must be before /:id).
router.get('/mine', authenticateToken, requireRole('agent', 'admin'), (req, res) => {
  res.json(db.prepare(`${SELECT} WHERE p.agent_id = ? ORDER BY p.created_at DESC`).all(req.user.id));
});

router.get('/:id', optionalAuth, (req, res) => {
  const row = db.prepare(`${SELECT} WHERE p.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Listing not found' });
  if (req.user) {
    row.is_favorite = !!db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND property_id = ?').get(req.user.id, row.id);
  }
  res.json(row);
});

// CREATE: agents only.
router.post('/', authenticateToken, requireRole('agent'), (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const b = req.body;
  const info = db
    .prepare(`INSERT INTO properties (agent_id, city_id, title, description, address, price, area_m2, rooms, type, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(req.user.id, b.city_id, b.title.trim(), b.description || null, b.address || null,
         Number(b.price), Number(b.area_m2), Number(b.rooms), b.type, b.image_url || null);
  res.status(201).json(db.prepare(`${SELECT} WHERE p.id = ?`).get(info.lastInsertRowid));
});

// Ownership check shared by update and delete. Admin may moderate any listing.
function loadOwned(req, res) {
  const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!row) { res.status(404).json({ error: 'Listing not found' }); return null; }
  if (req.user.role !== 'admin' && row.agent_id !== req.user.id) {
    res.status(403).json({ error: 'You can only change your own listings' });
    return null;
  }
  return row;
}

// UPDATE
router.put('/:id', authenticateToken, requireRole('agent', 'admin'), (req, res) => {
  const existing = loadOwned(req, res);
  if (!existing) return;
  const errors = validate(req.body, true);
  if (errors.length) return res.status(400).json({ errors });
  const m = { ...existing, ...req.body };
  db.prepare(`UPDATE properties SET city_id=?, title=?, description=?, address=?, price=?, area_m2=?, rooms=?, type=?, image_url=?,
              updated_at=datetime('now') WHERE id=?`)
    .run(m.city_id, m.title, m.description, m.address, Number(m.price), Number(m.area_m2), Number(m.rooms), m.type, m.image_url, existing.id);
  res.json(db.prepare(`${SELECT} WHERE p.id = ?`).get(existing.id));
});

// DELETE
router.delete('/:id', authenticateToken, requireRole('agent', 'admin'), (req, res) => {
  const existing = loadOwned(req, res);
  if (!existing) return;
  db.prepare('DELETE FROM properties WHERE id = ?').run(existing.id);
  res.status(204).end();
});

// Send an inquiry about a listing (users only).
router.post('/:id/inquiries', authenticateToken, requireRole('user'), (req, res) => {
  const { message } = req.body || {};
  if (!message || !message.trim()) return res.status(400).json({ error: 'message is required' });
  if (!db.prepare('SELECT 1 FROM properties WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  const info = db.prepare('INSERT INTO inquiries (property_id, user_id, message) VALUES (?, ?, ?)')
    .run(req.params.id, req.user.id, message.trim());
  res.status(201).json(db.prepare('SELECT * FROM inquiries WHERE id = ?').get(info.lastInsertRowid));
});

module.exports = router;
