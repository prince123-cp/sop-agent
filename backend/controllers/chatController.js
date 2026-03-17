import { generateEmbedding } from '../utils/embedding.js';
import { SopChunk } from '../models/SopChunk.js';
import { Conversation } from '../models/Conversation.js';
import { Sop } from '../models/Sop.js';
import { callLLM } from '../utils/llmWrapper.js';
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'a', 'an', 'of', 'for', 'to', 'in', 'on', 'at', 'by',
  'and', 'or', 'from', 'with', 'about', 'please', 'tell', 'me', 'policy'
]);

const REFUND_TERMS_REGEX = /(|refund|return|term|terms|condition|conditions|cancellation|cancel|exchange|eligible|eligibility|timeline|fee|charges|shipping|date|time|policy| Replacement Policy| Late or Missing Refunds|policy Updates| Introduction)/i;

const isRefundTermsQuery = (question) => REFUND_TERMS_REGEX.test(question || '');

const tokenizeQuestion = (question) => {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
};

const buildSnippet = (text, terms) => {
  if (!text || !terms.length) return null;

  const lower = text.toLowerCase();
  let hitIndex = -1;
  for (const term of terms) {
    hitIndex = lower.indexOf(term);
    if (hitIndex !== -1) break;
  }

  if (hitIndex === -1) return null;

  const start = Math.max(0, hitIndex - 220);
  const end = Math.min(text.length, hitIndex + 420);
  return text.slice(start, end).replace(/\s+/g, ' ').trim();
};

const buildSnippets = (text, terms, maxSnippets = 3, windowBefore = 220, windowAfter = 420) => {
  if (!text || !terms.length) return [];

  const lower = text.toLowerCase();
  const snippets = [];
  const seenStarts = new Set();

  for (const term of terms) {
    let fromIndex = 0;
    while (snippets.length < maxSnippets) {
      const idx = lower.indexOf(term, fromIndex);
      if (idx === -1) break;

      const start = Math.max(0, idx - windowBefore);
      const end = Math.min(text.length, idx + windowAfter);
      if (!seenStarts.has(start)) {
        snippets.push(text.slice(start, end).replace(/\s+/g, ' ').trim());
        seenStarts.add(start);
      }
      fromIndex = idx + term.length;
    }

    if (snippets.length >= maxSnippets) break;
  }

  return snippets;
};

const buildDetailedTermsAnswer = (entries = []) => {
  if (!entries.length) return "Information not available in SOP";

  const keywords = ['refund', 'return', 'term', 'condition', 'cancel', 'cancellation', 'eligible', 'eligibility', 'exchange', 'timeline', 'fee', 'charge', 'shipping'];
  const seen = new Set();
  const points = [];

  for (const entry of entries) {
    const page = entry.page || 'N/A';
    const content = (entry.content || '').replace(/\s+/g, ' ').trim();
    if (!content) continue;

    const sentences = content.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      const clean = sentence.replace(/\s+/g, ' ').trim();
      if (clean.length < 25) continue;

      const lower = clean.toLowerCase();
      const relevant = keywords.some((k) => lower.includes(k));
      if (!relevant && keywords.some((k) => content.toLowerCase().includes(k))) {
        continue;
      }

      const key = `${clean.toLowerCase()}|${page}`;
      if (seen.has(key)) continue;
      seen.add(key);
      points.push(`${clean} [Page ${page}]`);
    }
  }

  if (!points.length) return "Information not available in SOP";

  const numbered = points.map((point, idx) => `${idx + 1}. ${point}`).join('\n');
  return `Refund/Return Terms & Conditions (SOP se):\n${numbered}`;
};

const askQuestion = async (req, res) => {
  try {
    const { question, conversationId, sopId } = req.body;
    const activeConversationId = conversationId || randomUUID();
    const detailedRefundQuery = isRefundTermsQuery(question);
    const chunkFilter = {};
    const sopQueryFilter = {};

    if (sopId) {
      if (!mongoose.Types.ObjectId.isValid(sopId)) {
        return res.status(400).json({ message: 'Invalid sopId' });
      }
      const sopObjectId = new mongoose.Types.ObjectId(sopId);
      chunkFilter.sopId = sopObjectId;
      sopQueryFilter._id = sopObjectId;
    }

    // Validate question
    if (!question || question.trim().length < 5) {
      return res.status(400).json({ message: 'Question is required and must be at least 5 characters long.' });
    }

    // Fetch conversation history if conversationId provided
    let conversationHistory = [];
    if (activeConversationId) {
      const conversation = await Conversation.findOne({ conversationId: activeConversationId });
      if (conversation) {
        conversationHistory = conversation.messages;
      }
    }

    let filteredResults = [];
    let detailedTermEntries = [];

    // Try vector search first (best quality path).
    try {
      const hasEmbeddings = await SopChunk.exists({
        ...chunkFilter,
        embedding: { $exists: true, $ne: [] }
      });
      if (hasEmbeddings) {
        const questionEmbedding = await generateEmbedding(question);

        const vectorSearchStage = {
          $vectorSearch: {
            index: 'sop_chunks_vector_index',
            path: 'embedding',
            queryVector: questionEmbedding,
            numCandidates: 30,
            limit: 8
          }
        };
        if (chunkFilter.sopId) {
          vectorSearchStage.$vectorSearch.filter = { sopId: chunkFilter.sopId };
        }

        const pipeline = [
          vectorSearchStage,
          {
            $project: {
              content: 1,
              page: 1,
              source: 1,
              section: 1,
              chunkIndex: 1,
              sopId: 1,
              score: { $meta: 'vectorSearchScore' }
            }
          }
        ];

        const searchResults = await SopChunk.aggregate(pipeline);
        filteredResults = searchResults
          .filter(chunk => chunk.score > 0.55)
          .filter(chunk => !chunkFilter.sopId || String(chunk.sopId) === String(chunkFilter.sopId))
          .slice(0, 5);

        if (detailedRefundQuery && filteredResults.length > 0) {
          const dominantSopId = chunkFilter.sopId || filteredResults[0].sopId;
          if (dominantSopId) {
            const relatedChunks = await SopChunk.find({
              sopId: dominantSopId,
              content: { $regex: REFUND_TERMS_REGEX }
            })
              .select('content page source section chunkIndex sopId')
              .sort({ page: 1, chunkIndex: 1 })
              .lean();

            const merged = new Map();
            for (const chunk of filteredResults) {
              const key = `${chunk.page}-${chunk.chunkIndex}`;
              merged.set(key, chunk);
            }
            for (const chunk of relatedChunks) {
              const key = `${chunk.page}-${chunk.chunkIndex}`;
              if (!merged.has(key)) {
                merged.set(key, { ...chunk, score: 0.99 });
              }
            }

            filteredResults = Array.from(merged.values())
              .sort((a, b) => (a.page - b.page) || (a.chunkIndex - b.chunkIndex))
              .slice(0, 20);
          }
        }

        if (detailedRefundQuery) {
          detailedTermEntries = filteredResults.map((chunk) => ({
            content: chunk.content,
            page: chunk.page
          }));
        }
      }
    } catch (vectorError) {
      console.error('Vector search unavailable, using SOP text fallback:', vectorError.message);
    }

    // Combine chunks into context
    let context = '';
    const sources = [];
    filteredResults.forEach(chunk => {
      context += `SOURCE: ${chunk.source}\nPAGE: ${chunk.page}\nSECTION: ${chunk.section || 'N/A'}\nCONTENT:\n${chunk.content}\n\n---\n\n`;
      sources.push({ file: chunk.source, page: chunk.page, section: chunk.section });
    });

    // Remove duplicates in sources
    const uniqueSources = sources.filter((source, index, self) =>
      index === self.findIndex(s => s.file === source.file && s.page === source.page && s.section === source.section)
    );

    let fallbackAnswer = null;

    // Fallback: if chunks are unavailable, search direct SOP extracted text.
    if (!context.trim()) {
      const terms = tokenizeQuestion(question);
      const sops = await Sop.find(sopQueryFilter, { name: 1, extractedText: 1 }).lean();

      const matched = [];
      for (const sop of sops) {
        if (detailedRefundQuery) {
          const snippets = buildSnippets(sop.extractedText || '', terms, 8, 280, 800);
          snippets.forEach((snippet) => {
            matched.push({
              snippet,
              source: sop.name || 'SOP',
              page: 1
            });
          });
        } else {
          const snippet = buildSnippet(sop.extractedText || '', terms);
          if (snippet) {
            matched.push({
              snippet,
              source: sop.name || 'SOP',
              page: 1
            });
          }
        }
      }

      if (matched.length > 0) {
        const fallbackLimit = detailedRefundQuery ? 8 : 3;
        context = matched
          .slice(0, fallbackLimit)
          .map(m => `SOURCE: ${m.source}\nPAGE: ${m.page}\nCONTENT:\n${m.snippet}`)
          .join('\n\n---\n\n');

        if (detailedRefundQuery) {
          detailedTermEntries = matched.slice(0, fallbackLimit).map((m) => ({
            content: m.snippet,
            page: m.page
          }));
        }

        fallbackAnswer = `${matched[0].snippet} [Page ${matched[0].page}]`;

        uniqueSources.push(...matched.slice(0, fallbackLimit).map(m => ({
          file: m.source,
          page: m.page,
          section: 'N/A'
        })));
      }
    }

    // If still no context, respond accordingly.
    if (!context.trim()) {
      const answer = "Information not available in SOP";
      await saveToConversation(activeConversationId, 'user', question);
      await saveToConversation(activeConversationId, 'assistant', answer);
      return res.json({
        answer,
        sources: [],
        conversationId: activeConversationId
      });
    }

    // Build full context with history for LLM
    let fullContext = context;
    if (conversationHistory.length > 0) {
      const historyText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      fullContext = `${historyText}\n\nCurrent Context:\n${context}`;
    }

    // For refund/terms intent, return exhaustive points directly from SOP context.
    let answer = detailedRefundQuery
      ? buildDetailedTermsAnswer(detailedTermEntries)
      : await callLLM(fullContext, question);

    if (
      fallbackAnswer &&
      (!answer || answer.trim().toLowerCase() === 'information not available in sop')
    ) {
      answer = fallbackAnswer;
    }

    const dedupedSources = uniqueSources.filter((source, index, self) =>
      index === self.findIndex(s => s.file === source.file && s.page === source.page && s.section === source.section)
    );

    await saveToConversation(activeConversationId, 'user', question);
    await saveToConversation(activeConversationId, 'assistant', answer);

    // Return response
    res.json({
      answer: answer.trim(),
      sources: dedupedSources,
      conversationId: activeConversationId
    });

  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message, answer: "Information not available in SOP", sources: [] });
  }
};

// Helper function to save message to conversation
const saveToConversation = async (conversationId, role, content) => {
  try {
    let conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      conversation = new Conversation({ conversationId, messages: [] });
    }
    conversation.messages.push({ role, content });
    await conversation.save();
  } catch (error) {
    console.error('Error saving to conversation:', error);
  }
};

export { askQuestion };
