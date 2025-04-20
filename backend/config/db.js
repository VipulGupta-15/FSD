const { MongoClient } = require('mongodb');
const { logger } = require('../utils/logger');

let db;

async function connectDB() {
  const uri = process.env.MONGO_DB_URI;
  if (!uri) {
    throw new Error('MONGO_DB_URI is not set in the environment');
  }

  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await client.connect();
    db = client.db('mcq_generator');
    logger.info('Connected to MongoDB');
    return db;
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    throw err;
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}

module.exports = { connectDB, getDB };