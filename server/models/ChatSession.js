import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot', 'system'], required: true },
  text: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [messageSchema],
    status: { type: String, enum: ['active', 'escalated', 'closed'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('ChatSession', chatSessionSchema);
