import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true }, // e.g. "TICK-4912"
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contactEmail: { type: String, required: true },
    contactName: { type: String, default: 'Customer' },
    subject: { type: String, required: true },
    summary: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    chatSessionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('SupportTicket', supportTicketSchema);
