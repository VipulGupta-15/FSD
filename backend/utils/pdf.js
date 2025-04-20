const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const { logger } = require('./logger');

async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    logger.info(`Extracted ${text.length} characters from PDF: ${pdfPath}`);
    return text;
  } catch (err) {
    logger.error(`PDF extraction failed: ${err.message}`);
    throw err;
  }
}

function splitTextIntoChunks(text, maxChars = 5000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxChars) {
    chunks.push(text.slice(i, i + maxChars));
  }
  return chunks;
}

module.exports = { extractTextFromPDF, splitTextIntoChunks };