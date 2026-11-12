import { create } from 'zustand';
import apiClient from '../api/axios';

const initialMessages = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: `👋 Hi there! Welcome to **Hayroo Support**. I'm your AI tech assistant.\n\nHow can I help you today? You can ask about order status, 30-day returns, fast shipping, or tech recommendations!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const useChatStore = create((set, get) => ({
  isOpen: false,
  sessionId: localStorage.getItem('hayroo_chat_session_id') || `session-${Date.now()}`,
  messages: initialMessages,
  isTyping: false,
  unreadCount: 1,

  setIsOpen: (open) => {
    set({ isOpen: open, unreadCount: open ? 0 : get().unreadCount });
  },

  sendMessage: async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isTyping: true,
    }));

    try {
      const res = await apiClient.post('/chat', {
        sessionId: get().sessionId,
        message: text.trim(),
      });

      const { reply, products } = res.data.data;

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        products: products || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, botMsg],
        isTyping: false,
        unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
      }));
    } catch {
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ I'm having trouble reaching the Hayroo servers right now. Please try again or ask for human support.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      set((state) => ({
        messages: [...state.messages, errorMsg],
        isTyping: false,
      }));
    }
  },

  clearChat: () => {
    const newSession = `session-${Date.now()}`;
    localStorage.setItem('hayroo_chat_session_id', newSession);
    set({ sessionId: newSession, messages: initialMessages, unreadCount: 0 });
  },
}));
