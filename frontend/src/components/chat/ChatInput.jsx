import { useState } from 'react';
import { askQuestion } from '../../api/chat.api.js';

const ChatInput = ({ onSendMessage, onResponseReceived, onError, loading, conversationId, onConversationId }) => {
  const [message, setMessage] = useState('');
  const quickPrompts = [
    'Refund policy kya hai?',
    'Leave approval ka process batao',
    'Is SOP ka summary do'
  ];

  const submitMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    onSendMessage(trimmed);
    try {
      const response = await askQuestion(trimmed, conversationId);
      if (response?.conversationId && typeof onConversationId === 'function') {
        onConversationId(response.conversationId);
      }
      onResponseReceived(response);
    } catch (error) {
      onError();
    }
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitMessage(message);
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await submitMessage(message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-2">
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setMessage(prompt)}
            className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-300 bg-white p-2 shadow-sm">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your SOP question..."
          rows={2}
          className="w-full resize-none bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
          disabled={loading}
        />
        <div className="flex items-center justify-between border-t border-slate-200 px-1 pt-2">
          <p className="text-xs text-slate-500">Enter to send, Shift+Enter for new line</p>
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
