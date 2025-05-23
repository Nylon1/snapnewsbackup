const jwt = require('../utils/jwt');

function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.session.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verifyToken(token);
    const allowedRoles = ['Super Admin', 'Editor', 'Moderator', 'Analyst'];
    if (!allowedRoles.includes(payload.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { authenticateAdmin };
