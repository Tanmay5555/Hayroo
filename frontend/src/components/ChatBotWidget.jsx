import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  RefreshCw,
  ExternalLink,
  Headphones,
} from 'lucide-react';
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
    <div className="fixed bottom-5 right-5 z-40">
      
      {/* Expandable Support Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Hayroo Support Assistant"
          className="w-[90vw] sm:w-[370px] h-[500px] bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-[var(--shadow-lg)] flex flex-col overflow-hidden mb-3"
        >
          {/* Header */}
          <div className="bg-[var(--color-bg-subtle)] text-[var(--color-text)] px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[var(--color-primary-light)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)]">
                <Headphones className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-[var(--color-text)] leading-tight">
                  Hayroo Support
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Order help & catalog guidance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded hover:bg-[var(--color-bg-muted)] transition-colors"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded hover:bg-[var(--color-bg-muted)] transition-colors"
                aria-label="Close support chat"
              >
                <X className="w-4 h-4" />
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
                  className={`max-w-[85%] px-3 py-2.5 rounded-md leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                      : 'bg-[var(--color-card)] text-[var(--color-text)] border border-[var(--color-border)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.product && (
                    <div className="mt-2.5 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded flex items-center gap-2">
                      <img
                        src={msg.product.imageLight || '/favicon.svg'}
                        alt=""
                        className="w-9 h-9 object-contain rounded bg-[var(--color-card)] p-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-[var(--color-text)] truncate">{msg.product.title}</p>
                        <p className="text-[11px] font-semibold tabular-nums text-[var(--color-primary)]">
                          ₹{msg.product.price?.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(msg.product);
                          navigate(`/product/${msg.product.slug || msg.product._id}`);
                        }}
                        className="p-1.5 rounded bg-[var(--color-primary)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)] shrink-0"
                        title="View product"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[var(--color-text-subtle)] mt-1 px-0.5">
                  {msg.sender === 'user' ? 'You' : 'Support'}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="inline-flex items-center px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md text-[11px] text-[var(--color-text-muted)]">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Topic Chips */}
          <div className="px-3 py-2 bg-[var(--color-card)] border-t border-[var(--color-border)] flex items-center gap-1.5 overflow-x-auto">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="px-2.5 py-1 text-[11px] font-medium bg-[var(--color-bg)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] rounded whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[var(--color-card)] border-t border-[var(--color-border)] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about orders, returns, or products..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="form-input text-xs py-2"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn-primary p-2 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Support Chat Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
        aria-expanded={isOpen}
        className="relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-[var(--color-card)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)] shadow-[var(--shadow-md)] transition-colors text-xs font-medium"
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span>Close</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Support</span>
          </>
        )}

        {unreadCount > 0 && !isOpen && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded bg-[var(--color-primary)] text-[var(--color-primary-text)] text-[10px] font-mono font-semibold tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
