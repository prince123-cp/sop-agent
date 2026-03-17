// Test the full chunking flow
const { generateChunks } = require('./chunker');
const extractTextFromPDF = require('./pdfExtractor');
const Sop = require('../models/Sop');
const SopChunk = require('../models/SopChunk');
const mongoose = require('mongoose');
require('dotenv').config();

const testFullFlow = async () => {
  try {
    console.log('Testing Full Chunking Flow...');

    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adminchunk');
    console.log('Connected to MongoDB');

    // Create a test SOP
    const testSop = new Sop({
      name: 'Test SOP',
      department: 'IT',
      version: '1.0',
      filePath: '/test/path.pdf',
      extractedText: 'Sample text for testing',
      uploadedBy: 'admin'
    });
    const savedSop = await testSop.save();
    console.log('Test SOP created:', savedSop._id);

    // Simulate page-wise text (since we can't easily create a PDF)
    const pageWiseText = [
      { page: 1, text: 'This is page 1 content. It contains some text that will be chunked. The chunking process should break this into smaller pieces of approximately 1000 characters each. However, since this is a short text, it might not reach the full chunk size. We need to ensure that the overlap works correctly between chunks.' },
      { page: 2, text: 'Page 2 has different content. This page should also be chunked properly. The system needs to maintain page references and create global chunk indices. Overlap between chunks on the same page should be exactly 100 characters. Empty chunks should be ignored.' }
    ];

    // Generate chunks
    const chunks = await generateChunks(pageWiseText, savedSop._id);
    console.log(`Generated ${chunks.length} chunks`);

    // Save chunks to DB
    const savedChunks = await SopChunk.insertMany(chunks);
    console.log(`Saved ${savedChunks.length} chunks to DB`);

    // Verify chunks
    let hasError = false;
    savedChunks.forEach((chunk, index) => {
      console.log(`Chunk ${index}: Page ${chunk.page}, Length: ${chunk.text.length}, Index: ${chunk.chunkIndex}`);
      if (chunk.text.length > 1000) {
        console.error(`ERROR: Chunk ${index} exceeds 1000 characters!`);
        hasError = true;
      }
    });

    // Check overlap
    for (let i = 0; i < savedChunks.length - 1; i++) {
      const current = savedChunks[i];
      const next = savedChunks[i + 1];
      if (current.page === next.page) {
        const overlapText = current.text.slice(-100);
        const nextStart = next.text.slice(0, 100);
        if (overlapText === nextStart) {
          console.log(`✓ Overlap verified between chunk ${i} and ${i+1}`);
        } else {
          console.log(`✗ Overlap mismatch between chunk ${i} and ${i+1}`);
        }
      }
    }

    // Clean up
    await SopChunk.deleteMany({ sopId: savedSop._id });
    await Sop.findByIdAndDelete(savedSop._id);
    console.log('Cleaned up test data');

    if (!hasError) {
      console.log('✓ All tests passed!');
    } else {
      console.log('✗ Some tests failed!');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testFullFlow();
}

module.exports = { testFullFlow };
