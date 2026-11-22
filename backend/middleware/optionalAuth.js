const jwt = require('jsonwebtoken');

// Reads the login token if there is one but never rejects.
// Used on public listing routes so logged-in users also get is_favorite.
module.exports = function optionalAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { /* ignore bad token */ }
  }
  next();
};
