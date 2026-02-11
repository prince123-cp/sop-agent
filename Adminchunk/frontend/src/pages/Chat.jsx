import { useState } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Namaste! Main SOP assistant hoon. Aap apna question puchhiye, main SOP context se answer dunga.',
      sources: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');

  const handleSendMessage = (text) => {
    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
  };

  const handleResponseReceived = (response) => {
    const aiMessage = { role: 'ai', text: response.answer, sources: response.sources || [] };
    setMessages(prev => [...prev, aiMessage]);
    setLoading(false);
  };

  const handleError = () => {
    const errorMessage = { role: 'ai', text: 'Sorry, I encountered an error. Please try again.', sources: [] };
    setMessages(prev => [...prev, errorMessage]);
    setLoading(false);
  };

  const handleNewChat = () => {
    setConversationId('');
    setMessages([
      {
        role: 'ai',
        text: 'Nayi chat start ho gayi. Aap apna SOP question puchhiye.',
        sources: []
      }
    ]);
    setLoading(false);
  };

  return (
    <div className="h-full bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:p-6">
        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assistant Guide</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Ask SOP Smartly</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Specific question puchho: process, policy, timeline.</li>
            <li>Follow-up me "iske baad kya" type queries puch sakte ho.</li>
            <li>Sources section se answer verify karo.</li>
          </ul>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-6">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 md:text-xl">Ask SOP Assistant</h1>
              <p className="text-xs text-slate-500 md:text-sm">Context-aware chat based on uploaded SOPs</p>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              New Chat
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <ChatWindow messages={messages} loading={loading} />
          </div>
          <div className="border-t border-slate-200 bg-white px-3 py-3 md:px-4 md:py-4">
            <ChatInput
              onSendMessage={handleSendMessage}
              onResponseReceived={handleResponseReceived}
              onError={handleError}
              loading={loading}
              conversationId={conversationId}
              onConversationId={setConversationId}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Chat;
