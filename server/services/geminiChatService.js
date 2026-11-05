import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ChatSession from '../models/ChatSession.js';
import { GoogleGenAI } from '@google/genai';
import { firestore } from '../config/firebase.js';

const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;

if (apiKey && apiKey !== 'YourGeminiApiKey') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('⚠️ Google Gemini AI SDK init note:', err.message);
  }
}

const SYSTEM_PROMPT = `
You are "BazaarGuide", the official AI shopping concierge and customer support bot for ApexBazaar — India's premier multi-vendor marketplace with 100k+ products across all categories (electronics, fashion, grocery, books, home, beauty, etc.).

DIRECTIVES:
1. Be polite, concise, helpful, and transparent.
2. Recommend live products with exact pricing in ₹ (INR), brand, and rating.
3. ApexBazaar Policies:
   - Delivery: Free shipping on orders above ₹999 per vendor. Standard delivery: 2-4 business days.
   - Escrow Protection: Customer payments are secured in escrow and released to verified sellers only after the 7-day return window elapses.
   - Payments: Razorpay (UPI, Credit/Debit cards, NetBanking), Stripe, and COD.
   - Returns: 7-day itemized self-serve replacement/refund with automated doorstep pickup.
4. If the user asks about an existing order, instruct them to provide their order number (e.g. APX-YYYYMM-XXXX).
`;

export const processChatMessage = async ({ sessionId, message, user }) => {
  const sanitizedInput = (message || '').trim().slice(0, 500);
  if (!sanitizedInput) {
    throw new Error('Message content cannot be empty.');
  }

  let session = await ChatSession.findOne({ sessionId });
  if (!session) {
    session = await ChatSession.create({
      sessionId,
      user: user?._id,
      messages: [],
    });
  }

  session.messages.push({
    sender: 'user',
    text: sanitizedInput,
  });

  const lowerText = sanitizedInput.toLowerCase();
  let botReplyText;
  let suggestedProducts = [];

  // 1. Order Tracking Inquiry
  if (lowerText.includes('order') || lowerText.includes('track') || lowerText.includes('where is')) {
    const match = sanitizedInput.match(/APX-[0-9A-Z-]+/i);
    if (match) {
      const order = await Order.findOne({ orderId: match[0].toUpperCase() });
      if (order) {
        botReplyText = `📦 Order **#${order.orderId}** status: **${order.orderStatus}**.\n\nIt contains **${order.subOrders?.length || 1} vendor sub-order(s)** scheduled for delivery to ${order.shippingAddress?.city}. Estimated delivery is within 2-3 business days.`;
      } else {
        botReplyText = `I couldn't locate order **${match[0]}**. Please double-check your order number in your Account dashboard.`;
      }
    } else {
      botReplyText = `To track your order, please share your order number (e.g., **#APX-202611-98124**). You can also view live delivery timelines in your **My Orders** portal.`;
    }
  }
  // 2. Return & Refund Inquiry
  else if (lowerText.includes('return') || lowerText.includes('refund') || lowerText.includes('replace')) {
    botReplyText = `🔄 ApexBazaar offers a **7-Day Hassle-Free Return Policy** on eligible items. Customer funds remain protected in platform escrow during this period.\n\nTo initiate a return:\n1. Go to **Account > Orders**\n2. Select the specific item and click **Return / Replace**\n3. Upload photo evidence if defective, and a reverse pickup will be scheduled automatically via Delhivery.`;
  }
  // 3. Product Discovery & Recommendations
  else if (
    lowerText.includes('recommend') ||
    lowerText.includes('suggest') ||
    lowerText.includes('buy') ||
    lowerText.includes('phone') ||
    lowerText.includes('laptop') ||
    lowerText.includes('headphone') ||
    lowerText.includes('gift') ||
    lowerText.includes('jacket') ||
    lowerText.includes('coffee')
  ) {
    // Extract search keywords
    let keyword = 'electronics';
    if (lowerText.includes('phone')) keyword = 'phone';
    else if (lowerText.includes('laptop') || lowerText.includes('macbook')) keyword = 'computers';
    else if (lowerText.includes('headphone') || lowerText.includes('audio')) keyword = 'audio';
    else if (lowerText.includes('jacket') || lowerText.includes('fashion') || lowerText.includes('silk')) keyword = 'fashion';
    else if (lowerText.includes('coffee') || lowerText.includes('grocery')) keyword = 'grocery';
    else if (lowerText.includes('book')) keyword = 'books';

    suggestedProducts = await Product.find({
      $or: [{ category: new RegExp(keyword, 'i') }, { title: new RegExp(keyword, 'i') }],
      isPublished: true,
    })
      .limit(3)
      .select('title slug price originalPrice imageLight rating brand');

    if (suggestedProducts.length > 0) {
      botReplyText = `Here are top-rated recommendations from our verified marketplace sellers:\n\n` +
        suggestedProducts
          .map((p) => `• **${p.title}** by *${p.brand}* — **₹${p.price.toLocaleString('en-IN')}** (⭐ ${p.rating})`)
          .join('\n') +
        `\n\nClick any card below to view specifications and add to your cart!`;
    } else {
      botReplyText = `I searched our 100k+ catalog for "${sanitizedInput}" but couldn't find an exact match. Try browsing our category rails for Computers, Electronics, Fashion, or Grocery!`;
    }
  }
  // 4. General / LLM Fallback
  else {
    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${sanitizedInput}` }] },
          ],
        });
        botReplyText = response.text || 'How can I help you discover products on ApexBazaar today?';
      } catch (geminiErr) {
        console.warn('Gemini inference error, falling back to rule response:', geminiErr.message);
        botReplyText = `Welcome to **ApexBazaar**! I'm your AI shopping assistant. You can ask me to recommend laptops, fashion, headphones, or check order tracking and return policies.`;
      }
    } else {
      botReplyText = `Welcome to **ApexBazaar Multi-Vendor Marketplace**! I'm **BazaarGuide**, your AI shopping concierge. How can I help you find products, compare specs, or check your order today?`;
    }
  }

  session.messages.push({
    sender: 'bot',
    text: botReplyText,
    products: suggestedProducts.map((p) => p._id),
  });

  await session.save();

  // Real-time persistent stream to Firestore for live concierge sync
  try {
    if (firestore?.collection) {
      await firestore.collection('chat_sessions').doc(sessionId).set(
        {
          sessionId,
          userId: user?._id?.toString() || null,
          lastMessage: botReplyText,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (fsErr) {
    console.warn('Firestore chat sync notice:', fsErr.message);
  }

  return {
    reply: botReplyText,
    products: suggestedProducts,
    sessionId,
  };
};
