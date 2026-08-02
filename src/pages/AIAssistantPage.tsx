import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { aiService } from '../services/AIService';
import { RichChatMessage } from '../components/RichChatMessage';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isApiError?: boolean;
}

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I am your **FOF-AI Executive Business Intelligence Assistant**, powered by Google Gemini AI and live database reasoning. I have real-time access to ETS FOFANA CONFISERIE's inventory, sales forecasts, expiry alerts, and seasonal multipliers. Ask me any question naturally about your business!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const presetQueries = [
    "what to do next week ?",
    "what is the product that need attention for now ?",
    "So who is the admin?",
    "So how much product do we have?",
    "Which products expire within 30 days?",
    "What products should we import for Ramadan?",
    "Which products generate the highest profit?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    try {
      const responseText = await aiService.answerQueryAsync(text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const fallbackText = aiService.answerQuery(text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Bot className="h-6 w-6 text-amber-400" />
            <span>AI Business Assistant (Google Gemini AI)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Natural language decision support grounded in live ETS FOFANA operational database</p>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: '1',
                sender: 'ai',
                text: "Conversation history cleared. How may I assist your business planning?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="glass-card rounded-2xl border border-slate-800 flex-1 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 p-0.5'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-slate-950" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-1.5 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 border-b border-slate-800/60 pb-1">
                  <span className="font-bold">{msg.sender === 'user' ? 'Executive Manager' : 'FOF-AI Assistant'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {msg.sender === 'ai' ? (
                  <RichChatMessage text={msg.text} />
                ) : (
                  <p className="text-slate-100 text-xs leading-relaxed font-semibold">{msg.text}</p>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-amber-400 font-semibold flex items-center space-x-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>FOF-AI evaluating database records & generating intelligent response...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Preset Quick Chips */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Quick Queries:</span>
          {presetQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(query)}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 text-amber-300 text-[11px] border border-slate-700 whitespace-nowrap transition"
            >
              {query}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask FOF-AI any question about products, urgent risks, inventory counts, or Ramadan planning..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isThinking}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-gold-glow flex items-center space-x-2 transition disabled:opacity-50"
            >
              <span>Ask AI</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
