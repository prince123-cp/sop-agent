const mongoose = require('mongoose');
const SopChunk = require('../models/SopChunk');
const { generateEmbedding } = require('./embedding');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adminchunk');
    console.log('MongoDB connected for semantic similarity test');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
};

// Test semantic similarity with a question
const testSemanticSimilarity = async (question, topK = 5) => {
  try {
    console.log(`Testing semantic similarity for question: "${question}"`);

    // Generate embedding for the question
    console.log('Generating embedding for question...');
    const questionEmbedding = await generateEmbedding(question);
    console.log(`Question embedding generated with ${questionEmbedding.length} dimensions`);

    // Get all chunks with embeddings
    const chunks = await SopChunk.find({
      embedding: { $exists: true, $ne: null, $size: { $gt: 0 } }
    });

    if (chunks.length === 0) {
      console.log('No chunks with embeddings found. Run the embedding pipeline first.');
      return;
    }

    console.log(`Found ${chunks.length} chunks with embeddings`);

    // Calculate similarities
    console.log('Calculating similarities...');
    const similarities = chunks.map(chunk => ({
      chunkId: chunk._id,
      sopId: chunk.sopId,
      content: chunk.content,
      source: chunk.source,
      page: chunk.page,
      chunkIndex: chunk.chunkIndex,
      similarity: cosineSimilarity(questionEmbedding, chunk.embedding)
    }));

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Display top K results
    console.log(`\n=== TOP ${topK} MOST SIMILAR CHUNKS ===`);
    for (let i = 0; i < Math.min(topK, similarities.length); i++) {
      const result = similarities[i];
      console.log(`\n${i + 1}. Similarity: ${(result.similarity * 100).toFixed(2)}%`);
      console.log(`   Source: ${result.source} (Page ${result.page})`);
      console.log(`   Content: ${result.content.substring(0, 200)}${result.content.length > 200 ? '...' : ''}`);
    }

    // Analyze results
    const highSimilarityCount = similarities.filter(s => s.similarity > 0.7).length;
    const mediumSimilarityCount = similarities.filter(s => s.similarity > 0.5 && s.similarity <= 0.7).length;
    const lowSimilarityCount = similarities.filter(s => s.similarity <= 0.5).length;

    console.log(`\n=== SIMILARITY DISTRIBUTION ===`);
    console.log(`High similarity (>70%): ${highSimilarityCount} chunks`);
    console.log(`Medium similarity (50-70%): ${mediumSimilarityCount} chunks`);
    console.log(`Low similarity (≤50%): ${lowSimilarityCount} chunks`);

    // Check if top results are relevant (basic keyword matching for demo)
    const questionLower = question.toLowerCase();
    const relevantKeywords = ['refund', 'return', 'money back', 'policy', 'process'];

    const topResults = similarities.slice(0, 3);
    const relevantTopResults = topResults.filter(result => {
      const contentLower = result.content.toLowerCase();
      return relevantKeywords.some(keyword => contentLower.includes(keyword));
    });

    console.log(`\n=== RELEVANCE CHECK ===`);
    console.log(`Top 3 results contain relevant keywords: ${relevantTopResults.length}/3`);

    if (relevantTopResults.length >= 2) {
      console.log('✅ Semantic search appears to be working well!');
    } else if (relevantTopResults.length >= 1) {
      console.log('⚠️ Semantic search has moderate accuracy. Consider fine-tuning.');
    } else {
      console.log('❌ Semantic search may need improvement. Check embeddings or try different questions.');
    }

    return similarities;

  } catch (error) {
    console.error('Error during semantic similarity test:', error);
  }
};

// Run test with sample questions
const runSemanticTest = async () => {
  await connectDB();

  const testQuestions = [
    "Refund ka process kya hai?",
    "How do I process a refund?",
    "What is the return policy?",
    "Customer complaint handling procedure",
    "How to handle customer returns?"
  ];

  for (const question of testQuestions) {
    console.log('\n' + '='.repeat(80));
    await testSemanticSimilarity(question);
    console.log('='.repeat(80));
  }

  await mongoose.disconnect();
  console.log('Semantic similarity test complete, disconnected from MongoDB');
};

// Export for use in other files
module.exports = { testSemanticSimilarity };

// Run if called directly
if (require.main === module) {
  runSemanticTest();
}
