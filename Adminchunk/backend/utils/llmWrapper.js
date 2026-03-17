import { GoogleGenerativeAI } from '@google/generative-ai';
import '../config/env.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Base System Prompt
const SYSTEM_PROMPT = `You are a SOP assistant AI. Answer ONLY from the given SOP context.
Do NOT invent answers or use external knowledge. If the information is not available in the SOP context, reply exactly: "Information not available in SOP".
Structure answers in numbered steps if applicable.
If user asks for full details, complete terms, or all conditions (especially refund/return), provide complete points from context without skipping relevant clauses.
Keep answers factual and clearly structured.
Cite page numbers in the answer, e.g., [Page X].`;

// Function to call LLM
const callLLM = async (context, question) => {
  try {
    const fullPrompt = `${SYSTEM_PROMPT}\n\nContext:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(fullPrompt);
    let answer = result.response.text().trim();

    // Hallucination Guard: If answer doesn't reference context or says something not in context, replace
    // For simplicity, check if answer contains "I don't know" or is empty, else assume it's from context
    // Advanced: Could parse answer for sources, but for now, rely on prompt
    if (!answer || answer.toLowerCase().includes('i don\'t know') || answer.toLowerCase().includes('information not available')) {
      answer = "Information not available in SOP";
    }

    return answer;
  } catch (error) {
    console.error('Error calling LLM:', error);
    return "Information not available in SOP";
  }
};

export { callLLM };
