const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');
const { logger } = require('../utils/logger');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid Authorization header');
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const db = getDB();
    const usersCollection = db.collection('users');

    usersCollection.findOne({ _id: new ObjectId(decoded.sub) })
      .then(user => {
        if (!user) {
          logger.warn(`User not found for ID: ${decoded.sub}`);
          return res.status(401).json({ error: 'User not found' });
        }
        req.user = { id: decoded.sub, role: user.role };
        next();
      })
      .catch(err => {
        logger.error(`Database error during auth: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
      });
  } catch (err) {
    logger.warn(`Invalid token: ${err.message}`);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;