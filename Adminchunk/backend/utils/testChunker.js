// Simple test for chunking logic
const { cleanText, CHUNK_SIZE, CHUNK_OVERLAP } = require('./chunker');

const testChunking = async () => {
  console.log('Testing Chunking Logic...');

  // Sample page-wise text
  const pageWiseText = [
    { page: 1, text: 'This is a sample text for page 1. It has some content that will be chunked into smaller pieces. The chunk size is 1000 characters, but this text is shorter.' },
    { page: 2, text: 'Page 2 content here. This page has different text. We need to ensure that chunks are created properly with overlap. Overlap means some text repeats between chunks. This text is longer to test chunking properly. We will add more content to ensure we exceed the chunk size limit and create multiple chunks with proper overlap between them.' }
  ];

  const chunks = [];
  let globalChunkIndex = 0;

  for (const pageData of pageWiseText) {
    const { page, text } = pageData;
    const cleanedText = cleanText(text);

    if (!cleanedText) continue; // Skip empty pages

    let start = 0;
    let end = CHUNK_SIZE;

    while (start < cleanedText.length) {
      const chunkText = cleanedText.slice(start, end);

      if (chunkText.trim()) { // Ignore empty chunks
        chunks.push({
          sopId: 'test-sop-id',
          content: chunkText,
          source: 'test-source',
          page,
          chunkIndex: globalChunkIndex,
        });
        globalChunkIndex++;
      }

      start = end - CHUNK_OVERLAP;
      end = start + CHUNK_SIZE;

      if (start >= cleanedText.length) break;
    }
  }

  console.log(`Generated ${chunks.length} chunks:`);
  chunks.forEach((chunk, index) => {
    console.log(`Chunk ${index}: Page ${chunk.page}, Length: ${chunk.content.length}, Text: "${chunk.content.substring(0, 50)}..."`);
    if (chunk.content.length > 1000) {
      console.error(`ERROR: Chunk ${index} exceeds 1000 characters!`);
    }
  });

  // Check overlap (simple check: last 100 chars of chunk n should match first 100 of chunk n+1 if on same page)
  for (let i = 0; i < chunks.length - 1; i++) {
    const current = chunks[i];
    const next = chunks[i + 1];
    if (current.page === next.page) {
      const overlapText = current.content.slice(-100);
      const nextStart = next.content.slice(0, 100);
      if (overlapText === nextStart) {
        console.log(`✓ Overlap verified between chunk ${i} and ${i+1}`);
      } else {
        console.log(`✗ Overlap mismatch between chunk ${i} and ${i+1}`);
        console.log(`   Last 100 of chunk ${i}: "${overlapText}"`);
        console.log(`   First 100 of chunk ${i+1}: "${nextStart}"`);
      }
    }
  }

  console.log('Test completed.');
};

// Run test if this file is executed directly
if (require.main === module) {
  testChunking();
}

module.exports = { testChunking };
