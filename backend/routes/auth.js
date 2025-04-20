const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');
const { logger } = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.options('/signup', (req, res) => res.status(204).send());
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role required' });
    }
    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    if (await usersCollection.findOne({ email })) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      name,
      email,
      password: hashedPassword,
      role,
      created_at: new Date().toISOString()
    };
    const result = await usersCollection.insertOne(user);
    const token = jwt.sign({ sub: result.insertedId.toString() }, process.env.JWT_SECRET_KEY);

    logger.info(`User created successfully: ${email}`);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: result.insertedId.toString(), name, email, role }
    });
  } catch (err) {
    logger.error(`Signup error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.options('/login', (req, res) => res.status(204).send());
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET_KEY);
    res.status(200).json({
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.options('/check-auth', (req, res) => res.status(204).send());
router.get('/check-auth', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) {
      return res.status(401).json({ authenticated: false, message: 'User not found' });
    }
    res.status(200).json({
      authenticated: true,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    logger.error(`Check-auth error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

module.exports = router;