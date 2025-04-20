const axios = require('axios');
const { logger } = require('./logger');

function extractJsonFromResponse(rawOutput) {
  rawOutput = rawOutput.trim();
  const startIdx = rawOutput.indexOf('[');
  const endIdx = rawOutput.lastIndexOf(']') + 1;
  if (startIdx === -1 || endIdx === 0) {
    logger.warn('No JSON array delimiters found in response');
    return null;
  }
  try {
    return JSON.parse(rawOutput.slice(startIdx, endIdx));
  } catch (err) {
    logger.error(`JSON parsing failed: ${err.message}`);
    return null;
  }
}

async function generateMCQWithRelevance(text, groqApiKey, numQuestions = 2, difficulty = 'medium') {
  try {
    const difficultyInstructions = {
      easy: 'Generate straightforward questions testing basic recall or understanding of key terms or concepts. Use clear, simple language and include obviously incorrect distractors.',
      medium: 'Generate questions requiring analysis or application of concepts. Include plausible distractors that reflect common misconceptions.',
      hard: 'Generate complex questions demanding deep understanding, synthesis of multiple concepts, or problem-solving. Use highly plausible distractors requiring careful consideration.'
    };
    const instruction = difficultyInstructions[difficulty] || difficultyInstructions.medium;
    const prompt = `Generate ${numQuestions} multiple-choice questions from the provided text. ${instruction} Ensure questions are relevant to the subject and suitable for an examination. Determine the type ('theory' or 'numerical') based on content: use 'numerical' for questions involving calculations or mathematical concepts, and 'theory' otherwise. Set the 'difficulty' field to '${difficulty}'. Each question should be a JSON object with: question (string), options (array of 4 strings), correct_answer (string), type (string: theory/numerical), difficulty (string), relevance_score (float between 0 and 1, where 1 is highly relevant). Return a JSON array only.\n\nText:\n${text}`;

    const response = await axios.post('https://api.groq.com/v1/chat/completions', {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: 'You are an AI expert in question generation.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1
    }, {
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const rawOutput = response.data.choices[0]?.message?.content;
    if (!rawOutput) {
      logger.warn('No valid response from Groq API');
      return { error: 'No valid response from AI model' };
    }
    logger.info(`Raw Groq response: ${rawOutput.slice(0, 100)}...`);
    const mcqOutput = extractJsonFromResponse(rawOutput);
    if (!Array.isArray(mcqOutput)) {
      logger.warn('Response is not a JSON array');
      return { error: 'Response is not a JSON array' };
    }

    const requiredFields = ['question', 'options', 'correct_answer', 'type', 'difficulty', 'relevance_score'];
    const validMCQs = mcqOutput.filter(mcq => {
      const isValid = requiredFields.every(field => field in mcq) &&
                      Array.isArray(mcq.options) && mcq.options.length === 4 &&
                      typeof mcq.relevance_score === 'number' && mcq.relevance_score >= 0 && mcq.relevance_score <= 1;
      if (!isValid) {
        logger.warn(`Invalid MCQ format: ${JSON.stringify(mcq).slice(0, 100)}...`);
      }
      return isValid;
    });

    if (validMCQs.length === 0) {
      logger.warn('No valid MCQs after validation');
      return { error: 'No valid MCQs generated' };
    }

    return validMCQs;
  } catch (err) {
    logger.error(`MCQ generation failed: ${err.message}`);
    return { error: err.message };
  }
}

async function generateMCQsFromRandomChunks(text, groqApiKey, difficultyDistribution, minRelevance = 0.5) {
  const chunks = require('./pdf').splitTextIntoChunks(text, 4000);
  if (!chunks.length) {
    logger.warn('No text chunks available');
    return { error: 'No text chunks available' };
  }

  let allMCQs = [];
  const maxAttemptsPerDifficulty = 100;
  const maxRetries = 3;

  for (const [difficulty, count] of Object.entries(difficultyDistribution)) {
    if (count === 0) continue;
    let collected = 0;
    let attempts = 0;
    const attemptedChunks = new Set();

    while (collected < count && attempts < maxAttemptsPerDifficulty && attemptedChunks.size < chunks.length) {
      const remainingChunks = chunks.map((_, i) => i).filter(i => !attemptedChunks.has(i));
      if (!remainingChunks.length) break;
      const chunkIdx = remainingChunks[Math.floor(Math.random() * remainingChunks.length)];
      attemptedChunks.add(chunkIdx);
      const chunkText = chunks[chunkIdx];

      let chunkSize = Math.min(2, count - collected);
      let retries = 0;

      while (retries < maxRetries && collected < count) {
        const mcqs = await generateMCQWithRelevance(chunkText, groqApiKey, chunkSize, difficulty);
        if (mcqs.error) {
          logger.warn(`Skipping chunk ${chunkIdx} for ${difficulty} due to error: ${mcqs.error}`);
          retries++;
          continue;
        }

        const relevantMCQs = mcqs.filter(mcq => mcq.relevance_score >= minRelevance);
        if (relevantMCQs.length === 0 && retries < maxRetries - 1) {
          logger.info(`No relevant MCQs for chunk ${chunkIdx}, retrying (${retries + 1}/${maxRetries})`);
          retries++;
          continue;
        }

        const needed = count - collected;
        const selectedMCQs = relevantMCQs.slice(0, needed);
        allMCQs.push(...selectedMCQs);
        collected += selectedMCQs.length;
        logger.info(`Generated ${selectedMCQs.length} relevant ${difficulty} MCQs from chunk ${chunkIdx}, total collected: ${collected}/${count}`);
        break;
      }
      attempts++;
    }

    if (collected < count) {
      logger.warn(`Only collected ${collected}/${count} ${difficulty} MCQs after ${attempts} attempts`);
    }
  }

  const totalRequested = Object.values(difficultyDistribution).reduce((a, b) => a + b, 0);
  allMCQs.sort((a, b) => b.relevance_score - a.relevance_score);
  allMCQs = allMCQs.slice(0, totalRequested);
  logger.info(`Final MCQs generated: ${allMCQs.length}/${totalRequested}`);

  if (allMCQs.length === 0) {
    logger.warn('No MCQs generated after all attempts');
    return { error: 'No MCQs generated due to relevance filtering or text content' };
  }

  return allMCQs;
}

module.exports = { generateMCQWithRelevance, generateMCQsFromRandomChunks };