# Answer Generation System Implementation

## Information Gathered
- Current system in chatController.js handles question input, embedding, vector search, context building, LLM call, and response.
- llmWrapper.js has callLLM with basic prompt.
- SopChunk model has sopId, content, embedding, source, page, chunkIndex, createdAt. Needs 'section' field added.
- Context currently formatted as [Source: file | Page: num]\ncontent\n\n
- Prompt is basic, needs strict rules for SOP-only answers, numbered steps, specific "not available" message.
- Response format needs to match: {answer, sources: [{file, page, section}]}

## Plan
- Update SopChunk.js: Add 'section' field (optional string).
- Update chunker.js: If possible, extract section from PDF (but pdf-parse may not have sections, so optional).
- Update chatController.js: Change context format to SOURCE: file\nPAGE: num\nSECTION: sec\nCONTENT:\ntext\n---\n
- Update llmWrapper.js: Revise SYSTEM_PROMPT to strict rules: Answer ONLY from context, numbered steps, "Information not available in SOP" if not found.
- In chatController.js: Change default answer to “Information not available in SOP”, include section in sources.
- Test the changes.

## Dependent Files
- backend/models/SopChunk.js
- backend/utils/chunker.js (if adding section extraction)
- backend/controllers/chatController.js
- backend/utils/llmWrapper.js

## Followup Steps
- After edits, test with sample queries.
- Update TODO.md to reflect completion of Phase 12 and 13.
