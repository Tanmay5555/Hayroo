import mongoose from 'mongoose';

const sellerLedgerSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true },
    referenceType: {
      type: String,
      enum: ['ORDER_CREDIT', 'COMMISSION_DEBIT', 'REFUND_DEBIT', 'PAYOUT_DISBURSED', 'TCS_WITHHELD'],
      required: true,
    },
    referenceId: { type: String, required: true }, // e.g. SubOrderNumber or Payout ID
    amount: { type: Number, required: true }, // Positive for credit, negative for debit
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.SellerLedger || mongoose.model('SellerLedger', sellerLedgerSchema);

