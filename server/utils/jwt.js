const jwt = require('jsonwebtoken');

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("❌ JWT_SECRET is not defined");
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("❌ JWT_SECRET is not defined");
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };

