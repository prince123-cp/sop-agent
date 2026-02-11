import { SopChunk } from '../models/SopChunk.js';
import { generateEmbeddingsBatch } from './embedding.js';

// Constants
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

// Clean text: remove extra newlines, tabs, normalize spaces
const cleanText = (text) => {
  return text
    .replace(/\n+/g, ' ')  // Replace multiple newlines with single space
    .replace(/\t+/g, ' ')  // Replace tabs with space
    .replace(/\s+/g, ' ')  // Normalize multiple spaces to single space
    .trim();               // Trim leading/trailing spaces
};

// Generate chunks from page-wise text
const generateChunks = async (pageWiseText, sopId, source) => {
  const chunks = [];
  const textsToEmbed = [];
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
          sopId,
          content: chunkText,
          source,
          page,
          chunkIndex: globalChunkIndex,
        });
        textsToEmbed.push(chunkText);
        globalChunkIndex++;
      }

      start = end - CHUNK_OVERLAP;
      end = start + CHUNK_SIZE;

      if (start >= cleanedText.length) break;
    }
  }

  // Generate embeddings for all chunks
  console.log(`Generating embeddings for ${textsToEmbed.length} chunks...`);
  const embeddings = await generateEmbeddingsBatch(textsToEmbed);

  // Attach embeddings to chunks
  chunks.forEach((chunk, index) => {
    chunk.embedding = embeddings[index];
  });

  return chunks;
};

// Main chunking utility
const chunkSopText = async (pageWiseText, sopId, source) => {
  const chunks = await generateChunks(pageWiseText, sopId, source);

  // Save chunks to DB
  const savedChunks = await SopChunk.insertMany(chunks);

  return savedChunks;
};

export {
  chunkSopText,
  generateChunks,
  cleanText,
  CHUNK_SIZE,
  CHUNK_OVERLAP,
};
