const cron = require('node-cron');
const { DateTime } = require('luxon');
const { getDB } = require('../config/db');
const { logger } = require('./logger');

function initScheduler() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const db = getDB();
      const testsCollection = db.collection('tests');
      const now = DateTime.now().setZone('Asia/Kolkata').toISO();

      const tests = await testsCollection.find({ status: { $in: ['assigned', 'active'] } }).toArray();
      for (const test of tests) {
        const startTime = test.start_time;
        const endTime = test.end_time;
        if (!startTime || !endTime) continue;

        if (now >= startTime && now <= endTime && test.status !== 'active') {
          await testsCollection.updateOne(
            { _id: test._id },
            { $set: { status: 'active' } }
          );
          logger.info(`Test ${test.test_name} auto-set to active`);
        } else if (now > endTime && test.status !== 'stopped') {
          await testsCollection.updateOne(
            { _id: test._id },
            { $set: { status: 'stopped' } }
          );
          logger.info(`Test ${test.test_name} auto-set to stopped`);
        }
      }
    } catch (err) {
      logger.error(`Scheduler error: ${err.message}`);
    }
  });
  logger.info('Scheduler initialized');
}

module.exports = { initScheduler };