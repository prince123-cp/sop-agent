import api from './axios.js';

export const askQuestion = async (question, conversationId = '') => {
  try {
    const payload = conversationId ? { question, conversationId } : { question };
    const response = await api.post('/chat/ask', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
