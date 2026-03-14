import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Globe2, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
  ts?: string;
}

const QUICK_PROMPTS = [
  "What documents are required for EIA?",
  "What is the CRZ classification process?",
  "Explain the Forest Clearance procedure",
  "How is risk score calculated?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: 'Welcome to the Official PARIVESH 3.0 AI Assistant. I can guide you through environmental clearances, EIA regulations, and compliance procedures.\n\n(परिवेश 3.0 आधिकारिक सहायक में आपका स्वागत है।)',
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', text: text.trim(), ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), language })
      });

      setIsLoading(false);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No readable stream');

      const aiMsg: Message = { role: 'ai', text: '', ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, aiMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: updated[updated.length - 1].text + chunk };
          return updated;
        });
      }
    } catch {
      setIsLoading(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'I encountered an error connecting to the server. Please try again.',
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleReset = () => {
    setMessages([{
      role: 'ai',
      text: 'Conversation cleared. How may I assist you?',
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-900/30 hover:scale-105 transition-transform z-50 flex items-center gap-2"
          >
            <Sparkles size={20} />
            <span className="text-sm font-bold hidden sm:block">AI Assistant</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 bg-[#0a1935] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden z-50"
            style={{ height: isMinimized ? 'auto' : '520px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#071028] border-b border-white/6 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <Sparkles size={14} className="text-emerald-400" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#071028] animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-100">PARIVESH AI</p>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Official Assistant · MoEFCC</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Language toggle */}
                <button
                  onClick={() => setLanguage(l => l === 'English' ? 'Hindi' : 'English')}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  title="Toggle language"
                >
                  <Globe2 size={11} />
                  {language === 'English' ? 'EN' : 'HI'}
                </button>
                {/* Reset */}
                <button
                  onClick={handleReset}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Clear conversation"
                >
                  <RotateCcw size={13} />
                </button>
                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(m => !m)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  <ChevronDown size={14} className={`transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                </button>
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/8 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                      {msg.role === 'ai' && (
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mb-0.5">
                          <Sparkles size={11} className="text-emerald-400" />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${msg.role === 'user' ? '' : ''}`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-br-sm'
                            : 'bg-zinc-800/80 text-zinc-200 rounded-bl-sm border border-zinc-700/50'
                        }`}>
                          {msg.text}
                        </div>
                        {msg.ts && (
                          <p className={`text-[9px] text-zinc-600 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.ts}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Sparkles size={11} className="text-emerald-400 animate-pulse" />
                      </div>
                      <div className="bg-zinc-800/80 border border-zinc-700/50 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                        {[0, 0.15, 0.30].map((delay, i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Prompts (only on first message) */}
                  {messages.length === 1 && !isLoading && (
                    <div className="pt-2">
                      <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2 font-semibold">Suggested queries</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {QUICK_PROMPTS.map(qp => (
                          <button
                            key={qp}
                            onClick={() => sendMessage(qp)}
                            className="text-left px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-300 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-300 transition-all"
                          >
                            {qp}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Disclaimer */}
                <div className="px-4 py-1.5 bg-zinc-950/60 text-[9px] text-zinc-600 text-center border-t border-zinc-800/80">
                  AI guidance only · Not a substitute for official MoEFCC rulings
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="flex gap-2 p-3 bg-[#071028] border-t border-white/5">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={language === 'English' ? 'Ask about clearances, EIA, CRZ...' : 'अपना प्रश्न टाइप करें...'}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/40 placeholder-zinc-600 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
