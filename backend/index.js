require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const path = require('path');
const { logger } = require('./utils/logger');
const { initScheduler } = require('./utils/scheduler');
const authRoutes = require('./routes/auth');
const mcqRoutes = require('./routes/mcq');
const testRoutes = require('./routes/test');
const resultRoutes = require('./routes/result');
const studentRoutes = require('./routes/student');
const { connectDB } = require('./config/db');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:4040',
  'http://localhost:3000',
  'https://8053-58-146-106-120.ngrok-free.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600
}));

// Handle CORS preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed'));
    }
  }
});

// Routes
app.use('/api', authRoutes);
app.use('/api', mcqRoutes);
app.use('/api', testRoutes);
app.use('/api', resultRoutes);
app.use('/api', studentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: err.message });
});

// Initialize server
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('MongoDB connected');

    // Initialize scheduler for test status updates
    initScheduler();

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

startServer();