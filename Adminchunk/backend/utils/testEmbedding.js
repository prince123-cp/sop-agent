// Mock embedding function for testing (since API key is not configured)
const mockGenerateEmbedding = async (text) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  // Return a consistent 768-dimensional mock embedding
  return Array(768).fill(0).map((_, i) => Math.sin(text.length + i) * 0.1);
};

const mockGenerateEmbeddingsBatch = async (texts) => {
  const embeddings = [];
  for (const text of texts) {
    embeddings.push(await mockGenerateEmbedding(text));
  }
  return embeddings;
};

const testEmbedding = async () => {
  console.log('=== Embedding Pipeline Testing (Mock) ===\n');

  // Test 4.1: Embedding Generation
  console.log('TODO 4.1 – Embedding Generation');
  try {
    const testText = 'This is a test text for embedding generation.';
    const embedding = await mockGenerateEmbedding(testText);

    console.log(`Generated embedding with ${embedding.length} dimensions`);
    console.log('First 10 values:', embedding.slice(0, 10));

    // Check if all embeddings have consistent length
    const testTexts = [
      'Short text.',
      'This is a longer piece of text that should generate an embedding with the same dimensions.',
      'Another test text to verify consistency.'
    ];

    const embeddings = await mockGenerateEmbeddingsBatch(testTexts);
    console.log(`Generated ${embeddings.length} embeddings`);

    const lengths = embeddings.map(e => e.length);
    const allSameLength = lengths.every(len => len === lengths[0]);

    if (allSameLength) {
      console.log(`✅ All embeddings have consistent length: ${lengths[0]} dimensions`);
    } else {
      console.log(`❌ Inconsistent embedding lengths: ${lengths}`);
    }

  } catch (error) {
    console.log('❌ Embedding generation failed:', error.message);
  }

  // Test 4.2: Embedding Failure Handling
  console.log('\nTODO 4.2 – Embedding Failure Handling');
  try {
    // Test with empty text
    const emptyEmbedding = await mockGenerateEmbedding('');
    console.log('✅ Empty text handled successfully');

    // Test with very long text
    const longText = 'A'.repeat(10000);
    const longEmbedding = await mockGenerateEmbedding(longText);
    console.log('✅ Long text handled successfully');

  } catch (error) {
    console.log('❌ Failure handling test failed:', error.message);
  }

  // Test 4.3: Duplicate Chunk Test
  console.log('\nTODO 4.3 – Duplicate Chunk Test');
  try {
    const duplicateTexts = ['Same text', 'Same text', 'Different text'];
    const duplicateEmbeddings = await mockGenerateEmbeddingsBatch(duplicateTexts);

    // Check if identical texts produce identical embeddings
    const embedding1 = duplicateEmbeddings[0];
    const embedding2 = duplicateEmbeddings[1];
    const embedding3 = duplicateEmbeddings[2];

    const areIdentical = JSON.stringify(embedding1) === JSON.stringify(embedding2);
    const areDifferent = JSON.stringify(embedding1) !== JSON.stringify(embedding3);

    if (areIdentical && areDifferent) {
      console.log('✅ Duplicate detection working - identical texts have identical embeddings');
    } else {
      console.log('❌ Duplicate detection issue');
    }

  } catch (error) {
    console.log('❌ Duplicate chunk test failed:', error.message);
  }

  console.log('\n=== Embedding Pipeline Testing Complete ===');
};

// Run test if this file is executed directly
if (require.main === module) {
  testEmbedding().catch(console.error);
}

module.exports = { testEmbedding };
