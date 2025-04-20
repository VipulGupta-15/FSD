const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const { ObjectId } = require('mongodb');
const { DateTime } = require('luxon');
const { getDB } = require('../config/db');
const { logger } = require('../utils/logger');
const { extractTextFromPDF, splitTextIntoChunks } = require('../utils/pdf');
const { generateMCQsFromRandomChunks, generateMCQWithRelevance } = require('../utils/mcq');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-pdf', authMiddleware, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }
    if (!req.file.mimetype.includes('pdf')) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Invalid file format' });
    }
    const pdfPath = req.file.path;
    const pdfName = req.file.originalname;
    logger.info(`PDF uploaded: ${pdfPath}`);
    res.status(200).json({ success: true, pdf_path: pdfPath, pdf_name: pdfName });
  } catch (err) {
    logger.error(`Upload PDF error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.post('/generate-mcqs', authMiddleware, async (req, res) => {
  let pdfPath = req.body.pdf_path;
  try {
    const { pdf_name, test_name = `Test_${DateTime.now().setZone('Asia/Kolkata').toFormat('yyyyMMdd_HHmmss')}`, difficulty, min_relevance = 0.5 } = req.body;
    let difficultyDistribution;
    try {
      difficultyDistribution = JSON.parse(difficulty || '{"easy": 0, "medium": 5, "hard": 0}');
      if (!['easy', 'medium', 'hard'].every(k => k in difficultyDistribution)) {
        throw new Error('Difficulty must include easy, medium, and hard');
      }
      if (!Object.values(difficultyDistribution).every(v => Number.isInteger(v) && v >= 0)) {
        throw new Error('Difficulty values must be non-negative integers');
      }
    } catch (err) {
      return res.status(400).json({ error: `Invalid difficulty format: ${err.message}` });
    }

    const numQuestions = Object.values(difficultyDistribution).reduce((a, b) => a + b, 0);
    if (numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({ error: 'Total number of questions must be 1-20' });
    }

    if (!pdfPath || !await fs.access(pdfPath).then(() => true).catch(() => false)) {
      return res.status(400).json({ error: 'PDF path invalid or missing' });
    }
    if (!pdf_name) {
      return res.status(400).json({ error: 'PDF name missing' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not set');
    }

    const extractedText = await extractTextFromPDF(pdfPath);
    const mcqs = await generateMCQsFromRandomChunks(extractedText, groqApiKey, difficultyDistribution, parseFloat(min_relevance));
    if (mcqs.error) {
      return res.status(400).json({ 
        success: false, 
        error: mcqs.error, 
        message: 'Try adjusting difficulty, relevance threshold, or uploading a different PDF' 
      });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const testsCollection = db.collection('tests');
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    const isStudent = user.role === 'student';

    const existingTest = await testsCollection.findOne({
      user_id: req.user.id,
      test_name,
      status: 'generated'
    });

    const testData = {
      user_id: req.user.id,
      test_name,
      pdf_name,
      mcqs,
      created_at: DateTime.now().setZone('Asia/Kolkata').toISO(),
      status: isStudent ? 'active' : 'generated',
      assigned_to: isStudent ? [req.user.id] : [],
      start_time: isStudent ? DateTime.now().setZone('Asia/Kolkata').toISO() : null,
      end_time: null,
      duration: isStudent ? 30 : null,
      result: {}
    };

    if (existingTest) {
      await testsCollection.updateOne(
        { _id: existingTest._id },
        { $set: { mcqs, created_at: DateTime.now().setZone('Asia/Kolkata').toISO() } }
      );
      logger.info(`Updated existing test ${test_name} with ${mcqs.length} MCQs`);
    } else {
      await testsCollection.insertOne(testData);
      logger.info(`Created new test ${test_name} with ${mcqs.length} MCQs`);
    }

    res.status(200).json({
      success: true,
      mcqs,
      test_name,
      pdf_name,
      warning: mcqs.length < numQuestions ? `Only ${mcqs.length} questions generated. Try lowering relevance threshold or adjusting difficulty.` : null
    });
  } catch (err) {
    if (pdfPath && await fs.access(pdfPath).then(() => true).catch(() => false)) {
      await fs.unlink(pdfPath);
    }
    logger.error(`Generate MCQs error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/review-mcqs', authMiddleware, async (req, res) => {
  try {
    const { test_name, page = 1, limit = 10 } = req.query;
    if (!test_name) {
      return res.status(400).json({ error: 'Test name required' });
    }

    const db = getDB();
    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ user_id: req.user.id, test_name });
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const mcqs = test.mcqs;
    const total = mcqs.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedMCQs = mcqs.slice(start, end);

    logger.info(`Retrieved ${paginatedMCQs.length} MCQs for test ${test_name}, page ${page}`);
    res.status(200).json({
      test_name,
      pdf_name: test.pdf_name,
      mcqs: paginatedMCQs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    logger.error(`Review MCQs error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.put('/update-mcq', authMiddleware, async (req, res) => {
  try {
    const { test_name, mcq_index, updated_mcq } = req.body;
    if (!test_name || mcq_index == null || !updated_mcq) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDB();
    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ user_id: req.user.id, test_name });
    if (!test || mcq_index >= test.mcqs.length) {
      return res.status(404).json({ error: 'Test or MCQ not found' });
    }

    const requiredFields = ['question', 'options', 'correct_answer', 'type', 'difficulty', 'relevance_score'];
    if (!requiredFields.every(field => field in updated_mcq) || updated_mcq.options.length !== 4) {
      return res.status(400).json({ error: 'Invalid MCQ format' });
    }

    await testsCollection.updateOne(
      { user_id: req.user.id, test_name },
      { $set: { [`mcqs.${mcq_index}`]: updated_mcq } }
    );
    logger.info(`Updated MCQ at index ${mcq_index} for test ${test_name}`);
    res.status(200).json({ message: 'MCQ updated successfully' });
  } catch (err) {
    logger.error(`Update MCQ error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.delete('/delete-mcq', authMiddleware, async (req, res) => {
  try {
    const { test_name, mcq_index } = req.query;
    if (!test_name || mcq_index == null) {
      return res.status(400).json({ error: 'Test name and MCQ index required' });
    }

    const db = getDB();
    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ user_id: req.user.id, test_name });
    if (!test || mcq_index >= test.mcqs.length) {
      return res.status(404).json({ error: 'Test or MCQ not found' });
    }

    await testsCollection.updateOne(
      { user_id: req.user.id, test_name },
      { $pull: { mcqs: test.mcqs[mcq_index] } }
    );
    logger.info(`Deleted MCQ at index ${mcq_index} from test ${test_name}`);
    res.status(200).json({ message: 'MCQ deleted successfully' });
  } catch (err) {
    logger.error(`Delete MCQ error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.post('/regenerate-mcq', authMiddleware, async (req, res) => {
  try {
    const { test_name, mcq_index, text_chunk } = req.body;
    if (!test_name || mcq_index == null || !text_chunk) {
      return res.status(400).json({ error: 'Test name, MCQ index, and text chunk required' });
    }

    const db = getDB();
    const testsCollection = db.collection('tests');
    const test = await testsCollection.findOne({ user_id: req.user.id, test_name });
    if (!test || mcq_index >= test.mcqs.length) {
      return res.status(404).json({ error: 'Test or MCQ not found' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not set');
    }

    const originalMCQ = test.mcqs[mcq_index];
    const newMCQ = await generateMCQWithRelevance(text_chunk, groqApiKey, 1, originalMCQ.difficulty);
    if (newMCQ.error) {
      return res.status(500).json({ error: newMCQ.error });
    }
    if (!newMCQ || newMCQ.length === 0) {
      return res.status(500).json({ error: 'Failed to generate new MCQ' });
    }

    await testsCollection.updateOne(
      { user_id: req.user.id, test_name },
      { $set: { [`mcqs.${mcq_index}`]: newMCQ[0] } }
    );
    logger.info(`Regenerated MCQ at index ${mcq_index} for test ${test_name}`);
    res.status(200).json({ message: 'MCQ regenerated successfully', new_mcq: newMCQ[0] });
  } catch (err) {
    logger.error(`Regenerate MCQ error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

router.post('/cleanup-pdf', authMiddleware, async (req, res) => {
  try {
    const { pdf_path } = req.body;
    if (pdf_path && await fs.access(pdf_path).then(() => true).catch(() => false)) {
      await fs.unlink(pdf_path);
      logger.info(`Cleaned up PDF: ${pdf_path} for user: ${req.user.id}`);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    logger.error(`Cleanup PDF error: ${err.message}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

module.exports = router;