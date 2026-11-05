import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/useChatStore';
import { useCartStore } from '../store/useCartStore';

const QUICK_CHIPS = [
  'Track my order',
  'Return policy',
  'Shipping details',
  'Recommend products',
  'Talk to human agent',
];

export default function ChatBotWidget() {
  const navigate = useNavigate();
  const { isOpen, setIsOpen, messages, isTyping, unreadCount, sendMessage, clearChat } = useChatStore();
  const { addToCart } = useCartStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    sendMessage(text);
  };

  const handleChipClick = (chipText) => {
    sendMessage(chipText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Expandable Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="w-[90vw] sm:w-[380px] h-[520px] bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white p-4 border-b border-indigo-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">BazaarGuide AI</h3>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-300 font-medium">Concierge & ResolveBot Active</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  className="p-1.5 text-indigo-200 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-indigo-200 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[var(--color-bg)]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-md leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#047857] text-[#FFFFFF]'
                        : 'bg-[var(--color-card)] text-[var(--color-text)] border border-[var(--color-border)]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Product Card Suggestion */}
                    {msg.product && (
                      <div className="mt-3 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md flex items-center gap-2">
                        <img
                          src={msg.product.imageLight || '/favicon.svg'}
                          alt=""
                          className="w-10 h-10 object-cover rounded-md bg-[var(--color-card)] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-[var(--color-text)] truncate">{msg.product.title}</p>
                          <p className="text-[11px] font-bold text-[#047857]">₹{msg.product.price?.toLocaleString('en-IN')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(msg.product);
                            navigate(`/product/${msg.product.slug || msg.product._id}`);
                          }}
                          className="p-1.5 rounded-md bg-[#047857] text-white hover:bg-[#065F46] shrink-0"
                          title="View product"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--color-text-subtle)] mt-1 px-1">
                    {msg.sender === 'user' ? 'You' : 'Hayroo Bot'}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md w-16">
                  <span className="w-1.5 h-1.5 bg-[#047857] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#047857] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#047857] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="p-2 bg-[var(--color-card)] border-t border-[var(--color-border)] flex items-center gap-1.5 overflow-x-auto">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-[var(--color-card)] border-t border-[var(--color-border)] flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a question about products or orders..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:border-[#047857]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-[#047857] hover:bg-[#065F46] disabled:opacity-50 text-white rounded-md transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
        aria-expanded={isOpen}
        className="relative p-3 rounded-md bg-[#047857] hover:bg-[#065F46] text-white shadow-md border border-[#065F46] focus-visible:outline-2 focus-visible:outline-[#047857] focus-visible:outline-offset-2 transition-all duration-150"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}

        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-[#DC2626] text-white text-[10px] font-bold w-4 h-4 rounded-md flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
