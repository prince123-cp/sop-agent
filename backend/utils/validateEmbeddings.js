const mongoose = require('mongoose');
const SopChunk = require('../models/SopChunk');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adminchunk');
    console.log('MongoDB connected for validation');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Validate embeddings
const validateEmbeddings = async () => {
  try {
    console.log('Starting embedding validation...');

    // Get all chunks
    const allChunks = await SopChunk.find({});
    console.log(`Found ${allChunks.length} total chunks`);

    if (allChunks.length === 0) {
      console.log('No chunks found to validate');
      return;
    }

    let validCount = 0;
    let invalidCount = 0;
    let issues = [];

    // Expected embedding dimensions (Gemini embedding-001)
    const expectedDimensions = 768;

    for (const chunk of allChunks) {
      let isValid = true;
      const chunkIssues = [];

      // Check if embedding exists
      if (!chunk.embedding) {
        chunkIssues.push('Missing embedding field');
        isValid = false;
      } else if (!Array.isArray(chunk.embedding)) {
        chunkIssues.push('Embedding is not an array');
        isValid = false;
      } else if (chunk.embedding.length === 0) {
        chunkIssues.push('Embedding array is empty');
        isValid = false;
      } else {
        // Check dimensions
        if (chunk.embedding.length !== expectedDimensions) {
          chunkIssues.push(`Embedding has ${chunk.embedding.length} dimensions, expected ${expectedDimensions}`);
          isValid = false;
        }

        // Check for null/undefined values
        const hasInvalidValues = chunk.embedding.some(val => val === null || val === undefined || isNaN(val));
        if (hasInvalidValues) {
          chunkIssues.push('Embedding contains null, undefined, or NaN values');
          isValid = false;
        }

        // Check if all values are numbers
        const allNumbers = chunk.embedding.every(val => typeof val === 'number');
        if (!allNumbers) {
          chunkIssues.push('Embedding contains non-numeric values');
          isValid = false;
        }
      }

      // Check content field
      if (!chunk.content || typeof chunk.content !== 'string' || chunk.content.trim().length === 0) {
        chunkIssues.push('Missing or invalid content field');
        isValid = false;
      }

      // Check source field
      if (!chunk.source || typeof chunk.source !== 'string') {
        chunkIssues.push('Missing or invalid source field');
        isValid = false;
      }

      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
        issues.push({
          chunkId: chunk._id,
          sopId: chunk.sopId,
          page: chunk.page,
          chunkIndex: chunk.chunkIndex,
          issues: chunkIssues
        });
      }
    }

    // Report results
    console.log('\n=== VALIDATION RESULTS ===');
    console.log(`Total chunks: ${allChunks.length}`);
    console.log(`Valid chunks: ${validCount}`);
    console.log(`Invalid chunks: ${invalidCount}`);
    console.log(`Validation rate: ${((validCount / allChunks.length) * 100).toFixed(2)}%`);

    if (issues.length > 0) {
      console.log('\n=== ISSUES FOUND ===');
      issues.slice(0, 10).forEach((issue, index) => {
        console.log(`${index + 1}. Chunk ${issue.chunkId}: ${issue.issues.join(', ')}`);
      });

      if (issues.length > 10) {
        console.log(`... and ${issues.length - 10} more issues`);
      }

      console.log('\nTo fix issues, you may need to re-run the embedding pipeline for affected chunks.');
    } else {
      console.log('\n✅ All embeddings are valid!');
    }

  } catch (error) {
    console.error('Error during validation:', error);
  }
};

// Run validation
const runValidation = async () => {
  await connectDB();
  await validateEmbeddings();
  await mongoose.disconnect();
  console.log('Validation complete, disconnected from MongoDB');
};

// Export for use in other files
module.exports = { validateEmbeddings };

// Run if called directly
if (require.main === module) {
  runValidation();
}
