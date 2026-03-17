const mongoose = require('mongoose');
const SopChunk = require('../models/SopChunk');
const { generateEmbeddingsBatch } = require('./embedding');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adminchunk');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Embed existing chunks that don't have embeddings
const embedExistingChunks = async () => {
  try {
    console.log('Starting embedding pipeline for existing chunks...');

    // Find chunks without embeddings
    const chunksWithoutEmbeddings = await SopChunk.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: null },
        { embedding: { $size: 0 } }
      ]
    });

    if (chunksWithoutEmbeddings.length === 0) {
      console.log('No chunks found without embeddings. All chunks are already embedded.');
      return;
    }

    console.log(`Found ${chunksWithoutEmbeddings.length} chunks without embeddings`);

    // Process in batches to avoid memory issues
    const batchSize = 50;
    let processedCount = 0;

    for (let i = 0; i < chunksWithoutEmbeddings.length; i += batchSize) {
      const batch = chunksWithoutEmbeddings.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(chunksWithoutEmbeddings.length / batchSize)}`);

      const textsToEmbed = batch.map(chunk => chunk.content || chunk.text); // Fallback for old schema

      try {
        const embeddings = await generateEmbeddingsBatch(textsToEmbed);

        // Update chunks with embeddings
        const updatePromises = batch.map((chunk, index) => {
          return SopChunk.findByIdAndUpdate(chunk._id, {
            embedding: embeddings[index],
            content: chunk.content || chunk.text, // Ensure content field
            source: chunk.source || 'unknown' // Ensure source field
          });
        });

        await Promise.all(updatePromises);
        processedCount += batch.length;
        console.log(`Updated ${processedCount}/${chunksWithoutEmbeddings.length} chunks`);

      } catch (error) {
        console.error(`Error processing batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        // Continue with next batch
      }
    }

    console.log('Embedding pipeline completed successfully!');

  } catch (error) {
    console.error('Error in embedding pipeline:', error);
  }
};

// Run the pipeline
const runPipeline = async () => {
  await connectDB();
  await embedExistingChunks();
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

// Export for use in other files
module.exports = { embedExistingChunks };

// Run if called directly
if (require.main === module) {
  runPipeline();
}
