const express = require('express');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');
const { logger } = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/students', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can view students' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const students = await usersCollection.find({ role: 'student' }, { projection: { _id: 1, name: 1, email: 1 } }).toArray();
    const response = students.map(student => ({ ...student, _id: student._id.toString() }));

    logger.info(`Retrieved ${response.length} students`);
    res.status(200).json(response);
  } catch (err) {
    logger.error(`Get students error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.put('/students/update', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can update students' });
    }

    const { student_id, name, email, password } = req.body;
    if (!student_id || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let studentObjId;
    try {
      studentObjId = new ObjectId(student_id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const updateData = { name, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const result = await usersCollection.updateOne(
      { _id: studentObjId, role: 'student' },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    logger.info(`Student ${student_id} updated by teacher ${req.user.id}`);
    res.status(200).json({ message: 'Student updated successfully' });
  } catch (err) {
    logger.error(`Update student error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.delete('/students/delete', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can delete students' });
    }

    const { student_id } = req.query;
    if (!student_id) {
      return res.status(400).json({ error: 'Student ID required' });
    }

    let studentObjId;
    try {
      studentObjId = new ObjectId(student_id);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const testsCollection = db.collection('tests');

    const result = await usersCollection.deleteOne({ _id: studentObjId, role: 'student' });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await testsCollection.updateMany(
      { assigned_to: student_id },
      { $pull: { assigned_to: student_id } }
    );
    logger.info(`Student ${student_id} deleted by teacher ${req.user.id}`);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    logger.error(`Delete student error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

module.exports = router;