import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('FAQ', faqSchema);
