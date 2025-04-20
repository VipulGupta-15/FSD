const express = require('express');
const { ObjectId } = require('mongodb');
const { DateTime } = require('luxon');
const { getDB } = require('../config/db');
const { logger } = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/assign-test', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can assign tests' });
    }

    const { test_name, student_ids, start_time, end_time, duration } = req.body;
    if (!test_name || !student_ids || !start_time || !end_time || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let startDT, endDT;
    try {
      startDT = DateTime.fromISO(start_time, { zone: 'Asia/Kolkata' });
      endDT = DateTime.fromISO(end_time, { zone: 'Asia/Kolkata' });
      if (!startDT.isValid || !endDT.isValid || startDT >= endDT) {
        return res.status(400).json({ error: 'Invalid IST date/time format or start time must be before end time' });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Invalid IST date/time format (e.g., 2025-04-15T10:00:00)' });
    }

    const db = getDB();
    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ user_id: req.user.id, test_name });
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    let validStudentIds;
    try {
      validStudentIds = student_ids.map(id => new ObjectId(id));
    } catch (err) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const usersCollection = db.collection('users');
    const validStudents = await usersCollection.find({ _id: { $in: validStudentIds }, role: 'student' }).toArray();
    const validStudentIdsStr = validStudents.map(student => student._id.toString());
    if (validStudentIdsStr.length !== student_ids.length) {
      return res.status(400).json({ error: 'Some student IDs are invalid' });
    }

    await testsCollection.updateOne(
      { user_id: req.user.id, test_name },
      { $set: {
        assigned_to: validStudentIdsStr,
        start_time: startDT.toISO(),
        end_time: endDT.toISO(),
        duration,
        status: 'assigned'
      } }
    );
    logger.info(`Test ${test_name} assigned to ${validStudentIdsStr.length} students`);
    res.status(200).json({ success: true, message: `Test ${test_name} assigned successfully` });
  } catch (err) {
    logger.error(`Assign test error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.post('/manage-test', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can manage tests' });
    }

    const { test_name, action } = req.body;
    if (!test_name || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDB();
    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ user_id: req.user.id, test_name });
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (action === 'start') {
      await testsCollection.updateOne(
        { user_id: req.user.id, test_name },
        { $set: { status: 'active' } }
      );
      logger.info(`Test ${test_name} started`);
      res.status(200).json({ message: 'Test started' });
    } else if (action === 'stop') {
      await testsCollection.updateOne(
        { user_id: req.user.id, test_name },
        { $set: { status: 'stopped' } }
      );
      logger.info(`Test ${test_name} stopped`);
      res.status(200).json({ message: 'Test stopped' });
    } else if (action === 'reassign') {
      const { student_ids, start_time, end_time } = req.body;
      if (!student_ids || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing fields for reassign' });
      }

      let startDT, endDT;
      try {
        startDT = DateTime.fromISO(start_time, { zone: 'Asia/Kolkata' });
        endDT = DateTime.fromISO(end_time, { zone: 'Asia/Kolkata' });
        if (!startDT.isValid || !endDT.isValid || startDT >= endDT) {
          return res.status(400).json({ error: 'Invalid IST date/time format or start time must be before end time' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid IST date/time format (e.g., 2025-04-15T10:00:00)' });
      }

      let validStudentIds;
      try {
        validStudentIds = student_ids.map(id => new ObjectId(id));
      } catch (err) {
        return res.status(400).json({ error: 'Invalid student ID format' });
      }

      const usersCollection = db.collection('users');
      const validStudents = await usersCollection.find({ _id: { $in: validStudentIds }, role: 'student' }).toArray();
      const validStudentIdsStr = validStudents.map(student => student._id.toString());
      if (validStudentIdsStr.length !== student_ids.length) {
        return res.status(400).json({ error: 'Some student IDs are invalid' });
      }

      await testsCollection.updateOne(
        { user_id: req.user.id, test_name },
        { $set: {
          assigned_to: validStudentIdsStr,
          start_time: startDT.toISO(),
          end_time: endDT.toISO(),
          status: 'assigned'
        } }
      );
      logger.info(`Test ${test_name} reassigned`);
      res.status(200).json({ message: 'Test reassigned' });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    logger.error(`Manage test error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.delete('/delete-test', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can delete tests' });
    }

    const { test_name } = req.body;
    if (!test_name) {
      return res.status(400).json({ error: 'Test name required' });
    }

    const db = getDB();
    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ user_id: req.user.id, test_name, status: 'generated' });
    if (!test) {
      return res.status(404).json({ error: 'Test not found or not in generated state' });
    }

    const result = await testsCollection.deleteOne({ user_id: req.user.id, test_name });
    if (result.deletedCount === 0) {
      return res.status(500).json({ error: 'Failed to delete test' });
    }

    logger.info(`Test ${test_name} deleted by user ${req.user.id}`);
    res.status(200).json({ success: true, message: 'Test deleted successfully' });
  } catch (err) {
    logger.error(`Delete test error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.get('/user-tests', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const testsCollection = db.collection('tests');
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query = user.role === 'teacher' ? { user_id: req.user.id } : { assigned_to: req.user.id };
    if (req.query.pdf_name) query.pdf_name = req.query.pdf_name;
    if (req.query.test_name) query.test_name = req.query.test_name;

    const tests = await testsCollection.find(query).toArray();
    const now = DateTime.now().setZone('Asia/Kolkata').toISO();
    for (const test of tests) {
      if (test.user_id !== req.user.id) {
        const startTime = test.start_time;
        const endTime = test.end_time;
        if (startTime && endTime) {
          if (now >= startTime && now <= end0 && test.status !== 'active') {
            await testsCollection.updateOne(
              { _id: test._id },
              { $set: { status: 'active' } }
            );
            test.status = 'active';
          } else if (now > endTime && !['stopped', 'completed'].includes(test.status)) {
            await testsCollection.updateOne(
              { _id: test._id },
              { $set: { status: 'stopped' } }
            );
            test.status = 'stopped';
          }
        }
        test._id = test._id.toString();
      }
    }

    logger.info(`Retrieved ${tests.length} tests for user ${req.user.id}`);
    res.status(200).json(tests);
  } catch (err) {
    logger.error(`User tests error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

module.exports = router;