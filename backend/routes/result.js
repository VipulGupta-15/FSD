const express = require('express');
const { ObjectId } = require('mongodb');
const { DateTime } = require('luxon');
const { createObjectCsvStringifier } = require('csv-writer');
const { getDB } = require('../config/db');
const { logger } = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/save-test-result', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit results' });
    }

    const { test_name, result } = req.body;
    if (!test_name || !result) {
      return res.status(400).json({ message: 'Missing test_name or result' });
    }

    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ test_name, assigned_to: req.user.id });
    if (!test) {
      return res.status(404).json({ message: 'Test not found or not assigned' });
    }

    const now = DateTime.now().setZone('Asia/Kolkata').toISO();
    if (test.status !== 'active' || now < test.start_time || (test.end_time && now > test.end_time)) {
      return res.status(403).json({ message: 'Test not active or time expired' });
    }

    await testsCollection.updateOne(
      { test_name },
      { $set: { [`result.${req.user.id}`]: result } }
    );
    logger.info(`Result saved for test ${test_name}`);
    res.status(200).json({ message: 'Test result saved' });
  } catch (err) {
    logger.error(`Save test result error: ${err.message}`);
    res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});

router.get('/student-results', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can view results' });
    }

    const { test_name } = req.query;
    if (!test_name) {
      return res.status(400).json({ error: 'Test name required' });
    }

    const db = getDB();
    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ user_id: req.user.id, test_name });
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    logger.info(`Retrieved results for test ${test_name}`);
    res.status(200).json({ test_name, results: test.result || {} });
  } catch (err) {
    logger.error(`Student results error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.get('/export-results', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can export results' });
    }

    const { test_name } = req.query;
    if (!test_name) {
      return res.status(400).json({ error: 'Test name required' });
    }

    const db = getDB();
    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ user_id: req.user.id, test_name });
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const results = test.result || {};
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'student_id', title: 'Student ID' },
        { id: 'score', title: 'Score' },
        { id: 'totalQuestions', title: 'Total Questions' },
        { id: 'timeSpent', title: 'Time Spent' }
      ]
    });

    const records = Object.entries(results).map(([student_id, result]) => ({
      student_id,
      score: result.score,
      totalQuestions: result.totalQuestions,
      timeSpent: result.timeSpent
    }));

    const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${test_name}_results.csv"`);
    logger.info(`Exported results for test ${test_name} as CSV`);
    res.status(200).send(csvData);
  } catch (err) {
    logger.error(`Export results error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

module.exports = router;