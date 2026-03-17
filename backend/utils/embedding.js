import { GoogleGenerativeAI } from '@google/generative-ai';
import '../config/env.js';

// Initialize Gemini AI with API key (will be checked when functions are called)
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Function to generate embeddings for text
const generateEmbedding = async (text, retries = 3) => {
  if (!genAI) {
    throw new Error('Gemini AI not initialized. Check GEMINI_API_KEY.');
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Get the embedding model
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });

      // Generate embedding
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      // Validate embedding
      if (!embedding || embedding.length === 0) {
        throw new Error('Empty embedding returned');
      }

      return embedding;
    } catch (error) {
      console.error(`Embedding attempt ${attempt} failed:`, error.message);

      if (attempt === retries) {
        throw new Error(`Failed to generate embedding after ${retries} attempts: ${error.message}`);
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

// Function to generate embeddings for multiple texts (batch processing)
const generateEmbeddingsBatch = async (texts, batchSize = 10) => {
  const embeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(texts.length / batchSize)}`);

    const batchPromises = batch.map(text => generateEmbedding(text));
    const batchEmbeddings = await Promise.all(batchPromises);

    embeddings.push(...batchEmbeddings);

    // Small delay between batches to avoid rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return embeddings;
};

export { generateEmbedding, generateEmbeddingsBatch };
